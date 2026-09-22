// src/services/import-trainers.query.ts

import { Database } from "@/db/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { EmailConflictStatus } from "@/types/import-trainers.types";

type TypedSupabaseClient = SupabaseClient<Database>;

// Row shape returned by check_trainer_email_conflicts_batch. Only emails
// with an actual conflict are returned — an email absent from the RPC's
// result set is available.
type TrainerEmailConflictRow = {
  email: string;
  conflict_type: "owner" | "member" | "trainer";
};

/**
 * Check email conflict statuses for a list of trainer emails using RPC
 * check_trainer_email_conflicts_batch — a single round trip for the whole
 * batch instead of one RPC call per email.
 *
 * If the batch RPC fails, the whole check fails (success: false) instead
 * of silently treating any email as having no conflict. A row must never
 * be allowed to proceed as "available" when its conflict status could
 * not actually be determined.
 */
export async function checkTrainerEmailConflicts(
  supabase: TypedSupabaseClient,
  gymId: string,
  emails: string[],
): Promise<
  | { success: true; data: Record<string, EmailConflictStatus> }
  | { success: false; error: string }
> {
  const conflictMap: Record<string, EmailConflictStatus> = {};

  const validEmails = Array.from(
    new Set(emails.filter((email) => email && email.includes("@"))),
  );

  if (!validEmails.length) {
    return { success: true as const, data: conflictMap };
  }

  const { data: conflictData, error: conflictError } = await supabase.rpc(
    "check_trainer_email_conflicts_batch",
    {
      p_gym_id: gymId,
      p_emails: validEmails,
    },
  );

  if (conflictError) {
    console.error("Error checking trainer email conflicts:", conflictError);

    // Do NOT fall back to treating unresolved emails as available —
    // propagate the failure so no row is ever marked ready based on
    // an unknown conflict status.
    return {
      success: false,
      error: "Could not verify trainer email availability. Please try again.",
    };
  }

  const conflictByEmail = new Map(
    ((conflictData ?? []) as TrainerEmailConflictRow[]).map((row) => [
      row.email,
      row.conflict_type,
    ]),
  );

  for (const email of validEmails) {
    const conflictType = conflictByEmail.get(email);

    if (conflictType === "owner") {
      conflictMap[email] = "owner_email";
    } else if (conflictType === "member") {
      conflictMap[email] = "member_email";
    } else if (conflictType === "trainer") {
      conflictMap[email] = "existing_trainer_gym";
    } else {
      // No row returned for this email -> no conflict.
      conflictMap[email] = "available";
    }
  }

  return { success: true as const, data: conflictMap };
}
