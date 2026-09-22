// src/services/import-trainers.query.ts

import { Database } from "@/db/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { EmailConflictStatus } from "@/types/import-trainers.types";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Check email conflict statuses for a list of trainer emails using RPC check_trainer_email_conflict.
 */
export async function checkTrainerEmailConflicts(
  supabase: TypedSupabaseClient,
  gymId: string,
  emails: string[],
) {
  const conflictMap: Record<string, EmailConflictStatus> = {};

  for (const email of emails) {
    if (!email || !email.includes("@")) continue;

    const { data: conflictData, error: conflictError } = await supabase.rpc(
      "check_trainer_email_conflict",
      {
        p_gym_id: gymId,
        p_email: email,
      },
    );

    if (conflictError) {
      console.error("Error checking trainer email conflict:", conflictError);
      continue;
    }

    if (conflictData?.[0]) {
      const conflict = conflictData[0];
      if (conflict.conflict_type === "owner") {
        conflictMap[email] = "owner_email";
      } else if (conflict.conflict_type === "member") {
        conflictMap[email] = "member_email";
      } else if (conflict.conflict_type === "trainer") {
        conflictMap[email] = "existing_trainer_gym";
      } else if (conflict.conflict_type === "available") {
        conflictMap[email] = "available";
      } else if (conflict.conflict_type === "trainer_other_gym") {
        conflictMap[email] = "existing_trainer_other";
      }
    }
  }

  return { success: true as const, data: conflictMap };
}
