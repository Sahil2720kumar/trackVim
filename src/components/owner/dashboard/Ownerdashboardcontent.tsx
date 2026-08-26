"use client";

import Link from "next/link";
import {
  Users,
  UserCog,
  CalendarCheck,
  IndianRupee,
  Dumbbell,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { StatCard } from "@/components/StatCard";
import { MembershipGrowthChart } from "@/components/owner/MembershipGrowthChart";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { PieChartCard } from "@/components/PieChartCard";
import { ExpiringMembershipsTable } from "@/components/owner/dashboard/ExpiringMembershipsTable";
import { RecentRegistrationsTable } from "@/components/owner/dashboard/RecentRegistrationsTable";
import { RecentPaymentsTable } from "@/components/owner/dashboard/RecentPaymentsTable";
import { TrainerActivityTable } from "@/components/owner/dashboard/TrainerActivityTable";
import { useOwnerDashboardData } from "@/hooks/queries/owner.query";
import { useOwnerStore } from "@/stores/owner.store";

const PLAN_FALLBACK_COLORS = [
  "#f59e0b",
  "#94a3b8",
  "#8b5cf6",
  "#0ea5e9",
  "#22c55e",
];

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <>
      <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[132px]" />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <SkeletonBlock className="h-80 lg:col-span-2" />
        <SkeletonBlock className="h-80" />
      </section>

      <section className="mb-6 sm:mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-3 sm:mb-4">
          Quick Actions
        </h3>
        <QuickActionsGrid />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SkeletonBlock className="h-72" />
        <SkeletonBlock className="h-72" />
      </section>

      <div className="mt-4 sm:mt-6">
        <SkeletonBlock className="h-72" />
      </div>

      <div className="mt-4 sm:mt-6">
        <SkeletonBlock className="h-72" />
      </div>
    </>
  );
}

function DashboardError({
  message,
  onRetry,
  retrying,
}: {
  message: string | null;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 flex flex-col items-center text-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Couldn't load dashboard data{message ? `: ${message}` : "."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-background px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {retrying ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5" />
        )}
        {retrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

export function OwnerDashboardContent() {
  const activeGymId = useOwnerStore((state) => state.activeGymId);
  const owner = useOwnerStore((state) => state.owner);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useOwnerDashboardData();

  // No active gym in the store yet — mirrors the old `if (!gymId) notFound()`
  // guard, just evaluated client-side instead of from Clerk sessionClaims.
  if (!activeGymId && !isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No gym selected.
      </div>
    );
  }

  const stats = data?.stats;
  const pieData = (data?.planDistribution ?? []).map((p, i) => ({
    name: p.plan_name,
    value: p.member_count,
    color:
      p.plan_color || PLAN_FALLBACK_COLORS[i % PLAN_FALLBACK_COLORS.length],
  }));

  return (
    <>
      {/* Welcome — always renders once we have an activeGymId; doesn't wait
          on the query itself besides the gym-name line below. */}
      <section className="mb-6 sm:mb-8">
        <p className="text-sm text-muted-foreground font-medium mb-1">
          {getGreeting()}, 👋
        </p>
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 truncate">
              {owner?.fullName ?? "ownerName"}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Dumbbell className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {isLoading ? "Loading…" : (data?.gymName ?? "Your Gym")}
              </span>
              {/* Background refetch indicator — only after we already have
                  data, so it doesn't overlap with the initial skeleton. */}
              {isFetching && !isLoading && (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-muted-foreground" />
              )}
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <DashboardError
          message={error instanceof Error ? error.message : null}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : (
        <>
          {/* Stats */}
          <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard
              title="Total Members"
              value={stats?.total_members.toLocaleString("en-IN") ?? "—"}
              icon={Users}
              iconBg="bg-violet-100"
              iconColor="text-violet-600"
              trend={{
                value: `${stats?.memberTrend ?? 0}%`,
                positive: (stats?.memberTrend ?? 0) >= 0,
              }}
              subtitle={`${(stats?.total_members ?? 0) - (stats?.total_members_last_month ?? 0)} this month`}
            />
            <StatCard
              title="Active Trainers"
              value={stats?.active_trainers ?? 0}
              icon={UserCog}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              badge={`${stats?.trainers_available ?? 0} available`}
              subtitle="Set from trainer status"
            />
            <StatCard
              title="Today's Attendance"
              value={stats?.today_attendance ?? 0}
              icon={CalendarCheck}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              trend={{
                value: `${stats?.attendanceTrend ?? 0}%`,
                positive: (stats?.attendanceTrend ?? 0) >= 0,
              }}
              subtitle="vs. yesterday"
            />
            <StatCard
              title="Monthly Revenue"
              value={`₹${(stats?.monthly_revenue ?? 0).toLocaleString("en-IN")}`}
              icon={IndianRupee}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
              trend={{
                value: `${stats?.revenueTrend ?? 0}%`,
                positive: (stats?.revenueTrend ?? 0) >= 0,
              }}
              subtitle="vs. last month"
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <MembershipGrowthChart
              data={(data?.membershipGrowth ?? []).map((m) => ({
                month: m.month_label,
                members: m.members,
              }))}
            />
            <PieChartCard
              title="Membership Distribution"
              subtitle="Active memberships"
              data={pieData}
              legendFormat="countAndPercent"
            />
          </section>

          <section className="mb-6 sm:mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3 sm:mb-4">
              Quick Actions
            </h3>
            <QuickActionsGrid />
          </section>

          {/* Tables — TanStack Table client components, data now fetched via useOwnerDashboardData */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Upcoming Expiry
                </h3>
                <Link
                  href="/owner/members?filter=expiring"
                  className="text-xs font-semibold text-primary hover:underline shrink-0"
                >
                  View all
                </Link>
              </div>
              <div className="-mx-4 sm:mx-0 overflow-x-auto">
                <ExpiringMembershipsTable
                  data={data?.expiringMemberships ?? []}
                />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Recent Registrations
                </h3>
                <Link
                  href="/owner/members"
                  className="text-xs font-semibold text-primary hover:underline shrink-0"
                >
                  View all
                </Link>
              </div>
              <div className="-mx-4 sm:mx-0 overflow-x-auto">
                <RecentRegistrationsTable
                  data={data?.recentRegistrations ?? []}
                />
              </div>
            </div>
          </section>

          <section className="mt-4 sm:mt-6 bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-sm font-semibold text-foreground">
                Recent Payments
              </h3>
              <Link
                href="/owner/payments"
                className="text-xs font-semibold text-primary hover:underline shrink-0"
              >
                View all
              </Link>
            </div>
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <RecentPaymentsTable data={data?.recentPayments ?? []} />
            </div>
          </section>

          <section className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm lg:col-span-3">
              <h3 className="text-sm font-semibold text-foreground mb-4 sm:mb-5">
                Trainer Activity
              </h3>
              <TrainerActivityTable data={data?.trainerActivity ?? []} />
            </div>
          </section>
        </>
      )}
    </>
  );
}
