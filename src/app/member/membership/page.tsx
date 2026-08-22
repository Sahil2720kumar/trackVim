"use client";

import { notFound } from "next/navigation";
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
  CalendarClock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatDateStr, getInitials } from "@/lib/utils";
import { getMyMembershipDetails } from "@/services/member.query";
import { PaymentHistoryTable } from "@/components/member/membership/PaymentHistoryTable";
import type { MembershipTimelineEvent } from "@/services/member.query";
import { useMyMembershipDetails } from "@/hooks/queries/member.query";
import { Button } from "@/components/ui/button";

const FEATURE_ICONS: Record<string, React.ElementType> = {
  "Unlimited Gym Access": Dumbbell,
  "Locker Facility": Lock,
  "Personal Trainer Sessions": UserRound,
  "Steam Bath Access": Waves,
  "Workout Plans": LayoutGrid,
  "Nutrition Consultation": Apple,
  "Attendance Tracking": Activity,
  "Priority Support": HeadphonesIcon,
};

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    Active: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
    Scheduled:
      "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
    Expired: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
    PaymentPending:
      "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
    PaymentUploaded:
      "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  };
  return (
    <Badge className={map[status] ?? "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  );
}

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

// Pure SVG + arithmetic — no hooks, no state — safe to render server-side.
function CircularProgress({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
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

export default function MembershipPage() {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useMyMembershipDetails();

  if (isLoading) {
    return (
      <div className=" space-y-6 px-4 py-6">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !response?.success) {
    return (
      <div className=" flex  flex-col items-center gap-4 px-4 py-16 text-center">
        <h2 className="text-lg font-semibold">
          We couldn't load your membership
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {response && !response.success
            ? response.error
            : "Something went wrong. Please try again."}
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  const {
    membership,
    scheduledMembership,
    gym,
    trainer,
    totalDays,
    usedDays,
    totalPayments,
    payments,
    timeline,
    stats,
  } = response.data;

  const remainingDays = totalDays - usedDays;
  const progressPct =
    totalDays > 0 ? Math.round((usedDays / totalDays) * 100) : 0;

  const benefits = [
    ...(membership.plan?.selected_features ?? []).map((title: string) => ({
      icon: FEATURE_ICONS[title] ?? Sparkles,
      title,
    })),
    ...(membership.plan?.custom_features ?? []).map((title: string) => ({
      icon: Star,
      title,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            My Membership
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View your current membership, plan details, validity period, and
            payment history.
          </p>
        </div>

        {/* Hero Membership Card */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#3b1fa3] via-[#4c28c4] to-[#2e0f9e] p-5 sm:p-8 shadow-xl">
          <div className="absolute top-[-40px] right-[10%] w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-[-60px] right-[4%] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-start justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 w-full md:w-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {membership.plan?.plan_name ?? "—"}
                  </h2>
                  {getStatusBadge(membership.status)}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-white/70 text-sm">
                  <div>
                    <span className="text-white/50 text-xs block">
                      Membership No.
                    </span>
                    <span className="text-white font-semibold">
                      {membership.id.slice(0, 8).toUpperCase()}
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
                        {formatDateStr(membership.start_date)}
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
                        {gym?.name}
                        {gym?.city ? `, ${gym.city}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-4 sm:gap-2 flex-shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <div className="text-left md:text-center md:mb-1">
                <span className="text-white/60 text-xs block">Valid Until</span>
                <span className="text-white font-bold text-lg sm:text-xl">
                  {formatDateStr(membership.end_date)}
                </span>
              </div>
              <CircularProgress
                value={remainingDays}
                max={totalDays}
                label="Days Remaining"
              />
            </div>
          </div>
        </div>

        {/* Upcoming Plan banner — only shown when a paid renewal is
            sitting in Scheduled status waiting for the current plan to end */}
        {scheduledMembership && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <CalendarClock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {scheduledMembership.plan?.plan_name ?? "New plan"} scheduled
                  to start
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Begins {formatDateStr(scheduledMembership.start_date)}, right
                  after your current plan ends
                </p>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 self-start sm:self-auto">
              Scheduled
            </Badge>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={BadgeCheck}
            iconBg="bg-green-50"
            iconClass="text-green-600"
            label="Membership Status"
            value={membership.status}
            valueClass={
              membership.status === "Active"
                ? "text-green-600"
                : membership.status === "Expired"
                  ? "text-red-600"
                  : "text-yellow-600"
            }
          />
          <StatCard
            icon={CalendarDays}
            iconBg="bg-blue-50"
            iconClass="text-blue-600"
            label="Valid Until"
            value={formatDateStr(membership.end_date)}
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
            value={`₹${totalPayments.toLocaleString("en-IN")}`}
            valueClass="text-violet-600"
          />
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
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
                    {usedDays} / {totalDays} Days Used
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
                    {formatDateStr(membership.start_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDateStr(membership.end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {scheduledMembership ? "Renewal Starts" : "Renewal Date"}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDateStr(
                      scheduledMembership?.start_date ?? membership.end_date,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-0.5">
                    {getStatusBadge(membership.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <InfoRow
                label="Plan Name"
                value={membership.plan?.plan_name ?? "—"}
              />
              <InfoRow
                label="Plan Type"
                value={membership.plan?.plan_category ?? "—"}
              />
              <InfoRow
                label="Membership Status"
                value={getStatusBadge(membership.status)}
              />
              <InfoRow
                label="Duration"
                value={membership.plan?.membership_duration ?? "—"}
              />
              <InfoRow
                label="Start Date"
                value={formatDateStr(membership.start_date)}
              />
              <InfoRow
                label="Membership ID"
                value={membership.id.slice(0, 8).toUpperCase()}
              />
              {scheduledMembership && (
                <InfoRow
                  label="Next Plan"
                  value={scheduledMembership.plan?.plan_name ?? "—"}
                  valueClass="text-orange-600"
                />
              )}
            </CardContent>
          </Card>

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
              {benefits.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No benefits configured for this plan.
                </p>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                  {benefits.map((b) => (
                    <div key={b.title} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                        <b.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {b.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Payment History — the one client island on this page */}
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
              <PaymentHistoryTable data={payments} />
              {payments.length > 0 && (
                <div className="px-5 py-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Showing 1 to {payments.length} of {payments.length} payments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
                {timeline.map((event: MembershipTimelineEvent, idx: number) => (
                  <div key={event.id} className="relative flex gap-4">
                    {idx < timeline.length - 1 && (
                      <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-border" />
                    )}
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
                        {formatDateStr(event.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                <div className="rounded-xl border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Current Plan
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {membership.plan?.plan_name ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Total Gym Visits
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {stats.totalVisits}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Attendance Rate
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {stats.attendanceRate}%
                  </p>
                </div>
                <div className="rounded-xl border border-border p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs text-muted-foreground">
                      Current Streak
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {stats.currentStreak} Days
                  </p>
                </div>
                <div className="col-span-2 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <UserRound className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Trainer
                    </span>
                  </div>
                  {trainer ? (
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={trainer.photo_url ?? undefined}
                          alt={trainer.full_name ?? ""}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(trainer.full_name ?? "")}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-semibold text-foreground">
                        {trainer.full_name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No trainer assigned
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
