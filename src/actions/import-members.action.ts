"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { generateMemberCode } from "@/lib/utils";
import { logAndSanitizeError } from "@/lib/error-handler";
import { ActionResult } from "./owner.action";
import {
  ImportBatchPayloadItem,
  ImportBatchResult,
  ImportSettingsState,
} from "@/types/import-members.types";

const IMPORT_CHUNK_SIZE = 200;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

function emptyBatchResult(totalProcessed: number): ImportBatchResult {
  return {
    totalProcessed,
    membershipsCreated: 0,
    paymentsImported: 0,
    qrCardsCreated: 0,
    skippedCount: 0,
    skippedRows: [],
    errorRows: [],
    successfulRows: [],
  };
}

function mergeBatchResults(
  into: ImportBatchResult,
  from: ImportBatchResult,
): ImportBatchResult {
  return {
    totalProcessed: into.totalProcessed + from.totalProcessed,

    membershipsCreated: into.membershipsCreated + from.membershipsCreated,

    paymentsImported: into.paymentsImported + from.paymentsImported,

    qrCardsCreated: into.qrCardsCreated + from.qrCardsCreated,

    skippedCount: into.skippedCount + from.skippedCount,

    skippedRows: [...into.skippedRows, ...from.skippedRows],

    errorRows: [...into.errorRows, ...from.errorRows],

    successfulRows: [...into.successfulRows, ...from.successfulRows],
  };
}

/**
 * Import existing gym members in batches.
 *
 * Authorization:
 *
 * 1. Clerk metadata provides fast authorization.
 * 2. import_members_batch() performs the database-level
 *    authorization and business-rule validation.
 *
 * Email rules:
 *
 * - Owner email   -> rejected
 * - Trainer email -> rejected
 * - Member email  -> allowed
 * - Unknown email -> allowed
 *
 * Same-gym membership rules are enforced inside the RPC.
 */
export async function importMembersBatchAction(
  gymId: string,
  payloadItems: ImportBatchPayloadItem[],
  settings: ImportSettingsState,
): Promise<ActionResult<ImportBatchResult>> {
  // ============================================================
  // 1. AUTH
  // ============================================================

  const { userId, sessionClaims } = await auth();

  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };

  if (!userId || meta.role !== "owner" || meta.gymId !== gymId) {
    return {
      success: false,
      error: "Not authorized to import members for this gym.",
    };
  }

  // ============================================================
  // 2. EMPTY IMPORT
  // ============================================================

  if (!payloadItems.length) {
    return {
      success: true,
      data: emptyBatchResult(0),
    };
  }

  // ============================================================
  // 3. SUPABASE
  // ============================================================

  const supabase = await createServerClient();

  // ============================================================
  // 4. EARLY EMAIL CONFLICT CHECK
  //
  // This is for friendly client-side import feedback.
  //
  // The SECURITY DEFINER RPC performs the authoritative check
  // again, protecting against race conditions.
  // ============================================================

  const validItems: ImportBatchPayloadItem[] = [];

  const emailConflictRows: ImportBatchResult["errorRows"] = [];

  for (const item of payloadItems) {
    const normalizedEmail = item.contactEmail?.trim().toLowerCase() || null;

    // No email -> nothing to check.
    if (!normalizedEmail) {
      validItems.push(item);
      continue;
    }

    const { data: emailConflict, error: emailConflictError } =
      await supabase.rpc("check_member_email_conflict", {
        p_email: normalizedEmail,
      });

    if (emailConflictError) {
      console.error(
        "Failed to check member email conflict:",
        emailConflictError,
      );

      return {
        success: false,
        error: "Could not verify email availability. Please try again.",
      };
    }

    const conflict = emailConflict?.[0];

    if (!conflict) {
      return {
        success: false,
        error: "Could not verify email availability. Please try again.",
      };
    }

    // ----------------------------------------------------------
    // OWNER
    // ----------------------------------------------------------

    if (conflict.conflict_type === "owner") {
      emailConflictRows.push({
        rowNumber: item.rowNumber,
        fullName: item.fullName,
        errorCode: "EMAIL_BELONGS_TO_OWNER",
        error:
          "This email address already belongs to an owner account and cannot be imported as a member.",
        suggestedAction: "Use a different email address for this member.",
      });

      continue;
    }

    // ----------------------------------------------------------
    // TRAINER
    // ----------------------------------------------------------

    if (conflict.conflict_type === "trainer") {
      emailConflictRows.push({
        rowNumber: item.rowNumber,
        fullName: item.fullName,
        errorCode: "EMAIL_BELONGS_TO_TRAINER",
        error:
          "This email address already belongs to a trainer account and cannot be imported as a member.",
        suggestedAction: "Use a different email address for this member.",
      });

      continue;
    }

    // ----------------------------------------------------------
    // EXISTING MEMBER
    //
    // This is NOT a conflict.
    //
    // The RPC will reuse the global member if they belong
    // to another gym.
    // ----------------------------------------------------------

    validItems.push({
      ...item,
      contactEmail: normalizedEmail,
    });
  }

  // ============================================================
  // 5. NOTHING LEFT AFTER EMAIL VALIDATION
  // ============================================================

  if (!validItems.length) {
    return {
      success: true,
      data: {
        ...emptyBatchResult(payloadItems.length),
        errorRows: emailConflictRows,
      },
    };
  }

  // ============================================================
  // 6. GENERATE MEMBER CODES
  // ============================================================

  const rpcItems = validItems.map((item) => ({
    ...item,
    memberCode: generateMemberCode(),
  }));

  // ============================================================
  // 7. PROCESS BATCHES
  // ============================================================

  let result = emptyBatchResult(payloadItems.length);

  for (const batch of chunk(rpcItems, IMPORT_CHUNK_SIZE)) {
    const { data, error } = await supabase.rpc("import_members_batch", {
      p_gym_id: gymId,
      p_items: batch,
      p_settings: settings,
    });

    console.log("Batch Import Data:", data);

    if (error || !data) {
      console.error("Batch Import Error:", error);

      return {
        success: false,
        error: logAndSanitizeError(
          error,
          "importMembersBatchAction",
          "Failed to process member import batch.",
        ),
      };
    }

    result = mergeBatchResults(result, data as ImportBatchResult);
  }

  // ============================================================
  // 8. ADD SERVER-SIDE EMAIL CONFLICTS
  // ============================================================

  result.errorRows = [...emailConflictRows, ...result.errorRows];

  // ============================================================
  // 9. SEND CLERK INVITATIONS
  //
  // IMPORTANT:
  //
  // Only newly-created global members receive invitations.
  //
  // Existing global members must NEVER receive a new invitation.
  // ============================================================

  if (settings.sendInvitations) {
    const successfulRows = result.successfulRows ?? [];

    const client = await clerkClient();

    for (const successfulRow of successfulRows) {
      // Existing global member -> never invite.
      if (successfulRow.isExistingGlobal) {
        continue;
      }

      const email = successfulRow.contactEmail?.trim().toLowerCase();

      if (!email) {
        continue;
      }

      try {
        const invitation = await client.invitations.createInvitation({
          emailAddress: email,

          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,

          publicMetadata: {
            role: "member",
            gymId,
            memberId: successfulRow.memberId,
            onboardingComplete: false,
          },

          notify: true,
          ignoreExisting: true,
        });

        // Save invitation information.
        const { error: invitationUpdateError } = await supabase
          .from("members")
          .update({
            invited_email: email,
            clerk_invitation_id: invitation.id,
            invitation_sent_at: new Date().toISOString(),
          })
          .eq("id", successfulRow.memberId);

        if (invitationUpdateError) {
          console.error(
            "Failed to save Clerk invitation:",
            invitationUpdateError,
          );
        }
      } catch (err) {
        /*
         * Invitation failure should NOT roll back
         * the imported member.
         */
        console.error("Failed to send member invitation:", err);
      }
    }
  }

  // ============================================================
  // 10. REFRESH
  // ============================================================

  revalidatePath("/owner/members");

  // ============================================================
  // 11. RETURN
  // ============================================================

  return {
    success: true,
    data: {
      ...result,

      // Always report the actual number of CSV rows.
      totalProcessed: payloadItems.length,
    },
  };
}
