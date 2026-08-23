"use client";

import {
  Package,
  Users,
  BadgeIndianRupee,
  Star,
  BarChart3,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlansGrid } from "@/components/owner/PlansGrid";
import { RevenueOverviewChart } from "@/components/owner/RevenueOverviewChart";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { plansQuickActions } from "@/components/owner/quick-actions-data";
import {
  useMembershipPlans,
  useGymRevenueMonthly,
  useTopPerformingPlans,
} from "@/hooks/queries/owner.query";

// ─── Loading skeleton — flat blocks, matches DashboardSkeleton style ───────

function MembershipPlansSkeleton() {
  return (
    <>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] w-full rounded-2xl" />
        ))}
      </section>

      <div className="mt-4 sm:mt-6">
        <Skeleton className="h-[420px] w-full rounded-lg" />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <Skeleton className="h-80 w-full rounded-lg lg:col-span-2" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </section>

      <div className="mt-4 sm:mt-6">
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────

function MembershipPlansError({
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
        Couldn't load membership plans{message ? `: ${message}` : "."}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={retrying}
        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        {retrying ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5" />
        )}
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}

// ─── Main content ───────────────────────────────────────────────────────────

export function MembershipPlansContent() {
  const plansQuery = useMembershipPlans();
  const revenueQuery = useGymRevenueMonthly();
  const topPlansQuery = useTopPerformingPlans();

  // Plans are the core dataset the page can't render without. Revenue and
  // top-plans degrade gracefully to empty arrays, same fallback behavior
  // as the original server page's error-logged-but-continue approach.
  const isLoading = plansQuery.isLoading;
  const isError = plansQuery.isError;
  const isFetching =
    plansQuery.isFetching ||
    revenueQuery.isFetching ||
    topPlansQuery.isFetching;

  const refetchAll = () => {
    plansQuery.refetch();
    revenueQuery.refetch();
    topPlansQuery.refetch();
  };

  if (isLoading) {
    return <MembershipPlansSkeleton />;
  }

  const plansResult = plansQuery.data;

  if (isError || !plansResult || plansResult.error) {
    const firstError = plansQuery.error;
    return (
      <MembershipPlansError
        message={
          firstError instanceof Error
            ? firstError.message
            : (plansResult?.error?.message ?? null)
        }
        onRetry={refetchAll}
        retrying={isFetching}
      />
    );
  }

  const initialPlans = plansResult.data ?? [];

  const revenueResult = revenueQuery.data;
  const topPlansResult = topPlansQuery.data;

  if (revenueResult?.error) {
    console.error("get_gym_revenue_monthly failed:", revenueResult.error);
  }
  if (topPlansResult?.error) {
    console.error("get_plan_performance_monthly failed:", topPlansResult.error);
  }

  const revenueMonthly = revenueResult?.data ?? [];
  const topPerformingPlans = topPlansResult?.data ?? [];

  const revenueData = revenueMonthly.map((r) => ({
    month: r.month_label,
    revenue: r.revenue,
  }));

  const topPlans = topPerformingPlans.map((p, i) => ({
    rank: i + 1,
    id: p.plan_id,
    name: p.plan_name,
    members: Number(p.member_count),
    revenue: Number(p.revenue_this_month),
    growth: Number(p.growth_pct),
  }));

  const totalPlans = initialPlans.length || 0;

  const activePlans =
    initialPlans.filter((p) => p.status === "Active").length || 0;

  const totalMembers =
    initialPlans.reduce(
      (sum, p) => sum + (p.gym_memberships?.[0]?.count ?? 0),
      0,
    ) || 0;

  const monthlyRevenue =
    revenueMonthly[revenueMonthly.length - 1]?.revenue ?? 0;
  const maxTopPlanRevenue = topPlans[0]?.revenue || 1;

  const mostPopularPlan =
    initialPlans.reduce<(typeof initialPlans)[number] | null>((max, plan) => {
      const maxCount = max?.gym_memberships?.[0]?.count ?? 0;
      const planCount = plan.gym_memberships?.[0]?.count ?? 0;
      return planCount > maxCount ? plan : max;
    }, null) ?? null;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Package}
          title="Total Plans"
          value={totalPlans}
          subtitle={`${activePlans} Active Promotions`}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Users}
          title="Active Members"
          value={totalMembers}
          subtitle="Across all plans"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={BadgeIndianRupee}
          title="Monthly Revenue"
          value={`₹${(monthlyRevenue / 100000).toFixed(2)}L`}
          subtitle="This month, verified payments"
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={Star}
          title="Most Popular Plan"
          value={mostPopularPlan?.plan_name || "—"}
          subtitle={`${mostPopularPlan?.gym_memberships?.[0]?.count ?? 0} Members`}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Interactive search/filter/grid/add-modal all live in the client component */}
      <div className="mt-4 sm:mt-6">
        <PlansGrid initialPlans={initialPlans} />
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 mt-4 sm:mt-6">
        <RevenueOverviewChart data={revenueData} />

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">
              Top Performing Plans
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">This month</p>

          {topPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No plan revenue recorded this month yet.
            </p>
          ) : (
            <div className="space-y-4">
              {topPlans.map((plan) => (
                <div key={plan.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                        {plan.rank}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {plan.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plan.members} members
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        ₹{(plan.revenue / 100000).toFixed(2)}L
                      </p>
                      <p
                        className={`text-xs ${
                          plan.growth >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {plan.growth >= 0 ? "+" : ""}
                        {plan.growth}%
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{
                        width: `${(plan.revenue / maxTopPlanRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 sm:mt-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Quick Actions
        </h2>
        <QuickActionsGrid actions={plansQuickActions} columns={4} />
      </div>
    </>
  );
}
