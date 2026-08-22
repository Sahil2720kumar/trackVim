import { Wallet, CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { StatCard } from "@/components/StatCard";
import { PaymentsTable } from "@/components/owner/PaymentsTable";
import { RevenueOverviewChart } from "@/components/owner/RevenueOverviewChart";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { paymentsQuickActions } from "@/components/owner/quick-actions-data";
import { PieChartCard } from "@/components/PieChartCard";
import { getGymPaymentsOverview } from "@/services/owner.query";

export default async function PaymentsPage() {
  const { sessionClaims } = await auth();
  const gymId = sessionClaims?.publicMetadata?.gymId as string | undefined;
  if (!gymId) notFound();

  const result = await getGymPaymentsOverview(gymId);
  if (!result.success) notFound();

  const {
    payments,
    stats,
    revenueChangePercent,
    monthlyRevenue,
    statusDistribution,
  } = result.data;

  return (
    <div className="flex flex-col px-4 py-5 gap-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Payments
        </h1>
      </div>

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

      <PaymentsTable gymId={gymId} initialPayments={payments} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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

      <QuickActionsGrid actions={paymentsQuickActions} columns={4} />
    </div>
  );
}
