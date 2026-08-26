import { SupabaseClient } from "@supabase/supabase-js";

import { ActionResult } from "@/actions/owner.action";
import { Database, Json } from "@/db/database.types";
import { getDisplayStatus } from "@/lib/application-status";
import { formatDateTime, formatDuration, getTodayDateStr } from "@/lib/utils";
import {
  DisplayStatus,
  MembershipApplication,
  MyGymMembershipStatus,
} from "@/types";

type TypedSupabaseClient = SupabaseClient<Database>;

// ============================================================================
// Gym Discovery
// ============================================================================

/**
 * Find a gym by its unique code (e.g. "Q8K7PW").
 */
export async function findGymByCode(
  supabase: TypedSupabaseClient,
  code: string,
) {
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
    .eq("membership_plans.status", "Active")
    .is("membership_plans.deleted_at", null)
    .maybeSingle();

  if (error) return { success: false as const, error: error.message };
  if (!data)
    return { success: false as const, error: "No gym found for that code." };
  return { success: true as const, data };
}

export type GymByCodeResult = Extract<
  Awaited<ReturnType<typeof findGymByCode>>,
  { success: true }
>["data"];

/**
 * List active gyms (for discovery / browse screen).
 * member_count / trainer_count are computed via embedded-resource
 * subqueries (PostgREST turns `foo(count)` into a lateral subquery,
 * not a join, so it doesn't blow up row counts).
 */
export async function listActiveGyms(
  supabase: TypedSupabaseClient,
  options?: {
    city?: string;
    limit?: number;
    offset?: number;
  },
) {
  const { data, error } = await supabase.rpc("get_public_gyms", {
    p_city: options?.city ?? null,
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
  });

  if (error) return { success: false as const, error: error.message };

  const gyms = (data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    code: g.code,
    description: g.gym_description,
    logoUrl: g.logo_url,
    city: g.city,
    state: g.state,
    amenities: g.amenities ?? [],
    isVerified: g.is_verified,
    memberCount: g.member_count ?? 0,
    trainerCount: g.trainer_count ?? 0,
    priceStartingFrom: g.starting_price ?? null,
  }));

  return { success: true as const, data: gyms };
}

export type ActiveGymsResult = Extract<
  Awaited<ReturnType<typeof listActiveGyms>>,
  { success: true }
>["data"];

export type DiscoverGym = {
  id: string;
  name: string;
  city: string | null;
  description: string | null;
  amenities: Json;
  isVerified: boolean;
  memberCount: number;
  trainerCount: number;
  priceStartingFrom: number | null;
  applicationStatus: "none" | "pending" | "approved" | "rejected";
  logoUrl: string | null;
};

export type ApplicationStatus = "none" | "pending" | "approved" | "rejected";

export type GymMembershipStatus =
  | "PaymentPending"
  | "PaymentUploaded"
  | "PaymentRejected"
  | "Active"
  | "Expired"
  | "Cancelled"
  | "Frozen";

export type SelectedPlan = {
  id: string;
  name: string;
  planPrice: number;
  joiningFee: number;
  finalAmount: number;
  durationMonths: number;
};

/**
 * `memberId` is resolved by the caller (from the member store / session)
 * instead of being re-derived here via a Clerk `auth()` call on every
 * invocation.
 */
export async function getDiscoverGyms(
  supabase: TypedSupabaseClient,
  memberId: string,
  city?: string,
) {
  const result = await listActiveGyms(supabase, { city, limit: 500 });
  if (!result.success) return { success: false as const, error: result.error };

  type Entry = {
    applicationStatus: ApplicationStatus;
    selectedPlan: SelectedPlan | null;
    membershipStatus: GymMembershipStatus | null;
  };
  const statusByGym = new Map<string, Entry>();

  const { data: apps, error: appsError } = await supabase
    .from("membership_applications")
    .select(
      `
      id,
      gym_id,
      status,
      membership_plans:plan_id ( id, plan_name, plan_price, duration_months ),
      gym_memberships!application_id (
        status,
        plan_price,
        joining_fee,
        final_amount,
        duration_months
      )
    `,
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (appsError) {
    console.error(appsError);
  }

  for (const a of apps ?? []) {
    if (statusByGym.has(a.gym_id)) continue; // newest application per gym wins

    // plan_id is NOT NULL on membership_applications, so this is always present
    const plan = Array.isArray(a.membership_plans)
      ? a.membership_plans[0]
      : a.membership_plans;
    // application_id on gym_memberships is nullable, so this can be absent
    // (e.g. status still "Pending", membership row not created yet)
    const membership = Array.isArray(a.gym_memberships)
      ? a.gym_memberships[0]
      : a.gym_memberships;

    statusByGym.set(a.gym_id, {
      applicationStatus:
        a.status === "Approved"
          ? "approved"
          : a.status === "Rejected"
            ? "rejected"
            : "pending",
      selectedPlan: plan
        ? {
            id: plan.id,
            name: plan.plan_name,
            // gym_memberships.final_amount is what was actually charged
            // (plan_price minus discount, locked in at approval time).
            // Before a membership row exists, fall back to the plan's
            // current list price. numeric columns come back as strings.
            planPrice: Number(membership?.plan_price ?? plan.plan_price),
            joiningFee: Number(membership?.joining_fee ?? 0),
            finalAmount: Number(
              membership?.final_amount ??
                membership?.plan_price ??
                plan.plan_price,
            ),
            durationMonths: membership?.duration_months ?? plan.duration_months,
          }
        : null,
      membershipStatus: (membership?.status as GymMembershipStatus) ?? null,
    });
  }

  const data = result.data.map((g) => {
    const entry = statusByGym.get(g.id);
    return {
      ...g,
      applicationStatus: entry?.applicationStatus ?? "none",
      selectedPlan: entry?.selectedPlan ?? null,
      membershipStatus: entry?.membershipStatus ?? null,
    };
  });

  return { success: true as const, data };
}

export type DiscoverGymsResult = Extract<
  Awaited<ReturnType<typeof getDiscoverGyms>>,
  { success: true }
>["data"];

//Member/discover/[id] Queries
export async function getGymDetail(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("gyms")
    .select(
      `
      id,
      name,
      code,
      gym_description,
      logo_url,
      address_line1,
      address_line2,
      city,
      state,
      contact_phone,
      contact_email,
      amenities,
      is_verified,
      trainers (
        id,
        full_name,
        photo_url,
        professional_title,
        experience_years,
        average_rating,
        total_reviews,
        status
      ),
      membership_plans (
        id,
        plan_name,
        plan_price,
        pricing_type,
        duration_months,
        membership_duration,
        selected_features,
        is_featured,
        status
      ),
      gym_photos (
        id,
        photo_url,
        is_cover,
        sort_order,
        status
      )
      `,
    )
    .eq("id", gymId)
    .eq("status", "Active")
    .single();

  if (error) return { success: false as const, error: error.message };

  return {
    success: true as const,
    data: data,
  };
}

export type GymDetailResult = Extract<
  Awaited<ReturnType<typeof getGymDetail>>,
  { success: true }
>["data"];

export type MembershipApplicationByPlanIdPageData = {
  gym: {
    id: string;
    name: string;
    logoUrl: string | null;
    description: string | null;
    city: string | null;
    address: string | null;
    isVerified: boolean;
    paymentQrUrl: string | null;
    memberCount: number;
    trainerCount: number;
  };
  plan: {
    id: string;
    name: string;
    shortDescription: string;
    durationMonths: number;
    membershipDuration: string;
    price: number;
    joiningFee: number;
    benefits: string[];
  };
  member: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  gymMembership: {
    id: string;
    planId: string;
    applicationId: string | null;
    startDate: string;
    endDate: string;
    durationMonths: number;
    joiningFee: number;
    planPrice: number;
    discount: number;
    finalAmount: number;
    status: "Active" | "Expired" | "Cancelled" | "Frozen" | string;
    paymentVerificationRequired: boolean;
    activatedAt: string | null;
    isFrozen: boolean;
    freezeStartDate: string | null;
    freezeEndDate: string | null;
    totalFreezeDays: number;
    cancelledAt: string | null;
    cancellationReason: string | null;
  } | null;
  existingApplicationStatus: "none" | "pending" | "approved" | "rejected";
};

export async function MembershipApplicationPageDataByPlanId(
  supabase: TypedSupabaseClient,
  gymId: string,
  planId: string,
): Promise<MembershipApplicationByPlanIdPageData | null> {
  const { data, error } = await supabase.rpc(
    "get_membership_application_page_data",
    {
      p_gym_id: gymId,
      p_plan_id: planId,
    },
  );

  if (error || !data) return null;

  return data as MembershipApplicationByPlanIdPageData;
}

// This RPC wrapper returns the page-data shape directly (or null) rather
// than a { success, data } envelope, so there's no matching Result type
// via the Extract<..., { success: true }> pattern used elsewhere below.
export type MembershipApplicationPageDataByPlanIdResult = Awaited<
  ReturnType<typeof MembershipApplicationPageDataByPlanId>
>;

// ============================================================================
// Membership timeline status
export type MyMembershipStatusResult = {
  success: true;
  displayStatus: DisplayStatus | "none";
  planId: string | null;
  membershipPlanDetails?: {
    id: string;
    plan_name: string;
    plan_price: number;
    duration_months: number;
    membership_duration: string;
    selected_features: Json;
    custom_features: Json;
  } | null;
};

/**
 * `memberId` and `gymId` are resolved by the caller — no `auth()` call here.
 */
export async function getMyMembershipStatusWithPlanDetails(
  supabase: TypedSupabaseClient,
  memberId: string,
  gymId: string,
) {
  const { data: application } = await supabase
    .from("membership_applications")
    .select(
      `
      id,
      status,
      plan_id,
      gym_memberships (
        id,
        plan_id,
        status
      ),
      membership_plans(
        id,
        plan_name,
        plan_price,
        duration_months,
        membership_duration,
        selected_features,
        custom_features
      )
    `,
    )
    .eq("gym_id", gymId)
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!application) {
    return { success: true, displayStatus: "none", planId: null };
  }

  const displayStatus = getDisplayStatus(application);
  const membership = application.gym_memberships?.[0];

  return {
    success: true,
    displayStatus,
    planId: (membership?.plan_id ?? application.plan_id) as string,
    membershipPlanDetails: application.membership_plans,
  };
}

// Already has an explicit named return shape above (MyMembershipStatusResult),
// so no separate Extract<...>["data"] alias is added here.

// ============================================================================
// Dashboard read-only queries
export async function getMyProfile(supabase: TypedSupabaseClient) {
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

export type MyProfileResult = Extract<
  Awaited<ReturnType<typeof getMyProfile>>,
  { success: true }
>["data"];

export async function getMyMemberships(supabase: TypedSupabaseClient) {
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

export type MyMembershipsResult = Extract<
  Awaited<ReturnType<typeof getMyMemberships>>,
  { success: true }
>["data"];

/**
 * `memberId` is resolved by the caller — no `auth()` call here.
 */
export async function getMyApplications(
  supabase: TypedSupabaseClient,
  memberId: string,
) {
  const { data, error } = await supabase
    .from("membership_applications")
    .select(
      `
      id,
      status,
      message,
      rejection_reason,
      created_at,
      reviewed_at,
      reviewer:users (
        full_name,
        avatar_url
      ),
      gyms (
        id,
        name,
        logo_url,
        contact_email,
        contact_phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        is_verified,
        payment_qr_url,
        owner:users (
          id,
          full_name,
          avatar_url,
          phone,
          email
        )
      ),
      membership_plans (
        id,
        plan_name,
        plan_price,
        joining_fee,
        membership_duration,
        selected_features,
        custom_features
      ),
      gym_memberships (
        id,
        status,
        start_date,
        end_date,
        final_amount,
        joining_fee,
        plan_price,
        discount,
        activated_at,
        cancelled_at,
        cancellation_reason,
        updated_at,
        payments (
          id,
          amount,
          status,
          method,
          transaction_ref,
          payment_date,
          verified_at,
          rejection_reason,
          notes,
          created_at,
          payment_receipts (
            id,
            file_url,
            is_current,
            uploaded_at
          )
        )
      )
    `,
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { success: false as const, data: [], error: error?.message };
  }

  return { success: true as const, data: data };
}

export type MyApplicationsResult = Extract<
  Awaited<ReturnType<typeof getMyApplications>>,
  { success: true }
>["data"];

/**
 * `memberId` is resolved by the caller — no `auth()` call here.
 */
export async function getMyApplicationById(
  supabase: TypedSupabaseClient,
  memberId: string,
  applicationId: string,
) {
  const { data, error } = await supabase
    .from("membership_applications")
    .select(
      `
      id,
      message,
      status,
      rejection_reason,
      created_at,
      reviewed_at,
      reviewer:users (
        full_name
      ),
      gyms (
        id,
        name,
        logo_url,
        contact_email,
        contact_phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        is_verified,
        payment_qr_url,
        owner:users (
          id,
          full_name,
          avatar_url,
          phone,
          email
        )
      ),
      membership_plans (
        id,
        plan_name,
        plan_price,
        joining_fee,
        membership_duration,
        selected_features,
        custom_features
      ),
      gym_memberships (
        id,
        status,
        final_amount,
        activated_at,
        cancelled_at,
        cancellation_reason,
        payments (
          id,
          amount,
          status,
          method,
          verified_at,
          rejection_reason,
          created_at,
          updated_at,
          payment_receipts (
            id,
            file_url,
            is_current,
            uploaded_at
          )
        )
      )
    `,
    )
    .eq("id", applicationId)
    .eq("member_id", memberId)
    .order("uploaded_at", {
      referencedTable: "gym_memberships.payments.payment_receipts",
      ascending: false,
    })
    .limit(1, {
      referencedTable: "gym_memberships.payments.payment_receipts",
    })
    .maybeSingle();

  if (error) {
    console.error(error);
    return { success: false as const, data: null, error: error.message };
  }
  if (!data) {
    return {
      success: false as const,
      data: null,
      error: "Application not found.",
    };
  }

  return { success: true as const, data };
}

export type MyApplicationByIdResult = Extract<
  Awaited<ReturnType<typeof getMyApplicationById>>,
  { success: true }
>["data"];

/**
 * Get the active payment for a membership (Pending or Rejected = needs action).
 */
export async function getPaymentForMembership(
  supabase: TypedSupabaseClient,
  gymMembershipId: string,
) {
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

export type PaymentForMembershipResult = Extract<
  Awaited<ReturnType<typeof getPaymentForMembership>>,
  { success: true }
>["data"];

export async function getMyPayments(supabase: TypedSupabaseClient) {
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

export type MyPaymentsResult = Extract<
  Awaited<ReturnType<typeof getMyPayments>>,
  { success: true }
>["data"];

export async function getMyAttendance(
  supabase: TypedSupabaseClient,
  gymId?: string,
) {
  if (!gymId) {
    return { success: false as const, error: "Gym ID is required." };
  }
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

export type MyAttendanceResult = Extract<
  Awaited<ReturnType<typeof getMyAttendance>>,
  { success: true }
>["data"];

export async function getMyTrainingSessions(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      `
      *,
      trainers(id, professional_title,photo_url,full_name),
      session_exercises(
        *,
        exercises(id, name, muscle_group, equipment)
      )
    `,
    )
    .eq("gym_id", gymId)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type MyTrainingSessionsResult = Extract<
  Awaited<ReturnType<typeof getMyTrainingSessions>>,
  { success: true }
>["data"];

export async function getTrainingSessionById(
  supabase: TypedSupabaseClient,
  sessionId: string,
) {
  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      `
      *,
      trainers(id, professional_title, photo_url, full_name),
      session_exercises(
        *,
        exercises(id, name, muscle_group, equipment)
      )
    `,
    )
    .eq("id", sessionId)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type TrainingSessionByIdResult = Extract<
  Awaited<ReturnType<typeof getTrainingSessionById>>,
  { success: true }
>["data"];

/**
 * `gymId` is resolved by the caller. This replaces the old two-hop lookup
 * (members -> active_gym_membership_id -> gyms(timezone)) with a single
 * direct `gyms` read, and scopes the sessions query to that gym instead of
 * relying on RLS alone to narrow the rows.
 */
export async function getMyUpcomingSessions(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data: gym } = await supabase
    .from("gyms")
    .select("timezone")
    .eq("id", gymId)
    .maybeSingle();

  const timezone = gym?.timezone ?? "Asia/Kolkata";
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
    .eq("gym_id", gymId)
    .eq("status", "Upcoming")
    .gte("session_date", today)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type MyUpcomingSessionsResult = Extract<
  Awaited<ReturnType<typeof getMyUpcomingSessions>>,
  { success: true }
>["data"];

/**
 * `gymId` is resolved by the caller and used to scope the query directly,
 * instead of fetching every active assignment across all of the member's
 * gyms and relying on RLS to narrow it.
 */
export async function getMyAssignedTrainers(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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
    .eq("gym_id", gymId)
    .eq("is_active", true);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type MyAssignedTrainersResult = Extract<
  Awaited<ReturnType<typeof getMyAssignedTrainers>>,
  { success: true }
>["data"];

//Get Membership details

export type MemberPayment = {
  id: string;
  date: string | null;
  amount: number;
  method: string | null;
  plan: string;
  duration: string;
  status: "paid" | "pending" | "failed";
};

export type MembershipTimelineEvent = {
  id: string;
  label: string;
  date: string;
  completed: boolean;
};

function mapPaymentStatus(status: string): MemberPayment["status"] {
  if (status === "Verified") return "paid";
  if (status === "Rejected" || status === "Cancelled") return "failed";
  return "pending";
}

/**
 * `gymId` is now resolved by the caller (the member store already tracks
 * the active gym), so this skips the extra `gym_memberships` round trip
 * that used to exist purely to derive it.
 */
export async function getMyMembershipDetails(
  supabase: TypedSupabaseClient,
  memberId: string,
  gymId: string,
) {
  const asOfDate = getTodayDateStr("Asia/Kolkata");

  /*
   * ------------------------------------------------------------
   * Fetch all required data in parallel
   * ------------------------------------------------------------
   */
  const [
    { data: memberships, error: membershipError },
    { data: gym, error: gymError },
    { data: trainerAssignment, error: trainerAssignmentError },
    { data: payments, error: paymentsError },
    { data: attendanceStats, error: attendanceError },
  ] = await Promise.all([
    /*
     * ----------------------------------------------------------
     * All memberships for this member in the current gym.
     *
     * Includes:
     *   Active
     *   Scheduled
     *
     * Excludes:
     *   Cancelled
     * ----------------------------------------------------------
     */
    supabase
      .from("gym_memberships")
      .select(
        `
        id,
        status,
        start_date,
        end_date,
        duration_months,
        final_amount,
        created_at,
        plan:membership_plans (
          id,
          plan_name,
          plan_category,
          membership_duration,
          selected_features,
          custom_features
        )
      `,
      )
      .eq("member_id", memberId)
      .eq("gym_id", gymId)
      .neq("status", "Cancelled")
      .order("start_date", { ascending: true }),

    /*
     * ----------------------------------------------------------
     * Gym details
     * ----------------------------------------------------------
     */
    supabase
      .from("gyms")
      .select("id, name, city, state")
      .eq("id", gymId)
      .single(),

    /*
     * ----------------------------------------------------------
     * Active trainer assignment
     * ----------------------------------------------------------
     */
    supabase
      .from("trainer_assignments")
      .select(
        `
        trainer:trainers (
          id,
          full_name,
          photo_url
        )
      `,
      )
      .eq("gym_id", gymId)
      .eq("member_id", memberId)
      .eq("is_active", true)
      .eq("is_primary", true)
      .maybeSingle(),

    /*
     * ----------------------------------------------------------
     * Latest payments
     * ----------------------------------------------------------
     */
    supabase
      .from("payments")
      .select(
        `
        id,
        amount,
        payment_date,
        method,
        status,
        gym_membership:gym_memberships (
          duration_months,
          plan:membership_plans (
            plan_name
          )
        )
      `,
      )
      .eq("gym_id", gymId)
      .eq("member_id", memberId)
      .order("payment_date", { ascending: false })
      .limit(10),

    /*
     * ----------------------------------------------------------
     * Attendance statistics
     *
     * ONE RPC now returns:
     *
     *   days_attended
     *   total_days
     *   attendance_rate
     *   current_streak
     *   longest_streak
     *
     * No attendance rows are transferred to Next.js.
     * ----------------------------------------------------------
     */
    supabase.rpc("get_member_attendance_stats", {
      p_member_ids: [memberId],
      p_gym_id: gymId,
      p_as_of: asOfDate,
    }),
  ]);

  /*
   * ------------------------------------------------------------
   * Handle membership error
   * ------------------------------------------------------------
   */
  if (membershipError || !memberships || memberships.length === 0) {
    return {
      success: false as const,
      error: membershipError?.message ?? "No membership found",
    };
  }

  /*
   * ------------------------------------------------------------
   * Log independent query errors
   * ------------------------------------------------------------
   */

  if (gymError) {
    console.error("Gym fetch failed:", gymError.message);
  }

  if (trainerAssignmentError) {
    console.error(
      "Trainer assignment fetch failed:",
      trainerAssignmentError.message,
    );
  }

  if (paymentsError) {
    console.error("Payments fetch failed:", paymentsError.message);
  }

  if (attendanceError) {
    console.error(
      "get_member_attendance_stats failed:",
      attendanceError.message,
    );
  }

  /*
   * ------------------------------------------------------------
   * Determine CURRENT membership
   * ------------------------------------------------------------
   *
   * First preference:
   *   Active + currently within start/end date
   *
   * Second preference:
   *   Any Active membership
   *
   * Scheduled memberships are never selected as current.
   * ------------------------------------------------------------
   */
  const current =
    memberships.find(
      (m) =>
        m.status === "Active" &&
        m.start_date <= asOfDate &&
        m.end_date >= asOfDate,
    ) ?? memberships.find((m) => m.status === "Active");

  if (!current) {
    return {
      success: false as const,
      error: "No current active membership found",
    };
  }

  /*
   * ------------------------------------------------------------
   * Determine SCHEDULED membership
   * ------------------------------------------------------------
   *
   * If multiple scheduled memberships exist, use the one
   * starting soonest.
   * ------------------------------------------------------------
   */
  const scheduledMembership =
    memberships
      .filter((m) => m.status === "Scheduled" && m.start_date > asOfDate)
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      )[0] ?? null;

  /*
   * ------------------------------------------------------------
   * Membership duration calculations
   * ------------------------------------------------------------
   */
  const totalDays =
    Math.round(
      (new Date(current.end_date).getTime() -
        new Date(current.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const usedDays = Math.min(
    Math.max(
      Math.round(
        (new Date(asOfDate).getTime() -
          new Date(current.start_date).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1,
      0,
    ),
    totalDays,
  );

  /*
   * ------------------------------------------------------------
   * Total verified payments
   * ------------------------------------------------------------
   */
  const totalPayments = (payments ?? [])
    .filter((p) => p.status === "Verified")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  /*
   * ------------------------------------------------------------
   * Attendance statistics
   * ------------------------------------------------------------
   *
   * Everything is calculated inside PostgreSQL.
   *
   * No:
   *
   *   .from("attendance")
   *   .select("attendance_date")
   *   computeStreak()
   *
   * is required anymore.
   * ------------------------------------------------------------
   */
  const attendance = attendanceStats?.[0];

  const presentDays = Number(attendance?.days_attended ?? 0);

  const attendanceRate = Number(attendance?.attendance_rate ?? 0);

  const currentStreak = Number(attendance?.current_streak ?? 0);

  const longestStreak = Number(attendance?.longest_streak ?? 0);

  /*
   * ------------------------------------------------------------
   * First membership / first verified payment
   * ------------------------------------------------------------
   */
  const firstMembership = memberships[0];

  const firstVerifiedPayment = [...(payments ?? [])]
    .filter((p) => p.status === "Verified")
    .sort((a, b) =>
      (a.payment_date ?? "").localeCompare(b.payment_date ?? ""),
    )[0];

  /*
   * ------------------------------------------------------------
   * Membership timeline
   * ------------------------------------------------------------
   */
  const timeline: MembershipTimelineEvent[] = [
    {
      id: "started",
      label: "Membership Started",
      date: firstMembership.start_date,
      completed: true,
    },

    ...(firstVerifiedPayment
      ? [
          {
            id: "first-payment",
            label: "First Payment",
            date:
              firstVerifiedPayment.payment_date ?? firstMembership.start_date,
            completed: true,
          },
        ]
      : []),

    ...memberships.slice(1).map((m) => ({
      id: `renewed-${m.id}`,
      label: "Plan Renewed",
      date: m.start_date,
      completed: m.start_date <= asOfDate,
    })),

    {
      id: "current",
      label: "Current Plan Active",
      date: current.start_date,
      completed:
        current.status === "Active" &&
        current.start_date <= asOfDate &&
        current.end_date >= asOfDate,
    },

    {
      id: "next-renewal",
      label: scheduledMembership
        ? "Upcoming Renewal Scheduled"
        : "Next Renewal",
      date: scheduledMembership?.start_date ?? current.end_date,
      completed: false,
    },
  ];

  /*
   * ------------------------------------------------------------
   * Return result
   * ------------------------------------------------------------
   */
  return {
    success: true as const,

    data: {
      /*
       * Current active membership
       */
      membership: current,

      /*
       * Paid scheduled renewal, if any
       */
      scheduledMembership,

      /*
       * Gym
       */
      gym,

      /*
       * Active trainer
       */
      trainer: trainerAssignment?.trainer ?? null,

      /*
       * Membership duration
       */
      totalDays,

      usedDays,

      /*
       * Total verified payments
       */
      totalPayments,

      /*
       * Payment history
       */
      payments: (payments ?? []).map(
        (p): MemberPayment => ({
          id: p.id,
          date: p.payment_date,
          amount: Number(p.amount),
          method: p.method,

          plan: p.gym_membership?.plan?.plan_name ?? "—",

          duration: p.gym_membership?.duration_months
            ? `${p.gym_membership.duration_months} Month${
                p.gym_membership.duration_months > 1 ? "s" : ""
              }`
            : "—",

          status: mapPaymentStatus(p.status),
        }),
      ),

      /*
       * Membership timeline
       */
      timeline,

      /*
       * Attendance statistics
       */
      stats: {
        totalVisits: presentDays,
        presentDays,
        attendanceRate,
        currentStreak,
        longestStreak,
      },
    },
  };
}

export type MyMembershipResult = Extract<
  Awaited<ReturnType<typeof getMyMembershipDetails>>,
  { success: true }
>["data"];

export async function getMyMessages(supabase: TypedSupabaseClient) {
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

export type MyMessagesResult = Extract<
  Awaited<ReturnType<typeof getMyMessages>>,
  { success: true }
>["data"];

export async function getUnreadMessageCount(
  supabase: TypedSupabaseClient,
): Promise<ActionResult<{ count: number }>> {
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

// Already has an explicit return type annotation (ActionResult<{ count }>),
// so no separate Extract<...>["data"] alias is added here.

export async function getTodayAttendanceStatus(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
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

export type TodayAttendanceStatusResult = Extract<
  Awaited<ReturnType<typeof getTodayAttendanceStatus>>,
  { success: true }
>["data"];

export type MemberAttendanceStats = {
  daysAttended: number;
  totalDays: number;
  attendanceRate: number;
  currentStreak: number;
  longestStreak: number;
};

export async function getMemberAttendanceStats(
  supabase: TypedSupabaseClient,
  memberId: string,
  gymId: string,
  asOfDate: string,
) {
  const { data, error } = await supabase.rpc("get_my_attendance_stats", {
    p_member_id: memberId,
    p_gym_id: gymId,
    p_as_of: asOfDate,
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  const row = data?.[0];

  // Postgres numeric/int columns arrive as strings over PostgREST — coerce
  // at the boundary so every consumer gets real numbers.
  const stats: MemberAttendanceStats = {
    daysAttended: Number(row?.days_attended ?? 0),
    totalDays: Number(row?.total_days ?? 0),
    attendanceRate: Number(row?.attendance_rate ?? 0),
    currentStreak: Number(row?.current_streak ?? 0),
    longestStreak: Number(row?.longest_streak ?? 0),
  };

  return { success: true as const, data: stats };
}

export type MemberAttendanceStatsResult = Extract<
  Awaited<ReturnType<typeof getMemberAttendanceStats>>,
  { success: true }
>["data"];

export type AttendanceHistoryRow = {
  date: string; // yyyy-MM-dd
  checkIn: string | null; // formatted "07:02 AM"
  checkOut: string | null;
  duration: string | null; // formatted "1h 13m"
  session: string | null;
  workoutType: string | null;
  trainer: string | null;
  status: "present" | "missed" | "no_session";
};

export function mostFrequent(values: (string | null)[]) {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let top: string | null = null;
  let max = 0;
  for (const [v, c] of counts) {
    if (c > max) {
      top = v;
      max = c;
    }
  }
  return top;
}

// Plain helper (no supabase query, no { success, data } envelope) — no
// Result type alias applies here.

export async function getMemberAttendanceOverview(
  supabase: TypedSupabaseClient,
  memberId: string,
  gymId: string,
) {
  const asOfDate = getTodayDateStr("Asia/Kolkata");
  const calendarMonthStart = asOfDate.slice(0, 8) + "01";

  // Membership must be fetched first — the history window is bounded by
  // its start_date, so there's nothing to parallelize here anymore.
  const { data: membership, error: membershipError } = await supabase
    .from("gym_memberships")
    .select("start_date, end_date, status")
    .eq("member_id", memberId)
    .eq("gym_id", gymId)
    .eq("status", "Active")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    return { success: false as const, error: membershipError.message };
  }

  // Fallback: no active membership found (e.g. lapsed member) — still show
  // a year of history rather than nothing, but this is the exception path,
  // not the normal one.
  const fallbackStart = new Date(asOfDate);
  fallbackStart.setDate(fallbackStart.getDate() - 365);
  const historyStart =
    membership?.start_date ?? fallbackStart.toISOString().slice(0, 10);

  const [{ data: historyRaw, error: historyError }, statsResult] =
    await Promise.all([
      supabase.rpc("get_member_attendance_history", {
        p_member_id: memberId,
        p_gym_id: gymId,
        p_start_date: historyStart,
        p_end_date: asOfDate,
      }),

      getMemberAttendanceStats(supabase, memberId, gymId, asOfDate),
    ]);

  if (historyError) {
    return { success: false as const, error: historyError.message };
  }
  if (!statsResult.success) {
    console.error("get_my_attendance_stats failed:", statsResult.error);
  }

  const rows = historyRaw ?? [];

  const history: AttendanceHistoryRow[] = rows.map((r) => ({
    date: r.activity_date,
    checkIn: formatDateTime(r.check_in),
    checkOut: formatDateTime(r.check_out),
    duration: formatDuration(r.duration_minutes),
    session: r.session_name,
    workoutType: r.workout_type,
    trainer: r.trainer_name,
    status: r.status as AttendanceHistoryRow["status"],
  }));

  const presentRows = history.filter((r) => r.status === "present");

  // "This month" is still capped at the membership start, same as before —
  // now redundant with the RPC's own lower bound when a membership exists,
  // but kept as a safety net for the fallback (no-membership) path.
  const effectiveMonthStart =
    membership?.start_date && membership.start_date > calendarMonthStart
      ? membership.start_date
      : calendarMonthStart;

  const thisMonthPresent = presentRows.filter(
    (r) => r.date >= effectiveMonthStart,
  );
  const thisMonthMissed = history.filter(
    (r) => r.status === "missed" && r.date >= effectiveMonthStart,
  );
  const daysSoFarThisMonth =
    Math.round(
      (new Date(asOfDate).getTime() - new Date(effectiveMonthStart).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const lastVisit = presentRows[0] ?? null;

  const stats = statsResult.success
    ? statsResult.data
    : {
        daysAttended: 0,
        totalDays: 0,
        attendanceRate: 0,
        currentStreak: 0,
        longestStreak: 0,
      };

  return {
    success: true as const,
    data: {
      membership,
      history,
      stats: {
        totalCheckInsThisMonth: thisMonthPresent.length,
        missedThisMonth: thisMonthMissed.length,
        daysSoFarThisMonth,
        attendanceRate: stats.attendanceRate,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        lastVisitDate: lastVisit?.date ?? null,
        lastVisitTime: lastVisit?.checkIn ?? null,
        mostAttendedWorkout: mostFrequent(
          presentRows.map((r) => r.workoutType),
        ),
        mostFrequentTrainer: mostFrequent(presentRows.map((r) => r.trainer)),
      },
    },
  };
}

export type AttendanceOverviewResult = Extract<
  Awaited<ReturnType<typeof getMemberAttendanceOverview>>,
  { success: true }
>["data"];
