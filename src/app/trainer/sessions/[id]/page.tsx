"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
  ClipboardList,
  Tag,
  Layers,
  Gauge,
  Copy,
  ClipboardPlus,
  Trash2,
  ExternalLink,
  ListChecks,
  BarChart3,
  Info,
  AlertCircle,
  Loader2,
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  cn,
  diffMinutesFromTimes,
  formatDateTime,
  formatShortDate,
  formatTime12h,
  getInitials,
} from "@/lib/utils";
import { bigSquareButton } from "@/lib/styles";
import { useSessionWithExercises } from "@/hooks/queries/trainer.query";
import { toggleSessionExerciseCompletion } from "@/actions/trainer.action";
import { useQueryClient } from "@tanstack/react-query";

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
  id: string | null;
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

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

function getCompletedCount(exercises: Exercise[]): number {
  return exercises.filter((exercise) => exercise.completed).length;
}

// Best-effort volume estimate (sets × average of the reps range × weight),
// skipping exercises whose weight isn't a plain number (bodyweight, cables
// labeled "Bodyweight", etc). This is directional, not a precise total.
function estimateVolumeKg(exercises: Exercise[]): number | null {
  let total = 0;
  let countedAny = false;

  for (const exercise of exercises) {
    const weightMatch = exercise.weight.match(/([\d.]+)\s*kg/i);
    if (!weightMatch) continue;

    const weight = parseFloat(weightMatch[1]);
    const repsNumbers = exercise.reps.match(/\d+/g)?.map(Number) ?? [];
    if (repsNumbers.length === 0) continue;

    const avgReps = repsNumbers.reduce((a, b) => a + b, 0) / repsNumbers.length;

    total += weight * avgReps * exercise.sets;
    countedAny = true;
  }

  return countedAny ? Math.round(total) : null;
}

const SESSION_STATUS_MAP: Record<string, string> = {
  Upcoming: "Upcoming",
  InProgress: "In Progress",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

export function mapSessionDetails(row: any) {
  const exercises = (row.session_exercises ?? [])
    .slice()
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((se: any, index: number) => ({
      id: se.id,
      order: index + 1,
      name: se.exercises?.name ?? "Unknown exercise",
      equipment: se.exercises?.equipment ?? "—",
      muscleGroup: se.exercises?.muscle_group ?? "—",
      sets: se.sets,
      reps: se.reps,
      weight: se.weight || "—",
      restSeconds: se.rest_seconds ?? 60,
      completed: se.completed ?? false,
    }));

  const activeMembership = (row.members?.gym_memberships ?? []).find(
    (gm: any) => gm.status === "Active",
  );

  const durationMinutes =
    row.duration_minutes ??
    diffMinutesFromTimes(row.start_time, row.end_time) ??
    0;

  return {
    id: row.id,
    name: row.session_name,
    description: row.notes ?? "",
    status: SESSION_STATUS_MAP[row.status] ?? row.status,
    member: {
      name: row.members?.full_name ?? "Unknown member",
      membershipPlan: activeMembership?.membership_plans?.plan_name ?? "—",
      avatarUrl: row.members?.photo_url ?? undefined,
      initials: getInitials(row.members?.full_name ?? "?"),
    },
    date: formatShortDate(row.session_date),
    timeRange: `${formatTime12h(row.start_time)} - ${formatTime12h(row.end_time)}`,
    durationMinutes,
    sessionType: row.session_type,
    location: row.location || "—",
    template: {
      id: row.workout_templates?.id ?? null,
      name: row.workout_templates?.name ?? "Custom (no template)",
      workoutType: row.workout_type,
      // difficulty_level can be null on a template row — default kept
      // deliberately visible rather than silently guessing "Intermediate".
      difficulty: row.workout_templates?.difficulty_level ?? "Beginner",
      description: row.workout_templates?.description ?? "",
      exerciseCount: exercises.length,
    },
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
    exercises,
  };
}

// ============================================================================
// Reusable Components
// ============================================================================

function StatusBadge({ status }: { status: SessionStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.Missed;
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

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  destructive?: boolean;
  onClick?: () => void;
}

function ActionButton({
  icon: Icon,
  label,
  destructive,
  onClick,
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant={destructive ? "ghost" : "outline"}
      onClick={onClick}
      className={cn(
        bigSquareButton,
        "w-full justify-start gap-2.5",
        destructive &&
          "text-destructive hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </Button>
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
          <p className="truncate text-lg font-semibold text-foreground tabular-nums">
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

// Order + completion are merged into one leading indicator so the table
// reads like a checklist at a glance, instead of splitting that signal
// across a "#" column and a separate "Completed" column at the far end.
// Now interactive: clicking toggles completion (disabled while its own
// toggle request is in flight).
function ExerciseStatusMarker({
  exercise,
  isPending,
  onToggle,
}: {
  exercise: Exercise;
  isPending: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isPending}
      className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
      aria-pressed={exercise.completed}
    >
      {isPending ? (
        <Loader2
          className="h-4 w-4 shrink-0 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      ) : exercise.completed ? (
        <CheckCircle2
          className="h-4 w-4 shrink-0 text-emerald-500"
          aria-hidden="true"
        />
      ) : (
        <Circle
          className="h-4 w-4 shrink-0 text-muted-foreground/40 hover:text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <span className="text-sm text-muted-foreground tabular-nums">
        {exercise.order}
      </span>
      <span className="sr-only">
        {exercise.completed ? "Mark as not completed" : "Mark as completed"}
      </span>
    </button>
  );
}

function ExerciseTableRow({
  exercise,
  isPending,
  onToggle,
}: {
  exercise: Exercise;
  isPending: boolean;
  onToggle: () => void;
}) {
  return (
    <TableRow className={cn(!exercise.completed && "bg-muted/30")}>
      <TableCell>
        <ExerciseStatusMarker
          exercise={exercise}
          isPending={isPending}
          onToggle={onToggle}
        />
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
      <TableCell className="text-sm font-medium text-foreground tabular-nums">
        {exercise.sets}
      </TableCell>
      <TableCell className="text-sm font-medium text-foreground tabular-nums">
        {exercise.reps}
      </TableCell>
      <TableCell className="text-sm font-medium text-foreground tabular-nums">
        {exercise.weight}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground tabular-nums">
        {exercise.restSeconds} sec
      </TableCell>
    </TableRow>
  );
}

function ExerciseMobileCard({
  exercise,
  isPending,
  onToggle,
}: {
  exercise: Exercise;
  isPending: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        !exercise.completed && "bg-muted/30",
      )}
    >
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
        <button
          type="button"
          onClick={onToggle}
          disabled={isPending}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
          aria-pressed={exercise.completed}
        >
          {isPending ? (
            <Loader2
              className="h-5 w-5 shrink-0 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          ) : exercise.completed ? (
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
          <span className="sr-only">
            {exercise.completed ? "Mark as not completed" : "Mark as completed"}
          </span>
        </button>
      </div>

      <div className="mt-3">
        <MuscleGroupBadge muscleGroup={exercise.muscleGroup} />
      </div>

      <Separator className="my-3" />

      <dl className="grid grid-cols-3 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Sets</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {exercise.sets}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Reps</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {exercise.reps}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Weight</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {exercise.weight}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Rest</dt>
          <dd className="font-medium text-foreground tabular-nums">
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
      <Button className={cn(bigSquareButton, "mt-1 gap-1.5")}>
        <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
        Add Exercise
      </Button>
    </div>
  );
}

function SessionDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="space-y-5 p-6">
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-80" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function SessionDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const sessionId = React.use(params).id;
  const queryClient = useQueryClient();
  console.log("sessionId", sessionId);

  const {
    data: sessionResult,
    isLoading,
    error: queryError,
  } = useSessionWithExercises(sessionId);

  const mappedSession: SessionDetails | null = React.useMemo(() => {
    if (!sessionResult?.success) return null;
    return mapSessionDetails(sessionResult.data) as SessionDetails;
  }, [sessionResult]);

  // Exercise completion needs to be locally mutable for instant toggle
  // feedback — everything else on the page stays derived straight from
  // the query result.
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (mappedSession) {
      setExercises(mappedSession.exercises);
    }
  }, [mappedSession]);

  const session = mappedSession ? { ...mappedSession, exercises } : null;

  const totalExercises = exercises.length;
  const totalSets = getTotalSets(exercises);
  const completedCount = getCompletedCount(exercises);
  const completionPercent =
    totalExercises > 0
      ? Math.round((completedCount / totalExercises) * 100)
      : 0;
  const estimatedVolume = estimateVolumeKg(exercises);

  const handleToggleExercise = async (exercise: Exercise) => {
    if (pendingIds.has(exercise.id)) return;

    const nextCompleted = !exercise.completed;

    // Optimistic update.
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exercise.id ? { ...ex, completed: nextCompleted } : ex,
      ),
    );
    setPendingIds((prev) => new Set(prev).add(exercise.id));

    const result = await toggleSessionExerciseCompletion(
      exercise.id,
      nextCompleted,
    );

    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(exercise.id);
      return next;
    });

    queryClient.invalidateQueries({
      queryKey: ["sessionWithExercises", sessionId],
    });

    if (!result.success) {
      // Roll back on failure.
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exercise.id ? { ...ex, completed: !nextCompleted } : ex,
        ),
      );
      toast.error(result.error);
    }
  };

  const handleEdit = () => {
    router.push(`/trainer/training-sessions/${sessionId}/edit`);
  };

  // These don't have corresponding server actions yet — wired to a
  // placeholder toast rather than silently doing nothing, so it's obvious
  // in testing that they still need real implementations.
  const handleNotImplemented = (feature: string) => {
    toast.info(`${feature} isn't wired up yet.`);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        {isLoading ? (
          <SessionDetailsSkeleton />
        ) : queryError || !session ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Sessions
            </button>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Couldn&apos;t load this session. It may have been deleted, or
                you may not have access to it.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back navigation */}
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Sessions
            </button>

            {/* Session Header */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
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
                      {session.description && (
                        <p className="max-w-xl text-sm text-muted-foreground">
                          {session.description}
                        </p>
                      )}
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
                        {session.template.id ? "From Template" : "Custom"}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        className={cn(bigSquareButton, "gap-1.5")}
                        onClick={handleEdit}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit Session
                      </Button>
                      <Button
                        variant="outline"
                        className={cn(bigSquareButton, "gap-1.5")}
                        onClick={() => handleNotImplemented("More actions")}
                      >
                        <MoreHorizontal
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        More Actions
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Workout progress */}
                <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">
                      Workout Progress
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {completedCount} of {totalExercises} exercises completed
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
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
                    <div className="flex items-center gap-2.5">
                      <CardTitle className="text-base">
                        Exercises in This Session
                      </CardTitle>
                      {totalExercises > 0 && (
                        <Badge
                          variant="outline"
                          className="rounded-full border-border bg-muted px-2 py-0 text-[11px] font-medium text-muted-foreground"
                        >
                          {completedCount}/{totalExercises} completed
                        </Badge>
                      )}
                    </div>
                    {totalExercises > 0 && (
                      <Button
                        variant="outline"
                        className={cn(bigSquareButton, "gap-1.5")}
                        onClick={() =>
                          handleNotImplemented("Customize Exercises")
                        }
                      >
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
                                <TableHead className="w-16">Status</TableHead>
                                <TableHead>Exercise</TableHead>
                                <TableHead>Muscle Group</TableHead>
                                <TableHead>Sets</TableHead>
                                <TableHead>Reps</TableHead>
                                <TableHead>Weight</TableHead>
                                <TableHead>Rest</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {exercises.map((exercise) => (
                                <ExerciseTableRow
                                  key={exercise.id}
                                  exercise={exercise}
                                  isPending={pendingIds.has(exercise.id)}
                                  onToggle={() =>
                                    handleToggleExercise(exercise)
                                  }
                                />
                              ))}
                            </TableBody>
                          </Table>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {/* Mobile cards */}
                        <div className="space-y-3 md:hidden">
                          {exercises.map((exercise) => (
                            <ExerciseMobileCard
                              key={exercise.id}
                              exercise={exercise}
                              isPending={pendingIds.has(exercise.id)}
                              onToggle={() => handleToggleExercise(exercise)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Bottom Summary */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                    icon={CheckCircle2}
                    label="Completed"
                    value={`${completedCount}/${totalExercises}`}
                  />
                  <StatCard
                    icon={BarChart3}
                    label="Est. Volume"
                    value={
                      estimatedVolume !== null
                        ? `${formatNumber(estimatedVolume)} kg`
                        : "—"
                    }
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
                          {session.template.id ? "From Template" : "Custom"}
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
                        {session.template.description && (
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {session.template.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      disabled={!session.template.id}
                      className={cn(bigSquareButton, "w-full gap-1.5")}
                      onClick={() =>
                        session.template.id &&
                        router.push(`/trainer/templates/${session.template.id}`)
                      }
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
                  <CardContent className="space-y-2">
                    <ActionButton
                      icon={Pencil}
                      label="Edit Session"
                      onClick={handleEdit}
                    />
                    <ActionButton
                      icon={Copy}
                      label="Duplicate Session"
                      onClick={() => handleNotImplemented("Duplicate Session")}
                    />
                    <ActionButton
                      icon={ClipboardPlus}
                      label="Assign Homework"
                      onClick={() => handleNotImplemented("Assign Homework")}
                    />
                    <Separator className="my-1" />
                    <ActionButton
                      icon={Trash2}
                      label="Delete Session"
                      destructive
                      onClick={() => handleNotImplemented("Delete Session")}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
