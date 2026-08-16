import { ActionResult } from "@/actions/member.action";
import { createServerClient } from "@/lib/supabase/server";
import { formatDate, getTodayDateStr } from "@/lib/utils";
import { MembershipApplication } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { meta } from "zod";

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
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (meta.role !== "owner" || meta.gymId !== gymId) {
    return { success: false as const, error: "Not authorized." };
  }

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
export type TrainerList = Extract<
  Awaited<ReturnType<typeof getAllTrainers>>,
  { success: true }
>["data"];

export type TrainerRow = TrainerList[number];

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

// ============================================================================
// Trainer + Assigned Members — single query via FK embed
// ============================================================================

export type AssignedMember = {
  assignmentId: string;
  assignedAt: string;
  notes: string | null;
  id: string;
  full_name: string | null;
  photo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  plan: string | null;
  membershipStatus: string | null;
  attendanceRate: number;
  progressLabel: "Excellent" | "Good" | "Needs Attention";
};

function progressLabelFor(rate: number): AssignedMember["progressLabel"] {
  if (rate >= 85) return "Excellent";
  if (rate >= 60) return "Good";
  return "Needs Attention";
}

export async function getTrainerById(trainerId: string, gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("trainers")
    .select(
      `
    *,
    trainer_assignments!trainer_id (
      id,
      assigned_at,
      notes,
      is_active,
      member:members!inner (
        id,
        full_name,
        photo_url,
        contact_email,
        contact_phone,
        gym_memberships:gym_memberships!gym_memberships_member_id_members_id_fk (
          status,
          plan:membership_plans (
            plan_name
          )
        )
      )
    )
  `,
    )
    .eq("id", trainerId)
    .eq("gym_id", gymId)
    .is("deleted_at", null)
    .eq("trainer_assignments.is_active", true)
    // scope the embedded memberships to the one that's actually current —
    // a member can have years of Expired/Cancelled rows, we only want Active
    .eq("trainer_assignments.member.gym_memberships.status", "Active")
    .order("assigned_at", {
      referencedTable: "trainer_assignments",
      ascending: false,
    })
    .single();

  if (error) return { success: false as const, error: error.message };

  const { trainer_assignments, ...trainer } = data;
  const assignments = trainer_assignments ?? [];

  const linkedAssignments = assignments.filter((a) => a.member != null);
  const memberIds = linkedAssignments.map((a) => a.member!.id);

  let attendanceByMember = new Map<string, number>();
  const asOfDate = getTodayDateStr("Asia/Kolkata");
  if (memberIds.length > 0) {
    const { data: stats, error: statsError } = await supabase.rpc(
      "get_member_attendance_stats",
      { p_member_ids: memberIds, p_gym_id: gymId, p_as_of: asOfDate },
    );
    if (!statsError && stats) {
      attendanceByMember = new Map(
        stats.map((s) => [s.member_id, Number(s.attendance_rate)]),
      );
    }
  }

  const assignedMembers: AssignedMember[] = assignments.map((a) => {
    const member = a.member as {
      id: string;
      full_name: string | null;
      photo_url: string | null;
      contact_email: string | null;
      contact_phone: string | null;
      gym_memberships: {
        status: string;
        plan: { plan_name: string } | null;
      }[];
    };
    // Even scoped to status='Active' above, the FK filter only trims the
    // array — a member with zero Active memberships still comes back as [].
    // one_active_membership_per_member_gym guarantees at most one row here.
    const activeMembership = member.gym_memberships?.[0] ?? null;
    const rate = attendanceByMember.get(member.id) ?? 0;

    return {
      assignmentId: a.id,
      assignedAt: a.assigned_at,
      notes: a.notes,
      id: member.id,
      full_name: member.full_name,
      photo_url: member.photo_url,
      contact_email: member.contact_email,
      contact_phone: member.contact_phone,
      plan: activeMembership?.plan?.plan_name ?? null,
      membershipStatus: activeMembership?.status ?? null,
      attendanceRate: rate,
      progressLabel: progressLabelFor(rate),
    };
  });

  return { success: true as const, data: { trainer, assignedMembers } };
}

export type TrainerDetail = Extract<
  Awaited<ReturnType<typeof getTrainerById>>,
  { success: true }
>["data"]["trainer"];

export type TrainerAssignedMember = Extract<
  Awaited<ReturnType<typeof getTrainerById>>,
  { success: true }
>["data"]["assignedMembers"][number];
// ============================================================================
// Session stats — kept as-is, separate queries
// ============================================================================

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
  const start = formatDate(new Date(now.getFullYear(), now.getMonth() - 11, 1));
  const end = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const { data, error } = await supabase
    .from("training_sessions")
    .select("session_date")
    .eq("trainer_id", trainerId)
    .gte("session_date", start)
    .lte("session_date", end);

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
