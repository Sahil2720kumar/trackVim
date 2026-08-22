import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import {
  Users,
  UserCog,
  CalendarCheck,
  IndianRupee,
  Dumbbell,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MembershipGrowthChart } from "@/components/owner/MembershipGrowthChart";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { PieChartCard } from "@/components/PieChartCard";
import { getOwnerDashboardData } from "@/services/owner.query";
import { ExpiringMembershipsTable } from "@/components/owner/dashboard/ExpiringMembershipsTable";
import { RecentRegistrationsTable } from "@/components/owner/dashboard/RecentRegistrationsTable";
import { RecentPaymentsTable } from "@/components/owner/dashboard/RecentPaymentsTable";
import { TrainerActivityTable } from "@/components/owner/dashboard/TrainerActivityTable";

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
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function OwnerDashboard() {
  const { sessionClaims } = await auth();
  const gymId = sessionClaims?.publicMetadata?.gymId as string | undefined;
  if (!gymId) notFound();

  const user = await currentUser();

  const {
    gymName,
    stats,
    membershipGrowth,
    planDistribution,
    trainerActivity,
    expiringMemberships,
    recentRegistrations,
    recentPayments,
  } = await getOwnerDashboardData(gymId);

  const pieData = planDistribution.map((p, i) => ({
    name: p.plan_name,
    value: p.member_count,
    color:
      p.plan_color || PLAN_FALLBACK_COLORS[i % PLAN_FALLBACK_COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        {/* Welcome */}
        <section className="mb-6 sm:mb-8">
          <p className="text-sm text-muted-foreground font-medium mb-1">
            {getGreeting()}, 👋
          </p>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 truncate">
                {user?.fullName ?? "Owner"}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Dumbbell className="w-4 h-4 shrink-0" />
                <span className="truncate">{gymName}</span>
              </p>
            </div>
          </div>
        </section>

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
            data={membershipGrowth.map((m) => ({
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

        {/* Tables — TanStack Table client components, data fetched server-side above */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-sm font-semibold text-foreground">
                Upcoming Expiry
              </h3>
              <a
                href="/dashboard/members?filter=expiring"
                className="text-xs font-semibold text-primary hover:underline shrink-0"
              >
                View all
              </a>
            </div>
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <ExpiringMembershipsTable data={expiringMemberships} />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-sm font-semibold text-foreground">
                Recent Registrations
              </h3>
              <a
                href="/dashboard/members"
                className="text-xs font-semibold text-primary hover:underline shrink-0"
              >
                View all
              </a>
            </div>
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <RecentRegistrationsTable data={recentRegistrations} />
            </div>
          </div>
        </section>

        <section className="mt-4 sm:mt-6 bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="text-sm font-semibold text-foreground">
              Recent Payments
            </h3>
            <a
              href="/dashboard/payments"
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              View all
            </a>
          </div>
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <RecentPaymentsTable data={recentPayments} />
          </div>
        </section>

        <section className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm lg:col-span-3">
            <h3 className="text-sm font-semibold text-foreground mb-4 sm:mb-5">
              Trainer Activity
            </h3>
            <TrainerActivityTable data={trainerActivity} />
          </div>
        </section>
      </div>
    </div>
  );
}
