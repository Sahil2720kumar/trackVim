"use client";

import { useState } from "react";
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
} from "lucide-react";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Exercise {
  id: string;
  name: string;
  equipment: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  icon: string;
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
  createdDate: string;
  lastUpdated: string;
  createdBy: string;
  notes: string;
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
// Mock Data
// ============================================================================

const MOCK_TEMPLATE: TemplateData = {
  id: "template-1",
  name: "Pull Day",
  status: "active",
  description:
    "Target your back, biceps, and rear delts with pulling movements.",
  type: "Strength Training",
  primaryGoal: "Muscle Gain",
  difficulty: "intermediate",
  targetMuscles: ["Back", "Biceps", "Rear Delts"],
  equipment: ["Barbell", "Cable", "Bodyweight"],
  duration: 60,
  createdDate: "10 Jul 2026",
  lastUpdated: "20 Jul 2026 (2 days ago)",
  createdBy: "Rahul Sharma",
  notes:
    "Use this workout for intermediate members focusing on hypertrophy.\n\nMaintain strict rest periods.\n\nPrioritize compound movements first.",
  exercises: [
    {
      id: "1",
      name: "Deadlift",
      equipment: "Barbell",
      muscleGroup: "Back",
      sets: 4,
      reps: "6 - 8",
      weight: "100 kg",
      rest: "120 sec",
      icon: "⬆️",
    },
    {
      id: "2",
      name: "Pull Up",
      equipment: "Bodyweight",
      muscleGroup: "Back",
      sets: 4,
      reps: "8 - 10",
      weight: "Bodyweight",
      rest: "90 sec",
      icon: "🤸",
    },
    {
      id: "3",
      name: "Bent Over Row",
      equipment: "Barbell",
      muscleGroup: "Back",
      sets: 4,
      reps: "8 - 10",
      weight: "70 kg",
      rest: "90 sec",
      icon: "📊",
    },
    {
      id: "4",
      name: "Lat Pulldown",
      equipment: "Cable",
      muscleGroup: "Back",
      sets: 3,
      reps: "10 - 12",
      weight: "60 kg",
      rest: "75 sec",
      icon: "⬇️",
    },
    {
      id: "5",
      name: "Seated Cable Row",
      equipment: "Cable",
      muscleGroup: "Back",
      sets: 3,
      reps: "10 - 12",
      weight: "55 kg",
      rest: "75 sec",
      icon: "➡️",
    },
    {
      id: "6",
      name: "Face Pull",
      equipment: "Rope",
      muscleGroup: "Rear Delts",
      sets: 3,
      reps: "12 - 15",
      weight: "20 kg",
      rest: "60 sec",
      icon: "👤",
    },
    {
      id: "7",
      name: "Barbell Curl",
      equipment: "Barbell",
      muscleGroup: "Biceps",
      sets: 3,
      reps: "8 - 12",
      weight: "30 kg",
      rest: "60 sec",
      icon: "💪",
    },
    {
      id: "8",
      name: "Hammer Curl",
      equipment: "Dumbbell",
      muscleGroup: "Biceps",
      sets: 3,
      reps: "10 - 12",
      weight: "12.5 kg",
      rest: "60 sec",
      icon: "🔨",
    },
  ],
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

// ============================================================================
// Reusable Components
// ============================================================================

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="size-4" />}
          <a
            href={item.href || "#"}
            className={`${item.href ? "hover:text-foreground cursor-pointer" : ""}`}
          >
            {item.label}
          </a>
        </div>
      ))}
    </div>
  );
}

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
          <div className="flex flex-wrap gap-2">
            {value.map((v, i) => (
              <Badge key={i} variant="secondary" className="capitalize">
                {v}
              </Badge>
            ))}
          </div>
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
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function ExerciseCard({
  exercise,
  index,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg flex-shrink-0">
              {exercise.icon}
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
            onClick={() => onDelete(exercise.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingSkeletonsProps {
  showExercises?: boolean;
}

function LoadingSkeletons({ showExercises = true }: LoadingSkeletonsProps) {
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
      {showExercises && (
        <div className="rounded-lg border border-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      )}
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

export default function TemplateDetailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const template = MOCK_TEMPLATE;
  const totalSets = calculateTotalSets(template.exercises);
  const difficultyColor = DIFFICULTY_COLORS[template.difficulty];

  const handleAddExercise = () => {
    console.log("Add exercise clicked");
  };

  const handleEditExercise = (id: string) => {
    console.log("Edit exercise:", id);
  };

  const handleDeleteExercise = (id: string) => {
    console.log("Delete exercise:", id);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <LoadingSkeletons />
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
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-2xl flex-shrink-0">
                      🤸
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
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
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
                      value={template.lastUpdated.split(" ")[0]}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-col gap-2">
                    <Button className="w-full">
                      <Pencil className="size-4 mr-2" />
                      Edit Template
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Copy className="size-4 mr-2" />
                        Duplicate
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="px-2">
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
              <Separator className="my-6" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {template.description}
                </p>
              </div>
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
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-sm">
                                  {exercise.icon}
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
                                        onClick={() =>
                                          handleEditExercise(exercise.id)
                                        }
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
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() =>
                                          handleDeleteExercise(exercise.id)
                                        }
                                      >
                                        <Trash2 className="size-4" />
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
                }
              />
              <SummaryRow
                label="Equipment"
                value={
                  <div className="flex flex-wrap justify-end gap-1">
                    {template.equipment.map((eq) => (
                      <Badge key={eq} variant="outline" className="text-xs">
                        {eq}
                      </Badge>
                    ))}
                  </div>
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
              <SummaryRow label="Created" value={template.createdDate} />
              <SummaryRow label="Last Updated" value={template.lastUpdated} />
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
                onClick={() => console.log("Edit")}
              >
                <Pencil className="size-4 mr-2" />
                Edit Template
                <ArrowRight className="size-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => console.log("Duplicate")}
              >
                <Copy className="size-4 mr-2" />
                Duplicate Template
                <ArrowRight className="size-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => console.log("Export")}
              >
                <Download className="size-4 mr-2" />
                Export Template
                <ArrowRight className="size-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => console.log("Assign")}
              >
                <Layers className="size-4 mr-2" />
                Assign to Session
                <ArrowRight className="size-4 ml-auto" />
              </Button>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => console.log("Delete")}
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
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Pencil className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {template.notes}
              </p>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <p>Added by {template.createdBy}</p>
                <p>{template.lastUpdated}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
