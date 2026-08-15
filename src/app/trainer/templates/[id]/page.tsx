"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dumbbell,
  Target,
  Clock,
  Layers,
  Activity,
  Pencil,
  Trash2,
  Copy,
  Download,
  ArrowRight,
  NotebookPen,
  BarChart3,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useWorkoutTemplateById } from "@/hooks/queries/trainer.query";

import { removeExerciseFromTemplate } from "@/actions/trainer.action";
import {
  formatDateTime,
  formatRelativeDays,
  formatShortDate,
} from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  equipment: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
}

interface TemplateData {
  id: string;
  name: string;
  status: "active" | "draft" | "archived";
  description: string;
  type: string;
  primaryGoal: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  targetMuscles: string[];
  equipment: string[];
  duration: number;
  exercises: Exercise[];
  createdDateShort: string;
  lastUpdatedShort: string;
  lastUpdatedFull: string;
  createdBy: string;
  notes: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// ============================================================================
// Constants
// ============================================================================

const DIFFICULTY_COLORS: Record<
  string,
  { bg: string; text: string; badge: string }
> = {
  beginner: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  },
  intermediate: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  advanced: {
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
    badge:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
};

const STATUS_COLORS: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  archived: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// ============================================================================
// Helper Functions
// ============================================================================

const getMuscleGroupColor = (muscle: string): string => {
  const colors: Record<string, string> = {
    Back: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Biceps:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "Rear Delts":
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    Chest: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Shoulders:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    Triceps: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    Legs: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Abs: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  };
  return (
    colors[muscle] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  );
};

const calculateTotalSets = (exercises: Exercise[]): number => {
  return exercises.reduce((total, ex) => total + ex.sets, 0);
};

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

export function mapTemplateDetails(row: any) {
  const exercises = (row.template_exercises ?? []).map((te: any) => ({
    id: te.id,
    exerciseId: te.exercise_id,
    name: te.exercise?.name ?? "Unknown exercise",
    equipment: te.exercise?.equipment ?? "—",
    muscleGroup: te.exercise?.muscle_group ?? "—",
    sets: te.sets,
    reps: te.reps,
    weight: te.weight || "—",
    rest: te.rest_seconds ? `${te.rest_seconds} sec` : "60 sec",
  }));

  // The schema has no template-level "equipment" field — equipment is
  // per-exercise, so this list is derived from what's actually assigned.
  const equipment = Array.from(
    new Set(exercises.map((ex) => ex.equipment).filter((e) => e && e !== "—")),
  );

  return {
    id: row.id,
    name: row.name,
    status: (row.status ?? "Draft").toLowerCase() as
      | "active"
      | "draft"
      | "archived",
    description: row.description ?? "",
    type: row.workout_type ?? row.category ?? "General",
    primaryGoal: row.primary_goal ?? "—",
    difficulty: (row.difficulty_level ?? "Intermediate").toLowerCase() as
      | "beginner"
      | "intermediate"
      | "advanced",
    targetMuscles: row.target_muscles ?? [],
    equipment,
    duration: row.duration_minutes ?? 0,
    exercises,
    createdDateShort: formatShortDate(row.created_at),
    lastUpdatedShort: formatShortDate(row.updated_at),
    lastUpdatedFull: `${formatDateTime(row.updated_at)} (${formatRelativeDays(row.updated_at)})`,
    createdBy: row.trainers?.full_name ?? "Unknown trainer",
    notes: row.additional_notes ?? "",
  };
}
// ============================================================================
// Reusable Components
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-foreground">{value}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}

interface OverviewItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | string[];
}

function OverviewItem({ icon, label, value }: OverviewItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 text-primary mt-1">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </p>
        {Array.isArray(value) ? (
          value.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {value.map((v, i) => (
                <Badge key={i} variant="secondary" className="capitalize">
                  {v}
                </Badge>
              ))}
            </div>
          )
        ) : (
          <p className="text-sm font-semibold text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}

// Inline label/value row used in the Template Summary sidebar — label on the
// left, value on the right, one thin divider between rows instead of a
// stacked "label above value" layout with a full <Separator /> between each.
interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
  border?: boolean;
}

function SummaryRow({ label, value, border = true }: SummaryRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-2.5 ${
        border ? "border-b border-border" : ""
      }`}
    >
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">
        {value}
      </span>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  isDeleting: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function ExerciseCard({
  exercise,
  index,
  isDeleting,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Dumbbell className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{exercise.name}</p>
              <p className="text-xs text-muted-foreground">
                {exercise.equipment}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="flex-shrink-0">
            #{index}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Muscle Group</p>
              <Badge className={getMuscleGroupColor(exercise.muscleGroup)}>
                {exercise.muscleGroup}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sets × Reps</p>
              <p className="text-sm font-semibold text-foreground">
                {exercise.sets} × {exercise.reps}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Weight</p>
              <p className="text-sm font-semibold text-foreground">
                {exercise.weight}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rest</p>
              <p className="text-sm font-semibold text-foreground">
                {exercise.rest}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(exercise.id)}
          >
            <Pencil className="size-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => onDelete(exercise.id)}
            className="text-destructive hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeletons() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Skeleton className="h-12 w-48 mb-2" />
            <Skeleton className="h-4 w-96 mb-4" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-64">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </div>

      {/* Overview Skeleton */}
      <div className="rounded-lg border border-border bg-card p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>

      {/* Exercises Skeleton */}
      <div className="rounded-lg border border-border bg-card p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface EmptyExercisesProps {
  onAddExercise: () => void;
}

function EmptyExercises({ onAddExercise }: EmptyExercisesProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-lg bg-muted/50 p-3 mb-4">
        <Dumbbell className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No Exercises Added
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        This template doesn&apos;t contain any exercises yet. Start building
        your workout by adding exercises.
      </p>
      <Button onClick={onAddExercise}>
        <Dumbbell className="size-4 mr-2" />
        Add Exercise
      </Button>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function TemplateDetailPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const templateId = React.use(params).id;

  const {
    data: templateResult,
    isLoading,
    error: queryError,
  } = useWorkoutTemplateById(templateId);

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const template: TemplateData | null = templateResult?.success
    ? (mapTemplateDetails(templateResult.data) as TemplateData)
    : null;

  const totalSets = template ? calculateTotalSets(template.exercises) : 0;
  const difficultyColor = template
    ? DIFFICULTY_COLORS[template.difficulty]
    : DIFFICULTY_COLORS.intermediate;

  // Editing an individual exercise's sets/reps/weight isn't backed by a
  // dedicated action yet — only whole-template create/update and per-row
  // delete exist — so "Add" and "Edit" both route into the full template
  // editor rather than doing something silently incomplete inline.
  const handleAddExercise = () => {
    router.push(`/trainer/templates/${templateId}/edit`);
  };

  const handleEditExercise = () => {
    router.push(`/trainer/templates/${templateId}/edit`);
  };

  const handleDeleteExercise = async (templateExerciseId: string) => {
    if (deletingIds.has(templateExerciseId)) return;

    setDeletingIds((prev) => new Set(prev).add(templateExerciseId));
    const result = await removeExerciseFromTemplate(templateExerciseId);
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(templateExerciseId);
      return next;
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Exercise removed from template");
    queryClient.invalidateQueries({
      queryKey: ["workoutTemplateById", templateId],
    });
  };

  // No server actions exist yet for these — placeholder toast so it's
  // obvious in testing which buttons still need real implementations,
  // rather than silently doing nothing.
  const handleNotImplemented = (feature: string) => {
    toast.info(`${feature} isn't wired up yet.`);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <LoadingSkeletons />
      </div>
    );
  }

  if (queryError || !template) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Couldn&apos;t load this template. It may have been deleted, or you
            may not have access to it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Left: Template Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <Dumbbell className="size-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold text-foreground">
                          {template.name}
                        </h1>
                        <Badge className={STATUS_COLORS[template.status]}>
                          {capitalize(template.status)}
                        </Badge>
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {template.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {template.primaryGoal}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-4 text-muted-foreground" />
                      <Badge className={difficultyColor.badge}>
                        {capitalize(template.difficulty)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {template.duration} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Statistics */}
                <div className="flex-shrink-0 w-full sm:w-64">
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      label="Exercises"
                      value={template.exercises.length}
                    />
                    <StatCard label="Total Sets" value={totalSets} />
                    <StatCard
                      label="Est. Duration"
                      value={`${template.duration} min`}
                    />
                    <StatCard
                      label="Last Updated"
                      value={template.lastUpdatedShort}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      className="w-full"
                      onClick={() =>
                        router.push(`/trainer/templates/${templateId}/edit`)
                      }
                    >
                      <Pencil className="size-4 mr-2" />
                      Edit Template
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          handleNotImplemented("Duplicate Template")
                        }
                      >
                        <Copy className="size-4 mr-2" />
                        Duplicate
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-2"
                              onClick={() =>
                                handleNotImplemented("More actions")
                              }
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>More actions</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OverviewItem
                  icon={<Target className="size-5" />}
                  label="Primary Goal"
                  value={template.primaryGoal}
                />
                <OverviewItem
                  icon={<Activity className="size-5" />}
                  label="Target Muscle Groups"
                  value={template.targetMuscles}
                />
                <OverviewItem
                  icon={<Dumbbell className="size-5" />}
                  label="Equipment"
                  value={template.equipment}
                />
                <OverviewItem
                  icon={<BarChart3 className="size-5" />}
                  label="Difficulty"
                  value={capitalize(template.difficulty)}
                />
              </div>
              {template.description && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Exercises Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">
                Exercises ({template.exercises.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddExercise}>
                <Dumbbell className="size-4 mr-2" />
                Add Exercise
              </Button>
            </CardHeader>
            <CardContent>
              {template.exercises.length === 0 ? (
                <EmptyExercises onAddExercise={handleAddExercise} />
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="border-b border-border hover:bg-muted/50">
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Exercise</TableHead>
                          <TableHead>Muscle Group</TableHead>
                          <TableHead>Sets</TableHead>
                          <TableHead>Reps</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Rest</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {template.exercises.map((exercise, index) => (
                          <TableRow
                            key={exercise.id}
                            className="border-b border-border hover:bg-muted/30"
                          >
                            <TableCell className="font-medium text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                                  <Dumbbell className="size-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground text-sm">
                                    {exercise.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {exercise.equipment}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getMuscleGroupColor(
                                  exercise.muscleGroup,
                                )}
                              >
                                {exercise.muscleGroup}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              {exercise.sets}
                            </TableCell>
                            <TableCell className="text-sm">
                              {exercise.reps}
                            </TableCell>
                            <TableCell className="text-sm">
                              {exercise.weight}
                            </TableCell>
                            <TableCell className="text-sm">
                              {exercise.rest}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={handleEditExercise}
                                      >
                                        <Pencil className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={deletingIds.has(exercise.id)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() =>
                                          handleDeleteExercise(exercise.id)
                                        }
                                      >
                                        {deletingIds.has(exercise.id) ? (
                                          <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="size-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow className="bg-muted/50 font-semibold hover:bg-muted/50">
                          <TableCell colSpan={3}>Total</TableCell>
                          <TableCell>{totalSets}</TableCell>
                          <TableCell colSpan={2}></TableCell>
                          <TableCell className="text-right">
                            Est. Duration: {template.duration} min
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden grid grid-cols-1 gap-4">
                    {template.exercises.map((exercise, index) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        index={index + 1}
                        isDeleting={deletingIds.has(exercise.id)}
                        onEdit={handleEditExercise}
                        onDelete={handleDeleteExercise}
                      />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="size-5" />
                Template Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <SummaryRow label="Template Name" value={template.name} />
              <SummaryRow label="Workout Type" value={template.type} />
              <SummaryRow label="Primary Goal" value={template.primaryGoal} />
              <SummaryRow
                label="Difficulty"
                value={
                  <Badge className={difficultyColor.badge}>
                    {capitalize(template.difficulty)}
                  </Badge>
                }
              />
              <SummaryRow
                label="Target Muscles"
                value={
                  template.targetMuscles.length === 0 ? (
                    "—"
                  ) : (
                    <div className="flex flex-wrap justify-end gap-1">
                      {template.targetMuscles.map((muscle) => (
                        <Badge
                          key={muscle}
                          className={getMuscleGroupColor(muscle)}
                          variant="secondary"
                        >
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  )
                }
              />
              <SummaryRow
                label="Equipment"
                value={
                  template.equipment.length === 0 ? (
                    "—"
                  ) : (
                    <div className="flex flex-wrap justify-end gap-1">
                      {template.equipment.map((eq) => (
                        <Badge key={eq} variant="outline" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  )
                }
              />
              <SummaryRow
                label="Estimated Duration"
                value={`${template.duration} min`}
              />
              <SummaryRow
                label="Total Exercises"
                value={template.exercises.length}
              />
              <SummaryRow label="Total Sets" value={totalSets} />
              <SummaryRow label="Created" value={template.createdDateShort} />
              <SummaryRow
                label="Last Updated"
                value={template.lastUpdatedFull}
              />
              <SummaryRow
                label="Status"
                value={
                  <Badge className={STATUS_COLORS[template.status]}>
                    {capitalize(template.status)}
                  </Badge>
                }
                border={false}
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  router.push(`/trainer/templates/${templateId}/edit`)
                }
              >
                <Pencil className="size-4 mr-2" />
                Edit Template
                <ArrowRight className="size-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNotImplemented("Duplicate Template")}
              >
                <Copy className="size-4 mr-2" />
                Duplicate Template
                <ArrowRight className="size-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNotImplemented("Export Template")}
              >
                <Download className="size-4 mr-2" />
                Export Template
                <ArrowRight className="size-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  router.push(
                    `/trainer/training-sessions/new?templateId=${templateId}`,
                  )
                }
              >
                <Layers className="size-4 mr-2" />
                Assign to Session
                <ArrowRight className="size-4 ml-auto" />
              </Button>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleNotImplemented("Delete Template")}
              >
                <Trash2 className="size-4 mr-2" />
                Delete Template
              </Button>
            </CardContent>
          </Card>

          {/* Trainer Notes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2">
                <NotebookPen className="size-5" />
                Trainer Notes
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() =>
                  router.push(`/trainer/templates/${templateId}/edit`)
                }
              >
                <Pencil className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.notes ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {template.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notes added yet.
                </p>
              )}
              <Separator />
              <div className="text-xs text-muted-foreground">
                <p>Added by {template.createdBy}</p>
                <p>{template.lastUpdatedFull}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
