"use client";

// ============================================================================
// Imports
// ============================================================================

import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Row,
  PaginationState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Dumbbell,
  FileStack,
  Layers3,
  Clock3,
  Search,
  Plus,
  Download,
  Eye,
  Pencil,
  Copy,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  Grid3x3,
  List,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  Lightbulb,
  TrendingUp,
  ArrowLeft,
  Target,
  Zap,
  Activity,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  rest: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  muscleGroups: string[];
  exercises: Exercise[];
  exerciseCount: number;
  totalSets: number;
  duration: number;
  updatedAt: string;
  usageCount: number;
}

// ============================================================================
// Constants
// ============================================================================

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Legs",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Core",
];

const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Kettlebell",
  "Machine",
  "Bodyweight",
  "Cable",
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Upper Body", label: "Upper Body" },
  { value: "Lower Body", label: "Lower Body" },
  { value: "Full Body", label: "Full Body" },
  { value: "Arms", label: "Arms" },
];

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const SORT_OPTIONS = [
  { value: "updated", label: "Recently Updated" },
  { value: "name", label: "Name" },
  { value: "exercises", label: "Exercise Count" },
  { value: "duration", label: "Duration" },
];

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "1",
    name: "Push Day",
    description: "Focus on chest, shoulders, and triceps pushing movements.",
    icon: "trending-up",
    category: "Upper Body",
    difficulty: "Intermediate",
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
    exerciseCount: 7,
    totalSets: 28,
    duration: 60,
    updatedAt: "2 days ago",
    usageCount: 24,
    exercises: [
      {
        id: "e1",
        name: "Bench Press",
        muscleGroup: "Chest",
        equipment: "Barbell",
        sets: 4,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e2",
        name: "Incline Dumbbell Press",
        muscleGroup: "Chest",
        equipment: "Dumbbell",
        sets: 3,
        reps: "10-12",
        rest: "60 sec",
      },
      {
        id: "e3",
        name: "Dumbbell Flyes",
        muscleGroup: "Chest",
        equipment: "Dumbbell",
        sets: 3,
        reps: "12-15",
        rest: "45 sec",
      },
      {
        id: "e4",
        name: "Overhead Press",
        muscleGroup: "Shoulders",
        equipment: "Barbell",
        sets: 4,
        reps: "6-8",
        rest: "90 sec",
      },
      {
        id: "e5",
        name: "Lateral Raises",
        muscleGroup: "Shoulders",
        equipment: "Dumbbell",
        sets: 3,
        reps: "12-15",
        rest: "45 sec",
      },
      {
        id: "e6",
        name: "Tricep Dips",
        muscleGroup: "Triceps",
        equipment: "Bodyweight",
        sets: 3,
        reps: "8-12",
        rest: "60 sec",
      },
      {
        id: "e7",
        name: "Rope Tricep Pushdowns",
        muscleGroup: "Triceps",
        equipment: "Cable",
        sets: 3,
        reps: "12-15",
        rest: "45 sec",
      },
    ],
  },
  {
    id: "2",
    name: "Pull Day",
    description:
      "Target your back, biceps, and rear delts with pulling movements.",
    icon: "arrow-left",
    category: "Upper Body",
    difficulty: "Intermediate",
    muscleGroups: ["Back", "Biceps", "Rear Delts"],
    exerciseCount: 7,
    totalSets: 26,
    duration: 60,
    updatedAt: "5 days ago",
    usageCount: 18,
    exercises: [
      {
        id: "e1",
        name: "Deadlifts",
        muscleGroup: "Back",
        equipment: "Barbell",
        sets: 4,
        reps: "5-6",
        rest: "120 sec",
      },
      {
        id: "e2",
        name: "Bent Over Rows",
        muscleGroup: "Back",
        equipment: "Barbell",
        sets: 4,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e3",
        name: "Pull-ups",
        muscleGroup: "Back",
        equipment: "Bodyweight",
        sets: 3,
        reps: "8-12",
        rest: "60 sec",
      },
      {
        id: "e4",
        name: "Barbell Curls",
        muscleGroup: "Biceps",
        equipment: "Barbell",
        sets: 3,
        reps: "8-10",
        rest: "60 sec",
      },
      {
        id: "e5",
        name: "Dumbbell Curls",
        muscleGroup: "Biceps",
        equipment: "Dumbbell",
        sets: 3,
        reps: "10-12",
        rest: "45 sec",
      },
      {
        id: "e6",
        name: "Reverse Pec Deck",
        muscleGroup: "Rear Delts",
        equipment: "Machine",
        sets: 3,
        reps: "12-15",
        rest: "45 sec",
      },
      {
        id: "e7",
        name: "Face Pulls",
        muscleGroup: "Rear Delts",
        equipment: "Cable",
        sets: 2,
        reps: "15-20",
        rest: "30 sec",
      },
    ],
  },
  {
    id: "3",
    name: "Leg Day",
    description: "Build strength and size in your lower body.",
    icon: "target",
    category: "Lower Body",
    difficulty: "Advanced",
    muscleGroups: ["Quadriceps", "Hamstrings", "Glutes"],
    exerciseCount: 8,
    totalSets: 32,
    duration: 75,
    updatedAt: "1 week ago",
    usageCount: 16,
    exercises: [
      {
        id: "e1",
        name: "Barbell Squats",
        muscleGroup: "Quads",
        equipment: "Barbell",
        sets: 4,
        reps: "6-8",
        rest: "120 sec",
      },
      {
        id: "e2",
        name: "Leg Press",
        muscleGroup: "Quads",
        equipment: "Machine",
        sets: 3,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e3",
        name: "Leg Extensions",
        muscleGroup: "Quads",
        equipment: "Machine",
        sets: 3,
        reps: "12-15",
        rest: "60 sec",
      },
      {
        id: "e4",
        name: "Romanian Deadlifts",
        muscleGroup: "Hamstrings",
        equipment: "Barbell",
        sets: 3,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e5",
        name: "Leg Curls",
        muscleGroup: "Hamstrings",
        equipment: "Machine",
        sets: 3,
        reps: "10-12",
        rest: "60 sec",
      },
      {
        id: "e6",
        name: "Hip Thrusts",
        muscleGroup: "Glutes",
        equipment: "Barbell",
        sets: 3,
        reps: "8-12",
        rest: "90 sec",
      },
      {
        id: "e7",
        name: "Bulgarian Split Squats",
        muscleGroup: "Glutes",
        equipment: "Dumbbell",
        sets: 3,
        reps: "10-12",
        rest: "60 sec",
      },
      {
        id: "e8",
        name: "Leg Press Calf Raises",
        muscleGroup: "Calves",
        equipment: "Machine",
        sets: 2,
        reps: "15-20",
        rest: "45 sec",
      },
    ],
  },
  {
    id: "4",
    name: "Upper Body Strength",
    description: "Compound movements for overall upper body strength.",
    icon: "zap",
    category: "Upper Body",
    difficulty: "Advanced",
    muscleGroups: ["Chest", "Back", "Shoulders"],
    exerciseCount: 8,
    totalSets: 30,
    duration: 65,
    updatedAt: "3 days ago",
    usageCount: 16,
    exercises: [
      {
        id: "e1",
        name: "Bench Press",
        muscleGroup: "Chest",
        equipment: "Barbell",
        sets: 4,
        reps: "5-6",
        rest: "120 sec",
      },
      {
        id: "e2",
        name: "Weighted Pull-ups",
        muscleGroup: "Back",
        equipment: "Bodyweight",
        sets: 4,
        reps: "5-8",
        rest: "120 sec",
      },
      {
        id: "e3",
        name: "Overhead Press",
        muscleGroup: "Shoulders",
        equipment: "Barbell",
        sets: 3,
        reps: "5-8",
        rest: "120 sec",
      },
      {
        id: "e4",
        name: "Barbell Rows",
        muscleGroup: "Back",
        equipment: "Barbell",
        sets: 4,
        reps: "5-8",
        rest: "120 sec",
      },
      {
        id: "e5",
        name: "Incline Press",
        muscleGroup: "Chest",
        equipment: "Barbell",
        sets: 3,
        reps: "6-8",
        rest: "90 sec",
      },
      {
        id: "e6",
        name: "Chest Supported Rows",
        muscleGroup: "Back",
        equipment: "Dumbbell",
        sets: 3,
        reps: "8-10",
        rest: "60 sec",
      },
      {
        id: "e7",
        name: "Dumbbell Floor Press",
        muscleGroup: "Chest",
        equipment: "Dumbbell",
        sets: 2,
        reps: "8-12",
        rest: "60 sec",
      },
      {
        id: "e8",
        name: "Landmine Rows",
        muscleGroup: "Back",
        equipment: "Barbell",
        sets: 2,
        reps: "10-12",
        rest: "45 sec",
      },
    ],
  },
  {
    id: "5",
    name: "Full Body Workout",
    description: "Complete full body workout for balanced development.",
    icon: "dumbbell",
    category: "Full Body",
    difficulty: "Beginner",
    muscleGroups: ["Chest", "Back", "Legs", "Shoulders"],
    exerciseCount: 6,
    totalSets: 18,
    duration: 45,
    updatedAt: "Today",
    usageCount: 32,
    exercises: [
      {
        id: "e1",
        name: "Squats",
        muscleGroup: "Legs",
        equipment: "Barbell",
        sets: 3,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e2",
        name: "Bench Press",
        muscleGroup: "Chest",
        equipment: "Barbell",
        sets: 3,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e3",
        name: "Deadlifts",
        muscleGroup: "Back",
        equipment: "Barbell",
        sets: 2,
        reps: "5-6",
        rest: "120 sec",
      },
      {
        id: "e4",
        name: "Rows",
        muscleGroup: "Back",
        equipment: "Barbell",
        sets: 3,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e5",
        name: "Overhead Press",
        muscleGroup: "Shoulders",
        equipment: "Barbell",
        sets: 3,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e6",
        name: "Pull-ups",
        muscleGroup: "Back",
        equipment: "Bodyweight",
        sets: 2,
        reps: "6-10",
        rest: "60 sec",
      },
    ],
  },
  {
    id: "6",
    name: "Arms Day",
    description: "Focused workout for biceps and triceps development.",
    icon: "activity",
    category: "Arms",
    difficulty: "Intermediate",
    muscleGroups: ["Biceps", "Triceps", "Forearms"],
    exerciseCount: 8,
    totalSets: 24,
    duration: 50,
    updatedAt: "4 days ago",
    usageCount: 12,
    exercises: [
      {
        id: "e1",
        name: "Barbell Curls",
        muscleGroup: "Biceps",
        equipment: "Barbell",
        sets: 4,
        reps: "8-10",
        rest: "60 sec",
      },
      {
        id: "e2",
        name: "Dumbbell Hammer Curls",
        muscleGroup: "Biceps",
        equipment: "Dumbbell",
        sets: 3,
        reps: "10-12",
        rest: "45 sec",
      },
      {
        id: "e3",
        name: "Preacher Curls",
        muscleGroup: "Biceps",
        equipment: "Barbell",
        sets: 2,
        reps: "10-12",
        rest: "45 sec",
      },
      {
        id: "e4",
        name: "Close Grip Bench Press",
        muscleGroup: "Triceps",
        equipment: "Barbell",
        sets: 4,
        reps: "8-10",
        rest: "60 sec",
      },
      {
        id: "e5",
        name: "Tricep Rope Pushdowns",
        muscleGroup: "Triceps",
        equipment: "Cable",
        sets: 3,
        reps: "12-15",
        rest: "45 sec",
      },
      {
        id: "e6",
        name: "Overhead Extension",
        muscleGroup: "Triceps",
        equipment: "Dumbbell",
        sets: 3,
        reps: "10-12",
        rest: "45 sec",
      },
      {
        id: "e7",
        name: "Wrist Curls",
        muscleGroup: "Forearms",
        equipment: "Barbell",
        sets: 2,
        reps: "12-15",
        rest: "30 sec",
      },
      {
        id: "e8",
        name: "Reverse Wrist Curls",
        muscleGroup: "Forearms",
        equipment: "Barbell",
        sets: 2,
        reps: "12-15",
        rest: "30 sec",
      },
    ],
  },
  {
    id: "7",
    name: "Back & Biceps",
    description: "Combine back and bicep exercises for maximum pump.",
    icon: "dumbbell",
    category: "Upper Body",
    difficulty: "Intermediate",
    muscleGroups: ["Back", "Biceps"],
    exerciseCount: 7,
    totalSets: 26,
    duration: 55,
    updatedAt: "6 days ago",
    usageCount: 14,
    exercises: [
      {
        id: "e1",
        name: "Deadlifts",
        muscleGroup: "Back",
        equipment: "Barbell",
        sets: 4,
        reps: "5-6",
        rest: "120 sec",
      },
      {
        id: "e2",
        name: "Bent Over Rows",
        muscleGroup: "Back",
        equipment: "Barbell",
        sets: 3,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e3",
        name: "Lat Pulldowns",
        muscleGroup: "Back",
        equipment: "Cable",
        sets: 3,
        reps: "10-12",
        rest: "60 sec",
      },
      {
        id: "e4",
        name: "Barbell Curls",
        muscleGroup: "Biceps",
        equipment: "Barbell",
        sets: 3,
        reps: "8-10",
        rest: "60 sec",
      },
      {
        id: "e5",
        name: "Dumbbell Curls",
        muscleGroup: "Biceps",
        equipment: "Dumbbell",
        sets: 3,
        reps: "10-12",
        rest: "45 sec",
      },
      {
        id: "e6",
        name: "Cable Rows",
        muscleGroup: "Back",
        equipment: "Cable",
        sets: 2,
        reps: "12-15",
        rest: "45 sec",
      },
      {
        id: "e7",
        name: "Concentration Curls",
        muscleGroup: "Biceps",
        equipment: "Dumbbell",
        sets: 2,
        reps: "12-15",
        rest: "30 sec",
      },
    ],
  },
  {
    id: "8",
    name: "Lower Body Strength",
    description: "Focus on building leg strength with heavy compounds.",
    icon: "dumbbell",
    category: "Lower Body",
    difficulty: "Advanced",
    muscleGroups: ["Quadriceps", "Hamstrings", "Glutes"],
    exerciseCount: 6,
    totalSets: 20,
    duration: 70,
    updatedAt: "1 week ago",
    usageCount: 10,
    exercises: [
      {
        id: "e1",
        name: "Barbell Squats",
        muscleGroup: "Quads",
        equipment: "Barbell",
        sets: 5,
        reps: "3-5",
        rest: "150 sec",
      },
      {
        id: "e2",
        name: "Romanian Deadlifts",
        muscleGroup: "Hamstrings",
        equipment: "Barbell",
        sets: 3,
        reps: "5-8",
        rest: "120 sec",
      },
      {
        id: "e3",
        name: "Leg Press",
        muscleGroup: "Quads",
        equipment: "Machine",
        sets: 3,
        reps: "8-10",
        rest: "90 sec",
      },
      {
        id: "e4",
        name: "Walking Lunges",
        muscleGroup: "Glutes",
        equipment: "Dumbbell",
        sets: 3,
        reps: "10-12",
        rest: "60 sec",
      },
      {
        id: "e5",
        name: "Leg Curls",
        muscleGroup: "Hamstrings",
        equipment: "Machine",
        sets: 2,
        reps: "12-15",
        rest: "45 sec",
      },
      {
        id: "e6",
        name: "Calf Raises",
        muscleGroup: "Calves",
        equipment: "Machine",
        sets: 2,
        reps: "15-20",
        rest: "30 sec",
      },
    ],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    Beginner:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    Intermediate:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    Advanced: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  };
  return colors[difficulty] || colors.Intermediate;
}

function formatUpdatedAt(updatedAt: string): string {
  return updatedAt;
}

// ============================================================================
// Icon Mapping Component
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  "trending-up": TrendingUp,
  "arrow-left": ArrowLeft,
  target: Target,
  zap: Zap,
  activity: Activity,
  dumbbell: Dumbbell,
};

function TemplateIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const IconComponent = ICON_MAP[icon] || Dumbbell;
  return <IconComponent className={className} />;
}

// ============================================================================
// Reusable Components
// ============================================================================

interface StatisticCardProps {
  icon: React.ReactNode;
  title: string;
  metric: string | number;
  description: string;
}

function StatisticCard({
  icon,
  title,
  metric,
  description,
}: StatisticCardProps) {
  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{metric}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExpandableRowProps {
  template: WorkoutTemplate;
  isOpen: boolean;
  onToggle: () => void;
}

function ExpandableExercisesRow({
  template,
  isOpen,
  onToggle,
}: ExpandableRowProps) {
  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell colSpan={7}>
          <button
            onClick={onToggle}
            className="flex w-full items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary"
          >
            {isOpen ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronUp className="size-4" />
            )}
            Exercises Included ({template.exercises.length})
          </button>
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={7}>
            <div className="overflow-x-auto py-4">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="border-0 bg-transparent hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Exercise
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Muscle Group
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Equipment
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                      Sets
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                      Reps
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                      Rest
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {template.exercises.map((exercise) => (
                    <TableRow
                      key={exercise.id}
                      className="border-0 hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-foreground">
                        {exercise.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {exercise.muscleGroup}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {exercise.equipment}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {exercise.sets}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {exercise.reps}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {exercise.rest}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ============================================================================
// Empty State Components
// ============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="rounded-lg bg-muted p-3">
        <FileStack className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">
          No Templates Yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Create your first workout template to quickly build future sessions.
        </p>
      </div>
      <Button className="mt-4">
        <Plus className="mr-2 size-4" />
        Create Template
      </Button>
    </div>
  );
}

// ============================================================================
// Analytics Components
// ============================================================================

function PopularTemplatesCard() {
  const popularTemplates = MOCK_TEMPLATES.sort(
    (a, b) => b.usageCount - a.usageCount,
  ).slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="size-5 text-orange-500" />
          Popular Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {popularTemplates.map((template) => (
          <div key={template.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{template.name}</p>
              <p className="text-xs text-muted-foreground">
                Used {template.usageCount}x
              </p>
            </div>
            <Progress
              value={(template.usageCount / 32) * 100}
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MuscleGroupDistributionCard() {
  const muscleGroupCounts: Record<string, number> = {};
  MOCK_TEMPLATES.forEach((template) => {
    template.muscleGroups.forEach((mg) => {
      muscleGroupCounts[mg] = (muscleGroupCounts[mg] || 0) + 1;
    });
  });

  const topGroups = Object.entries(muscleGroupCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const total = topGroups.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dumbbell className="size-5 text-primary" />
          Muscle Group Distribution
        </CardTitle>
        <CardDescription>
          Most targeted muscle groups across templates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topGroups.map(([group, count]) => {
          const percentage = Math.round((count / total) * 100);
          return (
            <div key={group} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{group}</span>
                <span className="text-xs text-muted-foreground">
                  {percentage}%
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TrainerTipsCard() {
  const tips = [
    "Create separate templates for each training goal.",
    "Reuse templates to save time and maintain consistency.",
    "Keep exercise order logical for efficient workouts.",
    "Review templates regularly and update as needed.",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="size-5 text-yellow-500" />
          Trainer Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex gap-2 text-sm">
              <span className="text-primary">✓</span>
              <span className="text-muted-foreground">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function TemplatesPage() {
  const [data] = useState<WorkoutTemplate[]>(MOCK_TEMPLATES);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [searchValue, setSearchValue] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortValue, setSortValue] = useState("updated");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const resetFilters = () => {
    setSelectedDifficulty("all");
    setSortValue("updated");
  };

  const activeFilterCount =
    (selectedDifficulty !== "all" ? 1 : 0) + (sortValue !== "updated" ? 1 : 0);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Search filter
    if (searchValue) {
      filtered = filtered.filter((template) =>
        template.name.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    // Difficulty filter
    if (selectedDifficulty && selectedDifficulty !== "all") {
      filtered = filtered.filter(
        (template) => template.difficulty === selectedDifficulty,
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory,
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortValue) {
        case "name":
          return a.name.localeCompare(b.name);
        case "exercises":
          return b.exerciseCount - a.exerciseCount;
        case "duration":
          return b.duration - a.duration;
        case "updated":
        default:
          return 0;
      }
    });

    return filtered;
  }, [data, searchValue, selectedDifficulty, selectedCategory, sortValue]);

  // Table columns
  const columns: ColumnDef<WorkoutTemplate>[] = [
    {
      id: "template",
      header: "Template",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TemplateIcon icon={row.original.icon} className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              {row.original.name}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "muscles",
      header: "Target Muscles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.muscleGroups.map((muscle) => (
            <Badge key={muscle} variant="secondary" className="text-xs">
              {muscle}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => (
        <Badge
          className={cn("text-xs", getDifficultyColor(row.original.difficulty))}
        >
          {row.original.difficulty}
        </Badge>
      ),
    },
    {
      id: "exercises",
      header: "Exercises",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-foreground">
            {row.original.exerciseCount} Exercises
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.totalSets} Sets
          </p>
        </div>
      ),
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }) => (
        <p className="text-sm text-foreground">{row.original.duration} min</p>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">
          {formatUpdatedAt(row.original.updatedAt)}
        </p>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Copy className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Delete</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });

  const toggleRowExpansion = (templateId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Workout Templates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create reusable workout templates to quickly build training
            sessions.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Import Template
          </Button>
          <Button>
            <Plus className="mr-2 size-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          icon={<FileStack className="size-5" />}
          title="Total Templates"
          metric={data.length}
          description="Saved Templates"
        />
        <StatisticCard
          icon={<Dumbbell className="size-5" />}
          title="Total Exercises"
          metric={data.reduce((sum, t) => sum + t.exerciseCount, 0)}
          description="Across Templates"
        />
        <StatisticCard
          icon={<Layers3 className="size-5" />}
          title="Total Sets"
          metric={data.reduce((sum, t) => sum + t.totalSets, 0)}
          description="Across Templates"
        />
        <StatisticCard
          icon={<Clock3 className="size-5" />}
          title="Average Duration"
          metric={`${Math.round(data.reduce((sum, t) => sum + t.duration, 0) / data.length)} min`}
          description="Per Template"
        />
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Button + Popover */}
            <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="relative gap-2 px-3 sm:px-4 py-2 h-auto text-sm font-normal"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden xs:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Advanced filters
                  </h4>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Difficulty Level
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => {
                        setSelectedDifficulty(e.target.value);
                        setPagination((p) => ({ ...p, pageIndex: 0 }));
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Sort By
                    </label>
                    <select
                      value={sortValue}
                      onChange={(e) => {
                        setSortValue(e.target.value);
                        setPagination((p) => ({ ...p, pageIndex: 0 }));
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Reset filters
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Import Button */}
            <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedCategory(option.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground">
          <span className="font-medium">{filteredData.length} templates</span>
        </p>
      </div>

      {/* Templates Table */}
      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-b">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="text-xs font-semibold"
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
                      <React.Fragment key={row.id}>
                        <TableRow className="border-b hover:bg-muted/50">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        {expandedRows.has(row.original.id) && (
                          <ExpandableExercisesRow
                            template={row.original}
                            isOpen={expandedRows.has(row.original.id)}
                            onToggle={() => toggleRowExpansion(row.original.id)}
                          />
                        )}
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell colSpan={7} className="py-0">
                            <button
                              onClick={() =>
                                toggleRowExpansion(row.original.id)
                              }
                              className="inline-flex w-full items-center gap-2 py-2 text-xs font-medium text-muted-foreground hover:text-primary"
                            >
                              {expandedRows.has(row.original.id) ? (
                                <>
                                  <ChevronUp className="size-3" />
                                  Hide Exercises
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="size-3" />
                                  Show Exercises
                                </>
                              )}
                            </button>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  filteredData.length,
                )}{" "}
                of {filteredData.length} templates
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(table.getPageCount())].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => table.setPageIndex(idx)}
                    className={`w-8 h-8 rounded-lg border transition-colors ${
                      idx === pagination.pageIndex
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-gray-50"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <select
                  value={pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="px-2 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize} rows
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}

      <Separator />

      {/* Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PopularTemplatesCard />
        <MuscleGroupDistributionCard />
        <TrainerTipsCard />
      </div>
    </div>
  );
}
