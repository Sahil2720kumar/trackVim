"use client";

import Link from "next/link";
import { AttendanceAnalyticsChart } from "@/components/owner/AttendanceAnalyticsChart";
import { memberQuickActions } from "@/components/owner/quick-actions-data";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { StatCard } from "@/components/StatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Crown,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Shield,
  Star,
  User,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { daysBetween, getInitials } from "@/lib/utils";
import { TrainerManagerDialog } from "@/components/owner/member/TrainerManagerDialog";
import {
  useAllTrainers,
  useMemberByIdWithAttendance,
} from "@/hooks/queries/owner.query";

function getAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return null;
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function membershipProgress(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (end <= start) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round(((Date.now() - start) / (end - start)) * 100)),
  );
}

function waLink(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const e164 = phone.trim().startsWith("+") ? digits : `91${digits.slice(-10)}`;
  return `https://wa.me/${e164}`;
}

// ─── Loading skeleton — flat blocks, matches DashboardSkeleton style ───────

function MemberProfileSkeleton() {
  return (
    <>
      {/* Profile header */}
      <div className="flex flex-col gap-5 border-b border-gray-100 pb-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-5 w-72" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[110px] w-full rounded-2xl" />
            ))}
          </div>

          <Skeleton className="h-80 w-full rounded-2xl" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>

          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>

      <Skeleton className="h-48 w-full rounded-2xl mt-6" />
    </>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────

function MemberProfileError({
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
        Couldn't load this member{message ? `: ${message}` : "."}
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

export function MemberProfileContent({
  memberId,
  gymId,
}: {
  memberId: string;
  gymId: string;
}) {
  const {
    data: response,
    isLoading: memberLoading,
    isError: memberError,
    isFetching: memberFetching,
    error: memberErrorObj,
    refetch: refetchMember,
  } = useMemberByIdWithAttendance(memberId);

  const {
    data: allTrainers,
    isLoading: trainersLoading,
    isError: trainersError,
    isFetching: trainersFetching,
    error: trainersErrorObj,
    refetch: refetchTrainers,
  } = useAllTrainers();

  const isLoading = memberLoading || trainersLoading;
  const isError = memberError || trainersError;
  const isFetching = memberFetching || trainersFetching;

  const refetchAll = () => {
    refetchMember();
    refetchTrainers();
  };

  if (isLoading) {
    return <MemberProfileSkeleton />;
  }

  if (isError || !response) {
    const firstError = memberErrorObj ?? trainersErrorObj;

    return (
      <MemberProfileError
        message={firstError instanceof Error ? firstError.message : null}
        onRetry={refetchAll}
        retrying={isFetching}
      />
    );
  }

  // No more trainersQuery.data.success / trainersQuery.data.data
  // allTrainers is already the actual array.

  const {
    member: memberDetails,
    membership,
    scheduledMembership,
    trainers,
    monthlyAttendance,
    attendanceRate,
    totalCheckIns,
    payments,
    totalPaymentsThisYear,
    outstanding,
    lastPayment,
    upcomingSessions,
  } = response;

  const age = getAge(memberDetails.date_of_birth);

  const progress = membership
    ? membershipProgress(membership.start_date, membership.end_date)
    : 0;

  const daysLeft = membership ? daysBetween(membership.end_date) : 0;

  const chartData = monthlyAttendance.map((m) => ({
    month: m.month_label,
    present: m.days_present,
    absent: m.days_absent,
  }));

  const recentActivity = payments.slice(0, 3).map((p) => ({
    id: p.id,
    title:
      p.status === "Verified"
        ? "Payment Received"
        : p.status === "Rejected"
          ? "Payment Rejected"
          : "Payment Recorded",
    description: `₹${Number(p.amount).toLocaleString("en-IN")} via ${p.method ?? "—"}`,
    timestamp: p.payment_date ?? p.created_at,
  }));

  return (
    <>
      {/* Profile Header */}
      <div className="flex flex-col gap-5 border-b border-gray-100 pb-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <Avatar className="h-20 w-20 flex-shrink-0 border-2 border-indigo-100 sm:h-24 sm:w-24">
            <AvatarImage
              src={memberDetails.photo_url ?? undefined}
              alt={memberDetails.full_name ?? ""}
            />
            <AvatarFallback className="bg-indigo-50 text-lg font-bold text-indigo-600 sm:text-xl">
              {getInitials(memberDetails.full_name ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold text-gray-900 sm:text-3xl">
              {memberDetails.full_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {membership?.plan?.plan_name && (
                <Badge className="gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
                  <Crown className="h-3 w-3" />
                  {membership.plan.plan_name}
                </Badge>
              )}
              <Badge className="gap-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                <Check className="h-3 w-3" />
                {membership?.status ?? memberDetails.account_status}
              </Badge>
              <Badge
                className={`gap-1 ${
                  memberDetails.member_type === "WalkIn"
                    ? "border-primary/20 bg-primary/5 text-primary"
                    : "border-sky-200 bg-sky-50 text-sky-700"
                }`}
              >
                <User className="h-3 w-3" />
                {memberDetails.member_type}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>ID #{memberDetails.member_code}</span>
              <span className="hidden sm:inline">&bull;</span>
              <span>
                Joined{" "}
                {memberDetails.created_at
                  ? new Date(memberDetails.created_at).toLocaleDateString(
                      "en-IN",
                    )
                  : "—"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {age !== null && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {age} Years
                </span>
              )}
              {memberDetails.gender && (
                <span className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" />
                  {memberDetails.gender}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            asChild
          >
            <Link
              className="flex flex-row gap-1"
              href={`/owner/members/renew?memberId=${memberDetails.id}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Renew Membership
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Member Information */}
            <Card className="border-gray-100">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Member Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {memberDetails.contact_phone ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="truncate font-medium">
                      {memberDetails.contact_email ?? "—"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {[
                        memberDetails.address,
                        memberDetails.city,
                        memberDetails.state,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Occupation</p>
                    <p className="font-medium">
                      {memberDetails.occupation ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                    <p className="font-medium">
                      {memberDetails.blood_group ?? "—"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="font-medium">
                      {memberDetails.height_cm
                        ? `${memberDetails.height_cm} cm`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-medium">
                      {memberDetails.weight_kg
                        ? `${memberDetails.weight_kg} kg`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <p className="text-xs font-medium">
                      {memberDetails.fitness_goal ?? "—"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Emergency Contact
                  </p>
                  <p className="font-medium">
                    {memberDetails.emergency_contact_name ?? "—"}
                    {memberDetails.emergency_contact_phone
                      ? ` (${memberDetails.emergency_contact_phone})`
                      : ""}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Membership Summary */}
            <Card className="border-gray-100">
              <CardHeader>
                <CardTitle className="text-base">Membership Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                  <span className="flex items-center gap-1.5 text-base font-semibold text-amber-800">
                    <Crown className="h-4 w-4" />
                    {membership?.plan?.plan_name ?? "No active plan"}
                  </span>
                  {membership?.plan?.plan_price && (
                    <span className="text-xl font-bold text-indigo-600">
                      ₹{membership.plan.plan_price}
                      <span className="text-sm font-medium text-muted-foreground">
                        {" "}
                        / month
                      </span>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {membership?.start_date ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{membership?.end_date ?? "—"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className="font-medium">{daysLeft} Days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {trainers.length > 1
                      ? "Primary Trainer"
                      : "Assigned Trainer"}
                  </span>
                  <span className="font-medium text-indigo-600">
                    {trainers.length === 0
                      ? "Unassigned"
                      : (trainers.find((t) => t.isPrimary)?.full_name ??
                        trainers[0].full_name)}
                    {trainers.length > 1 && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        +{trainers.length - 1} more
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                    {membership?.status ?? "—"}
                  </Badge>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Membership Duration</p>
                    <p className="text-sm font-semibold">{progress}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {scheduledMembership && (
              <Card className="border-blue-100 bg-blue-50/40">
                <CardHeader>
                  <CardTitle className="text-base">
                    Upcoming Membership
                  </CardTitle>
                  <CardDescription>
                    Scheduled to start once the current plan ends
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="font-medium">
                      {scheduledMembership.plan?.plan_name ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-medium">
                      ₹
                      {scheduledMembership.plan?.plan_price ??
                        scheduledMembership.plan_price}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Starts</p>
                    <p className="font-medium">
                      {scheduledMembership.start_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ends</p>
                    <p className="font-medium">
                      {scheduledMembership.end_date}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Attendance"
              value={`${attendanceRate}%`}
              subtitle={`${totalCheckIns} Check-ins (12mo)`}
              icon={Activity}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <StatCard
              title="Total Payments"
              value={`₹${totalPaymentsThisYear.toLocaleString("en-IN")}`}
              icon={Wallet}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
            <StatCard
              title="Upcoming Sessions"
              value={upcomingSessions.length}
              subtitle="Scheduled"
              icon={Users}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Days Remaining"
              value={daysLeft}
              subtitle="Until expiry"
              icon={Calendar}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>

          <AttendanceAnalyticsChart data={chartData} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-gray-100">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  Trainers {trainers.length > 0 && `(${trainers.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trainers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No trainer assigned yet.
                  </p>
                ) : (
                  trainers.map((trainer) => (
                    <div
                      key={trainer.assignmentId}
                      className="flex items-start gap-4"
                    >
                      <Avatar className="h-14 w-14 border-2 border-indigo-100">
                        <AvatarFallback className="bg-indigo-50 text-base font-bold text-indigo-600">
                          {getInitials(trainer.full_name ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{trainer.full_name}</p>
                          {trainer.isPrimary && (
                            <Badge
                              variant="outline"
                              className="gap-1 text-[10px]"
                            >
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {trainer.professional_title}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-indigo-600"
                          asChild
                        >
                          <Link href={`/owner/trainers/${trainer.id}`}>
                            View Trainer
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                <Separator />
                <TrainerManagerDialog
                  memberId={memberDetails.id}
                  gymId={gymId}
                  assignedTrainers={trainers}
                  availableTrainers={allTrainers}
                />
              </CardContent>
            </Card>

            <Card className="border-gray-100">
              <CardHeader>
                <CardTitle className="text-base">Upcoming Sessions</CardTitle>
                <CardDescription>Next scheduled workouts</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No upcoming sessions.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="min-w-[64px] rounded-lg bg-indigo-50 px-3 py-2 text-center">
                          <p className="font-bold text-indigo-600">
                            {session.session_date}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">
                            {session.session_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.workout_type}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {session.start_time} - {session.end_time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-gray-100">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Payment Summary</CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-indigo-600"
                  asChild
                >
                  {/* <Link href={`/owner/members/${memberDetails.id}/payments`}>
                    View All
                  </Link> */}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paid This Year</span>
                  <span className="font-bold">
                    ₹{totalPaymentsThisYear.toLocaleString("en-IN")}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Outstanding</span>
                  <Badge
                    className={
                      outstanding > 0
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
                        : "border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
                    }
                  >
                    ₹{outstanding.toLocaleString("en-IN")}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Payment</span>
                  <span className="font-medium">
                    {lastPayment?.payment_date ?? "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <CardDescription>Latest member updates</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No recent activity.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50">
                          <CreditCard className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-base">Health Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Medical Conditions
                  </p>
                  <p className="mt-1 font-medium">
                    {memberDetails.medical_conditions ?? "None"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Allergies
                  </p>
                  <p className="mt-1 font-medium">
                    {memberDetails.allergies ?? "None"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Notes
                  </p>
                  <p className="mt-1 font-medium">
                    {memberDetails.physical_notes ?? "—"}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Emergency Contact
                </p>
                <p className="mt-1 font-medium">
                  {memberDetails.emergency_contact_name ?? "—"}
                  {memberDetails.emergency_contact_relationship
                    ? ` (${memberDetails.emergency_contact_relationship})`
                    : ""}
                  {memberDetails.emergency_contact_phone
                    ? ` • ${memberDetails.emergency_contact_phone}`
                    : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-base">Member Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                {membership?.status ?? memberDetails.account_status} Member
              </div>
              {membership?.plan?.plan_name && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 flex-shrink-0 text-amber-600" />
                  {membership.plan.plan_name}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                {attendanceRate}% Attendance
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                {trainers.length > 0 ? "Trainer Assigned" : "No Trainer"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Upcoming Renewal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Expires In
                </p>
                <p className="text-2xl font-bold text-orange-600 sm:text-3xl">
                  {daysLeft} Days
                </p>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Renewal due on {membership?.end_date ?? "—"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-base">Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex h-16 flex-col gap-1.5 border-green-100 bg-green-50 text-green-700 hover:bg-green-100"
                asChild={Boolean(memberDetails.contact_phone)}
                disabled={!memberDetails.contact_phone}
              >
                {memberDetails.contact_phone ? (
                  <a href={`tel:${memberDetails.contact_phone}`}>
                    <Phone className="h-5 w-5" />
                    <span className="text-xs">Call</span>
                  </a>
                ) : (
                  <>
                    <Phone className="h-5 w-5" />
                    <span className="text-xs">Call</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="flex h-16 flex-col gap-1.5 border-green-100 bg-green-50 text-green-700 hover:bg-green-100"
                asChild={Boolean(memberDetails.contact_phone)}
                disabled={!memberDetails.contact_phone}
              >
                {memberDetails.contact_phone ? (
                  <a
                    href={waLink(memberDetails.contact_phone)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-xs">WhatsApp</span>
                  </a>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-xs">WhatsApp</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="flex h-16 flex-col gap-1.5 border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                asChild={Boolean(memberDetails.contact_email)}
                disabled={!memberDetails.contact_email}
              >
                {memberDetails.contact_email ? (
                  <a href={`mailto:${memberDetails.contact_email}`}>
                    <Mail className="h-5 w-5" />
                    <span className="text-xs">Email</span>
                  </a>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    <span className="text-xs">Email</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-gray-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickActionsGrid actions={memberQuickActions} columns={4} />
        </CardContent>
      </Card>
    </>
  );
}
