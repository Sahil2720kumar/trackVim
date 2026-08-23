import { Database } from "@/db/database.types";
import { formatDate, getTodayDateStr } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabaseClient = SupabaseClient<Database>;

// ============================================================================
// Read-only data-fetching functions
//
// These run CLIENT-SIDE — the caller passes in a Supabase client obtained
// from `useSupabaseClient()` (same pattern as notifications/service.ts).
// Authorization is enforced entirely by Supabase RLS policies keyed off the
// signed-in user; there is no separate Clerk `auth()` / sessionClaims check
// in this file anymore, so any table these functions touch must have RLS
// that scopes rows to the requesting owner's gym.
// ============================================================================
export async function getGymOwnerInfo(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("gyms")
    .select(
      `
      id,
      name,
      gym_short_name,
      code,
      logo_url,
      owner:users!gyms_owner_id_fkey (
        id,
        full_name,
        email,
        username,
        phone,
        avatar_url,
        role,
        account_status
      )
    `,
    )
    .eq("id", gymId)
    .is("deleted_at", null)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type DashboardStats = {
  total_members: number;
  total_members_last_month: number;
  active_trainers: number;
  trainers_available: number;
  today_attendance: number;
  attendance_yesterday: number;
  monthly_revenue: number;
  monthly_revenue_last_month: number;
};

export type MembershipGrowthPoint = {
  month_start: string;
  month_label: string;
  members: number;
};
export type PlanDistributionPoint = {
  plan_id: string;
  plan_name: string;
  plan_color: string | null;
  member_count: number;
};
export type TrainerActivityRow = {
  trainer_id: string;
  full_name: string;
  photo_url: string;
  status: string;
  max_members: number | null;
  assigned_members: number;
  sessions_today: number;
};

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getOwnerDashboardData(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  try {
    const asOfDate = getTodayDateStr("Asia/Kolkata");

    const expiryWindowEnd = new Date();
    expiryWindowEnd.setDate(expiryWindowEnd.getDate() + 30);
    const expiryWindowEndStr = expiryWindowEnd.toISOString().slice(0, 10);

    const [
      { data: gym, error: gymError },
      { data: statsRows, error: statsError },
      { data: growth, error: growthError },
      { data: distribution, error: distributionError },
      { data: trainerActivity, error: trainerError },
      { data: expiringMemberships, error: expiringError },
      { data: recentRegistrations, error: registrationsError },
      { data: recentPayments, error: paymentsError },
    ] = await Promise.all([
      supabase.from("gyms").select("id, name").eq("id", gymId).single(),

      supabase.rpc("get_owner_dashboard_stats", {
        p_gym_id: gymId,
        p_as_of: asOfDate,
      }),

      supabase.rpc("get_membership_growth_monthly", {
        p_gym_id: gymId,
        p_months: 12,
        p_as_of: asOfDate,
      }),

      supabase.rpc("get_membership_plan_distribution", {
        p_gym_id: gymId,
        p_as_of: asOfDate,
      }),

      supabase.rpc("get_trainer_activity", {
        p_gym_id: gymId,
        p_as_of: asOfDate,
      }),

      supabase
        .from("gym_memberships")
        .select(
          `
          id, end_date, status,
          member:members!gym_memberships_member_id_members_id_fk (
            id,
            full_name,
            photo_url
          ),
          plan:membership_plans ( plan_name )
        `,
        )
        .eq("gym_id", gymId)
        .eq("status", "Active")
        .gte("end_date", asOfDate)
        .lte("end_date", expiryWindowEndStr)
        .order("end_date", { ascending: true })
        .limit(5),

      supabase
        .from("gym_memberships")
        .select(
          `
          id, created_at,
          member:members!gym_memberships_member_id_members_id_fk (
            id,
            full_name,
            photo_url
          ),
          plan:membership_plans ( plan_name )
        `,
        )
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false })
        .limit(4),

      supabase
        .from("payments")
        .select(
          `
          id, amount, status, payment_date,
          member:members ( id, full_name, photo_url ),
          gym_membership:gym_memberships (
            plan:membership_plans ( plan_name )
          )
        `,
        )
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (gymError) {
      throw new Error(`Gym fetch failed: ${gymError.message}`);
    }

    if (statsError) {
      throw new Error(
        `get_owner_dashboard_stats failed: ${statsError.message}`,
      );
    }

    if (growthError) {
      throw new Error(
        `get_membership_growth_monthly failed: ${growthError.message}`,
      );
    }

    if (distributionError) {
      throw new Error(
        `get_membership_plan_distribution failed: ${distributionError.message}`,
      );
    }

    if (trainerError) {
      throw new Error(`get_trainer_activity failed: ${trainerError.message}`);
    }

    if (expiringError) {
      throw new Error(
        `expiring memberships fetch failed: ${expiringError.message}`,
      );
    }

    if (registrationsError) {
      throw new Error(
        `recent registrations fetch failed: ${registrationsError.message}`,
      );
    }

    if (paymentsError) {
      throw new Error(`recent payments fetch failed: ${paymentsError.message}`);
    }

    const stats = statsRows?.[0] as DashboardStats | undefined;

    const daysToToday = (endDate: string) =>
      Math.max(
        Math.ceil(
          (new Date(endDate).getTime() - new Date(asOfDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
        0,
      );

    return {
      success: true as const,
      data: {
        gymName: gym?.name ?? "Your Gym",

        stats: stats
          ? {
              ...stats,
              memberTrend: pctChange(
                stats.total_members,
                stats.total_members_last_month,
              ),
              attendanceTrend: pctChange(
                stats.today_attendance,
                stats.attendance_yesterday,
              ),
              revenueTrend: pctChange(
                stats.monthly_revenue,
                stats.monthly_revenue_last_month,
              ),
            }
          : null,

        membershipGrowth: (growth ?? []) as MembershipGrowthPoint[],

        planDistribution: (distribution ?? []) as PlanDistributionPoint[],

        trainerActivity: (trainerActivity ?? []) as TrainerActivityRow[],

        expiringMemberships: (expiringMemberships ?? []).map((m) => ({
          id: m.id,
          name: m.member?.full_name ?? "—",
          photoUrl: m.member?.photo_url ?? null,
          plan: m.plan?.plan_name ?? "—",
          expiry: m.end_date,
          daysLeft: daysToToday(m.end_date),
        })),

        recentRegistrations: (recentRegistrations ?? []).map((r) => ({
          id: r.id,
          name: r.member?.full_name ?? "—",
          photoUrl: r.member?.photo_url ?? null,
          joined: r.created_at,
          plan: r.plan?.plan_name ?? "—",
        })),

        recentPayments: (recentPayments ?? []).map((p) => ({
          id: p.id,
          member: p.member?.full_name ?? "—",
          memberPhotoUrl: p.member?.photo_url ?? null,
          amount: `₹${Number(p.amount).toLocaleString("en-IN")}`,
          plan: p.gym_membership?.plan?.plan_name ?? "—",
          status: p.status,
          date: p.payment_date,
        })),
      },
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export type OwnerDashboardResult = Awaited<
  ReturnType<typeof getOwnerDashboardData>
>;

export async function getMembershipPlans(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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

export async function getGymRevenueMonthly(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const asOfDate = getTodayDateStr("Asia/Kolkata");

  const { data, error } = await supabase.rpc("get_gym_revenue_monthly", {
    p_gym_id: gymId,
    p_months: 12,
    p_as_of: asOfDate,
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  // numeric columns come back as strings from PostgREST — coerce at the boundary
  const coerced = (data ?? []).map((row) => ({
    month_start: row.month_start,
    month_label: row.month_label,
    revenue: Number(row.revenue),
  }));

  return { success: true as const, data: coerced as RevenueMonthPoint[] };
}

export async function getTopPerformingPlans(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const asOfDate = getTodayDateStr("Asia/Kolkata");

  const { data, error } = await supabase.rpc("get_plan_performance_monthly", {
    p_gym_id: gymId,
    p_as_of: asOfDate,
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  const coerced = (data ?? []).map((row) => ({
    plan_id: row.plan_id,
    plan_name: row.plan_name,
    member_count: Number(row.member_count),
    revenue_this_month: Number(row.revenue_this_month),
    revenue_last_month: Number(row.revenue_last_month),
    growth_pct: Number(row.growth_pct),
  }));

  return { success: true as const, data: coerced as PlanPerformanceRow[] };
}

export async function getTrainersAndPlans(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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

export type TrainersAndPlansResult = Extract<
  Awaited<ReturnType<typeof getTrainersAndPlans>>,
  { success: true }
>["data"];

export async function getGymWithDetails(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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
export async function getApplications(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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

/**
 * The role/gymId authorization check that used to live here (via Clerk
 * `auth()` + sessionClaims) is gone — `gymId` is now supplied by the
 * caller (from the owner store) and RLS on `membership_applications` /
 * `gyms` is what actually keeps an owner from reading another gym's
 * application.
 */
export async function getApplicationById(
  supabase: TypedSupabaseClient,
  id: string,
  gymId: string,
) {
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

export async function getPendingPayments(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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

export async function getGymMembers(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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

export async function getGymActiveMembers(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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

export async function getGymSubscriptions(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("gym_subscriptions")
    .select(`*, subscription_payments(*)`)
    .eq("gym_id", gymId)
    .order("billing_period_start", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getGymAttendance(
  supabase: TypedSupabaseClient,
  gymId: string,
  date?: string,
) {
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
/**
 * The role/gymId authorization check that used to live here (via Clerk
 * `auth()`) is gone — RLS on `trainers` is what scopes this to the
 * requesting owner's gym now.
 */
export async function getAllTrainers(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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

export async function getTrainerStats(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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

export async function getTrainerById(
  supabase: TypedSupabaseClient,
  trainerId: string,
  gymId: string,
) {
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

export async function getTrainerSessionStats(
  supabase: TypedSupabaseClient,
  trainerId: string,
) {
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

export async function getMonthlySessionsForTrainer(
  supabase: TypedSupabaseClient,
  trainerId: string,
) {
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

//Members

export async function getMembersAndPlans(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const [membershipsResult, plansResult] = await Promise.all([
    supabase
      .from("gym_memberships")
      .select(
        `id, status, plan_id, member_id, end_date,
         members!gym_memberships_member_id_members_id_fk (
           id, full_name, contact_email, contact_phone, photo_url, member_code
         ),
         membership_plans ( id, plan_name, grace_period_days )`,
      )
      .eq("gym_id", gymId)
      .in("status", ["Active", "Expired"])
      // Expired-first (renewals are usually more urgent), then soonest-expiring within each group
      .order("status", { ascending: false })
      .order("end_date", { ascending: true }),
    supabase
      .from("membership_plans")
      .select(
        "id, plan_name, plan_price, joining_fee, discount_type, discount_value, membership_duration, duration_months",
      )
      .eq("gym_id", gymId)
      .eq("status", "Active")
      .is("deleted_at", null)
      .order("plan_price", { ascending: true }),
  ]);

  if (membershipsResult.error) {
    return { success: false as const, error: membershipsResult.error.message };
  }
  if (plansResult.error) {
    return { success: false as const, error: plansResult.error.message };
  }

  return {
    success: true as const,
    data: {
      memberships: membershipsResult.data,
      plans: plansResult.data,
    },
  };
}

export type MembersAndPlansData = Extract<
  Awaited<ReturnType<typeof getMembersAndPlans>>,
  { success: true }
>["data"];

export type Membership = MembersAndPlansData["memberships"][number];

export type Plan = MembersAndPlansData["plans"][number];

export type GymMembershipStatus =
  | "PaymentPending"
  | "PaymentUploaded"
  | "PaymentRejected"
  | "Scheduled"
  | "Active"
  | "Expired"
  | "Cancelled";

/**
 * The attendance-stats RPC and the trainer-assignment lookup are both
 * independent of each other once `memberIds` is known, so they now run
 * concurrently instead of one after the other.
 */
export async function getMembersWithAttendance(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("members")
    .select(
      `
      id,
      full_name,
      contact_email,
      contact_phone,
      photo_url,
      member_code,
      profile_id,
      gym_memberships:gym_memberships!gym_memberships_member_id_members_id_fk!inner (
        id,
        status,
        plan_id,
        start_date,
        end_date,
        final_amount,

        plan:membership_plans (
          id,
          plan_name,
          membership_duration,
          duration_months
        )
      )
    `,
    )
    .eq("gym_memberships.gym_id", gymId)
    .order("full_name", { ascending: true });

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  const members = data ?? [];
  const memberIds = members.map((member) => member.id);
  const asOfDate = getTodayDateStr("Asia/Kolkata");

  // ---------------------------------------------------------------------------
  // Attendance + active trainer assignments, run concurrently.
  //
  // No FK exists between gym_memberships and trainers — the relationship
  // is via trainer_assignments (member_id -> trainer_id), so this stays a
  // separate query from attendance, just no longer a sequential one.
  // ---------------------------------------------------------------------------

  const attendanceByMember = new Map<string, number>();
  const trainerByMember = new Map<string, { id: string; full_name: string }>();

  if (memberIds.length > 0) {
    const [
      { data: stats, error: statsError },
      { data: assignments, error: assignmentsError },
    ] = await Promise.all([
      supabase.rpc("get_member_attendance_stats", {
        p_member_ids: memberIds,
        p_gym_id: gymId,
        p_as_of: asOfDate,
      }),
      supabase
        .from("trainer_assignments")
        .select(
          `
            member_id,
            trainer:trainers (
              id,
              full_name
            )
          `,
        )
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .in("member_id", memberIds),
    ]);

    if (!statsError && stats) {
      for (const stat of stats) {
        attendanceByMember.set(stat.member_id, Number(stat.attendance_rate));
      }
    }

    if (!assignmentsError && assignments) {
      for (const a of assignments) {
        if (a.trainer) {
          trainerByMember.set(a.member_id, a.trainer);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Build final member list
  // ---------------------------------------------------------------------------

  const result = (members ?? []).map((member) => {
    const memberType: "Normal" | "WalkIn" =
      member.profile_id !== null ? "Normal" : "WalkIn";
    const memberships = member.gym_memberships ?? [];

    const currentMembership =
      memberships
        .filter((membership) => {
          return (
            membership.start_date <= asOfDate &&
            membership.end_date >= asOfDate &&
            membership.status !== "Cancelled"
          );
        })
        .sort((a, b) => {
          return (
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
          );
        })[0] ?? null;

    const scheduledMembership =
      memberships
        .filter((membership) => {
          return (
            membership.status === "Scheduled" &&
            membership.start_date > asOfDate
          );
        })
        .sort((a, b) => {
          return (
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          );
        })[0] ?? null;

    const latestMembership =
      memberships
        .filter((membership) => membership.status !== "Cancelled")
        .sort((a, b) => {
          const startDateCompare =
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime();

          if (startDateCompare !== 0) {
            return startDateCompare;
          }

          return (
            new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
          );
        })[0] ?? null;

    const membership =
      currentMembership ?? scheduledMembership ?? latestMembership ?? null;

    const attendanceRate = attendanceByMember.get(member.id) ?? 0;
    const trainer = trainerByMember.get(member.id) ?? null;

    return {
      id: member.id,
      full_name: member.full_name,
      contact_email: member.contact_email,
      contact_phone: member.contact_phone,
      photo_url: member.photo_url,
      member_code: member.member_code,
      memberType,
      membership,
      membershipStatus: membership?.status ?? null,
      scheduledMembership,
      hasScheduledRenewal: scheduledMembership !== null,
      attendanceRate,
      trainer,
    };
  });

  return {
    success: true as const,
    data: result,
  };
}

export type MembersWithAttendanceResult = Extract<
  Awaited<ReturnType<typeof getMembersWithAttendance>>,
  { success: true }
>["data"];

export type MemberWithAttendance = MembersWithAttendanceResult[number];

export type MemberRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  plan: string;
  planPrice: string;
  trainer: string;
  joined: string;
  expiry: string;
  daysLeft: number;
  attendance: number;
  status: "Active" | "Expired" | "Expiring Soon" | "Pending";
  memberType: "Normal" | "WalkIn";
};

const PENDING_STATUSES = [
  "PaymentPending",
  "PaymentUploaded",
  "PaymentRejected",
] as const;

export async function getGymMemberStats(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const asOfDate = getTodayDateStr("Asia/Kolkata");

  const sevenDaysOut = new Date();
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
  const expiryWindowEnd = sevenDaysOut.toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await supabase
    .from("gym_memberships")
    .select("member_id, status, start_date, end_date, final_amount")
    .eq("gym_id", gymId)
    .neq("status", "Cancelled");

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  const memberships = data ?? [];

  // ---------------------------------------------------------------------
  // Distinct-member sets, since a member can have more than one
  // membership row (e.g. a Scheduled renewal alongside an Active one).
  // ---------------------------------------------------------------------

  const allMemberIds = new Set<string>();
  const activeMemberIds = new Set<string>();
  const expiringSoonMemberIds = new Set<string>();
  const pendingMemberIds = new Set<string>();
  let pendingAmount = 0;

  for (const m of memberships) {
    allMemberIds.add(m.member_id);

    const isActiveToday =
      m.status === "Active" &&
      m.start_date <= asOfDate &&
      m.end_date >= asOfDate;

    if (isActiveToday) {
      activeMemberIds.add(m.member_id);

      if (m.end_date <= expiryWindowEnd) {
        expiringSoonMemberIds.add(m.member_id);
      }
    }

    if ((PENDING_STATUSES as readonly string[]).includes(m.status)) {
      pendingMemberIds.add(m.member_id);
      pendingAmount += Number(m.final_amount ?? 0);
    }
  }

  return {
    success: true as const,
    data: {
      totalMembers: allMemberIds.size,
      activeMembers: activeMemberIds.size,
      expiringSoon: expiringSoonMemberIds.size,
      pendingPayments: pendingMemberIds.size,
      pendingAmount,
    },
  };
}

export type GymMemberStatsResult = Extract<
  Awaited<ReturnType<typeof getGymMemberStats>>,
  { success: true }
>["data"];

// Member By Id

export type MemberMonthlyAttendance = {
  month_start: string;
  month_label: string;
  days_present: number;
  days_expected: number;
  days_absent: number;
  attendance_rate: number;
};

export async function getMembersByIdWithAttendence(
  supabase: TypedSupabaseClient,
  memberId: string,
  gymId: string,
) {
  const asOfDate = getTodayDateStr("Asia/Kolkata");

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select(
      `
      id,
      full_name,
      contact_email,
      contact_phone,
      photo_url,
      member_code,
      profile_id,
      date_of_birth,
      gender,
      occupation,
      blood_group,
      address,
      city,
      state,
      pin_code,
      height_cm,
      weight_kg,
      fitness_goal,
      medical_conditions,
      allergies,
      physical_notes,
      emergency_contact_name,
      emergency_contact_relationship,
      emergency_contact_phone,
      account_status,
      created_at,
      gym_memberships:gym_memberships!gym_memberships_member_id_members_id_fk (
        id,
        status,
        plan_id,
        start_date,
        end_date,
        plan_price,
        final_amount,
        joining_fee,
        created_at,
        plan:membership_plans (
          id,
          plan_name,
          plan_price,
          membership_duration,
          duration_months
        )
      )
    `,
    )
    .eq("id", memberId)
    .eq("gym_memberships.gym_id", gymId)
    .single();

  if (memberError || !member) {
    return {
      success: false as const,
      error: memberError?.message ?? "Member not found",
    };
  }

  const memberships = member.gym_memberships ?? [];

  const currentMembership =
    memberships
      .filter(
        (m) =>
          m.start_date <= asOfDate &&
          m.end_date >= asOfDate &&
          m.status !== "Cancelled",
      )
      .sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
      )[0] ?? null;

  const scheduledMembership =
    memberships
      .filter((m) => m.status === "Scheduled" && m.start_date > asOfDate)
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      )[0] ?? null;

  const latestMembership =
    memberships
      .filter((m) => m.status !== "Cancelled")
      .sort((a, b) => {
        const cmp =
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        if (cmp !== 0) return cmp;
        return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
      })[0] ?? null;

  const membership =
    currentMembership ?? scheduledMembership ?? latestMembership ?? null;

  const [
    { data: trainerAssignments }, // renamed from trainerAssignment
    { data: monthlyAttendance, error: monthlyError },
    { data: payments },
    { data: upcomingSessions },
  ] = await Promise.all([
    supabase
      .from("trainer_assignments")
      .select(
        `
      id,
      is_primary,
      assigned_at,
      trainer:trainers (
        id,
        full_name,
        professional_title,
        specializations,
        experience_years,
        contact_phone,
        contact_email,
        photo_url
      )
      `,
      )
      .eq("gym_id", gymId)
      .eq("member_id", memberId)
      .eq("is_active", true)
      .order("is_primary", { ascending: false })
      .order("assigned_at", { ascending: true }),

    supabase.rpc("get_member_monthly_attendance", {
      p_member_id: memberId,
      p_gym_id: gymId,
      p_months: 12,
      p_as_of: asOfDate,
    }),
    supabase
      .from("payments")
      .select("id, amount, payment_date, method, status, created_at")
      .eq("gym_id", gymId)
      .eq("member_id", memberId)
      .order("payment_date", { ascending: false })
      .limit(10),
    supabase
      .from("training_sessions")
      .select(
        "id, session_name, session_date, start_time, end_time, workout_type, status",
      )
      .eq("gym_id", gymId)
      .eq("member_id", memberId)
      .eq("status", "Upcoming")
      .gte("session_date", asOfDate)
      .order("session_date", { ascending: true })
      .limit(5),
  ]);

  if (monthlyError) {
    // Non-fatal — chart just renders empty rather than failing the page.
    console.error(
      "get_member_monthly_attendance failed:",
      monthlyError.message,
    );
  }

  const monthly = (monthlyAttendance ?? []) as MemberMonthlyAttendance[];
  const currentMonthRate =
    monthly.length > 0 ? monthly[monthly.length - 1].attendance_rate : 0;
  const totalCheckIns = monthly.reduce((sum, m) => sum + m.days_present, 0);

  const currentYear = String(new Date().getFullYear());
  const totalPaymentsThisYear = (payments ?? [])
    .filter(
      (p) => p.status === "Verified" && p.payment_date?.startsWith(currentYear),
    )
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const outstanding = (payments ?? [])
    .filter((p) =>
      ["Pending", "PendingVerification", "Overdue", "Partial"].includes(
        p.status,
      ),
    )
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const trainers = (trainerAssignments ?? []).map((ta) => ({
    assignmentId: ta.id,
    isPrimary: ta.is_primary,
    ...ta.trainer,
  }));

  return {
    success: true as const,
    data: {
      member: {
        ...member,
        member_type: member.profile_id !== null ? "Normal" : "WalkIn",
      },
      membership,
      scheduledMembership,
      trainers,
      monthlyAttendance: monthly,
      attendanceRate: currentMonthRate,
      totalCheckIns,
      payments: payments ?? [],
      totalPaymentsThisYear,
      outstanding,
      lastPayment: payments?.[0] ?? null,
      upcomingSessions: upcomingSessions ?? [],
    },
  };
}

export type MemberProfileResult = Extract<
  Awaited<ReturnType<typeof getMembersByIdWithAttendence>>,
  { success: true }
>["data"];

//Payments

export type PaymentRow = {
  id: string;
  receiptId: string | null;
  memberId: string;
  memberName: string | null;
  memberPhone: string | null;
  plan: string | null;
  amount: number;
  method: string | null;
  paymentDate: string | null;
  dueDate: string | null;
  status: string;
};

export async function getGymPayments(
  supabase: TypedSupabaseClient,
  gymId: string,
  limit = 200,
) {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      id,
      receipt_id,
      amount,
      payment_date,
      due_date,
      method,
      status,
      member:members ( id, full_name, contact_phone ),
      gym_membership:gym_memberships ( plan:membership_plans ( plan_name ) )
      `,
    )
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false as const, error: error.message };
  }

  const payments: PaymentRow[] = (data ?? []).map((p) => ({
    id: p.id,
    receiptId: p.receipt_id,
    memberId: p.member?.id ?? "",
    memberName: p.member?.full_name ?? null,
    memberPhone: p.member?.contact_phone ?? null,
    plan: p.gym_membership?.plan?.plan_name ?? null,
    amount: Number(p.amount),
    method: p.method,
    paymentDate: p.payment_date,
    dueDate: p.due_date,
    status: p.status,
  }));

  return { success: true as const, data: payments };
}

export async function getGymPaymentsOverview(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const asOfDate = getTodayDateStr("Asia/Kolkata");

  const [
    paymentsResult,
    statsResult,
    monthlyRevenueResult,
    statusCountsResult,
  ] = await Promise.all([
    getGymPayments(supabase, gymId),
    supabase
      .rpc("get_gym_payment_stats", { p_gym_id: gymId, p_as_of: asOfDate })
      .single(),
    supabase.rpc("get_gym_monthly_revenue", {
      p_gym_id: gymId,
      p_months: 10,
      p_as_of: asOfDate,
    }),
    supabase.rpc("get_gym_payment_status_counts", { p_gym_id: gymId }),
  ]);

  if (!paymentsResult.success) {
    return { success: false as const, error: paymentsResult.error };
  }
  if (statsResult.error) {
    return { success: false as const, error: statsResult.error.message };
  }

  const stats = statsResult.data;
  const revenueChangePercent =
    stats.revenue_last_month > 0
      ? ((stats.revenue_this_month - stats.revenue_last_month) /
          stats.revenue_last_month) *
        100
      : null; // no baseline to compare against — render "New" rather than a %, see page below

  const statusColors: Record<string, string> = {
    Verified: "#10b981",
    Pending: "#f59e0b",
    PendingVerification: "#eab308",
    Overdue: "#ef4444",
    Refunded: "#6366f1",
    Cancelled: "#8b5cf6",
    Partial: "#0ea5e9",
    Rejected: "#dc2626",
  };

  const statusDistribution = (statusCountsResult.data ?? []).map((s) => ({
    name: s.status,
    value: s.count,
    color: statusColors[s.status] ?? "#94a3b8",
  }));

  return {
    success: true as const,
    data: {
      payments: paymentsResult.data,
      stats,
      revenueChangePercent,
      monthlyRevenue: (monthlyRevenueResult.data ?? []).map((m) => ({
        month: m.month_label,
        revenue: Number(m.revenue),
      })),
      statusDistribution,
    },
  };
}

// Get Payment by Id

export type PaymentDetailData = {
  id: string;
  receiptId: string | null;
  amount: number;
  paymentDate: string | null;
  dueDate: string | null;
  method: string | null;
  status: string;
  transactionRef: string | null;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  verifiedAt: string | null;
  collectedByName: string | null;
  verifiedByName: string | null;
  member: {
    id: string;
    fullName: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    memberCode: string | null;
    photoUrl: string | null;
    createdAt: string;
    memberType: "Normal" | "WalkIn";
  };
  gym: {
    id: string;
    name: string;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
  };
  membership: {
    id: string;
    startDate: string;
    endDate: string;
    durationMonths: number;
    joiningFee: number;
    planPrice: number;
    discount: number;
    finalAmount: number;
    plan: {
      planName: string;
      planCategory: string | null;
      membershipDuration: string;
    } | null;
  } | null;
};

export async function getPaymentById(
  supabase: TypedSupabaseClient,
  paymentId: string,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      id,
      receipt_id,
      amount,
      payment_date,
      due_date,
      method,
      status,
      transaction_ref,
      notes,
      rejection_reason,
      created_at,
      verified_at,
      collected_by_user:users!payments_collected_by_users_id_fk ( full_name ),
      verified_by_user:users!payments_verified_by_users_id_fk ( full_name ),
      member:members (
        id,
        full_name,
        contact_phone,
        contact_email,
        member_code,
        photo_url,
        profile_id,
        created_at
      ),
      gym:gyms (
        id,
        name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        contact_phone,
        contact_email
      ),
      gym_membership:gym_memberships (
        id,
        start_date,
        end_date,
        duration_months,
        joining_fee,
        plan_price,
        discount,
        final_amount,
        plan:membership_plans (
          plan_name,
          plan_category,
          membership_duration
        )
      )
    `,
    )
    .eq("id", paymentId)
    .eq("gym_id", gymId)
    .single();

  if (error || !data) {
    return {
      success: false as const,
      error: error?.message ?? "Payment not found",
    };
  }

  const memberType: "Normal" | "WalkIn" =
    data.member.profile_id !== null ? "Normal" : "WalkIn";

  const payment: PaymentDetailData = {
    id: data.id,
    receiptId: data.receipt_id,
    amount: Number(data.amount),
    paymentDate: data.payment_date,
    dueDate: data.due_date,
    method: data.method,
    status: data.status,
    transactionRef: data.transaction_ref,
    notes: data.notes,
    rejectionReason: data.rejection_reason,
    createdAt: data.created_at,
    verifiedAt: data.verified_at,
    collectedByName: data.collected_by_user?.full_name ?? null,
    verifiedByName: data.verified_by_user?.full_name ?? null,
    member: {
      id: data.member.id,
      fullName: data.member.full_name,
      contactPhone: data.member.contact_phone,
      contactEmail: data.member.contact_email,
      memberCode: data.member.member_code,
      photoUrl: data.member.photo_url,
      createdAt: data.member.created_at,
      memberType,
    },
    gym: {
      id: data.gym.id,
      name: data.gym.name,
      addressLine1: data.gym.address_line1,
      addressLine2: data.gym.address_line2,
      city: data.gym.city,
      state: data.gym.state,
      postalCode: data.gym.postal_code,
      contactPhone: data.gym.contact_phone,
      contactEmail: data.gym.contact_email,
    },
    membership: data.gym_membership
      ? {
          id: data.gym_membership.id,
          startDate: data.gym_membership.start_date,
          endDate: data.gym_membership.end_date,
          durationMonths: data.gym_membership.duration_months,
          joiningFee: Number(data.gym_membership.joining_fee ?? 0),
          planPrice: Number(data.gym_membership.plan_price ?? 0),
          discount: Number(data.gym_membership.discount ?? 0),
          finalAmount: Number(data.gym_membership.final_amount ?? 0),
          plan: data.gym_membership.plan
            ? {
                planName: data.gym_membership.plan.plan_name,
                planCategory: data.gym_membership.plan.plan_category,
                membershipDuration:
                  data.gym_membership.plan.membership_duration,
              }
            : null,
        }
      : null,
  };

  return { success: true as const, data: payment };
}
