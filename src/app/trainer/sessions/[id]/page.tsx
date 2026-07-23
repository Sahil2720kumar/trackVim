// ============================================================================
// Imports
// ============================================================================

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock3,
  Timer,
  User,
  MapPin,
  Dumbbell,
  CheckCircle2,
  Circle,
  Pencil,
  MoreHorizontal,
  ChevronRight,
  ClipboardList,
  Tag,
  Layers,
  Gauge,
  Weight,
  Copy,
  ClipboardPlus,
  Trash2,
  ExternalLink,
  GripVertical,
  ListChecks,
  BarChart3,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

type SessionStatus =
  | "Completed"
  | "Upcoming"
  | "In Progress"
  | "Cancelled"
  | "Missed";

type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

interface SessionMember {
  name: string;
  membershipPlan: string;
  avatarUrl?: string;
  initials: string;
}

interface SessionTemplate {
  name: string;
  workoutType: string;
  difficulty: DifficultyLevel;
  description: string;
  exerciseCount: number;
}

interface Exercise {
  id: string;
  order: number;
  name: string;
  equipment: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight: string;
  restSeconds: number;
  tempo: string;
  rpe: number;
  completed: boolean;
}

interface SessionDetails {
  id: string;
  name: string;
  description: string;
  status: SessionStatus;
  member: SessionMember;
  date: string;
  timeRange: string;
  durationMinutes: number;
  sessionType: string;
  location: string;
  template: SessionTemplate;
  createdAt: string;
  updatedAt: string;
  exercises: Exercise[];
}

interface PageProps {
  params: { id: string };
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_META: Record<
  SessionStatus,
  { badgeClass: string; dotClass: string }
> = {
  Completed: {
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  Upcoming: {
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  "In Progress": {
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  Cancelled: {
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    dotClass: "bg-rose-500",
  },
  Missed: {
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};

const MUSCLE_GROUP_STYLES: Record<string, string> = {
  Back: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  "Rear Delts":
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  Biceps:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  Chest:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  Legs: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  Shoulders:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
};

const DEFAULT_MUSCLE_GROUP_STYLE =
  "bg-muted text-muted-foreground border-border";

const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
  Beginner: "text-emerald-600 dark:text-emerald-400",
  Intermediate: "text-amber-600 dark:text-amber-400",
  Advanced: "text-rose-600 dark:text-rose-400",
};

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_SESSION: SessionDetails = {
  id: "sess_10234",
  name: "Pull Day – Strength Focus",
  description: "Strength training session for back and biceps development.",
  status: "Completed",
  member: {
    name: "Aman Verma",
    membershipPlan: "Premium Plan",
    initials: "AV",
  },
  date: "22 Jul 2026",
  timeRange: "07:00 AM - 08:00 AM",
  durationMinutes: 60,
  sessionType: "Strength Training",
  location: "Main Floor",
  template: {
    name: "Pull Day",
    workoutType: "Strength Training",
    difficulty: "Intermediate",
    description:
      "Target your back, biceps, and rear delts with pulling movements.",
    exerciseCount: 8,
  },
  createdAt: "20 Jul 2026, 10:45 AM",
  updatedAt: "22 Jul 2026, 08:15 AM",
  exercises: [
    {
      id: "ex_1",
      order: 1,
      name: "Deadlift",
      equipment: "Barbell",
      muscleGroup: "Back",
      sets: 4,
      reps: "6 - 8",
      weight: "100 kg",
      restSeconds: 120,
      tempo: "2-0-2",
      rpe: 8,
      completed: true,
    },
    {
      id: "ex_2",
      order: 2,
      name: "Pull Up",
      equipment: "Bodyweight",
      muscleGroup: "Back",
      sets: 4,
      reps: "8 - 10",
      weight: "Bodyweight",
      restSeconds: 90,
      tempo: "2-0-2",
      rpe: 8,
      completed: true,
    },
    {
      id: "ex_3",
      order: 3,
      name: "Bent Over Row",
      equipment: "Barbell",
      muscleGroup: "Back",
      sets: 4,
      reps: "8 - 10",
      weight: "70 kg",
      restSeconds: 90,
      tempo: "2-0-2",
      rpe: 8,
      completed: true,
    },
    {
      id: "ex_4",
      order: 4,
      name: "Lat Pulldown",
      equipment: "Cable",
      muscleGroup: "Back",
      sets: 3,
      reps: "10 - 12",
      weight: "60 kg",
      restSeconds: 75,
      tempo: "2-1-2",
      rpe: 7,
      completed: true,
    },
    {
      id: "ex_5",
      order: 5,
      name: "Seated Cable Row",
      equipment: "Cable",
      muscleGroup: "Back",
      sets: 3,
      reps: "10 - 12",
      weight: "55 kg",
      restSeconds: 75,
      tempo: "2-1-2",
      rpe: 7,
      completed: true,
    },
    {
      id: "ex_6",
      order: 6,
      name: "Face Pull",
      equipment: "Rope",
      muscleGroup: "Rear Delts",
      sets: 3,
      reps: "12 - 15",
      weight: "20 kg",
      restSeconds: 60,
      tempo: "2-1-2",
      rpe: 7,
      completed: true,
    },
    {
      id: "ex_7",
      order: 7,
      name: "Barbell Curl",
      equipment: "Barbell",
      muscleGroup: "Biceps",
      sets: 3,
      reps: "8 - 12",
      weight: "30 kg",
      restSeconds: 60,
      tempo: "2-0-2",
      rpe: 8,
      completed: true,
    },
    {
      id: "ex_8",
      order: 8,
      name: "Hammer Curl",
      equipment: "Dumbbell",
      muscleGroup: "Biceps",
      sets: 3,
      reps: "10 - 12",
      weight: "12.5 kg",
      restSeconds: 60,
      tempo: "2-0-2",
      rpe: 7,
      completed: true,
    },
  ],
};

// Mock estimated training volume, since not every exercise (e.g. bodyweight
// movements) has a numeric weight to derive this from directly.
const MOCK_ESTIMATED_VOLUME_KG = 12150;

// ============================================================================
// Helper Functions
// ============================================================================

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function getMuscleGroupStyle(muscleGroup: string): string {
  return MUSCLE_GROUP_STYLES[muscleGroup] ?? DEFAULT_MUSCLE_GROUP_STYLE;
}


function getTotalSets(exercises: Exercise[]): number {
  return exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
}

// ============================================================================
// Reusable Components
// ============================================================================

function StatusBadge({ status }: { status: SessionStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 font-medium",
        meta.badgeClass,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
      {status}
    </Badge>
  );
}

function MuscleGroupBadge({ muscleGroup }: { muscleGroup: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 font-medium",
        getMuscleGroupStyle(muscleGroup),
      )}
    >
      {muscleGroup}
    </Badge>
  );
}


interface MetaItemProps {
  icon: React.ElementType;
  label: string;
  srLabel?: string;
}

function MetaItem({ icon: Icon, label, srLabel }: MetaItemProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        {srLabel && <span className="sr-only">{srLabel}: </span>}
        {label}
      </span>
    </div>
  );
}

interface OverviewItemProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}

function OverviewItem({ icon: Icon, label, children }: OverviewItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-semibold text-foreground">{children}</div>
      </div>
    </div>
  );
}

interface SummaryRowProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}

function SummaryRow({ icon: Icon, label, children }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="text-right text-sm font-medium text-foreground">
        {children}
      </div>
    </div>
  );
}

interface ActionRowProps {
  icon: React.ElementType;
  label: string;
  destructive?: boolean;
  onClick?: () => void;
}

function ActionRow({
  icon: Icon,
  label,
  destructive,
  onClick,
}: ActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground",
      )}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ExerciseThumbnail() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Dumbbell className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

function ExerciseTableRow({ exercise }: { exercise: Exercise }) {
  return (
    <TableRow>
      <TableCell className="text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <GripVertical
            className="h-3.5 w-3.5 text-muted-foreground/60"
            aria-hidden="true"
          />
          {exercise.order}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <ExerciseThumbnail />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {exercise.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {exercise.equipment}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <MuscleGroupBadge muscleGroup={exercise.muscleGroup} />
      </TableCell>
      <TableCell className="text-sm font-medium text-foreground">
        {exercise.sets}
      </TableCell>
      <TableCell className="text-sm font-medium text-foreground">
        {exercise.reps}
      </TableCell>
      <TableCell className="text-sm font-medium text-foreground">
        {exercise.weight}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {exercise.restSeconds} sec
      </TableCell>
      <TableCell>
        {exercise.completed ? (
          <CheckCircle2
            className="h-5 w-5 text-emerald-500"
            aria-hidden="true"
          />
        ) : (
          <Circle
            className="h-5 w-5 text-muted-foreground/40"
            aria-hidden="true"
          />
        )}
        <span className="sr-only">
          {exercise.completed ? "Completed" : "Not completed"}
        </span>
      </TableCell>
    </TableRow>
  );
}

function ExerciseMobileCard({ exercise }: { exercise: Exercise }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ExerciseThumbnail />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {exercise.order}. {exercise.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {exercise.equipment}
            </p>
          </div>
        </div>
        {exercise.completed ? (
          <CheckCircle2
            className="h-5 w-5 shrink-0 text-emerald-500"
            aria-hidden="true"
          />
        ) : (
          <Circle
            className="h-5 w-5 shrink-0 text-muted-foreground/40"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="mt-3">
        <MuscleGroupBadge muscleGroup={exercise.muscleGroup} />
      </div>

      <Separator className="my-3" />

      <dl className="grid grid-cols-3 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Sets</dt>
          <dd className="font-medium text-foreground">{exercise.sets}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Reps</dt>
          <dd className="font-medium text-foreground">{exercise.reps}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Weight</dt>
          <dd className="font-medium text-foreground">{exercise.weight}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Rest</dt>
          <dd className="font-medium text-foreground">
            {exercise.restSeconds} sec
          </dd>
        </div>
      </dl>
    </div>
  );
}

function EmptyExercisesState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <ClipboardList
          className="h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          No Exercises Assigned
        </p>
        <p className="text-sm text-muted-foreground">
          This session does not contain any exercises yet.
        </p>
      </div>
      <Button size="sm" className="mt-1 gap-1.5">
        <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
        Add Exercise
      </Button>
    </div>
  );
}

export default function SessionDetailsPage({ params }: PageProps) {
  const session = MOCK_SESSION;

  const totalExercises = session.exercises.length;
  const totalSets = getTotalSets(session.exercises);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <div className="space-y-6">
          {/* Session Header */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar
                    className="h-6 w-6 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                      {session.name}
                    </h1>
                    <StatusBadge status={session.status} />
                  </div>
                  <p className="max-w-xl text-sm text-muted-foreground">
                    {session.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                    <MetaItem
                      icon={User}
                      label={session.member.name}
                      srLabel="Member"
                    />
                    <MetaItem
                      icon={Calendar}
                      label={session.date}
                      srLabel="Date"
                    />
                    <MetaItem
                      icon={Clock3}
                      label={session.timeRange}
                      srLabel="Time"
                    />
                    <MetaItem
                      icon={Timer}
                      label={`${session.durationMinutes} min`}
                      srLabel="Duration"
                    />
                    <MetaItem
                      icon={Tag}
                      label={session.sessionType}
                      srLabel="Session type"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-border bg-muted/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Template</p>
                  <p className="text-sm font-semibold text-foreground">
                    {session.template.name}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-1 rounded-full border-border bg-background px-2 py-0 text-[11px] font-medium text-muted-foreground"
                  >
                    From Template
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit Session
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <MoreHorizontal
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    More Actions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Layout: Main Content (2fr) | Sidebar (1fr) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Main Content */}
            <div className="min-w-0 space-y-6">
              {/* Session Overview */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    Session Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                    <OverviewItem icon={User} label="Member">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={session.member.avatarUrl}
                            alt=""
                          />
                          <AvatarFallback className="text-[10px]">
                            {session.member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {session.member.name}
                          </p>
                          <p className="text-xs font-normal text-primary">
                            {session.member.membershipPlan}
                          </p>
                        </div>
                      </div>
                    </OverviewItem>
                    <OverviewItem icon={ClipboardList} label="Template">
                      <p>{session.template.name}</p>
                      <p className="text-xs font-normal text-muted-foreground">
                        {session.template.exerciseCount} Exercises
                      </p>
                    </OverviewItem>
                    <OverviewItem icon={Layers} label="Session Type">
                      {session.sessionType}
                    </OverviewItem>
                    <OverviewItem icon={MapPin} label="Location">
                      {session.location}
                    </OverviewItem>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                    <OverviewItem icon={Calendar} label="Date">
                      {session.date}
                    </OverviewItem>
                    <OverviewItem icon={Clock3} label="Time">
                      {session.timeRange}
                    </OverviewItem>
                    <OverviewItem icon={Timer} label="Duration">
                      {session.durationMinutes} min
                    </OverviewItem>
                    <OverviewItem icon={CheckCircle2} label="Status">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {session.status}
                      </span>
                    </OverviewItem>
                  </div>
                </CardContent>
              </Card>

              {/* Exercises */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                  <CardTitle className="text-base">
                    Exercises in This Session ({totalExercises})
                  </CardTitle>
                  {totalExercises > 0 && (
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Customize Exercises
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {totalExercises === 0 ? (
                    <EmptyExercisesState />
                  ) : (
                    <>
                      {/* Desktop / tablet table */}
                      <ScrollArea className="hidden w-full md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10">#</TableHead>
                              <TableHead>Exercise</TableHead>
                              <TableHead>Muscle Group</TableHead>
                              <TableHead>Sets</TableHead>
                              <TableHead>Reps</TableHead>
                              <TableHead>Weight</TableHead>
                              <TableHead>Rest</TableHead>
                              <TableHead>Completed</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {session.exercises.map((exercise) => (
                              <ExerciseTableRow
                                key={exercise.id}
                                exercise={exercise}
                              />
                            ))}
                          </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>

                      {/* Mobile cards */}
                      <div className="space-y-3 md:hidden">
                        {session.exercises.map((exercise) => (
                          <ExerciseMobileCard
                            key={exercise.id}
                            exercise={exercise}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Bottom Summary */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  icon={ListChecks}
                  label="Total Exercises"
                  value={String(totalExercises)}
                />
                <StatCard
                  icon={Layers}
                  label="Total Sets"
                  value={`${totalSets} sets`}
                />
                <StatCard
                  icon={BarChart3}
                  label="Est. Volume"
                  value={`${formatNumber(MOCK_ESTIMATED_VOLUME_KG)} kg`}
                />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Session Summary */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Session Summary</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                  <SummaryRow icon={ClipboardList} label="Template">
                    <span className="inline-flex items-center gap-1.5">
                      {session.template.name}
                      <Badge
                        variant="outline"
                        className="rounded-full border-border bg-muted px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
                      >
                        From Template
                      </Badge>
                    </span>
                  </SummaryRow>
                  <SummaryRow icon={User} label="Member">
                    {session.member.name}
                  </SummaryRow>
                  <SummaryRow icon={Calendar} label="Date">
                    {session.date}
                  </SummaryRow>
                  <SummaryRow icon={Clock3} label="Time">
                    {session.timeRange}
                  </SummaryRow>
                  <SummaryRow icon={Timer} label="Duration">
                    {session.durationMinutes} min
                  </SummaryRow>
                  <SummaryRow icon={Tag} label="Session Type">
                    {session.sessionType}
                  </SummaryRow>
                  <SummaryRow icon={MapPin} label="Location">
                    {session.location}
                  </SummaryRow>
                  <SummaryRow icon={Gauge} label="Status">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {session.status}
                    </span>
                  </SummaryRow>
                  <SummaryRow icon={Info} label="Created">
                    {session.createdAt}
                  </SummaryRow>
                  <SummaryRow icon={Info} label="Last Updated">
                    {session.updatedAt}
                  </SummaryRow>
                </CardContent>
              </Card>

              {/* Template Info */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Template Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Dumbbell
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {session.template.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.template.workoutType}
                        <span className="mx-1.5">•</span>
                        <span
                          className={
                            DIFFICULTY_STYLES[session.template.difficulty]
                          }
                        >
                          {session.template.difficulty}
                        </span>
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {session.template.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                  >
                    <ExternalLink
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    View Template
                  </Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <ActionRow icon={Pencil} label="Edit Session" />
                  <ActionRow icon={Copy} label="Duplicate Session" />
                  <ActionRow icon={ClipboardPlus} label="Assign Homework" />
                  <Separator className="my-1" />
                  <ActionRow
                    icon={Trash2}
                    label="Delete Session"
                    destructive
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
