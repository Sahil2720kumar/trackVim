import "server-only";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export type AttendanceStatus = "not-checked-in" | "checked-in" | "checked-out";

export type MembershipView = {
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
    gymName: row.gyms?.name ?? "Your gym",
    planName: row.membership_plans?.plan_name ?? "Membership",
    planType: row.membership_plans?.plan_category ?? "Standard",
    startDate: row.start_date,
    endDate: row.end_date,
    durationLabel: durationLabel(row.duration_months),
    daysRemaining,
  };
}

export async function getMemberHomeState(): Promise<MemberHomeState> {
  // ------------------------------------------------------------
  // 1. Get authenticated Clerk user + memberId
  // ------------------------------------------------------------

  const { userId, sessionClaims } = await auth();

  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    memberId?: string;
  };

  if (!userId || !meta.memberId) {
    return {
      kind: "no-gym",
    };
  }

  const memberId = meta.memberId;

  // ------------------------------------------------------------
  // 2. Create Supabase server client
  // ------------------------------------------------------------

  const supabase = await createServerClient();

  // ------------------------------------------------------------
  // 3. Get all memberships belonging to this member
  // ------------------------------------------------------------

  const { data: memberships, error: membershipsError } = await supabase
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
            name,
            timezone
          ),

          membership_plans (
            plan_name,
            plan_category
          )
        `,
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (membershipsError) {
    console.error("[getMemberHomeState] memberships", membershipsError);

    throw new Error("Failed to load membership");
  }

  // ------------------------------------------------------------
  // 4. Member has never had a membership
  // ------------------------------------------------------------

  if (!memberships || memberships.length === 0) {
    const { data: application, error: applicationError } = await supabase
      .from("membership_applications")
      .select(
        `
            created_at,

            gyms (
              name
            ),

            membership_plans (
              plan_name
            )
          `,
      )
      .eq("member_id", memberId)
      .eq("status", "Pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (applicationError) {
      console.error("[getMemberHomeState] application", applicationError);
    }

    if (!application) {
      return {
        kind: "no-gym",
      };
    }

    return {
      kind: "pending",
      application: {
        gymName: (application.gyms as any)?.name ?? "Gym",

        planName: (application.membership_plans as any)?.plan_name ?? "Plan",

        appliedOn: application.created_at,
      },
    };
  }

  // ------------------------------------------------------------
  // 5. Determine today's date using the gym timezone
  // ------------------------------------------------------------

  const latestMembership = memberships[0] as any;

  const gymTimezone = latestMembership.gyms?.timezone ?? "Asia/Kolkata";

  const todayIso = todayIsoInTimezone(gymTimezone);

  // ------------------------------------------------------------
  // 6. Find membership that is actually active TODAY
  // ------------------------------------------------------------

  const current = memberships.find((membership: any) => {
    return (
      membership.status === "Active" &&
      membership.start_date <= todayIso &&
      membership.end_date >= todayIso &&
      !membership.is_frozen
    );
  }) as any;

  // ------------------------------------------------------------
  // 7. Active membership
  // ------------------------------------------------------------

  if (current) {
    const { data: attendanceRow, error: attendanceError } = await supabase
      .from("attendance")
      .select("check_in, check_out, duration_minutes")
      .eq("member_id", memberId)
      .eq("gym_id", current.gym_id)
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
        current,
        daysBetween(todayIso, current.end_date),
      ),

      attendance,
    };
  }

  // ------------------------------------------------------------
  // 8. No currently valid membership
  //    Classify the most recent membership
  // ------------------------------------------------------------

  const latest = memberships[0] as any;

  const membership = toMembershipView(latest);

  // ------------------------------------------------------------
  // Frozen
  // ------------------------------------------------------------

  if (latest.status === "Frozen" || latest.is_frozen) {
    return {
      kind: "frozen",

      membership,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membership.planName,
        },
        {
          key: "frozenSince",
          label: "Frozen Since",
          value: latest.freeze_start_date ?? "—",
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // Cancelled
  // ------------------------------------------------------------

  if (latest.status === "Cancelled") {
    return {
      kind: "cancelled",

      membership,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membership.planName,
        },
        {
          key: "cancelledOn",
          label: "Cancelled On",
          value: latest.cancelled_at ?? "—",
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // Payment rejected
  // ------------------------------------------------------------

  if (latest.status === "PaymentRejected") {
    return {
      kind: "payment-rejected",

      membership,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membership.planName,
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // Payment pending
  // ------------------------------------------------------------

  if (
    latest.status === "PaymentPending" ||
    latest.status === "PaymentUploaded"
  ) {
    return {
      kind: "payment-pending",

      membership,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membership.planName,
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // Membership hasn't started yet
  // ------------------------------------------------------------

  if (latest.status === "Active" && latest.start_date > todayIso) {
    return {
      kind: "not-started",

      membership,

      details: [
        {
          key: "plan",
          label: "Plan",
          value: membership.planName,
        },
        {
          key: "startDate",
          label: "Starts On",
          value: latest.start_date,
        },
      ],
    };
  }

  // ------------------------------------------------------------
  // Expired
  // ------------------------------------------------------------

  return {
    kind: "expired",

    membership,

    details: [
      {
        key: "plan",
        label: "Plan",
        value: membership.planName,
      },
      {
        key: "expiredOn",
        label: "Expired On",
        value: latest.end_date,
      },
    ],
  };
}

//              getMemberHomeState()
//                      │
//                      ▼
//               Get Clerk user
//                      │
//                      ▼
//                 Get memberId
//                      │
//                      ▼
//             Get memberships
//                      │
//           ┌──────────┴──────────┐
//           │                     │
//     No membership          Has membership
//           │                     │
//           ▼                     ▼
//   Check application       Find valid TODAY
//           │                     │
//     ┌─────┴─────┐        ┌──────┴──────┐
//     ↓           ↓        ↓             ↓
//  Pending      No gym   Active       Not active
//                           │             │
//                           ▼             ▼
//                      Check today's   Find reason
//                      attendance          │
//                           │         ┌────┼────┐
//                      ┌────┼────┐    ↓    ↓    ↓
//                      ↓    ↓    ↓  Frozen ... Expired
//                     None In   Out
//                      │    │    │
//                      ▼    ▼    ▼
//                   Not    In   Out
//                   check

// CodeRabbit
// Resolve the current gym membership via activeGymMembershipId, not by scanning all memberships.

// This code derives gymTimezone/todayIso from the most recently created membership row, then searches all memberships — across any gym — for one active today. Two problems follow from this:

// If the most recently created membership belongs to a different gym than the one that is actually active today, date comparisons use the wrong gym's timezone. Near a day boundary, this can misclassify a membership as active or inactive.
// If a member has simultaneously Active memberships at two different gyms, this returns whichever one happens to sort first by created_at, not necessarily the member's currently selected gym.
// Per the architecture, members.active_gym_membership_id is the canonical pointer for a member's current gym. Fetch that column and resolve the "active" membership and its gym's timezone from it directly, falling back to the existing heuristic only when the pointer is unset.
