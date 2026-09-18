import { Database } from "@/db/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabaseClient = SupabaseClient<Database>;

export interface PublicHomepageStats {
  today_scans: number;
  scan_change_percent: number;
  active_memberships: number;
  attendance_rate: number;
}

export async function getPublicHomepageStats(supabase: TypedSupabaseClient) {
  const { data, error } = await supabase.rpc("get_public_homepage_stats");

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  const stats = (data as unknown as PublicHomepageStats) ?? {
    today_scans: 0,
    scan_change_percent: 0,
    active_memberships: 0,
    attendance_rate: 0,
  };

  return {
    success: true as const,
    data: stats,
  };
}

export type PublicHomepageStatsResult = Extract<
  Awaited<ReturnType<typeof getPublicHomepageStats>>,
  { success: true }
>["data"];
