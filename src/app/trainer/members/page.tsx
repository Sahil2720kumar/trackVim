"use client";

import React, { useMemo } from "react";
import { Users, UserCheck, Calendar, Clock, LucideIcon } from "lucide-react";
import { MembersTable } from "@/components/trainer/MembersTable";
import type { Member, MemberStatus } from "@/mock/trainer/members";
import { StatCard } from "@/components/StatCard";
import { useMyAssignedMembers } from "@/hooks/queries/trainer.query";
import { MyAssignedMembersResult } from "@/services/trainer.query";
import { formatDateStr } from "@/lib/utils";
import { useTrainerStore } from "@/stores/trainer-store";

type AssignedMemberRow = MyAssignedMembersResult[number];
type RawMember = NonNullable<AssignedMemberRow["members"]>;
type RawMembership = NonNullable<RawMember["gym_memberships"]>[number];

function getCurrentMembership(
  memberships: RawMembership[] | null | undefined,
): RawMembership | null {
  if (!memberships || memberships.length === 0) return null;

  const today = new Date();
  const active = memberships.find(
    (m) =>
      m.status === "Active" &&
      m.start_date &&
      m.end_date &&
      new Date(m.start_date) <= today &&
      new Date(m.end_date) >= today,
  );
  if (active) return active;

  return (
    [...memberships].sort((a, b) => {
      const aTime = a.start_date ? new Date(a.start_date).getTime() : 0;
      const bTime = b.start_date ? new Date(b.start_date).getTime() : 0;
      return bTime - aTime;
    })[0] ?? null
  );
}

function resolveStatus(
  accountStatus: RawMember["account_status"],
): MemberStatus {
  switch (accountStatus) {
    case "Active":
      return "Active";
    case "Suspended":
      return "On Leave";
    case "Pending":
    case "Inactive":
    default:
      return "Inactive";
  }
}

export function mapAssignedMemberToTableMember(
  row: AssignedMemberRow,
): Member | null {
  const member = row.members;
  if (!member) return null;

  const membership = getCurrentMembership(member.gym_memberships);
  // gym_memberships.plan_id is a to-one FK to membership_plans, so this
  // comes back as a single object, not an array.
  const planName = membership?.membership_plans?.plan_name ?? "No Plan";
  const planValidity =
    membership?.start_date && membership?.end_date
      ? `${formatDateStr(membership.start_date)} - ${formatDateStr(membership.end_date)}`
      : undefined;

  return {
    id: member.id,
    memberId: member.member_code ?? member.id,
    name: member.full_name ?? "Unknown",
    avatarUrl: member.photo_url ?? "/avatar-placeholder.png",
    phone: member.contact_phone ?? undefined,
    membershipPlan: planName,
    planValidity,
    attendance: member.attendanceRate ?? 0,
    status: resolveStatus(member.account_status),
    // Not available from getMyAssignedMembers — no join to training_sessions.
    // Leaving as placeholders; wire up separately if real session data is needed.
    lastSession: "-",
    lastSessionTime: undefined,
    nextSession: "-",
    nextSessionTime: undefined,
  };
}

interface StatisticCard {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
}

export default function MembersPage() {
  const activeGymId = useTrainerStore((s) => s.activeGymId);
  const activeTrainerId = useTrainerStore((s) => s.activeTrainerId);

  const {
    data: membersResponse,
    isLoading: membersLoading,
    isError: membersIsError,
    error: membersError,
    refetch: refetchMembers,
  } = useMyAssignedMembers(activeGymId, activeTrainerId);

  const loadError = membersIsError
    ? membersError instanceof Error
      ? membersError.message
      : "Failed to load members"
    : membersResponse && !membersResponse.success
      ? membersResponse.error
      : null;

  const members: Member[] = useMemo(() => {
    if (!membersResponse?.success) return [];
    return membersResponse.data
      .map(mapAssignedMemberToTableMember)
      .filter((m): m is Member => m !== null);
  }, [membersResponse]);

  const attendanceToday = useMemo(() => {
    if (members.length === 0) return 0;
    return Math.round(
      members.reduce((sum, m) => sum + m.attendance, 0) / members.length,
    );
  }, [members]);

  const stats: StatisticCard[] = [
    {
      id: "assigned-members",
      label: "Assigned Members",
      value: members.length,
      icon: Users,
      subtitle: "Currently assigned",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      id: "active-members",
      label: "Active Members",
      value: members.filter((m) => m.status === "Active").length,
      icon: UserCheck,
      subtitle: "Currently active",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: "attendance-today",
      label: "Avg. Attendance",
      value: `${attendanceToday}%`,
      icon: Calendar,
      subtitle: "Across assigned members",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "on-leave",
      label: "On Leave",
      value: members.filter((m) => m.status === "On Leave").length,
      icon: Clock,
      subtitle: "Temporary leave",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const handleRecordAttendance = () => {
    console.log("Record attendance clicked");
  };

  if (!activeGymId || !activeTrainerId) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">
            No active trainer context. Please select a gym.
          </p>
        </div>
      </div>
    );
  }

  if (membersLoading) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-lg border border-border bg-muted/40 animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 rounded-lg border border-border bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground mb-3">
            Couldn't load your members: {loadError}
          </p>
          <button
            onClick={() => refetchMembers()}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconBg={stat.iconBg}
            iconColor={stat.iconColor}
            badge={stat.badge}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      <MembersTable
        members={members}
        title="Members"
        subtitle="Manage and monitor all members assigned to you."
        variant="full"
        showCreateButton
        createButtonLabel="Record Attendance"
        onCreateClick={handleRecordAttendance}
        pageSize={10}
      />
    </div>
  );
}
