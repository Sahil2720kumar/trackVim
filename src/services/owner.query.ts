import { ActionResult } from "@/actions/member.action";
import { createServerClient } from "@/lib/supabase/server";

// ============================================================================
// Read-only data-fetching functions
//
// These are NOT Server Actions (no "use server" directive). They're plain
// async functions meant to be awaited directly inside Server Components /
// route handlers (e.g. `const { data } = await getGymMembers(gymId)`).
// Keeping them out of the actions file avoids turning every read into a
// Server Action endpoint, which adds pointless serialization/network
// overhead for data that never mutates anything.
// ============================================================================

export async function getMembershipPlans(gymId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("membership_plans")
    .select(
      `
      *,
      gym_memberships(count)
    `,
    )
    .eq("gym_id", gymId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getTrainersAndPlans(gymId: string) {
  const supabase = await createServerClient();

  const [trainersResult, plansResult] = await Promise.all([
    supabase
      .from("trainers")
      .select("id, full_name, professional_title")
      .eq("gym_id", gymId)
      .eq("status", "Active")
      .order("full_name", { ascending: true }),
    supabase
      .from("membership_plans")
      .select(
        "id, plan_name, plan_price,joining_fee,discount_type,discount_value, membership_duration, duration_months",
      )
      .eq("gym_id", gymId)
      .eq("status", "Active")
      .is("deleted_at", null)
      .order("plan_price", { ascending: true }),
  ]);

  if (trainersResult.error) {
    return { success: false as const, error: trainersResult.error.message };
  }
  if (plansResult.error) {
    return { success: false as const, error: plansResult.error.message };
  }

  return {
    success: true as const,
    data: {
      trainers: trainersResult.data,
      plans: plansResult.data,
    },
  };
}

export async function getOwnerNotifications() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getGymWithDetails(gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("gyms")
    .select(
      `
      *,
      gym_locations(*),
      gym_qr_codes(*),
      membership_plans(*),
      trainers(id, status, professional_title, employee_id,
        users:profile_id(full_name, email, avatar_url, phone))
    `,
    )
    .eq("id", gymId)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getPendingApplications(gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("membership_applications")
    .select(
      `
      *,
      members(id, full_name, contact_email, contact_phone, photo_url, gender, date_of_birth, member_code),
      membership_plans(id, plan_name, plan_price, duration_months, joining_fee, plan_color)
    `,
    )
    .eq("gym_id", gymId)
    .eq("status", "Pending")
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getPendingPayments(gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      members(id, full_name, contact_email, photo_url),
      gym_memberships(id, status, plan_id, start_date, end_date, final_amount),
      payment_receipts(id, file_url, file_type, is_current, uploaded_at)
    `,
    )
    .eq("gym_id", gymId)
    .in("status", ["Pending", "PendingVerification"])
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getGymMembers(gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("gym_memberships")
    .select(
      `
      id, status, start_date, end_date, plan_price, final_amount, created_at,
      members(id, full_name, contact_email, contact_phone, photo_url, gender, account_status, member_code),
      membership_plans(id, plan_name, plan_color, duration_months)
    `,
    )
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getGymActiveMembers(gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("gym_memberships")
    .select(
      `
      id, status, start_date, end_date,
      members(id, full_name, contact_email, photo_url, account_status),
      membership_plans(plan_name, plan_color)
    `,
    )
    .eq("gym_id", gymId)
    .eq("status", "Active");

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getGymSubscriptions(gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("gym_subscriptions")
    .select(`*, subscription_payments(*)`)
    .eq("gym_id", gymId)
    .order("billing_period_start", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getGymAttendance(gymId: string, date?: string) {
  const supabase = await createServerClient();

  let query = supabase
    .from("attendance")
    .select(
      `
      *,
      members(id, full_name, photo_url, member_code)
    `,
    )
    .eq("gym_id", gymId)
    .order("check_in", { ascending: false });

  if (date) query = query.eq("attendance_date", date);

  const { data, error } = await query;
  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}
