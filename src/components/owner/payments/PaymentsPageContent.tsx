"use client";

import {
  Wallet,
  CreditCard,
  Calendar,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentsTable } from "@/components/owner/PaymentsTable";
import { RevenueOverviewChart } from "@/components/owner/RevenueOverviewChart";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { paymentsQuickActions } from "@/components/owner/quick-actions-data";
import { PieChartCard } from "@/components/PieChartCard";
import { useGymPaymentsOverview } from "@/hooks/queries/owner.query";
import { useOwnerStore } from "@/stores/owner.store";

// ─── Loading skeleton — flat blocks, matches DashboardSkeleton style ───────

function PaymentsSkeleton() {
  return (
    <>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] w-full rounded-2xl" />
        ))}
      </section>

      <div className="mt-4 sm:mt-6">
        <Skeleton className="h-[520px] w-full rounded-lg" />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <Skeleton className="h-72 w-full rounded-lg lg:col-span-2" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </section>

      <div className="mt-4 sm:mt-6">
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────

function PaymentsError({
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
        Couldn't load payments{message ? `: ${message}` : "."}
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

export function PaymentsPageContent() {
  const activeGymId = useOwnerStore((state) => state.activeGymId);
  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGymPaymentsOverview();

  if (isLoading) {
    return <PaymentsSkeleton />;
  }

  if (isError || !result?.success) {
    return (
      <PaymentsError
        message={
          error instanceof Error
            ? error.message
            : !result?.success
              ? (result?.error ?? null)
              : null
        }
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  const {
    payments,
    stats,
    revenueChangePercent,
    monthlyRevenue,
    statusDistribution,
  } = result.data;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Wallet}
          title="Revenue This Month"
          value={`₹${stats.revenue_this_month.toLocaleString("en-IN")}`}
          subtitle={
            revenueChangePercent === null
              ? "No data last month"
              : `${revenueChangePercent >= 0 ? "+" : ""}${revenueChangePercent.toFixed(1)}% vs last month`
          }
          trend={
            revenueChangePercent === null
              ? undefined
              : {
                  value: `${Math.abs(revenueChangePercent).toFixed(1)}%`,
                  positive: revenueChangePercent >= 0,
                }
          }
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={CreditCard}
          title="Payments Verified"
          value={String(stats.payments_received_this_month)}
          subtitle="This Month"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Calendar}
          title="Pending Payments"
          value={String(stats.pending_count)}
          subtitle={`₹${stats.pending_amount.toLocaleString("en-IN")} awaiting`}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Overdue Payments"
          value={String(stats.overdue_count)}
          subtitle={`₹${stats.overdue_amount.toLocaleString("en-IN")} overdue`}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      <div className="mt-4 sm:mt-6">
        <PaymentsTable gymId={activeGymId!} initialPayments={payments} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <RevenueOverviewChart data={monthlyRevenue} />
        <PieChartCard
          title="Payment Status Distribution"
          data={statusDistribution}
          height={250}
          outerRadius={80}
          innerRadius={0}
          showTooltip
          showSliceLabels
          legendFormat="countAndPercent"
          className="rounded-lg p-6"
        />
      </div>

      <div className="mt-4 sm:mt-6">
        <QuickActionsGrid actions={paymentsQuickActions} columns={4} />
      </div>
    </>
  );
}
