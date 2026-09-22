// src/services/import-members.query.ts

import { Database } from "@/db/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabaseClient = SupabaseClient<Database>;

export interface GymPlanForImport {
  id: string;
  name: string;
  price: string;
  durationMonths: number;
  membershipDuration: string;
}

export interface ExistingPhonesForImport {
  gymPhones: Set<string>;
  globalPhones: Set<string>;
}

/**
 * Fetch active membership plans for a gym for import mapping.
 */
export async function getImportGymPlans(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("membership_plans")
    .select("id, plan_name, plan_price, duration_months, membership_duration")
    .eq("gym_id", gymId)
    .eq("status", "Active")
    .is("deleted_at", null);

  if (error) {
    return { success: false as const, error: error.message };
  }

  const plans: GymPlanForImport[] = (data || []).map((p) => ({
    id: p.id,
    name: p.plan_name,
    price: p.plan_price ? p.plan_price.toString() : "0",
    durationMonths: p.duration_months || 1,
    membershipDuration: p.membership_duration || "1 Month",
  }));

  return { success: true as const, data: plans };
}

/**
 * Fetch existing phone numbers in gym & globally for duplicate detection.
 */
export async function getImportExistingPhones(
  supabase: TypedSupabaseClient,
  gymId: string,
  candidatePhones: string[], // normalized digits-only, from the import file
) {
  const { data, error } = await supabase.rpc("check_import_phone_conflicts", {
    p_gym_id: gymId,
    p_phones: candidatePhones,
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  const gymPhones = new Set<string>();
  const globalPhones = new Set<string>();

  (data || []).forEach((row) => {
    if (row.exists_in_gym) gymPhones.add(row.phone);
    if (row.exists_globally) globalPhones.add(row.phone);
  });

  return {
    success: true as const,
    data: { gymPhones, globalPhones } as ExistingPhonesForImport,
  };
}
