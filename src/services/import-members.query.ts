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
) {
  const [gymRes, globalRes] = await Promise.all([
    supabase
      .from("gym_memberships")
      .select("member:members(contact_phone)")
      .eq("gym_id", gymId)
      .eq("status", "Active"),

    supabase
      .from("members")
      .select("contact_phone")
      .not("contact_phone", "is", null),
  ]);

  if (gymRes.error) {
    return { success: false as const, error: gymRes.error.message };
  }

  if (globalRes.error) {
    return { success: false as const, error: globalRes.error.message };
  }

  const gymPhones = new Set<string>();
  (gymRes.data || []).forEach((gm: any) => {
    if (gm.member?.contact_phone) {
      gymPhones.add(gm.member.contact_phone.replace(/[^0-9]/g, ""));
    }
  });

  const globalPhones = new Set<string>();
  (globalRes.data || []).forEach((m) => {
    if (m.contact_phone) {
      globalPhones.add(m.contact_phone.replace(/[^0-9]/g, ""));
    }
  });

  return {
    success: true as const,
    data: { gymPhones, globalPhones } as ExistingPhonesForImport,
  };
}
