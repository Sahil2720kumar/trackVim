"use client";

// ============================================================================
// Imports
// ============================================================================

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LucideIcon,
  XCircle,
  AlertCircle,
  Dumbbell,
  HeartPulse,
  Activity,
  Wind,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SesssionTable } from "@/components/trainer/SesssionTable";
import { StatCard } from "@/components/StatCard";
import { useTrainerStore } from "@/stores/trainer-store";
import { useAllSessions } from "@/hooks/queries/trainer.query";
import { formatTime12h, getFirstDayOfMonth } from "@/lib/utils";
import { getDaysInMonth } from "date-fns";
// ============================================================================
// Types
// ============================================================================

interface StatisticCardConfig {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend: {
    value: string | number;
    positive: boolean;
  };
  subtitle: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ============================================================================
// Helpers
// ============================================================================

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
// ============================================================================
// Sidebar widgets (unique to this page — not part of the reusable table)
// ============================================================================

const CalendarCard: React.FC<{ highlightedDates: string[] }> = ({
  highlightedDates,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const highlightedDateSet = useMemo(
    () => new Set(highlightedDates),
    [highlightedDates],
  );

  const today = new Date();
  const isToday = (day: number): boolean =>
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  const isDateHighlighted = (day: number): boolean => {
    const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return highlightedDateSet.has(date);
  };

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {monthLabel}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                  ),
                )
              }
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                  ),
                )
              }
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-xs font-medium text-muted-foreground text-center py-1"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center text-xs rounded-md transition-colors ${
                  day === null
                    ? ""
                    : isToday(day)
                      ? "bg-primary text-primary-foreground font-semibold"
                      : isDateHighlighted(day)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UpcomingSessionsCard: React.FC<{ sessions: any[] }> = ({ sessions }) => {
  const upcoming = sessions
    .filter((s) => s.status === "Upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Upcoming Sessions
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-auto py-1 px-2"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-xs text-muted-foreground">No upcoming sessions.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((session) => {
              const Icon = session.icon;
              return (
                <div
                  key={session.id}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="mt-0.5 text-muted-foreground">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.date} • {session.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.duration}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SessionOverviewCard: React.FC<{
  stats: {
    completed: number;
    upcoming: number;
    inProgress: number;
    cancelled: number;
    total: number;
  };
}> = ({ stats }) => {
  const completedPercent =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const upcomingPercent =
    stats.total > 0 ? Math.round((stats.upcoming / stats.total) * 100) : 0;
  const inProgressPercent =
    stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0;
  const cancelledPercent =
    stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0;

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Session Overview
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-emerald-500"
                  strokeDasharray={`${(completedPercent / 100) * 339.29} 339.29`}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-blue-500"
                  strokeDasharray={`${(upcomingPercent / 100) * 339.29} 339.29`}
                  strokeDashoffset={-((completedPercent / 100) * 339.29)}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-amber-500"
                  strokeDasharray={`${(inProgressPercent / 100) * 339.29} 339.29`}
                  strokeDashoffset={
                    -(((completedPercent + upcomingPercent) / 100) * 339.29)
                  }
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-red-500"
                  strokeDasharray={`${(cancelledPercent / 100) * 339.29} 339.29`}
                  strokeDashoffset={
                    -(
                      ((completedPercent +
                        upcomingPercent +
                        inProgressPercent) /
                        100) *
                      339.29
                    )
                  }
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {stats.total}
                  </p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                label: "Completed",
                value: stats.completed,
                percent: completedPercent,
                dot: "bg-emerald-500",
              },
              {
                label: "Upcoming",
                value: stats.upcoming,
                percent: upcomingPercent,
                dot: "bg-blue-500",
              },
              {
                label: "In Progress",
                value: stats.inProgress,
                percent: inProgressPercent,
                dot: "bg-amber-500",
              },
              {
                label: "Cancelled",
                value: stats.cancelled,
                percent: cancelledPercent,
                dot: "bg-red-500",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${row.dot}`} />
                  <span className="text-muted-foreground">{row.label}</span>
                </div>
                <span className="font-semibold text-foreground">
                  {row.value} ({row.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SessionsSkeletonLoader: React.FC = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Skeleton className="h-10 w-48" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-20 mb-4" />
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24 mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-full sm:w-32" />
      <Skeleton className="h-10 w-full sm:w-32" />
    </div>
    <Card className="border-border">
      <CardContent className="pt-6">
        <Skeleton className="h-10 w-full mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-2" />
        ))}
      </CardContent>
    </Card>
  </div>
);

// ============================================================================
// Main Page
// ============================================================================

export default function SessionsPage() {
  const router = useRouter();
  const { activeGymId, activeTrainerId } = useTrainerStore();

  const {
    data: sessionsResult,
    isLoading,
    error: queryError,
  } = useAllSessions(activeGymId, activeTrainerId);

  const sessions = useMemo(
    () =>
      sessionsResult?.success ? mapTrainingSessions(sessionsResult.data) : [],
    [sessionsResult],
  );

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === "Completed").length;
    const upcoming = sessions.filter((s) => s.status === "Upcoming").length;
    const inProgress = sessions.filter((s) => s.status === "InProgress").length;
    const cancelled = sessions.filter((s) => s.status === "Cancelled").length;
    return {
      completed,
      upcoming,
      inProgress,
      cancelled,
      total: sessions.length,
    };
  }, [sessions]);

  const statisticCards: StatisticCardConfig[] = [
    {
      id: "total-sessions",
      label: "Total Sessions",
      value: stats.total,
      icon: CalendarCheck,
      trend: { value: "15%", positive: true },
      subtitle: "This Month",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "completed-sessions",
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      trend: { value: "12%", positive: true },
      subtitle: "This Month",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      id: "upcoming-sessions",
      label: "Upcoming",
      value: stats.upcoming,
      icon: Clock3,
      trend: { value: "5%", positive: true },
      subtitle: "This Month",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      id: "cancelled-sessions",
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      trend: { value: "8%", positive: false },
      subtitle: "This Month",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  const highlightedDates = sessions.map((s) => s.date);

  const handleCreateSession = () => {
    router.push("/trainer/sessions/new");
  };

  if (isLoading) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <SessionsSkeletonLoader />
      </div>
    );
  }

  if (queryError || (sessionsResult && !sessionsResult.success)) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Couldn&apos;t load sessions. Please refresh and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statisticCards.map((stat) => (
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
      </div>

      {/* Reusable session table: header + search + filters + status pills + create button */}
      <SesssionTable
        sessions={sessions}
        title="Sessions"
        subtitle="Manage and track all your training sessions."
        showCreateButton
        onCreateClick={handleCreateSession}
        pageSize={5}
      />

      {/* Sidebar */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <CalendarCard highlightedDates={highlightedDates} />
        <UpcomingSessionsCard sessions={sessions} />
        <SessionOverviewCard stats={stats} />
      </div>
    </div>
  );
}
