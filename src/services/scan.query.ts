import { Database } from "@/db/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabaseClient = SupabaseClient<Database>;

export type AttendanceStatus = "not-checked-in" | "checked-in" | "checked-out";

export type MembershipView = {
  gymId: string;
  gymName: string;
  planName: string;
  planType: string;
  startDate: string;
  endDate: string;
  durationLabel: string;
  daysRemaining?: number;
};

export type AttendanceView = {
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  durationMinutes?: number;
};

export type DetailItem = {
  key: string;
  label: string;
  value: string;
};

export type MemberHomeState =
  | { kind: "no-gym" }
  | {
      kind: "pending";
      application: {
        gymId: string;
        gymName: string;
        planName: string;
        appliedOn: string;
      };
    }
  | {
      kind: "active";
      membership: MembershipView;
      attendance: AttendanceView;
    }
  | {
      kind: "not-started";
      membership: MembershipView;
      details: DetailItem[];
    }
  | {
      kind: "expired";
      membership: MembershipView;
      details: DetailItem[];
    }
  | {
      kind: "payment-pending";
      membership: MembershipView;
      details: DetailItem[];
    }
  | {
      kind: "payment-rejected";
      membership: MembershipView;
      details: DetailItem[];
    }
  | {
      kind: "cancelled";
      membership: MembershipView;
      details: DetailItem[];
    }
  | {
      kind: "frozen";
      membership: MembershipView;
      details: DetailItem[];
    };

function durationLabel(months: number) {
  return months === 1 ? "1 Month" : `${months} Months`;
}

function todayIsoInTimezone(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function daysBetween(fromIso: string, toIso: string) {
  const MS_PER_DAY = 86_400_000;

  return Math.ceil(
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / MS_PER_DAY,
  );
}

function toMembershipView(row: any, daysRemaining?: number): MembershipView {
  return {
    gymId: row.gym_id ?? row.gyms?.id ?? "",
    gymName: row.gyms?.name ?? "Your gym",
    planName: row.membership_plans?.plan_name ?? "Membership",
    planType: row.membership_plans?.plan_category ?? "Standard",
    startDate: row.start_date,
    endDate: row.end_date,
    durationLabel: durationLabel(row.duration_months),
    daysRemaining,
  };
}

export async function getMemberHomeState(
  supabase: TypedSupabaseClient,
  memberId: string,
  activeGymId: string,
  activeMembershipId: string,
): Promise<MemberHomeState> {
  // query Supabase

  if (!memberId || !activeMembershipId) {
    return {
      kind: "no-gym",
    };
  }

  // ------------------------------------------------------------
  // 3. Get the SELECTED membership only
  // ------------------------------------------------------------

  const { data: membership, error: membershipError } = await supabase
    .from("gym_memberships")
    .select(
      `
          id,
          gym_id,
          start_date,
          end_date,
          duration_months,
          status,
          is_frozen,
          freeze_start_date,
          cancelled_at,
          created_at,

          gyms (
            id,
            name,
            timezone
          ),

          membership_plans (
            plan_name,
            plan_category
          )
        `,
    )
    .eq("id", activeMembershipId)
    .eq("member_id", memberId)
    .eq("gym_id", activeGymId)
    .maybeSingle();

  if (membershipError) {
    console.error("[getMemberHomeState] membership", membershipError);

    throw new Error("Failed to load membership");
  }

  // ------------------------------------------------------------
  // 4. No membership for selected gym
  // ------------------------------------------------------------

  if (!membership) {
    return {
      kind: "no-gym",
    };
  }

  const currentMembership = membership as any;

  // ------------------------------------------------------------
  // 5. Get TODAY using THIS gym's timezone
  // ------------------------------------------------------------

  const gymTimezone = currentMembership.gyms?.timezone ?? "Asia/Kolkata";

  const todayIso = todayIsoInTimezone(gymTimezone);

  // ------------------------------------------------------------
  // 6. Check whether selected membership is active TODAY
  // ------------------------------------------------------------

  const isActiveToday =
    currentMembership.status === "Active" &&
    currentMembership.start_date <= todayIso &&
    currentMembership.end_date >= todayIso &&
    !currentMembership.is_frozen;

  // ------------------------------------------------------------
  // 7. Active membership
  // ------------------------------------------------------------

  if (isActiveToday) {
    const { data: attendanceRow, error: attendanceError } = await supabase
      .from("attendance")
      .select("check_in, check_out, duration_minutes")
      .eq("member_id", memberId)
      .eq("gym_id", activeGymId)
      .eq("attendance_date", todayIso)
      .maybeSingle();

    if (attendanceError) {
      console.error("[getMemberHomeState] attendance", attendanceError);
    }

    let attendance: AttendanceView;

    if (!attendanceRow) {
      attendance = {
        status: "not-checked-in",
      };
    } else if (!attendanceRow.check_out) {
      attendance = {
        status: "checked-in",
        checkIn: attendanceRow.check_in,
      };
    } else {
      attendance = {
        status: "checked-out",
        checkIn: attendanceRow.check_in,
        checkOut: attendanceRow.check_out,
        durationMinutes: attendanceRow.duration_minutes ?? undefined,
      };
    }

    return {
      kind: "active",

      membership: toMembershipView(
        currentMembership,
        daysBetween(todayIso, currentMembership.end_date),
      ),

      attendance,
    };
  }

  // ------------------------------------------------------------
  // 8. Convert selected membership to view
  // ------------------------------------------------------------

  const membershipView = toMembershipView(currentMembership);

  // ------------------------------------------------------------
  // 9. Frozen
  // ------------------------------------------------------------

  if (currentMembership.status === "Frozen" || currentMembership.is_frozen) {
    return {
      kind: "frozen",

      membership: membershipView,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membershipView.planName,
        },
        {
          key: "frozenSince",
          label: "Frozen Since",
          value: currentMembership.freeze_start_date ?? "—",
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // 10. Cancelled
  // ------------------------------------------------------------

  if (currentMembership.status === "Cancelled") {
    return {
      kind: "cancelled",

      membership: membershipView,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membershipView.planName,
        },
        {
          key: "cancelledOn",
          label: "Cancelled On",
          value: currentMembership.cancelled_at ?? "—",
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // 11. Payment rejected
  // ------------------------------------------------------------

  if (currentMembership.status === "PaymentRejected") {
    return {
      kind: "payment-rejected",

      membership: membershipView,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membershipView.planName,
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // 12. Payment pending
  // ------------------------------------------------------------

  if (
    currentMembership.status === "PaymentPending" ||
    currentMembership.status === "PaymentUploaded"
  ) {
    return {
      kind: "payment-pending",

      membership: membershipView,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membershipView.planName,
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // 13. Membership hasn't started
  // ------------------------------------------------------------

  if (
    currentMembership.status === "Active" &&
    currentMembership.start_date > todayIso
  ) {
    return {
      kind: "not-started",

      membership: membershipView,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membershipView.planName,
        },
        {
          key: "startDate",
          label: "Starts On",
          value: currentMembership.start_date,
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // 14. Expired
  // ------------------------------------------------------------

  return {
    kind: "expired",

    membership: membershipView,

    details: [
      {
        key: "plan",
        label: "Plan",
        value: membershipView.planName,
      },
      {
        key: "expiredOn",
        label: "Expired On",
        value: currentMembership.end_date,
      },
    ],
  };
}
