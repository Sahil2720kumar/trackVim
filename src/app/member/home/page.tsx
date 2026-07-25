"use client";

import { useEffect, useState } from "react";
import {
  ScanLine,
  CheckCircle2,
  Clock3,
  Calendar,
  Activity,
  Timer,
  Flame,
  CreditCard,
  ChevronRight,
  MessageCircle,
  Dumbbell,
  ShieldAlert,
  TriangleAlert,
  Building2,
  History,
  Crown,
  QrCode,
  DoorOpen,
  DoorClosed,
  Sprout,
  Zap,
  TrendingUp,
  Search,
  ClipboardList,
  Lock,
  Info,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AttendanceStatus = "not-checked-in" | "checked-in" | "checked-out";

interface Membership {
  planName: string;
  planType: string;
  status: "active" | "expired";
  validUntil: string;
  daysRemaining: number;
  startDate: string;
  duration: string;
  expiredOn?: string;
}

interface QuickLink {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

interface TodaySummary {
  workoutDuration: string;
  sessions: number;
  caloriesBurned: number;
}

interface MembershipApplication {
  gymName: string;
  planName: string;
  appliedOn: string;
}

/** The six states the Development Controls can force the page into. */
type DevState =
  | "no-gym"
  | "pending"
  | "expired"
  | "not-checked-in"
  | "checked-in"
  | "checked-out";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockMembership: Membership = {
  planName: "Annual Gold",
  planType: "All Access",
  status: "active",
  validUntil: "22 Aug 2026",
  daysRemaining: 28,
  startDate: "22 Aug 2025",
  duration: "12 Months",
};

const mockExpiredMembership: Membership = {
  ...mockMembership,
  status: "expired",
  expiredOn: "22 Jul 2026",
};

const mockApplication: MembershipApplication = {
  gymName: "IronForge Fitness",
  planName: "Annual Gold",
  appliedOn: "22 Jul 2026",
};

const mockAttendanceTimes = {
  checkIn: "07:05 AM",
  checkOut: "08:32 AM",
  duration: "01 hr 27 min",
};

const summaryByAttendance: Record<AttendanceStatus, TodaySummary> = {
  "not-checked-in": {
    workoutDuration: "0 min",
    sessions: 0,
    caloriesBurned: 0,
  },
  "checked-in": { workoutDuration: "01:15", sessions: 1, caloriesBurned: 125 },
  "checked-out": {
    workoutDuration: "1 hr 27 min",
    sessions: 1,
    caloriesBurned: 152,
  },
};

const quickLinks: QuickLink[] = [
  {
    title: "My Sessions",
    description: "View your assigned workouts",
    icon: Dumbbell,
    href: "/sessions",
  },
  {
    title: "Attendance History",
    description: "View your check-in history",
    icon: History,
    href: "/attendance",
  },
  {
    title: "Membership",
    description: "View your membership details",
    icon: CreditCard,
    href: "/membership",
  },
  {
    title: "Messages",
    description: "Chat with your trainer or gym",
    icon: MessageCircle,
    href: "/messages",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDevStateLabel(state: DevState): string {
  const labels: Record<DevState, string> = {
    "no-gym": "No Gym Joined",
    pending: "Application Pending",
    expired: "Membership Expired",
    "not-checked-in": "Not Checked In",
    "checked-in": "Checked In",
    "checked-out": "Checked Out",
  };
  return labels[state];
}

function deriveAttendanceStatus(state: DevState): AttendanceStatus {
  if (state === "checked-in") return "checked-in";
  if (state === "checked-out") return "checked-out";
  return "not-checked-in";
}

// ---------------------------------------------------------------------------
// Development Controls
// ---------------------------------------------------------------------------

interface DevControlsProps {
  state: DevState;
  onChange: (state: DevState) => void;
}

function DevControls({ state, onChange }: DevControlsProps) {
  const states: DevState[] = [
    "no-gym",
    "pending",
    "expired",
    "not-checked-in",
    "checked-in",
    "checked-out",
  ];

  return (
    <Card className="rounded-2xl border-dashed border-border bg-muted/40 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Development Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {states.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={state === s ? "default" : "outline"}
            onClick={() => onChange(s)}
            className="rounded-full"
          >
            {getDevStateLabel(s)}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section eyebrow — small icon + label used above most cards
// ---------------------------------------------------------------------------

function SectionEyebrow({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
      <Icon className="h-4 w-4" />
      {label}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Onboarding Card (No Gym Joined / Application Pending)
// ---------------------------------------------------------------------------

interface OnboardingCardProps {
  mode: "no-gym" | "pending";
  application?: MembershipApplication;
}

function OnboardingCard({ mode, application }: OnboardingCardProps) {
  const isPending = mode === "pending";

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-10 text-center sm:px-8">
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-primary/5 sm:h-48 sm:w-48">
        <div className="absolute -left-2 top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-sm">
          {isPending ? (
            <Clock3 className="h-6 w-6 text-primary/70" />
          ) : (
            <Dumbbell className="h-6 w-6 text-primary/70" />
          )}
        </div>
        <div className="absolute -right-3 bottom-4 flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm">
          <Sprout className="h-5 w-5 text-primary/60" />
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-card shadow-md sm:h-28 sm:w-28">
          {isPending ? (
            <ClipboardList className="h-11 w-11 text-primary" />
          ) : (
            <Building2 className="h-11 w-11 text-primary" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {isPending ? "Application Pending" : "New Member"}
        </Badge>
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {isPending
            ? "Membership Request Under Review"
            : "You haven't joined a gym yet"}
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          {isPending
            ? "Your membership request is currently under review. Once the gym owner approves your application and activates your membership, you'll be able to check in and track your attendance."
            : "Join a gym to receive workout sessions, track your attendance, and stay connected with your trainer."}
        </p>
      </div>

      {isPending && application && (
        <div className="grid w-full max-w-md grid-cols-1 gap-4 rounded-2xl bg-muted/50 p-5 text-left sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Applied Gym</p>
            <p className="text-sm font-medium text-foreground">
              {application.gymName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Applied Plan</p>
            <p className="text-sm font-medium text-foreground">
              {application.planName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Applied On</p>
            <p className="text-sm font-medium text-foreground">
              {application.appliedOn}
            </p>
          </div>
        </div>
      )}

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button size="lg" className="w-full rounded-xl">
          {isPending ? (
            <ClipboardList className="h-5 w-5" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          {isPending ? "View My Applications" : "Discover Gyms"}
        </Button>
        <Button size="lg" variant="outline" className="w-full rounded-xl">
          {isPending ? (
            <Search className="h-5 w-5" />
          ) : (
            <ClipboardList className="h-5 w-5" />
          )}
          {isPending ? "Discover More Gyms" : "View My Applications"}
        </Button>
      </div>

      {!isPending && (
        <div className="w-full rounded-2xl bg-muted/40 p-5">
          <p className="mb-4 text-sm font-medium text-foreground">
            Why join a gym on TrackVim?
          </p>
          <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Dumbbell, label: "Personalized workout sessions" },
              { icon: Calendar, label: "Track attendance easily" },
              {
                icon: MessageCircle,
                label: "Stay connected with your trainer",
              },
              { icon: CreditCard, label: "Manage membership & payments" },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-muted-foreground">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attendance Card (Not Checked In / Checked In / Checked Out)
// ---------------------------------------------------------------------------

interface AttendanceCardProps {
  status: AttendanceStatus;
}

function AttendanceCard({ status }: AttendanceCardProps) {
  if (status === "not-checked-in") {
    return (
      <Card className="overflow-hidden rounded-2xl border-border bg-primary/5 shadow-md">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <SectionEyebrow icon={Activity} label="Today's Check-in Status" />
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Not Checked In
            </Badge>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <ScanLine className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Ready to start your workout?
                  </h2>
                  <p className="text-muted-foreground">
                    Scan the QR code at the gym entrance to check in and track
                    your workout.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-xl sm:w-auto sm:px-8"
                >
                  <ScanLine className="h-5 w-5" />
                  Scan to Check In
                </Button>
              </div>
            </div>

            <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-2xl lg:flex">
              <DoorOpen className="absolute -left-6 h-28 w-28 text-primary/10" />
              <DoorOpen className="absolute -right-6 h-28 w-28 -scale-x-100 text-primary/10" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] border-4 border-primary/15 bg-card shadow-md">
                <QrCode className="h-14 w-14 text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "checked-in") {
    return (
      <Card className="overflow-hidden rounded-2xl border-emerald-500/20 bg-emerald-500/5 shadow-md">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <SectionEyebrow icon={Activity} label="Today's Check-in Status" />
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-500">
                Checked In
              </Badge>
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Session
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="w-full space-y-4">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-semibold text-foreground">
                    You&apos;re checked in!
                  </h2>
                  <p className="text-muted-foreground">
                    Enjoy your workout. Don&apos;t forget to scan again when you
                    leave.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      Check-in Time
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {mockAttendanceTimes.checkIn}
                    </p>
                  </div>
                  <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Timer className="h-3.5 w-3.5" />
                      Duration
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      01:15:24
                    </p>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full rounded-xl sm:w-auto sm:px-8"
                >
                  <ScanLine className="h-5 w-5" />
                  Scan to Check Out
                </Button>
              </div>
            </div>

            <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-2xl lg:flex">
              <DoorOpen className="absolute -left-6 h-28 w-28 text-emerald-500/10" />
              <DoorOpen className="absolute -right-6 h-28 w-28 -scale-x-100 text-emerald-500/10" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-emerald-500/10 shadow-md">
                <Activity className="h-14 w-14 text-emerald-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // checked-out
  return (
    <Card className="overflow-hidden rounded-2xl border-sky-500/20 bg-sky-500/5 shadow-md">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow icon={Activity} label="Today's Check-in Status" />
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-sky-500 px-3 py-1 text-white hover:bg-sky-500">
              Checked Out
            </Badge>
            <Badge
              variant="outline"
              className="hidden rounded-full border-sky-500/30 bg-card px-3 py-1 text-sky-700 dark:text-sky-400 sm:inline-flex"
            >
              Done for today 👋
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-foreground">
                  Great workout!
                </h2>
                <p className="text-muted-foreground">
                  You&apos;ve checked out for today. See you tomorrow!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Check-in Time
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {mockAttendanceTimes.checkIn}
                  </p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Check-out Time
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {mockAttendanceTimes.checkOut}
                  </p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    Total Duration
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {mockAttendanceTimes.duration}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-2xl lg:flex">
            <DoorClosed className="absolute -left-6 h-28 w-28 text-sky-500/10" />
            <DoorClosed className="absolute -right-6 h-28 w-28 -scale-x-100 text-sky-500/10" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-sky-500/10 shadow-md">
              <Sprout className="h-14 w-14 text-sky-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Membership Expired Attention Card (replaces Attendance Card hero)
// ---------------------------------------------------------------------------

interface ExpiredAttentionCardProps {
  membership: Membership;
}

function ExpiredAttentionCard({ membership }: ExpiredAttentionCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-amber-500/20 bg-amber-500/5 shadow-md">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow icon={ShieldAlert} label="Membership Alert" />
          <Badge className="rounded-full bg-amber-500 px-3 py-1 text-white hover:bg-amber-500">
            Membership Expired
          </Badge>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
              <TriangleAlert className="h-7 w-7" />
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-foreground">
                  Your membership has expired
                </h2>
                <p className="text-muted-foreground">
                  You currently don&apos;t have an active membership. Please
                  contact the gym owner to renew your membership.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Expired On
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {membership.expiredOn}
                  </p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Crown className="h-3.5 w-3.5" />
                    Previous Membership
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {membership.planName}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="rounded-xl sm:px-8">
                  <ShieldAlert className="h-5 w-5" />
                  Contact Gym
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl sm:px-8"
                >
                  View Membership
                </Button>
              </div>

              <div className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p className="text-xs">
                  Check-in and workout access are paused until your membership
                  is renewed by the gym owner.
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-2xl lg:flex">
            <DoorClosed className="absolute -left-6 h-28 w-28 text-amber-500/10" />
            <DoorClosed className="absolute -right-6 h-28 w-28 -scale-x-100 text-amber-500/10" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-amber-500/10 shadow-md">
              <Lock className="h-14 w-14 text-amber-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Membership Card
// ---------------------------------------------------------------------------

interface MembershipCardProps {
  membership: Membership;
}

function MembershipCard({ membership }: MembershipCardProps) {
  const isExpired = membership.status === "expired";
  const isExpiringSoon = !isExpired && membership.daysRemaining <= 30;

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <SectionEyebrow icon={CreditCard} label="Membership Status" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-sm">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-foreground">
                  {membership.planName}
                </p>
                <Badge
                  variant={isExpired ? "outline" : "secondary"}
                  className={
                    isExpired
                      ? "rounded-full border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-amber-700 dark:text-amber-400"
                      : "rounded-full px-2.5 py-0.5"
                  }
                >
                  {isExpired ? "Expired" : "Active"}
                </Badge>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {isExpired
                  ? `Expired on ${membership.expiredOn}`
                  : `Valid until ${membership.validUntil}`}
              </p>
            </div>
          </div>

          <Separator className="lg:hidden" />
          <Separator orientation="vertical" className="hidden h-16 lg:block" />

          <div className="flex flex-col items-center gap-1.5 text-center">
            {isExpired ? (
              <>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-400"
                >
                  Expired
                </Badge>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Days Remaining</p>
                <p className="text-3xl font-bold text-foreground">
                  {membership.daysRemaining}
                </p>
                <p className="text-xs text-muted-foreground">days left</p>
                {isExpiringSoon && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-700 dark:text-amber-400"
                  >
                    Expires Soon
                  </Badge>
                )}
              </>
            )}
          </div>

          <Separator className="lg:hidden" />
          <Separator orientation="vertical" className="hidden h-16 lg:block" />

          <div>
            <p className="mb-3 text-sm font-medium text-foreground lg:hidden">
              Membership Details
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {membership.startDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {membership.duration}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {membership.planType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Quick Links
// ---------------------------------------------------------------------------

interface QuickLinksProps {
  links: QuickLink[];
}

function QuickLinks({ links }: QuickLinksProps) {
  return (
    <div className="space-y-4">
      <SectionEyebrow icon={Zap} label="Quick Access" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Card
              key={link.title}
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-2xl border-border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{link.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Today's Summary
// ---------------------------------------------------------------------------

interface TodaySummaryCardProps {
  summary: TodaySummary;
}

function TodaySummaryCard({ summary }: TodaySummaryCardProps) {
  const items: { icon: LucideIcon; label: string; value: string }[] = [
    {
      icon: Timer,
      label: "Total Workout Time",
      value: summary.workoutDuration,
    },
    {
      icon: Dumbbell,
      label: "Workouts Completed",
      value: String(summary.sessions),
    },
    {
      icon: Flame,
      label: "Calories Burned",
      value: String(summary.caloriesBurned),
    },
  ];

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="space-y-5 p-6 sm:p-8">
        <SectionEyebrow icon={TrendingUp} label="Today's Summary" />
        <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-1 items-center gap-3 py-4 first:pt-0 last:pb-0 sm:justify-center sm:py-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MemberHomePage() {
  const [devState, setDevState] = useState<DevState>("not-checked-in");

  const attendanceStatus = deriveAttendanceStatus(devState);
  const isExpired = devState === "expired";
  const isNoGym = devState === "no-gym";
  const isPending = devState === "pending";
  const isOnboarding = isNoGym || isPending;
  const summary = summaryByAttendance[attendanceStatus];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <DevControls state={devState} onChange={setDevState} />

        {isOnboarding ? (
          <OnboardingCard
            mode={isPending ? "pending" : "no-gym"}
            application={isPending ? mockApplication : undefined}
          />
        ) : (
          <div className="space-y-6">
            {isExpired ? (
              <ExpiredAttentionCard membership={mockExpiredMembership} />
            ) : (
              <AttendanceCard status={attendanceStatus} />
            )}

            <MembershipCard
              membership={isExpired ? mockExpiredMembership : mockMembership}
            />

            <QuickLinks links={quickLinks} />

            <TodaySummaryCard
              summary={
                isExpired ? summaryByAttendance["not-checked-in"] : summary
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
