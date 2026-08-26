// notifications/service.ts

import { Database } from "@/db/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getNotifications(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Returns the row array directly (and throws on error) rather than a
// { success, data } envelope, so — same as getActiveQrCode — this is a
// plain Awaited<ReturnType<...>> alias rather than the Extract<...,
// { success: true }> pattern used for the envelope-style queries.
export type NotificationsResult = Awaited<ReturnType<typeof getNotifications>>;
