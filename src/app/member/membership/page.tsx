"use client";

import { useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Wallet,
  Crown,
  Building2,
  UserRound,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Activity,
  Flame,
  Star,
  CheckCircle2,
  Circle,
  CreditCard,
  Lock,
  Waves,
  Apple,
  HeadphonesIcon,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type MembershipStatus = "active" | "expiring_soon" | "expired" | "pending";
type PaymentStatus = "paid" | "pending" | "failed";

interface Membership {
  planName: string;
  status: MembershipStatus;
  memberId: string;
  membershipNo: string;
  joinedOn: string;
  gymBranch: string;
  planType: string;
  duration: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  assignedTrainer: string;
  totalDays: number;
  usedDays: number;
  totalPayments: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  plan: string;
  duration: string;
  status: PaymentStatus;
}

interface TimelineEvent {
  id: string;
  label: string;
  date: string;
  completed: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MEMBERSHIP: Membership = {
  planName: "Premium Fitness Plan",
  status: "active",
  memberId: "MEM-78234",
  membershipNo: "TRK-2026-78234",
  joinedOn: "22 Feb 2026",
  gymBranch: "Main Branch, Delhi",
  planType: "Individual",
  duration: "6 Months",
  startDate: "22 Feb 2026",
  endDate: "22 Aug 2026",
  renewalDate: "22 Aug 2026",
  assignedTrainer: "Rahul Sharma",
  totalDays: 180,
  usedDays: 162,
  totalPayments: 12000,
};

const PAYMENTS: Payment[] = [
  {
    id: "p1",
    date: "22 Jul 2026",
    amount: 3000,
    method: "Cash",
    plan: "Premium Plan",
    duration: "1 Month",
    status: "paid",
  },
  {
    id: "p2",
    date: "22 Jun 2026",
    amount: 3000,
    method: "Cash",
    plan: "Premium Plan",
    duration: "1 Month",
    status: "paid",
  },
  {
    id: "p3",
    date: "22 May 2026",
    amount: 3000,
    method: "Cash",
    plan: "Premium Plan",
    duration: "1 Month",
    status: "paid",
  },
  {
    id: "p4",
    date: "22 Apr 2026",
    amount: 3000,
    method: "Cash",
    plan: "Premium Plan",
    duration: "1 Month",
    status: "paid",
  },
];

const TIMELINE: TimelineEvent[] = [
  {
    id: "t1",
    label: "Membership Started",
    date: "22 Feb 2026",
    completed: true,
  },
  { id: "t2", label: "First Payment", date: "22 Feb 2026", completed: true },
  { id: "t3", label: "Plan Renewed", date: "22 Mar 2026", completed: true },
  {
    id: "t4",
    label: "Current Plan Active",
    date: "22 Feb 2026",
    completed: true,
  },
  { id: "t5", label: "Next Renewal", date: "22 Aug 2026", completed: false },
];

const BENEFITS = [
  {
    icon: Dumbbell,
    title: "Unlimited Gym Access",
    description: "Access to all gym equipment",
  },
  {
    icon: Lock,
    title: "Locker Facility",
    description: "Secure locker facility",
  },
  {
    icon: UserRound,
    title: "Personal Trainer Sessions",
    description: "1-1 training sessions",
  },
  {
    icon: Waves,
    title: "Steam Bath Access",
    description: "Relax in steam bath",
  },
  {
    icon: LayoutGrid,
    title: "Workout Plans",
    description: "Personalized workout plans",
  },
  {
    icon: Apple,
    title: "Nutrition Consultation",
    description: "Diet & nutrition guidance",
  },
  {
    icon: Activity,
    title: "Attendance Tracking",
    description: "Track your attendance and progress",
  },
  {
    icon: HeadphonesIcon,
    title: "Priority Support",
    description: "24/7 priority support",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getStatusBadge(status: MembershipStatus) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          Active
        </Badge>
      );
    case "expiring_soon":
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
          Expiring Soon
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          Expired
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
          Pending
        </Badge>
      );
  }
}

function getPaymentBadge(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          Failed
        </Badge>
      );
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  iconClass,
  iconBg,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  iconClass: string;
  iconBg: string;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
        <div
          className={cn(
            "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0",
            iconBg,
          )}
        >
          <Icon className={cn("w-5 h-5", iconClass)} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium truncate">
            {label}
          </p>
          <p
            className={cn(
              "text-base sm:text-lg font-bold mt-0.5 truncate",
              valueClass ?? "text-foreground",
            )}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center gap-3 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium text-right", valueClass)}>
        {value}
      </span>
    </div>
  );
}

// ─── Circular Progress Ring ─────────────────────────────────────────────────────

function CircularProgress({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const pct = Math.round((value / max) * 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24">
        <svg
          className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90"
          viewBox="0 0 96 96"
        >
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl font-bold text-white leading-none">
            {value}
          </span>
          <span className="text-[10px] text-white/80 leading-tight text-center px-2">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── TanStack Table columns for Payment History ────────────────────────────────

const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => (
      <span className="text-xs font-semibold whitespace-nowrap">
        ₹{info.getValue<number>().toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: (info) => (
      <span className="text-xs text-muted-foreground">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: (info) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: (info) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => getPaymentBadge(info.getValue<PaymentStatus>()),
  },
];

function PaymentHistoryTable({ data }: { data: Payment[] }) {
  const table = useReactTable({
    data,
    columns: paymentColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[560px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/40">
              {headerGroup.headers.map((header, idx) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "text-xs",
                    idx === 0 && "pl-5",
                    idx === headerGroup.headers.length - 1 && "pr-5",
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/20">
              {row.getVisibleCells().map((cell, idx) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    idx === 0 && "pl-5",
                    idx === row.getVisibleCells().length - 1 && "pr-5",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MembershipPage() {
  const m = MEMBERSHIP;
  const remainingDays = m.totalDays - m.usedDays;
  const progressPct = Math.round((m.usedDays / m.totalDays) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* ── Page Header ── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            My Membership
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View your current membership, plan details, validity period, and
            payment history.
          </p>
        </div>

        {/* ── Hero Membership Card ── */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#3b1fa3] via-[#4c28c4] to-[#2e0f9e] p-5 sm:p-8 shadow-xl">
          {/* decorative circles */}
          <div className="absolute top-[-40px] right-[10%] w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-[-60px] right-[4%] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-start justify-between gap-6">
            {/* Left */}
            <div className="flex items-start gap-4 sm:gap-5 w-full md:w-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {m.planName}
                  </h2>
                  <Badge className="bg-green-500 text-white border-0 hover:bg-green-500 text-xs px-2.5 py-0.5">
                    Active
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-white/70 text-sm">
                  <div>
                    <span className="text-white/50 text-xs block">
                      Member ID
                    </span>
                    <span className="text-white font-semibold">
                      {m.memberId}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50 text-xs block">
                      Membership No.
                    </span>
                    <span className="text-white font-semibold">
                      {m.membershipNo}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-white/80">
                    <CalendarDays className="w-4 h-4 text-white/50 flex-shrink-0" />
                    <div>
                      <span className="text-white/50 text-xs block">
                        Joined On
                      </span>
                      <span className="text-white font-medium">
                        {m.joinedOn}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Building2 className="w-4 h-4 text-white/50 flex-shrink-0" />
                    <div>
                      <span className="text-white/50 text-xs block">
                        Gym Branch
                      </span>
                      <span className="text-white font-medium">
                        {m.gymBranch}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — expiry + ring */}
            <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-4 sm:gap-2 flex-shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <div className="text-left md:text-center md:mb-1">
                <span className="text-white/60 text-xs block">Valid Until</span>
                <span className="text-white font-bold text-lg sm:text-xl">
                  {m.endDate}
                </span>
              </div>
              <CircularProgress
                value={remainingDays}
                max={m.totalDays}
                label="Days Remaining"
              />
            </div>
          </div>
        </div>

        {/* ── 4 Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={BadgeCheck}
            iconBg="bg-green-50"
            iconClass="text-green-600"
            label="Membership Status"
            value="Active"
            valueClass="text-green-600"
          />
          <StatCard
            icon={CalendarDays}
            iconBg="bg-blue-50"
            iconClass="text-blue-600"
            label="Valid Until"
            value={m.endDate}
          />
          <StatCard
            icon={Clock3}
            iconBg="bg-orange-50"
            iconClass="text-orange-500"
            label="Remaining Days"
            value={`${remainingDays} Days`}
            valueClass="text-orange-500"
          />
          <StatCard
            icon={Wallet}
            iconBg="bg-violet-50"
            iconClass="text-violet-600"
            label="Total Payments"
            value={`₹${m.totalPayments.toLocaleString("en-IN")}`}
            valueClass="text-violet-600"
          />
        </div>

        {/* ── Row 1: Progress + Info + Benefits ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Membership Progress */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Membership Progress
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {m.usedDays} / {m.totalDays} Days Used
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {progressPct}% Complete
                  </span>
                </div>
                <Progress value={progressPct} className="h-2.5 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-3 pt-1">
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {m.startDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {m.endDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Renewal Date</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {m.renewalDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-0.5">{getStatusBadge(m.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Information */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Membership Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <InfoRow label="Plan Name" value={m.planName} />
              <InfoRow label="Plan Type" value={m.planType} />
              <InfoRow
                label="Membership Status"
                value={getStatusBadge(m.status)}
              />
              <InfoRow label="Duration" value={m.duration} />
              <InfoRow label="Start Date" value={m.startDate} />
              <InfoRow label="Membership ID" value={m.membershipNo} />
            </CardContent>
          </Card>

          {/* Included Benefits */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Included Benefits
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                {BENEFITS.map((b) => (
                  <div key={b.title} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <b.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {b.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 2: Payment History + Timeline + Summary ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Payment History */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <div>
                  <CardTitle className="text-base font-semibold">
                    Payment History
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recent membership payments.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <PaymentHistoryTable data={PAYMENTS} />
              <div className="px-5 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing 1 to {PAYMENTS.length} of {PAYMENTS.length} payments
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Membership Timeline */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Membership Timeline
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="relative space-y-0">
                {TIMELINE.map((event, idx) => (
                  <div key={event.id} className="relative flex gap-4">
                    {/* vertical line */}
                    {idx < TIMELINE.length - 1 && (
                      <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-border" />
                    )}
                    {/* dot */}
                    <div className="flex-shrink-0 mt-1">
                      {event.completed ? (
                        <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                          <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {/* content */}
                    <div className="pb-5 flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold leading-tight",
                          event.completed
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {event.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Membership Benefits Summary */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Membership Benefits Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="grid grid-cols-2 gap-3">
                {/* Current Plan */}
                <div className="rounded-xl border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Current Plan
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    Premium Fitness
                  </p>
                </div>
                {/* Total Gym Visits */}
                <div className="rounded-xl border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Total Gym Visits
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">128</p>
                </div>
                {/* Attendance Rate */}
                <div className="rounded-xl border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Attendance Rate
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">84%</p>
                </div>
                {/* Current Streak */}
                <div className="rounded-xl border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs text-muted-foreground">
                      Current Streak
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">5 Days</p>
                </div>
                {/* Trainer — full width */}
                <div className="col-span-2 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <UserRound className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Trainer
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        RS
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold text-foreground">
                      {m.assignedTrainer}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
