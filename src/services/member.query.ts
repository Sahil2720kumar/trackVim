import { ActionResult } from "@/actions/owner.action";
import { createClient } from "@/lib/supabase/server";
import { getTodayDateStr } from "@/lib/utils";

// ============================================================================
// Gym Discovery
// ============================================================================

/**
 * Find a gym by its unique code (e.g. "Q8K7PW").
 */
export async function findGymByCode(code: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gyms")
    .select(
      `
      id, name, code, gym_description, logo_url, contact_email, contact_phone,
      city, state, country, amenities,
      membership_plans(id, plan_name, short_description, plan_price, duration_months,
        joining_fee, plan_category, plan_color, selected_features, custom_features,
        enrollment_mode, status, is_featured)
    `,
    )
    .eq("code", code.toUpperCase())
    .eq("status", "Active")
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

/**
 * List active gyms (for discovery / browse screen).
 */
export async function listActiveGyms(options?: {
  city?: string;
  limit?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("gyms")
    .select("id, name, code, gym_description, logo_url, city, state, amenities")
    .eq("status", "Active")
    .order("name", { ascending: true })
    .limit(options?.limit ?? 20);

  if (options?.city) query = query.ilike("city", `%${options.city}%`);

  const { data, error } = await query;
  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

// ============================================================================
// Dashboard read-only queries
export async function getMyProfile() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .select(
      `
      *,
      gym_memberships:active_gym_membership_id(
        id, status, start_date, end_date,
        membership_plans(plan_name, plan_color),
        gyms(id, name, logo_url)
      )
    `,
    )
    .maybeSingle();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyMemberships() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gym_memberships")
    .select(
      `
      *,
      gyms(id, name, logo_url, city),
      membership_plans(id, plan_name, plan_color, plan_price, duration_months,
        selected_features, custom_features),
      payments(id, status, amount, method, payment_date, due_date)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyApplications() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("membership_applications")
    .select(
      `
      *,
      gyms(id, name, logo_url, city),
      membership_plans(id, plan_name, plan_price, duration_months, plan_color)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

/**
 * Get the active payment for a membership (Pending or Rejected = needs action).
 */
export async function getPaymentForMembership(gymMembershipId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      payment_receipts(id, file_url, file_type, is_current, uploaded_at)
    `,
    )
    .eq("gym_membership_id", gymMembershipId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyPayments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      gyms(id, name, logo_url),
      gym_memberships(id, status, start_date, end_date),
      payment_receipts(id, file_url, file_type, is_current, uploaded_at)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyAttendance(gymId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("attendance")
    .select(
      `
      *,
      gyms(id, name, logo_url)
    `,
    )
    .order("attendance_date", { ascending: false })
    .limit(30);

  if (gymId) query = query.eq("gym_id", gymId);

  const { data, error } = await query;
  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyTrainingSessions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      `
      *,
      trainers(id, professional_title,
        users:profile_id(full_name, avatar_url)),
      session_exercises(
        *,
        exercises(id, name, muscle_group, equipment)
      )
    `,
    )
    .order("session_date", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyUpcomingSessions() {
  const supabase = await createClient();

  const { data: memberProfile } = await supabase
    .from("members")
    .select(
      `
      gym_memberships:active_gym_membership_id(
        gyms(timezone)
      )
    `,
    )
    .maybeSingle();

  const timezone =
    (memberProfile?.gym_memberships as any)?.gyms?.timezone ?? "Asia/Kolkata";
  const today = getTodayDateStr(timezone);

  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      `
      *,
      trainers(id, professional_title,
        users:profile_id(full_name, avatar_url))
    `,
    )
    .eq("status", "Upcoming")
    .gte("session_date", today)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyAssignedTrainers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainer_assignments")
    .select(
      `
      *,
      trainers(
        id, professional_title, bio, specializations, average_rating,
        working_days, start_time, end_time, instagram, linkedin,
        users:profile_id(full_name, avatar_url, phone)
      ),
      gyms(id, name, logo_url)
    `,
    )
    .eq("is_active", true);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyNotifications() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyMessages() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:sender_id(id, full_name, avatar_url),
      receiver:receiver_id(id, full_name, avatar_url)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getUnreadMessageCount(): Promise<
  ActionResult<{ count: number }>
> {
  const supabase = await createClient();

  const { data: currentUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .single();

  if (userError || !currentUser)
    return { success: false, error: "User not found." };

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", currentUser.id)
    .eq("is_read", false);

  if (error) return { success: false, error: error.message };
  return { success: true, data: { count: count ?? 0 } };
}

export async function getTodayAttendanceStatus(gymId: string) {
  const supabase = await createClient();

  const { data: gym } = await supabase
    .from("gyms")
    .select("timezone")
    .eq("id", gymId)
    .maybeSingle();

  const today = getTodayDateStr(gym?.timezone ?? "Asia/Kolkata");

  const { data, error } = await supabase
    .from("attendance")
    .select("id, status, check_in, check_out, duration_minutes")
    .eq("gym_id", gymId)
    .eq("attendance_date", today)
    .maybeSingle();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}
