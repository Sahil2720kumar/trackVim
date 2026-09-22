"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { createServerClient } from "@/lib/supabase/server";
import { generateTrainerCode } from "@/lib/utils";
import { logAndSanitizeError } from "@/lib/error-handler";

import { ActionResult } from "./owner.action";
import {
  ImportTrainerBatchResult,
  ImportTrainerErrorRow,
  ImportTrainerPayloadItem,
  ImportTrainerSettings,
} from "@/types/import-trainers.types";

const IMPORT_CHUNK_SIZE = 200;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

export async function importTrainersBatchAction(
  gymId: string,
  payloadItems: ImportTrainerPayloadItem[],
  settings: ImportTrainerSettings,
): Promise<ActionResult<ImportTrainerBatchResult>> {
  // ============================================================
  // 1. AUTHORIZATION
  // ============================================================

  const { userId, sessionClaims } = await auth();

  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };

  if (!userId || meta.role !== "owner" || meta.gymId !== gymId) {
    return {
      success: false,
      error: "Not authorized to import trainers for this gym.",
    };
  }

  // ============================================================
  // 2. EMPTY IMPORT
  // ============================================================

  if (!payloadItems.length) {
    return {
      success: true,
      data: {
        totalProcessed: 0,
        trainersCreated: 0,
        existingProfilesLinked: 0,
        skippedCount: 0,
        skippedRows: [],
        errorRows: [],
        successfulRows: [],
      },
    };
  }

  // ============================================================
  // 3. SUPABASE
  // ============================================================

  const supabase = await createServerClient();

  // ============================================================
  // 4. NORMALIZE EMAILS
  // ============================================================

  const normalizedItems = payloadItems.map((item) => ({
    ...item,

    contactEmail: item.contactEmail?.trim().toLowerCase() || null,

    contactPhone: item.contactPhone?.trim() || null,

    employeeId: item.employeeId?.trim() || null,
  }));

  // ============================================================
  // 5. EARLY EMAIL CONFLICT CHECK
  //
  // This provides friendly feedback.
  //
  // The RPC checks again authoritatively.
  // ============================================================

  const validItems: ImportTrainerPayloadItem[] = [];

  const emailConflictRows: ImportTrainerErrorRow[] = [];

  for (const item of normalizedItems) {
    const email = item.contactEmail;

    if (!email) {
      validItems.push(item);
      continue;
    }

    const { data: conflictData, error: conflictError } = await supabase.rpc(
      "check_trainer_email_conflict",
      {
        p_gym_id: gymId,
        p_email: email,
      },
    );

    if (conflictError) {
      console.error("Failed to check trainer email conflict:", conflictError);

      return {
        success: false,
        error: "Could not verify trainer email availability. Please try again.",
      };
    }

    const conflict = conflictData?.[0];

    if (!conflict) {
      return {
        success: false,
        error: "Could not verify trainer email availability. Please try again.",
      };
    }

    // ==========================================================
    // OWNER
    // ==========================================================

    if (conflict.conflict_type === "owner") {
      emailConflictRows.push({
        rowNumber: item.rowNumber,
        fullName: item.fullName,

        errorCode: "EMAIL_BELONGS_TO_OWNER",

        error:
          "This email address already belongs to an owner account and cannot be imported as a trainer.",

        suggestedAction: "Use a different email address for this trainer.",
      });

      continue;
    }

    // ==========================================================
    // MEMBER
    // ==========================================================

    if (conflict.conflict_type === "member") {
      emailConflictRows.push({
        rowNumber: item.rowNumber,
        fullName: item.fullName,

        errorCode: "EMAIL_BELONGS_TO_MEMBER",

        error:
          "This email address already belongs to a member account and cannot be imported as a trainer.",

        suggestedAction: "Use a different email address for this trainer.",
      });

      continue;
    }

    // ==========================================================
    // TRAINER ALREADY IN THIS GYM
    // ==========================================================

    if (conflict.conflict_type === "trainer") {
      emailConflictRows.push({
        rowNumber: item.rowNumber,
        fullName: item.fullName,

        errorCode: "TRAINER_ALREADY_EXISTS_IN_GYM",

        error: "A trainer with this email address already exists in this gym.",

        suggestedAction:
          "Use the existing trainer record instead of importing another one.",
      });

      continue;
    }

    // ==========================================================
    // AVAILABLE / TRAINER FROM ANOTHER GYM
    // ==========================================================

    validItems.push(item);
  }

  // ============================================================
  // 6. NOTHING LEFT
  // ============================================================

  if (!validItems.length) {
    return {
      success: true,
      data: {
        totalProcessed: payloadItems.length,

        trainersCreated: 0,
        existingProfilesLinked: 0,

        skippedCount: 0,
        skippedRows: [],

        errorRows: emailConflictRows,

        successfulRows: [],
      },
    };
  }

  // ============================================================
  // 7. GENERATE TRAINER CODES
  // ============================================================

  const rpcItems = validItems.map((item) => ({
    ...item,

    trainerCode: generateTrainerCode(),
  }));

  // ============================================================
  // 8. PROCESS BATCHES
  // ============================================================

  let result: ImportTrainerBatchResult = {
    totalProcessed: 0,

    trainersCreated: 0,
    existingProfilesLinked: 0,

    skippedCount: 0,
    skippedRows: [],

    errorRows: [],
    successfulRows: [],
  };

  for (const batch of chunk(rpcItems, IMPORT_CHUNK_SIZE)) {
    const { data, error } = await supabase.rpc("import_trainers_batch", {
      p_gym_id: gymId,

      p_items: batch,

      p_settings: settings,
    });

    console.log("Trainer import batch result:", data);
    console.log("Trainer import batch error:", error);

    if (error || !data) {
      console.error("Trainer import batch error:", error);

      return {
        success: false,

        error: logAndSanitizeError(
          error,
          "importTrainersBatchAction",
          "Failed to process trainer import batch.",
        ),
      };
    }

    const batchResult = data as ImportTrainerBatchResult;

    result = {
      totalProcessed: result.totalProcessed + batchResult.totalProcessed,

      trainersCreated: result.trainersCreated + batchResult.trainersCreated,

      existingProfilesLinked:
        result.existingProfilesLinked + batchResult.existingProfilesLinked,

      skippedCount: result.skippedCount + batchResult.skippedCount,

      skippedRows: [...result.skippedRows, ...batchResult.skippedRows],

      errorRows: [...result.errorRows, ...batchResult.errorRows],

      successfulRows: [...result.successfulRows, ...batchResult.successfulRows],
    };
  }

  // ============================================================
  // 9. ADD CLIENT-SIDE EMAIL ERRORS
  // ============================================================

  result.errorRows = [...emailConflictRows, ...result.errorRows];

  // ============================================================
  // 10. SEND CLERK INVITATIONS
  //
  // ONLY newly-created accounts are invited.
  //
  // Existing global trainer accounts are already connected
  // through profile_id and must NOT receive another invitation.
  // ============================================================

  if (settings.sendInvitations) {
    const successfulRows = result.successfulRows ?? [];

    const client = await clerkClient();

    for (const successfulRow of successfulRows) {
      // Existing global account.
      if (successfulRow.hasExistingProfile) {
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
            role: "trainer",

            gymId,

            trainerId: successfulRow.trainerId,

            onboardingComplete: false,
          },

          notify: true,

          ignoreExisting: true,
        });

        const { error: invitationUpdateError } = await supabase
          .from("trainers")
          .update({
            invited_email: email,

            clerk_invitation_id: invitation.id,

            invitation_sent_at: new Date().toISOString(),
          })
          .eq("id", successfulRow.trainerId);

        if (invitationUpdateError) {
          console.error(
            "Failed to save trainer invitation:",
            invitationUpdateError,
          );
        }
      } catch (err) {
        /*
         * Invitation failure must NOT
         * rollback the imported trainer.
         */

        console.error("Failed to send trainer invitation:", err);
      }
    }
  }

  // ============================================================
  // 11. REFRESH
  // ============================================================

  revalidatePath("/owner/trainers");

  // ============================================================
  // 12. RETURN
  // ============================================================

  return {
    success: true,

    data: {
      ...result,

      totalProcessed: payloadItems.length,
    },
  };
}
