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
