import { Wallet, CreditCard, Calendar, Users } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { PaymentsTable } from "@/components/owner/PaymentsTable";
import { RevenueOverviewChart } from "@/components/owner/RevenueOverviewChart";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { paymentsQuickActions } from "@/components/owner/quick-actions-data";
import { initialPayments } from "@/mock/payments";
import { PieChartCard } from "@/components/PieChartCard";

const revenueData = [
  { month: "Aug", revenue: 340000 },
  { month: "Sep", revenue: 420000 },
  { month: "Oct", revenue: 380000 },
  { month: "Nov", revenue: 520000 },
  { month: "Dec", revenue: 480000 },
  { month: "Jan", revenue: 620000 },
  { month: "Feb", revenue: 580000 },
  { month: "Mar", revenue: 720000 },
  { month: "Apr", revenue: 680000 },
  { month: "May", revenue: 780000 },
];

const statusDistribution = [
  { name: "Paid", value: 245, color: "#10b981" },
  { name: "Pending", value: 24, color: "#f59e0b" },
  { name: "Overdue", value: 9, color: "#ef4444" },
  { name: "Refunded", value: 32, color: "#6366f1" },
  { name: "Cancelled", value: 16, color: "#8b5cf6" },
];

export default function PaymentsPage() {
  return (
    <div className="flex flex-col px-4 py-5 gap-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Payments
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Wallet}
          title="Total Revenue"
          value="₹8,46,000"
          subtitle="+12.4% this month"
          trend={{ value: "12.4%", positive: true }}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={CreditCard}
          title="Payments Received"
          value="326"
          subtitle="This Month"
          trend={{ value: "12.4%", positive: true }}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Calendar}
          title="Pending Payments"
          value="24"
          subtitle="Awaiting Collection"
          trend={{ value: "12.4%", positive: true }}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Users}
          title="Overdue Payments"
          value="9"
          subtitle="Require Follow-up"
          trend={{ value: "12.4%", positive: false }}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Interactive search/filter/table/pagination all live in the client component */}
      <PaymentsTable initialPayments={initialPayments} />

      {/* Revenue Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <RevenueOverviewChart data={revenueData} />

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

      {/* Quick Actions */}
      <QuickActionsGrid actions={paymentsQuickActions} columns={4} />
    </div>
  );
}
