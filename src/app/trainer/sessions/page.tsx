"use client";

// ============================================================================
// Imports
// ============================================================================

import React, { useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  LucideIcon,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SesssionTable } from "@/components/trainer/SesssionTable";
import { Sesssions, type Session } from "@/mock/trainer/sesssions";
import { StatCard } from "@/components/StatCard";

// ============================================================================
// Types
// ============================================================================

interface StatisticCard {
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

const getDaysInMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getFirstDayOfMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), 1).getDay();

// ============================================================================
// Sidebar widgets (unique to this page — not part of the reusable table)
// ============================================================================

const StatisticCard: React.FC<{ stat: StatCard }> = ({ stat }) => {
  const isTrendUp = stat.trendDirection === "up";
  const TrendIcon = isTrendUp ? TrendingUp : TrendingDown;
  const trendColor = isTrendUp
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-400";

  return (
    <Card className="border-border hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={`p-2.5 rounded-lg inline-flex mb-2 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <h3 className="text-3xl font-bold text-foreground mt-1">
              {stat.value}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4 text-xs">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={trendColor}>
            {isTrendUp ? "↑" : "↓"} {Math.abs(stat.trend)}% vs last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const CalendarCard: React.FC<{ highlightedDates: string[] }> = ({
  highlightedDates,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 22));
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

  const isDateHighlighted = (day: number): boolean => {
    const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return highlightedDateSet.has(date);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">July 2026</h3>
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
                    : day === 22
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

const UpcomingSessionsCard: React.FC<{ sessions: Session[] }> = ({
  sessions,
}) => {
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
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const SessionOverviewCard: React.FC<{
  stats: {
    completed: number;
    upcoming: number;
    cancelled: number;
    total: number;
  };
}> = ({ stats }) => {
  const completedPercent = Math.round((stats.completed / stats.total) * 100);
  const upcomingPercent = Math.round((stats.upcoming / stats.total) * 100);
  const cancelledPercent = Math.round((stats.cancelled / stats.total) * 100);

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
                  className="text-red-500"
                  strokeDasharray={`${(cancelledPercent / 100) * 339.29} 339.29`}
                  strokeDashoffset={
                    -(((completedPercent + upcomingPercent) / 100) * 339.29)
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
  const [isLoading] = useState(false);

  const stats = useMemo(() => {
    const completed = Sesssions.filter((s) => s.status === "Completed").length;
    const upcoming = Sesssions.filter((s) => s.status === "Upcoming").length;
    const cancelled = Sesssions.filter((s) => s.status === "Cancelled").length;
    return { completed, upcoming, cancelled, total: Sesssions.length };
  }, []);

  const statisticCards: StatisticCard[] = [
    {
      id: "total-sessions",
      label: "Total Sessions",
      value: stats.total,
      icon: CalendarCheck,
      trend: {
        value: "15%",
        positive: true,
      },
      subtitle: "This Month",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "completed-sessions",
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      trend: {
        value: "12%",
        positive: true,
      },
      subtitle: "This Month",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      id: "upcoming-sessions",
      label: "Upcoming",
      value: stats.upcoming,
      icon: Clock3,
      trend: {
        value: "5%",
        positive: true,
      },
      subtitle: "This Month",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      id: "cancelled-sessions",
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      trend: {
        value: "8%",
        positive: false,
      },
      subtitle: "This Month",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  const highlightedDates = Sesssions.map((s) => s.date);

  const handleCreateSession = () => {
    console.log("Create new session clicked");
  };

  const handleViewDetails = (session: Session) => {
    console.log("View details for session:", session);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <SessionsSkeletonLoader />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statisticCards.map((stat, index) => (
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
        sessions={Sesssions}
        title="Sessions"
        subtitle="Manage and track all your training sessions."
        showCreateButton
        onCreateClick={handleCreateSession}
        onViewDetails={handleViewDetails}
        pageSize={5}
      />

      {/* Sidebar */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <CalendarCard highlightedDates={highlightedDates} />
        <UpcomingSessionsCard sessions={Sesssions} />
        <SessionOverviewCard stats={stats} />
      </div>
    </div>
  );
}
