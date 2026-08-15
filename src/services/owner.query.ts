import { ActionResult } from "@/actions/member.action";
import { createServerClient } from "@/lib/supabase/server";
import { formatDate, getTodayDateStr } from "@/lib/utils";
import { MembershipApplication } from "@/types";
import { auth } from "@clerk/nextjs/server";

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

//Application Quries
export async function getApplications(gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("membership_applications")
    .select(
      `
      *,
      members(id, full_name, contact_email, contact_phone, photo_url, gender, date_of_birth, member_code),
      membership_plans(id, plan_name, plan_price, duration_months, joining_fee, plan_color),
      gym_memberships(id, status, activated_at)
    `,
    )
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return {
    success: true as const,
    data: data,
  };
}

export async function getApplicationById(id: string) {
  const supabase = await createServerClient();
  const { sessionClaims } = await auth();
  const ownerMeta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };

  if (ownerMeta.role !== "owner" || !ownerMeta.gymId) {
    return {
      success: false as const,
      error: "Not authorized to view this application.",
    };
  }
  const gymId = ownerMeta.gymId;

  const { data, error } = await supabase
    .from("membership_applications")
    .select(
      `
      *,
      members(
        id, full_name, contact_email, contact_phone, photo_url,
        gender, date_of_birth, member_code,
        height_cm, weight_kg, fitness_goal, medical_conditions, allergies,
        emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
        address, city, state
      ),
      membership_plans(
        id, plan_name, plan_price, duration_months, joining_fee,
        plan_color, plan_icon, selected_features, custom_features, validity_starts
      ),
      gym_memberships(
        id, status, activated_at, start_date, end_date, final_amount, activated_by,
        payments(
          id, amount, method, status, payment_date, transaction_ref,
          rejection_reason, verified_at, verified_by,
          payment_receipts(id, file_url, file_type, is_current, uploaded_at)
        )
      ),
      reviewer:reviewed_by(id, full_name)
    `,
    )
    .eq("id", id)
    .eq("gym_id", gymId)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data: data };
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

//Get Trainers
export async function getAllTrainers(gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("trainers")
    .select(
      "id, full_name, contact_email, contact_phone, photo_url, professional_title, specializations, experience_years, members_trained, completed_sessions, average_rating, status",
    )
    .eq("gym_id", gymId)
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const, data };
}

export async function getTrainerStats(gymId: string) {
  const supabase = await createServerClient();
  const today = getTodayDateStr();

  const [
    totalTrainersResult,
    activeTrainersResult,
    activeMembersResult,
    sessionsTodayResult,
  ] = await Promise.all([
    supabase
      .from("trainers")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .is("deleted_at", null),
    supabase
      .from("trainers")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .eq("status", "Active")
      .is("deleted_at", null),
    supabase
      .from("gym_memberships")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .eq("status", "Active"),
    supabase
      .from("training_sessions")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .eq("session_date", today),
  ]);

  const errored = [
    totalTrainersResult,
    activeTrainersResult,
    activeMembersResult,
    sessionsTodayResult,
  ].find((r) => r.error);

  if (errored) {
    console.log(errored.error);

    return { success: false as const, error: errored.error!.message };
  }

  return {
    success: true as const,
    data: {
      totalTrainers: totalTrainersResult.count ?? 0,
      activeTrainers: activeTrainersResult.count ?? 0,
      totalMembers: activeMembersResult.count ?? 0,
      sessionsToday: sessionsTodayResult.count ?? 0,
    },
  };
}

export async function getTrainerById(trainerId: string, gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("id", trainerId)
    .eq("gym_id", gymId)
    .is("deleted_at", null)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type TrainerDetail = NonNullable<
  Awaited<ReturnType<typeof getTrainerById>>["data"]
>;

export async function getTrainerSessionStats(trainerId: string) {
  const supabase = await createServerClient();
  const now = new Date();
  const monthStart = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = formatDate(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
  );

  const { data, error } = await supabase
    .from("training_sessions")
    .select("id, status")
    .eq("trainer_id", trainerId)
    .gte("session_date", monthStart)
    .lte("session_date", monthEnd);

  if (error) return { success: false as const, error: error.message };

  const sessionsThisMonth = data.length;
  const completed = data.filter((s) => s.status === "Completed").length;
  const attendanceRate =
    sessionsThisMonth > 0
      ? Math.round((completed / sessionsThisMonth) * 100)
      : 0;

  return {
    success: true as const,
    data: { sessionsThisMonth, attendanceRate },
  };
}

export async function getMonthlySessionsForTrainer(trainerId: string) {
  const supabase = await createServerClient();
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const startDate = formatDate(start);

  const { data, error } = await supabase
    .from("training_sessions")
    .select("session_date")
    .eq("trainer_id", trainerId)
    .gte("session_date", start.toISOString().slice(0, 10));

  if (error) return { success: false as const, error: error.message };

  const counts = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    counts.set(d.toLocaleString("en-US", { month: "short" }), 0);
  }
  data.forEach((row) => {
    const month = new Date(row.session_date).toLocaleString("en-US", {
      month: "short",
    });
    counts.set(month, (counts.get(month) ?? 0) + 1);
  });

  return {
    success: true as const,
    data: Array.from(counts.entries()).map(([month, sessions]) => ({
      month,
      sessions,
    })),
  };
}

// APPROXIMATION: there's no persistent trainer↔member assignment table in the schema
// you've shown me, so "assigned members" here is the distinct set of members this
// trainer has ever had a training_session with — not a true current-assignment count.
// If members has (or should have) an assigned_trainer_id, swap this for a direct count.
export async function getAssignedMembersCount(trainerId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("training_sessions")
    .select("member_id")
    .eq("trainer_id", trainerId);

  if (error) return { success: false as const, error: error.message };
  return {
    success: true as const,
    data: new Set(data.map((r) => r.member_id)).size,
  };
}
