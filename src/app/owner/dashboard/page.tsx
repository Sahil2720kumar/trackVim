import {
  Users,
  UserCog,
  CalendarCheck,
  IndianRupee,
  Bell,
  TrendingUp,
  UserPlus,
  Dumbbell,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MembershipGrowthChart } from "@/components/owner/MembershipGrowthChart";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { PieChartCard } from "@/components/PieChartCard";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const membershipGrowthData = [
  { month: "Jun", members: 450 },
  { month: "Jul", members: 520 },
  { month: "Aug", members: 780 },
  { month: "Sep", members: 890 },
  { month: "Oct", members: 1010 },
  { month: "Nov", members: 1045 },
  { month: "Dec", members: 1020 },
  { month: "Jan", members: 1080 },
  { month: "Feb", members: 1110 },
  { month: "Mar", members: 1140 },
  { month: "Apr", members: 1160 },
  { month: "May", members: 1248 },
];

const membershipDistribution = [
  { name: "Gold", value: 450, color: "#f59e0b" },
  { name: "Silver", value: 300, color: "#94a3b8" },
  { name: "Premium", value: 250, color: "#8b5cf6" },
];

const expiringMemberships = [
  {
    id: 1,
    name: "Rohan Sharma",
    plan: "Gold",
    expiry: "25 May 2025",
    daysLeft: 5,
    avatar: "RS",
  },
  {
    id: 2,
    name: "Ankit Verma",
    plan: "Silver",
    expiry: "28 May 2025",
    daysLeft: 8,
    avatar: "AV",
  },
  {
    id: 3,
    name: "Neha Singh",
    plan: "Gold",
    expiry: "02 Jun 2025",
    daysLeft: 13,
    avatar: "NS",
  },
  {
    id: 4,
    name: "Vikram Patel",
    plan: "Premium",
    expiry: "05 Jun 2025",
    daysLeft: 16,
    avatar: "VP",
  },
  {
    id: 5,
    name: "Pooja Mehta",
    plan: "Silver",
    expiry: "10 Jun 2025",
    daysLeft: 21,
    avatar: "PM",
  },
];

const recentRegistrations = [
  {
    id: 1,
    name: "Aman Verma",
    joined: "16 May 2025",
    plan: "Gold",
    avatar: "AV",
  },
  {
    id: 2,
    name: "Karan Malhotra",
    joined: "15 May 2025",
    plan: "Silver",
    avatar: "KM",
  },
  {
    id: 3,
    name: "Yash Gupta",
    joined: "12 May 2025",
    plan: "Silver",
    avatar: "YG",
  },
  {
    id: 4,
    name: "Divya Sharma",
    joined: "11 May 2025",
    plan: "Gold",
    avatar: "DS",
  },
];

const recentPayments = [
  {
    id: 1,
    member: "Rohan Sharma",
    avatar: "RS",
    amount: "₹6,000",
    plan: "Gold",
    status: "Paid",
    date: "16 May 2025",
  },
  {
    id: 2,
    member: "Neha Singh",
    avatar: "NS",
    amount: "₹8,000",
    plan: "Premium",
    status: "Paid",
    date: "16 May 2025",
  },
  {
    id: 3,
    member: "Ankit Verma",
    avatar: "AV",
    amount: "₹4,000",
    plan: "Silver",
    status: "Pending",
    date: "15 May 2025",
  },
  {
    id: 4,
    member: "Vikram Patel",
    avatar: "VP",
    amount: "₹9,000",
    plan: "Premium",
    status: "Failed",
    date: "15 May 2025",
  },
  {
    id: 5,
    member: "Pooja Mehta",
    avatar: "PM",
    amount: "₹4,000",
    plan: "Silver",
    status: "Paid",
    date: "14 May 2025",
  },
];

const notifications = [
  {
    id: 1,
    icon: Bell,
    title: "Rohan Sharma's membership is expiring in 5 days.",
    time: "10m ago",
    type: "warning",
  },
  {
    id: 2,
    icon: Wallet,
    title: "Payment received from Neha Singh",
    time: "25m ago",
    type: "success",
  },
  {
    id: 3,
    icon: UserPlus,
    title: "New member Aman Verma registered",
    time: "1h ago",
    type: "info",
  },
  {
    id: 4,
    icon: TrendingUp,
    title: "Today's attendance is 82%",
    time: "2h ago",
    type: "info",
  },
];

const trainerActivity = [
  {
    name: "Rahul Sharma",
    avatar: "RS",
    members: 45,
    sessions: 3,
    status: "Online",
  },
  {
    name: "Priya Mehta",
    avatar: "PM",
    members: 36,
    sessions: 2,
    status: "Online",
  },
  {
    name: "Amit Kumar",
    avatar: "AK",
    members: 40,
    sessions: 4,
    status: "Busy",
  },
  {
    name: "Sandeep Verma",
    avatar: "SV",
    members: 30,
    sessions: 1,
    status: "Offline",
  },
];

const gymPerformance = [
  { label: "Capacity Usage", value: 82, color: "bg-violet-500" },
  { label: "Equipment Health", value: 94, color: "bg-green-500" },
  { label: "Trainer Utilization", value: 78, color: "bg-blue-500" },
  { label: "Member Satisfaction", value: 96, color: "bg-amber-500" },
];

const topPlans = [
  { name: "Gold Plan", value: 561, color: "#f59e0b", percent: "45%" },
  { name: "Silver Plan", value: 374, color: "#94a3b8", percent: "30%" },
  { name: "Premium Plan", value: 313, color: "#8b5cf6", percent: "25%" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  initials,
  size = "md",
}: {
  initials: string;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-red-100 text-red-700",
    Online: "bg-green-100 text-green-700",
    Offline: "bg-muted text-muted-foreground",
    Busy: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    Gold: "bg-amber-100 text-amber-700",
    Silver: "bg-muted text-muted-foreground",
    Premium: "bg-violet-100 text-violet-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${map[plan] ?? "bg-muted text-muted-foreground"}`}
    >
      {plan}
    </span>
  );
}

// ─── Page ── ───────────────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        {/* ── Welcome Section ── */}
        <section className="mb-6 sm:mb-8">
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Good morning, 👋
          </p>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 truncate">
                Sahil Kumar
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Dumbbell className="w-4 h-4 shrink-0" />
                <span className="truncate">PowerFlex Gym</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ── */}
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            title="Total Members"
            value="1,248"
            icon={Users}
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
            trend={{ value: "+8%", positive: true }}
            subtitle="+28 this month"
          />

          <StatCard
            title="Active Trainers"
            value={12}
            icon={UserCog}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            badge="2 online"
            subtitle="4% increase"
          />

          <StatCard
            title="Today's Attendance"
            value={198}
            icon={CalendarCheck}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            trend={{ value: "82%", positive: true }}
            subtitle="+6% from yesterday"
          />

          <StatCard
            title="Monthly Revenue"
            value="₹2,45,600"
            icon={IndianRupee}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            trend={{ value: "+12%", positive: true }}
            subtitle="+12% from last month"
          />

          {/* down-trend example */}
          {/* <StatCard
            title="Churned Members"
            value={7}
            icon={Users}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            trend={{ value: "-3%", positive: false }}
            subtitle="-2 from last month"
          /> */}
        </section>

        {/* ── Charts Section ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Membership Growth Chart */}
          <MembershipGrowthChart data={membershipGrowthData} />

          {/* Plan Distribution */}
          <PieChartCard
            title="Membership Distribution"
            subtitle="Active memberships"
            data={membershipDistribution}
            legendFormat="countAndPercent"
          />
        </section>

        {/* ── Quick Actions ── */}
        <section className="mb-6 sm:mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3 sm:mb-4">
            Quick Actions
          </h3>
          <QuickActionsGrid />
        </section>

        {/* ── Tables Section ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Upcoming Expiry */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Upcoming Expiry
                </h3>
              </div>
              <button className="text-xs font-semibold text-primary hover:underline shrink-0">
                View all
              </button>
            </div>
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[480px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pl-4 pr-3 sm:px-3 font-semibold text-muted-foreground">
                      Member
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">
                      Plan
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground hidden sm:table-cell">
                      Expiry Date
                    </th>
                    <th className="text-left py-3 pr-4 pl-3 sm:px-3 font-semibold text-muted-foreground">
                      Days Left
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expiringMemberships.slice(0, 4).map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 pl-4 pr-3 sm:px-3 flex items-center gap-2">
                        <Avatar initials={member.avatar} size="sm" />
                        <span className="text-foreground font-medium whitespace-nowrap">
                          {member.name}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <PlanBadge plan={member.plan} />
                      </td>
                      <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                        {member.expiry}
                      </td>
                      <td className="py-3 pr-4 pl-3 sm:px-3">
                        <span
                          className={`font-semibold whitespace-nowrap ${
                            member.daysLeft <= 5
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {member.daysLeft} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Recent Registrations
                </h3>
              </div>
              <button className="text-xs font-semibold text-primary hover:underline shrink-0">
                View all
              </button>
            </div>
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[420px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pl-4 pr-3 sm:px-3 font-semibold text-muted-foreground">
                      Member
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">
                      Joined On
                    </th>
                    <th className="text-left py-3 pr-4 pl-3 sm:px-3 font-semibold text-muted-foreground">
                      Plan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 pl-4 pr-3 sm:px-3 flex items-center gap-2">
                        <Avatar initials={member.avatar} size="sm" />
                        <span className="text-foreground font-medium whitespace-nowrap">
                          {member.name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {member.joined}
                      </td>
                      <td className="py-3 pr-4 pl-3 sm:px-3">
                        <PlanBadge plan={member.plan} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Recent Payments ── */}
        <section className="mt-4 sm:mt-6 bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Recent Payments
              </h3>
            </div>
            <button className="text-xs font-semibold text-primary hover:underline shrink-0">
              View all
            </button>
          </div>
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[360px] sm:min-w-0">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pl-4 pr-3 sm:px-3 font-semibold text-muted-foreground">
                    Member
                  </th>
                  <th className="text-left py-3 px-3 font-semibold text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left py-3 px-3 font-semibold text-muted-foreground hidden sm:table-cell">
                    Plan
                  </th>
                  <th className="text-left py-3 px-3 font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 pr-4 pl-3 sm:px-3 font-semibold text-muted-foreground hidden sm:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-3 pl-4 pr-3 sm:px-3">
                      <div className="flex items-center gap-2">
                        <Avatar initials={payment.avatar} size="sm" />
                        <span className="text-foreground font-medium whitespace-nowrap">
                          {payment.member}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                      {payment.amount}
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <PlanBadge plan={payment.plan} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="py-3 pr-4 pl-3 sm:px-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {payment.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Footer Info Section ── */}
        <section className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Trainer Activity */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4 sm:mb-5">
              Trainer Activity
            </h3>
            <div className="space-y-3">
              {trainerActivity.map((trainer) => (
                <div
                  key={trainer.name}
                  className="flex items-center justify-between gap-2 pb-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar initials={trainer.avatar} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {trainer.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {trainer.members} members • {trainer.sessions} sessions
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={trainer.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Gym Performance */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4 sm:mb-5">
              Gym Performance
            </h3>
            <div className="space-y-4">
              {gymPerformance.map((perf) => (
                <div key={perf.label}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {perf.label}
                    </p>
                    <p className="text-xs font-bold text-foreground shrink-0">
                      {perf.value}%
                    </p>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${perf.color} rounded-full transition-all`}
                      style={{ width: `${perf.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
