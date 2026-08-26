"use client";

import {
  Calendar,
  Clock,
  UserCheck,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  LucideIcon,
  Activity,
  Dumbbell,
  Wind,
  HeartPulse,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { SesssionTable } from "@/components/trainer/SesssionTable";
import { MembersTable } from "@/components/trainer/MembersTable";
import { useTrainerDashboardData } from "@/hooks/queries/trainer.query";
import { useTrainerStore } from "@/stores/trainer-store";
import { MyAssignedMembersResult } from "@/services/trainer.query";
import { Member } from "@/mock/members";
import { formatTime12h } from "@/lib/utils";

interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend: { value: string | number; positive: boolean };
  subtitle: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatSessionLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatTimeLabel(timeStr?: string | null): string | undefined {
  if (!timeStr) return undefined;
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

interface SessionHistoryRow {
  member_id: string;
  session_date: string;
  start_time: string;
  status: string;
}

export function mapToMemberCards(
  assignedMembers: MyAssignedMembersResult,
  sessionHistory: SessionHistoryRow[],
  gymId: string, // NEW — needed to pick the right membership out of the array
): Member[] {
  const nowDate = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 8);

  const byMember = new Map<string, SessionHistoryRow[]>();
  for (const row of sessionHistory) {
    const list = byMember.get(row.member_id) ?? [];
    list.push(row);
    byMember.set(row.member_id, list);
  }

  return assignedMembers.map((assignment) => {
    const m = assignment.members; // non-null: members!inner
    const sessions = byMember.get(m.id) ?? [];

    const past = sessions.filter(
      (s) =>
        s.session_date < nowDate ||
        (s.session_date === nowDate && s.start_time <= nowTime),
    );
    const future = sessions.filter(
      (s) =>
        s.session_date > nowDate ||
        (s.session_date === nowDate && s.start_time > nowTime),
    );

    const lastCompleted = [...past]
      .reverse()
      .find((s) => s.status === "Completed");
    const nextUpcoming = future.find((s) => s.status === "Upcoming");

    // Pick this member's current membership AT THIS GYM: prefer an Active
    // row, else fall back to the most recently started row for this gym.
    // ASSUMPTION: "current" = highest start_date among this gym's rows.
    const membershipsAtThisGym = (m.gym_memberships ?? []).filter(
      (gm: any) => gm.gym_id === gymId,
    );
    const currentMembership =
      membershipsAtThisGym.find((gm: any) => gm.status === "Active") ??
      [...membershipsAtThisGym].sort((a: any, b: any) =>
        a.start_date < b.start_date ? 1 : -1,
      )[0];
    const plan = currentMembership?.membership_plans;

    const member: Member = {
      id: m.id,
      memberId: m.member_code ?? "—",
      name: m.full_name ?? "Unknown",
      avatarUrl: m.photo_url ?? "",
      initials: getInitials(m.full_name ?? "?"),
      membershipPlan: plan?.plan_name ?? "No active plan",
      planValidity: currentMembership?.end_date
        ? new Date(currentMembership.end_date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : undefined,
      // NOTE: this query selects plan_name/plan_color from membership_plans,
      // not plan_icon — Member.planIcon has nothing to map from here. Add
      // plan_icon to the select if the card needs it; left undefined for now.
      planIcon: undefined,
      phone: m.contact_phone ?? undefined,
      attendance: (m as any).attendanceRate ?? 0, // CHANGED — real RPC value, not derived
      lastSession: lastCompleted
        ? formatSessionLabel(lastCompleted.session_date)
        : "No sessions yet",
      lastSessionTime: lastCompleted
        ? formatTimeLabel(lastCompleted.start_time)
        : undefined,
      nextSession: nextUpcoming
        ? formatSessionLabel(nextUpcoming.session_date)
        : "None scheduled",
      nextSessionTime: nextUpcoming
        ? formatTimeLabel(nextUpcoming.start_time)
        : undefined,
      status: m.account_status ?? "Active",
    };

    return member;
  });
}

const WORKOUT_TYPE_ICONS: Record<string, LucideIcon> = {
  Strength: Dumbbell,
  Hypertrophy: Dumbbell,
  Functional: Activity,
  Cardio: HeartPulse,
  Mobility: Wind,
  Powerlifting: Dumbbell,
  HIIT: Activity,
};

export function mapTrainingSessions(rows: any[]) {
  return rows.map((row) => ({
    id: row.id,
    name: row.session_name,
    member: {
      name: row.members?.full_name ?? "Unknown member",
      photo_url: row.members?.photo_url,
    },
    date: row.session_date,
    time: formatTime12h(row.start_time),
    duration: row.duration_minutes ? `${row.duration_minutes} mins` : "—",
    status: row.status,
    icon: WORKOUT_TYPE_ICONS[row.workout_type] ?? Dumbbell,
  }));
}

export default function TrainerDashboard() {
  const {
    activeGymId: gymId,
    activeTrainerId: trainerId,
    trainer,
  } = useTrainerStore();
  const trainerName = trainer?.fullName || "Trainer";
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useTrainerDashboardData(gymId, trainerId);

  if (!gymId || !trainerId) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  if (isError || !result?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">
          Couldn&apos;t load your dashboard
          {result && !result.success
            ? `: ${result.error}`
            : error
              ? `: ${(error as Error).message}`
              : ""}
        </p>
      </div>
    );
  }

  const data = result.data;

  const stats: DashboardStat[] = [
    {
      id: "1",
      label: "Assigned Members",
      value: data.assignedMembersCount,
      icon: Users,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: { value: `+${data.newAssignmentsThisWeek}`, positive: true },
      subtitle: `+${data.newAssignmentsThisWeek} this week`,
    },
    {
      id: "2",
      label: "Today's Sessions",
      value: data.todaysSessionsCount,
      icon: Calendar,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: { value: `${data.todaysUpcomingCount} upcoming`, positive: true },
      badge: `${data.todaysUpcomingCount} upcoming`,
      subtitle: `${data.todaysCompletedCount} completed`,
    },
    {
      id: "3",
      label: "Attendance Today",
      value: data.attendanceTodayCount,
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: {
        value: `${data.attendanceRateToday}%`,
        positive: data.attendanceRateToday >= data.attendanceRateYesterday,
      },
      subtitle:
        data.attendanceRateToday >= data.attendanceRateYesterday
          ? `+${(data.attendanceRateToday - data.attendanceRateYesterday).toFixed(0)}% from yesterday`
          : `${(data.attendanceRateToday - data.attendanceRateYesterday).toFixed(0)}% from yesterday`,
    },
    {
      id: "4",
      label: "Upcoming Sessions",
      value: data.upcomingSessionsCount,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      trend: { value: "", positive: true },
      subtitle: "As of today",
    },
  ];

  const todaysSessionsForTable = mapTrainingSessions(data.todaysSessions);

  const assignedMembersForTable = mapToMemberCards(
    data.assignedMembers,
    data.sessionHistory,
    gymId!,
  );

  const presentCount = data.attendanceTodayCount;
  const absentCount = data.attendanceAbsentCount;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Good Morning{trainerName ? `, ${trainerName}` : ""} 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your members and today&apos;s training
            schedule.
          </p>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.label}
              value={stat.value}
              trend={{ value: stat.trend.value, positive: stat.trend.positive }}
              icon={stat.icon}
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
              badge={stat.badge}
              subtitle={stat.subtitle}
            />
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SesssionTable
              sessions={todaysSessionsForTable}
              title="Today's Sessions"
              showCreateButton={false}
              viewAllHref="/trainer/sessions"
              showPagination={false}
              pageSize={6}
              showToolbar={false}
            />
          </div>

          <div>
            <Card className="border-0 shadow-sm bg-card h-full">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg font-semibold">
                  Today&apos;s Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {presentCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <XCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {absentCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                    <div className="text-center">
                      {/* ASSUMPTION: no "late" figure from the RPC — see note in prior turn */}
                      <div className="flex justify-center mb-2">
                        <AlertCircle className="w-8 h-8 text-yellow-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">—</p>
                      <p className="text-xs text-muted-foreground">Late</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">
                      Attendance Rate
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold text-green-600">
                          {data.attendanceRateToday}%
                        </span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${data.attendanceRateToday}%` }}
                        />
                      </div>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {data.attendanceRateToday >=
                        data.attendanceRateYesterday
                          ? "Great job! Your attendance rate is higher than yesterday."
                          : "Attendance is down slightly from yesterday."}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground pt-4 border-t">
                    {presentCount} / {data.assignedMembersCount} Members
                    attended today
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CHANGED — now real data from data.assignedMembers instead of the mock import */}
        <MembersTable
          members={assignedMembersForTable}
          title="Assigned Members"
          variant="compact"
          pageSize={5}
          showCreateButton={false}
          showExportButton={false}
          showToolbar={false}
          showPagination={false}
          viewAllHref="/trainer/members"
        />
      </div>
    </div>
  );
}
