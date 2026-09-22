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

// Row-level conflict type returned by the batched conflict-check RPC.
type TrainerEmailConflictRow = {
  email: string;
  conflict_type: "owner" | "member" | "trainer" | null;
};

function buildConflictErrorRow(
  item: ImportTrainerPayloadItem,
  conflictType: "owner" | "member" | "trainer",
): ImportTrainerErrorRow {
  switch (conflictType) {
    case "owner":
      return {
        rowNumber: item.rowNumber,
        fullName: item.fullName,

        errorCode: "EMAIL_BELONGS_TO_OWNER",

        error:
          "This email address already belongs to an owner account and cannot be imported as a trainer.",

        suggestedAction: "Use a different email address for this trainer.",
      };

    case "member":
      return {
        rowNumber: item.rowNumber,
        fullName: item.fullName,

        errorCode: "EMAIL_BELONGS_TO_MEMBER",

        error:
          "This email address already belongs to a member account and cannot be imported as a trainer.",

        suggestedAction: "Use a different email address for this trainer.",
      };

    case "trainer":
      return {
        rowNumber: item.rowNumber,
        fullName: item.fullName,

        errorCode: "TRAINER_ALREADY_EXISTS_IN_GYM",

        error: "A trainer with this email address already exists in this gym.",

        suggestedAction:
          "Use the existing trainer record instead of importing another one.",
      };
  }
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
  // 5. BATCH EMAIL CONFLICT CHECK
  //
  // This provides friendly feedback.
  //
  // The RPC checks again authoritatively.
  //
  // Rows without an email skip the check entirely and are valid.
  // All emails are checked in a single round trip instead of one
  // RPC call per row.
  // ============================================================

  const validItems: ImportTrainerPayloadItem[] = [];

  const emailConflictRows: ImportTrainerErrorRow[] = [];

  const itemsWithEmail = normalizedItems.filter((item) => item.contactEmail);
  const itemsWithoutEmail = normalizedItems.filter(
    (item) => !item.contactEmail,
  );

  // Emailless rows have nothing to conflict-check.
  validItems.push(...itemsWithoutEmail);

  if (itemsWithEmail.length) {
    const emails = Array.from(
      new Set(itemsWithEmail.map((item) => item.contactEmail as string)),
    );

    const { data: conflictData, error: conflictError } = await supabase.rpc(
      "check_trainer_email_conflicts_batch",
      {
        p_gym_id: gymId,
        p_emails: emails,
      },
    );

    if (conflictError) {
      console.error("Failed to check trainer email conflicts:", conflictError);

      return {
        success: false,
        error: "Could not verify trainer email availability. Please try again.",
      };
    }

    const conflictByEmail = new Map<
      string,
      TrainerEmailConflictRow["conflict_type"]
    >(
      ((conflictData ?? []) as TrainerEmailConflictRow[]).map((row) => [
        row.email,
        row.conflict_type,
      ]),
    );

    for (const item of itemsWithEmail) {
      const email = item.contactEmail as string;
      const conflictType = conflictByEmail.get(email) ?? null;

      if (!conflictType) {
        validItems.push(item);
        continue;
      }

      emailConflictRows.push(buildConflictErrorRow(item, conflictType));
    }
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

    // Invitation failures are non-blocking: the trainer is already
    // imported. We collect them as warnings so the caller can surface
    // them without treating them as hard errors.
    const invitationWarnings: ImportTrainerErrorRow[] = [];

    for (const successfulRow of successfulRows) {
      // Existing global account — already has credentials, skip.
      if (successfulRow.hasExistingProfile) {
        continue;
      }

      const email = successfulRow.contactEmail?.trim().toLowerCase();

      if (!email) {
        continue;
      }

      let invitationId: string | undefined;

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

        invitationId = invitation.id;
      } catch (err) {
        /*
         * Clerk invitation failure must NOT rollback the imported trainer.
         * Surface as a row-level warning instead of only logging.
         */
        console.error("Failed to send trainer invitation:", err);

        invitationWarnings.push({
          rowNumber: successfulRow.rowNumber,
          fullName: successfulRow.fullName,
          errorCode: "INVITATION_SEND_FAILED",
          stage: "invitation",
          error:
            err instanceof Error
              ? err.message
              : "Failed to send Clerk invitation email.",
          suggestedAction:
            "Re-send the invitation manually from the trainer profile.",
          extra: { trainerId: successfulRow.trainerId, email },
        });

        continue;
      }

      const { error: invitationUpdateError } = await supabase
        .from("trainers")
        .update({
          invited_email: email,

          clerk_invitation_id: invitationId,

          invitation_sent_at: new Date().toISOString(),
        })
        .eq("id", successfulRow.trainerId);

      if (invitationUpdateError) {
        console.error(
          "Failed to save trainer invitation:",
          invitationUpdateError,
        );

        invitationWarnings.push({
          rowNumber: successfulRow.rowNumber,
          fullName: successfulRow.fullName,
          errorCode: "INVITATION_PERSISTENCE_FAILED",
          stage: "invitation",
          error:
            invitationUpdateError.message ||
            "Invitation was sent but could not be saved to the database.",
          detail: invitationUpdateError.details ?? null,
          hint: invitationUpdateError.hint ?? null,
          suggestedAction:
            "The invitation email was delivered. Update the trainer record manually if needed.",
          extra: { trainerId: successfulRow.trainerId, invitationId, email },
        });
      }
    }

    // Merge invitation warnings after hard import errors so the
    // summary ordering stays: conflict errors → import errors → warnings.
    if (invitationWarnings.length) {
      result.errorRows = [...result.errorRows, ...invitationWarnings];
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
