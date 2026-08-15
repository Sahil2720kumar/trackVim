"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  Activity,
  Star,
  Calendar,
  Clock,
  Briefcase,
  ArrowLeft,
  Edit3,
  MoreVertical,
  ChevronDown,
  CheckCircle2,
  MessageSquare,
  FileText,
  XCircle,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/StatCard";
import { MonthlySessionsChart } from "@/components/owner/MonthlySessionsChart";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { trainerDetailQuickActions } from "@/components/owner/quick-actions-data";
import { bigSquareButton } from "@/lib/styles";
import { TrainerAssignedMembersTable } from "@/components/owner/TrainerAssignedMembersTable";
import {
  deactivateTrainerAction,
  deleteTrainerAction,
} from "@/actions/owner.action";
import {
  type TrainerDetail,
  type AssignedMember,
} from "@/services/owner.query";
import { getInitials } from "@/lib/utils";
import { type trainerStatusEnum } from "@/db/schema";

export type TrainerStatus = (typeof trainerStatusEnum.enumValues)[number];

export const TRAINER_STATUS_COLORS: Record<TrainerStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-0",
  Busy: "bg-amber-100 text-amber-700 border-0",
  "On Leave": "bg-blue-100 text-blue-700 border-0",
  Offline: "bg-gray-100 text-gray-600 border-0",
  Invited: "bg-purple-100 text-purple-700 border-0",
  Inactive: "bg-rose-100 text-rose-700 border-0",
};

export function getTrainerStatusColor(status: string) {
  return (
    TRAINER_STATUS_COLORS[status as TrainerStatus] ??
    "bg-gray-100 text-gray-600 border-0"
  );
}
const SPEC_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
];

type Props = {
  trainerId: string;
  initialTrainer: TrainerDetail;
  initialStats: { sessionsThisMonth: number; attendanceRate: number };
  monthlySessions: { month: string; sessions: number }[];
  assignedMembers: AssignedMember[];
};

export function TrainerProfileClient({
  trainerId,
  initialTrainer,
  initialStats,
  monthlySessions,
  assignedMembers,
}: Props) {
  const router = useRouter();

  const trainer = initialTrainer;

  const [isDeactivating, startDeactivateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeactivate = () => {
    if (isDeactivating) return;
    startDeactivateTransition(async () => {
      try {
        const result = await deactivateTrainerAction(trainerId);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Trainer deactivated");
        router.refresh();
      } catch (error) {
        console.error("Error deactivating trainer:", error);
        toast.error("Error deactivating trainer. Please try again.");
      }
    });
  };

  const handleDelete = () => {
    if (isDeleting) return;
    startDeleteTransition(async () => {
      try {
        const result = await deleteTrainerAction(trainerId);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Trainer deleted");
        router.push("/owner/trainers");
      } catch (error) {
        console.error("Error deleting trainer:", error);
        toast.error("Error deleting trainer. Please try again.");
      }
    });
  };

  const workingHours =
    trainer.start_time && trainer.end_time
      ? `${trainer.start_time} - ${trainer.end_time}`
      : "Not set";
  const specializations = trainer.specializations ?? [];
  const workingDays = trainer.working_days ?? [];

  return (
    <div className="flex-1 bg-background">
      <div className="flex flex-col gap-6 lg:flex-row px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <div className="min-w-0 flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-20 w-20 border-2 border-border sm:h-24 sm:w-24">
                <AvatarImage src={trainer.photo_url ?? undefined} />
                <AvatarFallback>
                  {getInitials(trainer.full_name || "NA")}
                </AvatarFallback>
              </Avatar>
              <div className="sm:pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                    {trainer.full_name ?? "-"}
                  </h1>
                  <Badge className={getTrainerStatusColor(trainer.status)}>
                    {trainer.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {trainer.employee_id
                    ? `Employee ID: ${trainer.employee_id} | `
                    : ""}
                  Joined: {trainer.joining_date ?? "—"} |{" "}
                  {trainer.experience_years ?? 0} Years Experience
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {specializations.map((spec, i) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className={`${SPEC_COLORS[i % SPEC_COLORS.length]} border-0`}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Button
                variant="ghost"
                className={bigSquareButton}
                onClick={() => router.push("/owner/trainers")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Trainers
              </Button>
              <Button
                variant="outline"
                className={bigSquareButton}
                onClick={() => router.push(`/owner/trainers/${trainerId}/edit`)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Trainer
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={bigSquareButton}>
                    <MoreVertical className="w-4 h-4 mr-2" />
                    More Actions
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    Assign Members
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="w-4 h-4 mr-2" />
                    View Sessions
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Trainer
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleDeactivate}
                    disabled={isDeactivating}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {isDeactivating ? "Deactivating…" : "Deactivate Trainer"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Deleting…" : "Delete Trainer"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Assigned Members"
              value={assignedMembers.length}
              icon={Users}
              iconBg="bg-violet-100 dark:bg-violet-500/15"
              iconColor="text-violet-600"
            />
            <StatCard
              title="Sessions This Month"
              value={initialStats.sessionsThisMonth}
              icon={Activity}
              iconBg="bg-blue-100 dark:bg-blue-500/15"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Attendance Rate"
              value={`${initialStats.attendanceRate}%`}
              icon={ShieldCheck}
              iconBg="bg-emerald-100 dark:bg-emerald-500/15"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Average Rating"
              value={Number(trainer.average_rating ?? 0).toFixed(1)}
              icon={Star}
              iconBg="bg-orange-100 dark:bg-orange-500/15"
              iconColor="text-orange-500"
            />
          </div>

          {/* Performance Analytics */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Performance Analytics
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <MonthlySessionsChart data={monthlySessions} />
              {/* Member growth still needs a dated assignment/join-event table to be real —
                  left out rather than faked; drop MemberGrowthChart back in once that exists. */}
            </div>
          </div>

          {/* Working Schedule + Capacity */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Working Schedule
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Working Days
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div
                          key={day}
                          className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded border text-sm font-medium ${
                            workingDays.includes(day)
                              ? "bg-purple-100 text-purple-700 border-purple-200"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {workingDays.includes(day) ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            day.substring(0, 1)
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-semibold text-foreground truncate">
                          {workingHours}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Employment Type
                        </p>
                        <p className="font-semibold text-foreground truncate">
                          {trainer.employment_type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4">Capacity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Max Members
                  </span>
                  <span className="font-semibold text-foreground">
                    {trainer.max_members ?? "—"} Members
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Max Sessions / Day
                  </span>
                  <span className="font-semibold text-foreground">
                    {trainer.max_sessions_per_day ?? "—"} Sessions
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Assigned Members — live from trainer_assignments */}
          <TrainerAssignedMembersTable initialMembers={assignedMembers} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Quick Actions
              </h3>
              <QuickActionsGrid
                actions={trainerDetailQuickActions}
                columns={2}
              />
            </Card>
          </div>
        </div>

        <div className="w-full lg:block lg:w-80 lg:shrink-0 space-y-4">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-6">
            <h3 className="font-semibold text-foreground mb-4">
              Trainer Summary
            </h3>
            <div className="space-y-4">
              <div className="text-center py-3">
                <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-border">
                  <AvatarImage src={trainer.photo_url ?? undefined} />
                  <AvatarFallback>
                    {getInitials(trainer.full_name || "NA")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-foreground">
                  {trainer.full_name}
                </p>
                {trainer.employee_id && (
                  <p className="text-xs text-muted-foreground">
                    Employee ID: {trainer.employee_id}
                  </p>
                )}
                <Badge className={getTrainerStatusColor(trainer.status)}>
                  {trainer.status}
                </Badge>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" /> Today&apos;s Schedule
                  </span>
                  <span className="text-sm font-semibold text-foreground text-right">
                    {workingHours}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" /> Working Days
                  </span>
                  <span className="text-sm font-semibold text-foreground text-right">
                    {workingDays.join(", ") || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4 shrink-0" /> Employment Type
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {trainer.employment_type}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0" /> Maximum Members
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {trainer.max_members ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Invitation
                    Status
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                    {trainer.invitation_accepted_at ? "Accepted" : "Pending"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Profile Completion
                  </span>
                </div>
                <Progress
                  value={trainer.bio && trainer.qualification ? 100 : 60}
                  className="h-2"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
