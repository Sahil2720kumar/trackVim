"use client";

// ============================================================================
// Imports
// ============================================================================
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Clock3,
  Target,
  Dumbbell,
  Layers3,
  Save,
  Settings2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Legs"
  | "Core"
  | "Glutes"
  | "Forearms"
  | "Traps";

type TemplateType =
  | "Strength Training"
  | "Hypertrophy"
  | "Powerlifting"
  | "Functional Training"
  | "Cardio"
  | "Mobility"
  | "HIIT";

type PrimaryGoal =
  | "Muscle Gain"
  | "Fat Loss"
  | "Strength"
  | "Endurance"
  | "Athletic Performance";

type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

type ScreenState = "loading" | "loaded";

interface LibraryExercise {
  id: string;
  name: string;
  equipment: string;
  muscleGroup: MuscleGroup;
}

interface TemplateExercise extends LibraryExercise {
  rowId: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  tempo: string;
  rpe: string;
}

// ============================================================================
// Constants
// ============================================================================

const TEMPLATE_TYPES: TemplateType[] = [
  "Strength Training",
  "Hypertrophy",
  "Powerlifting",
  "Functional Training",
  "Cardio",
  "Mobility",
  "HIIT",
];

const PRIMARY_GOALS: PrimaryGoal[] = [
  "Muscle Gain",
  "Fat Loss",
  "Strength",
  "Endurance",
  "Athletic Performance",
];

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Core",
  "Glutes",
  "Forearms",
  "Traps",
];

const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Resistance Band",
  "Bodyweight",
];

const REST_OPTIONS = [
  "30 sec",
  "45 sec",
  "60 sec",
  "75 sec",
  "90 sec",
  "120 sec",
];

const TEMPO_OPTIONS = ["2-0-2", "3-1-1", "2-1-2", "4-0-1", "Controlled"];

const RPE_OPTIONS = ["6", "6-7", "7", "7-8", "8", "8-9", "9", "9-10"];

const MUSCLE_GROUP_STYLES: Record<MuscleGroup, string> = {
  Chest:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  Back: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  Shoulders:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  Biceps:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  Triceps:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Legs: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  Core: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  Glutes:
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/20",
  Forearms:
    "bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-500/10 dark:text-lime-400 dark:border-lime-500/20",
  Traps:
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20",
};

const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
  Beginner:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  Intermediate:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  Advanced:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

// Dev toggle mirroring the pattern used across TrackVim screens.
const MOCK_SCREEN_STATE: ScreenState = "loaded";

// ============================================================================
// Mock Data
// ============================================================================

const EXERCISE_LIBRARY: LibraryExercise[] = [
  {
    id: "lib-deadlift",
    name: "Deadlift",
    equipment: "Barbell",
    muscleGroup: "Back",
  },
  {
    id: "lib-pullup",
    name: "Pull Up",
    equipment: "Bodyweight",
    muscleGroup: "Back",
  },
  {
    id: "lib-bent-row",
    name: "Bent Over Row",
    equipment: "Barbell",
    muscleGroup: "Back",
  },
  {
    id: "lib-lat-pulldown",
    name: "Lat Pulldown",
    equipment: "Cable",
    muscleGroup: "Back",
  },
  {
    id: "lib-seated-row",
    name: "Seated Cable Row",
    equipment: "Cable",
    muscleGroup: "Back",
  },
  {
    id: "lib-face-pull",
    name: "Face Pull",
    equipment: "Cable",
    muscleGroup: "Shoulders",
  },
  {
    id: "lib-barbell-curl",
    name: "Barbell Curl",
    equipment: "Barbell",
    muscleGroup: "Biceps",
  },
  {
    id: "lib-hammer-curl",
    name: "Hammer Curl",
    equipment: "Dumbbell",
    muscleGroup: "Biceps",
  },
  {
    id: "lib-bench",
    name: "Bench Press",
    equipment: "Barbell",
    muscleGroup: "Chest",
  },
  {
    id: "lib-incline-db",
    name: "Incline Dumbbell Press",
    equipment: "Dumbbell",
    muscleGroup: "Chest",
  },
  {
    id: "lib-ohp",
    name: "Overhead Press",
    equipment: "Barbell",
    muscleGroup: "Shoulders",
  },
  {
    id: "lib-lateral-raise",
    name: "Lateral Raise",
    equipment: "Dumbbell",
    muscleGroup: "Shoulders",
  },
  {
    id: "lib-tricep-pushdown",
    name: "Tricep Pushdown",
    equipment: "Cable",
    muscleGroup: "Triceps",
  },
  {
    id: "lib-dips",
    name: "Dips",
    equipment: "Bodyweight",
    muscleGroup: "Triceps",
  },
  {
    id: "lib-squat",
    name: "Back Squat",
    equipment: "Barbell",
    muscleGroup: "Legs",
  },
  {
    id: "lib-rdl",
    name: "Romanian Deadlift",
    equipment: "Barbell",
    muscleGroup: "Legs",
  },
  {
    id: "lib-leg-press",
    name: "Leg Press",
    equipment: "Machine",
    muscleGroup: "Legs",
  },
  {
    id: "lib-leg-curl",
    name: "Seated Leg Curl",
    equipment: "Machine",
    muscleGroup: "Legs",
  },
  {
    id: "lib-calf-raise",
    name: "Standing Calf Raise",
    equipment: "Machine",
    muscleGroup: "Legs",
  },
  {
    id: "lib-plank",
    name: "Plank",
    equipment: "Bodyweight",
    muscleGroup: "Core",
  },
  {
    id: "lib-hip-thrust",
    name: "Hip Thrust",
    equipment: "Barbell",
    muscleGroup: "Glutes",
  },
  {
    id: "lib-wrist-curl",
    name: "Wrist Curl",
    equipment: "Dumbbell",
    muscleGroup: "Forearms",
  },
  {
    id: "lib-shrug",
    name: "Barbell Shrug",
    equipment: "Barbell",
    muscleGroup: "Traps",
  },
];

const INITIAL_EXERCISES: TemplateExercise[] = [
  {
    rowId: "row-1",
    id: "lib-deadlift",
    name: "Deadlift",
    equipment: "Barbell",
    muscleGroup: "Back",
    sets: 4,
    reps: "6-8",
    weight: "185 kg",
    rest: "120 sec",
    tempo: "2-0-2",
    rpe: "9",
  },
  {
    rowId: "row-2",
    id: "lib-pullup",
    name: "Pull Up",
    equipment: "Bodyweight",
    muscleGroup: "Back",
    sets: 4,
    reps: "8-10",
    weight: "Bodyweight",
    rest: "90 sec",
    tempo: "2-0-2",
    rpe: "8",
  },
  {
    rowId: "row-3",
    id: "lib-bent-row",
    name: "Bent Over Row",
    equipment: "Barbell",
    muscleGroup: "Back",
    sets: 4,
    reps: "8-10",
    weight: "100 kg",
    rest: "90 sec",
    tempo: "2-0-2",
    rpe: "8",
  },
  {
    rowId: "row-4",
    id: "lib-lat-pulldown",
    name: "Lat Pulldown",
    equipment: "Cable",
    muscleGroup: "Back",
    sets: 3,
    reps: "10-12",
    weight: "80 kg",
    rest: "75 sec",
    tempo: "2-1-2",
    rpe: "7",
  },
  {
    rowId: "row-5",
    id: "lib-face-pull",
    name: "Face Pull",
    equipment: "Cable",
    muscleGroup: "Shoulders",
    sets: 3,
    reps: "12-15",
    weight: "30 kg",
    rest: "60 sec",
    tempo: "2-1-2",
    rpe: "6",
  },
  {
    rowId: "row-6",
    id: "lib-barbell-curl",
    name: "Barbell Curl",
    equipment: "Barbell",
    muscleGroup: "Biceps",
    sets: 3,
    reps: "8-12",
    weight: "40 kg",
    rest: "60 sec",
    tempo: "2-0-2",
    rpe: "7",
  },
];

// ============================================================================
// Validation Schema
// ============================================================================

const templateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Template name must be at least 3 characters")
    .max(80, "Template name must be under 80 characters"),
  type: z.enum(TEMPLATE_TYPES as [TemplateType, ...TemplateType[]]),
  goal: z.enum(PRIMARY_GOALS as [PrimaryGoal, ...PrimaryGoal[]]),
  difficulty: z.enum(
    DIFFICULTY_LEVELS as [DifficultyLevel, ...DifficultyLevel[]],
  ),
  muscleGroups: z
    .array(z.string())
    .min(1, "Select at least one target muscle group"),
  description: z
    .string()
    .max(250, "Description must be under 250 characters")
    .optional(),
  duration: z.coerce
    .number({ invalid_type_error: "Duration is required" })
    .min(1, "Duration must be at least 1 minute")
    .max(300, "Duration must be under 300 minutes"),
  restBetweenSets: z.string().min(1, "Select a default rest time"),
  equipment: z.array(z.string()).min(1, "Select at least one equipment type"),
  notes: z.string().max(500, "Notes must be under 500 characters").optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

const DEFAULT_FORM_VALUES: TemplateFormValues = {
  name: "Pull Day",
  type: "Strength Training",
  goal: "Muscle Gain",
  difficulty: "Intermediate",
  muscleGroups: ["Back", "Biceps", "Shoulders"],
  description:
    "A back and biceps focused workout to build thickness and strength.",
  duration: 60,
  restBetweenSets: "90 sec",
  equipment: ["Barbell", "Dumbbell", "Cable"],
  notes:
    "Focus on full range of motion and controlled tempos. Keep form pristine.",
};

// ============================================================================
// Helper Functions
// ============================================================================

function createRowId(): string {
  return `row-${Math.random().toString(36).slice(2, 10)}`;
}

function calculateTotalSets(exercises: TemplateExercise[]): number {
  return exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
}

// ============================================================================
// Reusable Components
// ============================================================================

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-center gap-1 text-xs font-medium text-destructive"
    >
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

function MuscleBadge({ muscle }: { muscle: MuscleGroup }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap font-medium",
        MUSCLE_GROUP_STYLES[muscle],
      )}
    >
      {muscle}
    </Badge>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", DIFFICULTY_STYLES[difficulty])}
    >
      {difficulty}
    </Badge>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

// Multi-select chip field used for muscle groups / equipment.
function MultiSelectField({
  id,
  options,
  selected,
  onChange,
  placeholder,
  invalid,
}: {
  id?: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  invalid?: boolean;
}) {
  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="gap-1 pl-2.5 pr-1.5 font-medium"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(selected.filter((s) => s !== item))}
                className="rounded-sm p-0.5 hover:bg-background/60"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Select
        onValueChange={(value) => {
          if (!selected.includes(value)) onChange([...selected, value]);
        }}
      >
        <SelectTrigger
          id={id}
          aria-invalid={invalid || undefined}
          className={cn(
            invalid && "border-destructive focus-visible:ring-destructive",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options
            .filter((opt) => !selected.includes(opt))
            .map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ExerciseThumbnail({ muscleGroup }: { muscleGroup: MuscleGroup }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
        MUSCLE_GROUP_STYLES[muscleGroup],
      )}
    >
      <Dumbbell className="h-4 w-4" />
    </div>
  );
}

function NumberStepper({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex h-9 w-[84px] items-center rounded-md border border-input bg-background">
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel}`}
        className="flex h-full w-7 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-l-md"
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        −
      </button>
      <input
        type="number"
        aria-label={ariaLabel}
        value={value}
        min={1}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="h-full w-full min-w-0 border-x border-input bg-transparent text-center text-sm font-medium text-foreground focus-visible:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={`Increase ${ariaLabel}`}
        className="flex h-full w-7 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}

function EditableSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={ariaLabel} className="h-9 w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ExerciseTableRow({
  exercise,
  index,
  showAdvanced,
  onUpdate,
  onDuplicate,
  onDelete,
}: {
  exercise: TemplateExercise;
  index: number;
  showAdvanced: boolean;
  onUpdate: (rowId: string, patch: Partial<TemplateExercise>) => void;
  onDuplicate: (rowId: string) => void;
  onDelete: (rowId: string) => void;
}) {
  return (
    <TableRow>
      <TableCell className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <GripVertical
            className="h-3.5 w-3.5 text-muted-foreground/50"
            aria-hidden="true"
          />
          {index + 1}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <ExerciseThumbnail muscleGroup={exercise.muscleGroup} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {exercise.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {exercise.equipment}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <MuscleBadge muscle={exercise.muscleGroup} />
      </TableCell>
      <TableCell>
        <NumberStepper
          value={exercise.sets}
          ariaLabel={`Sets for ${exercise.name}`}
          onChange={(value) => onUpdate(exercise.rowId, { sets: value })}
        />
      </TableCell>
      <TableCell>
        <Input
          value={exercise.reps}
          aria-label={`Reps for ${exercise.name}`}
          className="h-9 w-[76px]"
          onChange={(e) => onUpdate(exercise.rowId, { reps: e.target.value })}
        />
      </TableCell>
      <TableCell>
        <Input
          value={exercise.weight}
          aria-label={`Weight for ${exercise.name}`}
          className="h-9 w-[100px]"
          onChange={(e) => onUpdate(exercise.rowId, { weight: e.target.value })}
        />
      </TableCell>
      <TableCell>
        <EditableSelect
          value={exercise.rest}
          options={REST_OPTIONS}
          ariaLabel={`Rest for ${exercise.name}`}
          onChange={(value) => onUpdate(exercise.rowId, { rest: value })}
        />
      </TableCell>
      {showAdvanced && (
        <TableCell>
          <EditableSelect
            value={exercise.tempo}
            options={TEMPO_OPTIONS}
            ariaLabel={`Tempo for ${exercise.name}`}
            onChange={(value) => onUpdate(exercise.rowId, { tempo: value })}
          />
        </TableCell>
      )}
      {showAdvanced && (
        <TableCell>
          <EditableSelect
            value={exercise.rpe}
            options={RPE_OPTIONS}
            ariaLabel={`RPE for ${exercise.name}`}
            onChange={(value) => onUpdate(exercise.rowId, { rpe: value })}
          />
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label={`Duplicate ${exercise.name}`}
                  onClick={() => onDuplicate(exercise.rowId)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate exercise</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${exercise.name}`}
                  onClick={() => onDelete(exercise.rowId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove exercise</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ExerciseMobileCard({
  exercise,
  index,
  onUpdate,
  onDuplicate,
  onDelete,
}: {
  exercise: TemplateExercise;
  index: number;
  onUpdate: (rowId: string, patch: Partial<TemplateExercise>) => void;
  onDuplicate: (rowId: string) => void;
  onDelete: (rowId: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ExerciseThumbnail muscleGroup={exercise.muscleGroup} />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">#{index + 1}</p>
            <p className="truncate text-sm font-medium text-foreground">
              {exercise.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {exercise.equipment}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            aria-label={`Duplicate ${exercise.name}`}
            onClick={() => onDuplicate(exercise.rowId)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label={`Remove ${exercise.name}`}
            onClick={() => onDelete(exercise.rowId)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <MuscleBadge muscle={exercise.muscleGroup} />
      </div>

      <Separator className="my-3" />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Sets</p>
          <NumberStepper
            value={exercise.sets}
            ariaLabel={`Sets for ${exercise.name}`}
            onChange={(value) => onUpdate(exercise.rowId, { sets: value })}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Reps</p>
          <Input
            value={exercise.reps}
            aria-label={`Reps for ${exercise.name}`}
            className="h-9"
            onChange={(e) => onUpdate(exercise.rowId, { reps: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Weight</p>
          <Input
            value={exercise.weight}
            aria-label={`Weight for ${exercise.name}`}
            className="h-9"
            onChange={(e) =>
              onUpdate(exercise.rowId, { weight: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Rest</p>
          <EditableSelect
            value={exercise.rest}
            options={REST_OPTIONS}
            ariaLabel={`Rest for ${exercise.name}`}
            onChange={(value) => onUpdate(exercise.rowId, { rest: value })}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Tempo</p>
          <EditableSelect
            value={exercise.tempo}
            options={TEMPO_OPTIONS}
            ariaLabel={`Tempo for ${exercise.name}`}
            onChange={(value) => onUpdate(exercise.rowId, { tempo: value })}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">RPE</p>
          <EditableSelect
            value={exercise.rpe}
            options={RPE_OPTIONS}
            ariaLabel={`RPE for ${exercise.name}`}
            onChange={(value) => onUpdate(exercise.rowId, { rpe: value })}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyExerciseState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Dumbbell className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">
        No Exercises Added
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Use "Add Exercise" below to search the exercise library and start
        building this template.
      </p>
    </div>
  );
}

// ============================================================================
// Loading Skeleton Components
// ============================================================================

function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function CreateTemplatePage() {
  const router = useRouter();

  const [exercises, setExercises] =
    useState<TemplateExercise[]>(INITIAL_EXERCISES);
  const [showAdvancedColumns, setShowAdvancedColumns] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [exercisesError, setExercisesError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema) as Resolver<TemplateFormValues>,
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onBlur",
  });

  const name = watch("name");
  const type = watch("type");
  const goal = watch("goal");
  const difficulty = watch("difficulty");
  const muscleGroups = watch("muscleGroups");
  const equipment = watch("equipment");
  const duration = watch("duration");
  const descriptionValue = watch("description") ?? "";
  const notesValue = watch("notes") ?? "";

  const availableLibraryExercises = useMemo(
    () =>
      EXERCISE_LIBRARY.filter(
        (libEx) => !exercises.some((sessionEx) => sessionEx.id === libEx.id),
      ),
    [exercises],
  );

  const stats = useMemo(
    () => ({
      totalExercises: exercises.length,
      totalSets: calculateTotalSets(exercises),
    }),
    [exercises],
  );

  function handleUpdateExercise(
    rowId: string,
    patch: Partial<TemplateExercise>,
  ) {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.rowId === rowId ? { ...exercise, ...patch } : exercise,
      ),
    );
  }

  function handleDuplicateExercise(rowId: string) {
    setExercises((prev) => {
      const index = prev.findIndex((exercise) => exercise.rowId === rowId);
      if (index === -1) return prev;
      const duplicate: TemplateExercise = {
        ...prev[index],
        rowId: createRowId(),
      };
      const next = [...prev];
      next.splice(index + 1, 0, duplicate);
      return next;
    });
  }

  function handleDeleteExercise(rowId: string) {
    setExercises((prev) => prev.filter((exercise) => exercise.rowId !== rowId));
  }

  function handleAddExercise(libraryExercise: LibraryExercise) {
    const newExercise: TemplateExercise = {
      ...libraryExercise,
      rowId: createRowId(),
      sets: 3,
      reps: "8-10",
      weight: "—",
      rest: "60 sec",
      tempo: "2-0-2",
      rpe: "7",
    };
    setExercises((prev) => [...prev, newExercise]);
    setExercisesError(null);
    setAddExerciseOpen(false);
  }

  function onSubmit(values: TemplateFormValues) {
    if (exercises.length === 0) {
      setExercisesError(
        "Add at least one exercise to this template before saving.",
      );
      return;
    }
    setExercisesError(null);

    // In a real integration this would POST to the templates API.
    console.log("Template saved:", { ...values, exercises });

    setSubmitSuccess(true);
    window.setTimeout(() => setSubmitSuccess(false), 4000);
  }

  if (MOCK_SCREEN_STATE === "loading") {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link
          href="/trainer/templates"
          className="text-muted-foreground hover:text-foreground"
        >
          Templates
        </Link>
        <ChevronLeft className="size-4 rotate-180 text-muted-foreground" />
        <span className="text-foreground font-medium">Create Template</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create Workout Template</h1>
          <p className="text-muted-foreground">
            Build reusable workout templates that can be assigned to future
            training sessions.
          </p>
        </div>
        <Link href="/trainer/templates">
          <Button type="button" variant="outline" size="sm">
            <ChevronLeft className="size-4 mr-2" />
            Back to Templates
          </Button>
        </Link>
      </div>

      {submitSuccess && (
        <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-foreground dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-sm text-emerald-700 dark:text-emerald-400">
            Template saved successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Template Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Template Details
              </CardTitle>
              <CardDescription>
                Configure the basic information for this workout template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Name */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="name" required>
                  Template Name
                </FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g., Pull Day"
                  aria-invalid={!!errors.name || undefined}
                  className={cn(
                    errors.name &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  {...register("name")}
                />
                <FieldError message={errors.name?.message} />
              </div>

              {/* Template Type & Primary Goal Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="type">Template Type</FieldLabel>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <FieldLabel htmlFor="goal">Primary Goal</FieldLabel>
                  <Controller
                    control={control}
                    name="goal"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="goal">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIMARY_GOALS.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Difficulty & Duration Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="difficulty">Difficulty Level</FieldLabel>
                  <Controller
                    control={control}
                    name="difficulty"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTY_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <FieldLabel htmlFor="duration" required>
                    Estimated Duration
                  </FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      aria-invalid={!!errors.duration || undefined}
                      className={cn(
                        "flex-1",
                        errors.duration &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      {...register("duration")}
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      min
                    </span>
                  </div>
                  <FieldError message={errors.duration?.message} />
                </div>
              </div>

              {/* Target Muscle Groups */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="muscle-groups">
                  Target Muscle Groups
                </FieldLabel>
                <Controller
                  control={control}
                  name="muscleGroups"
                  render={({ field }) => (
                    <MultiSelectField
                      id="muscle-groups"
                      options={MUSCLE_GROUPS}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select muscle groups..."
                      invalid={!!errors.muscleGroups}
                    />
                  )}
                />
                <FieldError message={errors.muscleGroups?.message} />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="description">
                  Description (Optional)
                </FieldLabel>
                <div className="relative">
                  <Textarea
                    id="description"
                    placeholder="Add a brief description of this workout template..."
                    maxLength={250}
                    className="min-h-[84px] resize-none"
                    {...register("description")}
                  />
                  <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground">
                    {descriptionValue.length} / 250
                  </span>
                </div>
                <FieldError message={errors.description?.message} />
              </div>

              {/* Rest Between Sets & Equipment Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="rest">
                    Default Rest Between Sets
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="restBetweenSets"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="rest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REST_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <FieldLabel htmlFor="equipment">Equipment</FieldLabel>
                  <Controller
                    control={control}
                    name="equipment"
                    render={({ field }) => (
                      <MultiSelectField
                        id="equipment"
                        options={EQUIPMENT_OPTIONS}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select equipment..."
                        invalid={!!errors.equipment}
                      />
                    )}
                  />
                  <FieldError message={errors.equipment?.message} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercises Card */}
          <Card>
            <CardHeader>
              <SectionHeading
                icon={Dumbbell}
                title="Exercises"
                subtitle="Search the exercise library and build out this template."
                action={
                  exercises.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedColumns((prev) => !prev)}
                    >
                      <Settings2 className="mr-2 h-3.5 w-3.5" />
                      {showAdvancedColumns ? "Hide" : "Customize"} Exercises
                    </Button>
                  )
                }
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {exercisesError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {exercisesError}
                  </AlertDescription>
                </Alert>
              )}

              {exercises.length === 0 ? (
                <EmptyExerciseState />
              ) : (
                <>
                  {/* Desktop / tablet table */}
                  <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
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
                          {showAdvancedColumns && <TableHead>Tempo</TableHead>}
                          {showAdvancedColumns && <TableHead>RPE</TableHead>}
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exercises.map((exercise, index) => (
                          <ExerciseTableRow
                            key={exercise.rowId}
                            exercise={exercise}
                            index={index}
                            showAdvanced={showAdvancedColumns}
                            onUpdate={handleUpdateExercise}
                            onDuplicate={handleDuplicateExercise}
                            onDelete={handleDeleteExercise}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 md:hidden">
                    {exercises.map((exercise, index) => (
                      <ExerciseMobileCard
                        key={exercise.rowId}
                        exercise={exercise}
                        index={index}
                        onUpdate={handleUpdateExercise}
                        onDuplicate={handleDuplicateExercise}
                        onDelete={handleDeleteExercise}
                      />
                    ))}
                  </div>

                  {/* Exercise Summary */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Exercises
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.totalExercises}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Sets
                      </p>
                      <p className="text-2xl font-bold">{stats.totalSets}</p>
                    </div>
                  </div>
                </>
              )}

              <Popover open={addExerciseOpen} onOpenChange={setAddExerciseOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Plus className="h-4 w-4" />
                    Add Exercise
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search exercise library..." />
                    <CommandList>
                      <CommandEmpty>No exercises found.</CommandEmpty>
                      <CommandGroup>
                        {availableLibraryExercises.map((libEx) => (
                          <CommandItem
                            key={libEx.id}
                            value={`${libEx.name} ${libEx.muscleGroup}`}
                            onSelect={() => handleAddExercise(libEx)}
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {libEx.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {libEx.equipment}
                                </p>
                              </div>
                              <MuscleBadge muscle={libEx.muscleGroup} />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle>Trainer Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="relative">
                <Textarea
                  placeholder="Add coaching tips or special instructions for this workout template..."
                  maxLength={500}
                  className="min-h-[100px] resize-none"
                  {...register("notes")}
                />
                <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground">
                  {notesValue.length} / 500
                </span>
              </div>
              <FieldError message={errors.notes?.message} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* Template Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="size-5 text-primary" />
                Template Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Template Name
                </p>
                <p className="font-semibold text-lg">{name || "Untitled"}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <SummaryRow icon={Target} label="Type" value={type} />
                <SummaryRow icon={Target} label="Goal" value={goal} />
                <SummaryRow
                  icon={Target}
                  label="Difficulty"
                  value={<DifficultyBadge difficulty={difficulty} />}
                />
                <SummaryRow
                  icon={Layers3}
                  label="Muscle Groups"
                  value={
                    muscleGroups.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {muscleGroups.map((mg) => (
                          <Badge
                            key={mg}
                            variant="secondary"
                            className="text-xs"
                          >
                            {mg}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "None selected"
                    )
                  }
                />
                <SummaryRow
                  icon={Clock3}
                  label="Est. Duration"
                  value={`${duration || 0} minutes`}
                />
                <SummaryRow
                  icon={Layers3}
                  label="Exercises"
                  value={stats.totalExercises}
                />
                <SummaryRow
                  icon={Target}
                  label="Total Sets"
                  value={stats.totalSets}
                />

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Status</p>
                  <Badge variant="outline">Draft</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Add 6-10 exercises for a complete workout.",
                "Place compound exercises first.",
                "Follow logical exercise progression.",
                "Keep templates reusable for clients.",
              ].map((tip) => (
                <div key={tip} className="flex gap-2 text-sm">
                  <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-muted-foreground">{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin mr-2 size-4 border-2 border-background border-t-foreground rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save Template
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
