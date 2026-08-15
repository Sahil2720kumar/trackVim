import { ActionResult } from "@/actions/owner.action";
import { Json } from "@/db/database.types";
import { getDisplayStatus } from "@/lib/application-status";
import { createServerClient } from "@/lib/supabase/server";
import { getTodayDateStr } from "@/lib/utils";
import {
  DisplayStatus,
  MembershipApplication,
  MyGymMembershipStatus,
} from "@/types";
import { auth } from "@clerk/nextjs/server";

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
    .eq("membership_plans.status", "Active")
    .is("membership_plans.deleted_at", null)
    .maybeSingle();

  if (error) return { success: false as const, error: error.message };
  if (!data)
    return { success: false as const, error: "No gym found for that code." };
  return { success: true as const, data };
}

/**
 * List active gyms (for discovery / browse screen).
 * member_count / trainer_count are computed via embedded-resource
 * subqueries (PostgREST turns `foo(count)` into a lateral subquery,
 * not a join, so it doesn't blow up row counts).
 */

export async function listActiveGyms(options?: {
  city?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createServerClient();

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

export async function getDiscoverGyms(city?: string) {
  const { userId, sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as { memberId?: string };

  if (!userId || !meta.memberId) {
    return { success: false as const, error: "User not found" };
  }
  const supabase = await createServerClient();

  const result = await listActiveGyms({ city, limit: 500 });
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
    .eq("member_id", meta.memberId!)
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

//Member/discover/[id] Queries
export async function getGymDetail(gymId: string) {
  const supabase = await createServerClient();

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

/**
 * Current member's application status for a given gym.
 * Returns "none" if the member has never applied.
 */

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
  gymId: string,
  planId: string,
): Promise<MembershipApplicationByPlanIdPageData | null> {
  const supabase = await createServerClient();
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

export async function getMyMembershipStatusWithPlanDetails(gymId: string) {
  const { userId, sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as { memberId?: string };

  if (!userId || !meta.memberId) {
    return {
      success: false,
      error: "You must be signed in to view your applications.",
    };
  }

  const supabase = await createServerClient();

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
    .eq("member_id", meta.memberId)
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
  const { userId, sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as { memberId?: string };

  if (!userId || !meta.memberId) {
    return {
      success: false,
      error: "You must be signed in to view your applications.",
    };
  }

  const supabase = await createServerClient();

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
    .eq("member_id", meta.memberId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { success: false, data: [], error: error?.message };
  }

  return { success: true, data: data };
}

export async function getMyApplicationById(applicationId: string) {
  const { userId, sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as { memberId?: string };

  if (!userId || !meta.memberId) {
    return {
      success: false,
      error: "You must be signed in to view your applications.",
    };
  }

  const supabase = await createServerClient();

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
    .eq("member_id", meta.memberId)
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
    return { success: false, data: null, error: error.message };
  }
  if (!data) {
    return { success: false, data: null, error: "Application not found." };
  }

  return { success: true, data };
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
  const supabase = await createServerClient();
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
    // Chronological, soonest-first — matches how the page uses this
    // (upcoming sessions first, not most-recently-created first).
    // RLS's "Members can view their own sessions" policy already scopes
    // this to member_id = current_member_id(), so no explicit filter needed.
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getTrainingSessionById(sessionId: string) {
  const supabase = await createServerClient();

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
