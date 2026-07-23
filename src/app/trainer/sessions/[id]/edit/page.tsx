"use client";

// ============================================================================
// Imports
// ============================================================================

import * as React from "react";
import { useMemo, useState } from "react";
import {
  Calendar,
  Clock3,
  User,
  Users,
  Dumbbell,
  ClipboardList,
  Plus,
  Trash2,
  Copy,
  Settings2,
  Bell,
  CheckCircle2,
  Info,
  MapPin,
  ChevronDown,
  Check,
  Timer,
  Gauge,
  Activity,
  Target,
  FileDown,
  ClipboardCopy,
  Eye,
  Lightbulb,
  Zap,
  AlertCircle,
  Layers,
  Sparkles,
  GripVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
  | "Back"
  | "Chest"
  | "Legs"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Core"
  | "Rear Delts"
  | "Full Body";

type SessionType =
  | "Strength"
  | "Hypertrophy"
  | "Functional"
  | "Cardio"
  | "Mobility";

type VolumeLevel = "Low" | "Medium" | "High";
type RestTimerMode = "Show Timer" | "Hide Timer";
type RpeTrackingMode = "Enable" | "Disable";
type ReminderOption = "None" | "15 minutes" | "30 minutes" | "1 hour";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  tempo: string;
  rpe: string;
}

interface ExerciseLibraryItem {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  type: SessionType;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  primaryGoal: string;
  targetMuscles: string;
  exerciseCount: number;
  durationMinutes: number;
  exercises: Exercise[];
}

interface Member {
  id: string;
  name: string;
  plan: string;
  initials: string;
}

interface SessionSettings {
  restTimer: RestTimerMode;
  defaultRestSeconds: string;
  rpeTracking: RpeTrackingMode;
  reminder: ReminderOption;
}

interface SessionDetails {
  name: string;
  templateId: string | null;
  memberId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  location: string;
  notes: string;
}

// ============================================================================
// Constants
// ============================================================================

const REST_OPTIONS = [
  "30 sec",
  "45 sec",
  "60 sec",
  "75 sec",
  "90 sec",
  "120 sec",
];
const TEMPO_OPTIONS = ["2-0-2", "2-1-2", "3-1-1", "Controlled", "Explosive"];
const RPE_OPTIONS = ["6", "7", "7-8", "8", "8-9", "9", "9-10", "10"];
const SESSION_TYPES: SessionType[] = [
  "Strength",
  "Hypertrophy",
  "Functional",
  "Cardio",
  "Mobility",
];
const REMINDER_OPTIONS: ReminderOption[] = [
  "None",
  "15 minutes",
  "30 minutes",
  "1 hour",
];

const MUSCLE_GROUP_STYLES: Record<MuscleGroup, string> = {
  Back: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  Chest:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  Legs: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  Shoulders:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  Biceps:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  Triceps:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Core: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  "Rear Delts":
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  "Full Body":
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/20",
};

const VOLUME_STYLES: Record<VolumeLevel, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  High: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
};

// ============================================================================
// Mock Data
// ============================================================================

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  { name: "Deadlift", muscleGroup: "Back", equipment: "Barbell" },
  { name: "Pull Up", muscleGroup: "Back", equipment: "Bodyweight" },
  { name: "Bent Over Row", muscleGroup: "Back", equipment: "Barbell" },
  { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable" },
  { name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable" },
  { name: "Face Pull", muscleGroup: "Rear Delts", equipment: "Rope" },
  { name: "Barbell Curl", muscleGroup: "Biceps", equipment: "Barbell" },
  { name: "Hammer Curl", muscleGroup: "Biceps", equipment: "Dumbbell" },
  { name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell" },
  {
    name: "Incline Dumbbell Press",
    muscleGroup: "Chest",
    equipment: "Dumbbell",
  },
  { name: "Squat", muscleGroup: "Legs", equipment: "Barbell" },
  { name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell" },
  { name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell" },
  { name: "Lateral Raise", muscleGroup: "Shoulders", equipment: "Dumbbell" },
  { name: "Tricep Pushdown", muscleGroup: "Triceps", equipment: "Cable" },
  { name: "Plank", muscleGroup: "Core", equipment: "Bodyweight" },
];

function buildPullDayExercises(): Exercise[] {
  return [
    {
      id: nextId("ex"),
      name: "Deadlift",
      muscleGroup: "Back",
      equipment: "Barbell",
      sets: 4,
      reps: "6-8",
      weight: "100 kg",
      rest: "120 sec",
      tempo: "2-0-2",
      rpe: "8-9",
    },
    {
      id: nextId("ex"),
      name: "Pull Up",
      muscleGroup: "Back",
      equipment: "Bodyweight",
      sets: 4,
      reps: "8-10",
      weight: "Bodyweight",
      rest: "90 sec",
      tempo: "2-0-2",
      rpe: "8",
    },
    {
      id: nextId("ex"),
      name: "Bent Over Row",
      muscleGroup: "Back",
      equipment: "Barbell",
      sets: 4,
      reps: "8-10",
      weight: "70 kg",
      rest: "90 sec",
      tempo: "2-0-2",
      rpe: "8",
    },
    {
      id: nextId("ex"),
      name: "Lat Pulldown",
      muscleGroup: "Back",
      equipment: "Cable",
      sets: 3,
      reps: "10-12",
      weight: "60 kg",
      rest: "75 sec",
      tempo: "2-1-2",
      rpe: "7-8",
    },
    {
      id: nextId("ex"),
      name: "Seated Cable Row",
      muscleGroup: "Back",
      equipment: "Cable",
      sets: 3,
      reps: "10-12",
      weight: "55 kg",
      rest: "75 sec",
      tempo: "2-1-2",
      rpe: "7-8",
    },
    {
      id: nextId("ex"),
      name: "Face Pull",
      muscleGroup: "Rear Delts",
      equipment: "Rope",
      sets: 3,
      reps: "12-15",
      weight: "20 kg",
      rest: "60 sec",
      tempo: "2-1-2",
      rpe: "7",
    },
    {
      id: nextId("ex"),
      name: "Barbell Curl",
      muscleGroup: "Biceps",
      equipment: "Barbell",
      sets: 3,
      reps: "8-12",
      weight: "30 kg",
      rest: "60 sec",
      tempo: "2-0-2",
      rpe: "8",
    },
    {
      id: nextId("ex"),
      name: "Hammer Curl",
      muscleGroup: "Biceps",
      equipment: "Dumbbell",
      sets: 3,
      reps: "10-12",
      weight: "12.5 kg",
      rest: "60 sec",
      tempo: "2-0-2",
      rpe: "7-8",
    },
  ];
}

function buildPushDayExercises(): Exercise[] {
  return [
    {
      id: nextId("ex"),
      name: "Bench Press",
      muscleGroup: "Chest",
      equipment: "Barbell",
      sets: 4,
      reps: "6-8",
      weight: "80 kg",
      rest: "120 sec",
      tempo: "2-0-2",
      rpe: "8-9",
    },
    {
      id: nextId("ex"),
      name: "Overhead Press",
      muscleGroup: "Shoulders",
      equipment: "Barbell",
      sets: 4,
      reps: "8-10",
      weight: "45 kg",
      rest: "90 sec",
      tempo: "2-0-2",
      rpe: "8",
    },
    {
      id: nextId("ex"),
      name: "Incline Dumbbell Press",
      muscleGroup: "Chest",
      equipment: "Dumbbell",
      sets: 3,
      reps: "10-12",
      weight: "24 kg",
      rest: "75 sec",
      tempo: "2-1-2",
      rpe: "7-8",
    },
    {
      id: nextId("ex"),
      name: "Lateral Raise",
      muscleGroup: "Shoulders",
      equipment: "Dumbbell",
      sets: 3,
      reps: "12-15",
      weight: "10 kg",
      rest: "60 sec",
      tempo: "2-1-2",
      rpe: "7",
    },
    {
      id: nextId("ex"),
      name: "Tricep Pushdown",
      muscleGroup: "Triceps",
      equipment: "Cable",
      sets: 3,
      reps: "10-12",
      weight: "25 kg",
      rest: "60 sec",
      tempo: "2-0-2",
      rpe: "7",
    },
  ];
}

function buildLegDayExercises(): Exercise[] {
  return [
    {
      id: nextId("ex"),
      name: "Squat",
      muscleGroup: "Legs",
      equipment: "Barbell",
      sets: 4,
      reps: "6-8",
      weight: "110 kg",
      rest: "120 sec",
      tempo: "2-0-2",
      rpe: "9",
    },
    {
      id: nextId("ex"),
      name: "Romanian Deadlift",
      muscleGroup: "Legs",
      equipment: "Barbell",
      sets: 4,
      reps: "8-10",
      weight: "90 kg",
      rest: "90 sec",
      tempo: "2-1-2",
      rpe: "8",
    },
    {
      id: nextId("ex"),
      name: "Plank",
      muscleGroup: "Core",
      equipment: "Bodyweight",
      sets: 3,
      reps: "45 sec",
      weight: "Bodyweight",
      rest: "45 sec",
      tempo: "Controlled",
      rpe: "6",
    },
  ];
}

const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "tpl-pull-day",
    name: "Pull Day",
    type: "Strength",
    difficulty: "Intermediate",
    primaryGoal: "Back & Bicep Strength",
    targetMuscles: "Back, Biceps, Rear Delts",
    exerciseCount: 8,
    durationMinutes: 60,
    exercises: buildPullDayExercises(),
  },
  {
    id: "tpl-push-day",
    name: "Push Day",
    type: "Hypertrophy",
    difficulty: "Intermediate",
    primaryGoal: "Chest & Shoulder Hypertrophy",
    targetMuscles: "Chest, Shoulders, Triceps",
    exerciseCount: 5,
    durationMinutes: 50,
    exercises: buildPushDayExercises(),
  },
  {
    id: "tpl-leg-day",
    name: "Leg Day – Foundation",
    type: "Strength",
    difficulty: "Beginner",
    primaryGoal: "Lower Body Strength",
    targetMuscles: "Legs, Core",
    exerciseCount: 3,
    durationMinutes: 40,
    exercises: buildLegDayExercises(),
  },
];

const MEMBERS: Member[] = [
  { id: "mem-aman", name: "Aman Verma", plan: "Premium Plan", initials: "AV" },
  { id: "mem-priya", name: "Priya Nair", plan: "Elite Plan", initials: "PN" },
  {
    id: "mem-rohan",
    name: "Rohan Gupta",
    plan: "Standard Plan",
    initials: "RG",
  },
  { id: "mem-sara", name: "Sara Khan", plan: "Premium Plan", initials: "SK" },
];

const INITIAL_SESSION_DETAILS: SessionDetails = {
  name: "Pull Day – Strength Focus",
  templateId: "tpl-pull-day",
  memberId: "mem-aman",
  date: "2026-07-22",
  startTime: "07:00",
  endTime: "08:00",
  sessionType: "Strength",
  location: "Main Floor",
  notes: "",
};

const INITIAL_SETTINGS: SessionSettings = {
  restTimer: "Show Timer",
  defaultRestSeconds: "60 sec",
  rpeTracking: "Enable",
  reminder: "15 minutes",
};

const EDITING_TIPS: string[] = [
  "Place compound exercises first.",
  "Balance workout volume.",
  "Adjust weights to member ability.",
  "Track RPE consistently.",
  "Keep realistic rest intervals.",
];

// ============================================================================
// Helper Functions
// ============================================================================

function estimateVolume(exercises: Exercise[]): VolumeLevel {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  if (totalSets >= 24) return "High";
  if (totalSets >= 14) return "Medium";
  return "Low";
}

function totalSets(exercises: Exercise[]): number {
  return exercises.reduce((sum, ex) => sum + ex.sets, 0);
}

function getFocusMuscles(exercises: Exercise[]): string {
  const unique = Array.from(new Set(exercises.map((e) => e.muscleGroup)));
  return unique.length > 0 ? unique.join(", ") : "—";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTimeRange(start: string, end: string): string {
  if (!start || !end) return "—";
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
}

function durationMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

// ============================================================================
// Reusable Components
// ============================================================================

function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? (
            <CardDescription className="mt-0.5">{description}</CardDescription>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Label className="text-sm font-medium text-foreground">
      {children}
      {required ? <span className="ml-0.5 text-destructive">*</span> : null}
    </Label>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
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
        className="flex h-full w-7 shrink-0 items-center justify-center rounded-l-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        className="flex h-full w-7 shrink-0 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
  width = "w-[100px]",
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  ariaLabel: string;
  width?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={ariaLabel} className={cn("h-9", width)}>
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

function TemplateCombobox({
  templates,
  value,
  onSelect,
}: {
  templates: WorkoutTemplate[];
  value: string | null;
  onSelect: (templateId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = templates.find((t) => t.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto w-full justify-between px-3 py-2 text-left font-normal"
        >
          {selected ? (
            <span className="flex flex-1 flex-col items-start gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {selected.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {selected.type} · {selected.exerciseCount} Exercises ·{" "}
                {selected.durationMinutes} Minutes
              </span>
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Select a workout template
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search templates..." />
          <CommandList>
            <CommandEmpty>No templates found.</CommandEmpty>
            <CommandGroup>
              {templates.map((template) => (
                <CommandItem
                  key={template.id}
                  value={template.name}
                  onSelect={() => {
                    onSelect(template.id);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{template.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {template.type} · {template.exerciseCount} Exercises ·{" "}
                      {template.durationMinutes} Minutes
                    </span>
                  </span>
                  {template.id === value ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function MemberCombobox({
  members,
  value,
  onSelect,
}: {
  members: Member[];
  value: string | null;
  onSelect: (memberId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = members.find((m) => m.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto w-full justify-between px-3 py-2 text-left font-normal"
        >
          {selected ? (
            <span className="flex flex-1 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {selected.initials}
              </span>
              <span className="flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">
                  {selected.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selected.plan}
                </span>
              </span>
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Select a member
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              {members.map((member) => (
                <CommandItem
                  key={member.id}
                  value={member.name}
                  onSelect={() => {
                    onSelect(member.id);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {member.initials}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{member.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {member.plan}
                      </span>
                    </span>
                  </span>
                  {member.id === value ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---- Exercise Table Row (Desktop) ----

function ExerciseTableRow({
  exercise,
  index,
  showAdvanced,
  onChange,
  onDuplicate,
  onDelete,
  dragHandlers,
  isDragging,
}: {
  exercise: Exercise;
  index: number;
  showAdvanced: boolean;
  onChange: (id: string, patch: Partial<Exercise>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  dragHandlers: {
    onDragStart: () => void;
    onDragEnter: () => void;
    onDragEnd: () => void;
  };
  isDragging: boolean;
}) {
  return (
    <TableRow
      className={cn("align-middle", isDragging && "bg-muted/60 opacity-60")}
      draggable
      onDragStart={dragHandlers.onDragStart}
      onDragEnter={dragHandlers.onDragEnter}
      onDragEnd={dragHandlers.onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <TableCell className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <GripVertical
            className="h-3.5 w-3.5 cursor-grab text-muted-foreground/50 active:cursor-grabbing"
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
          onChange={(value) => onChange(exercise.id, { sets: value })}
        />
      </TableCell>
      <TableCell>
        <Input
          value={exercise.reps}
          aria-label={`Reps for ${exercise.name}`}
          className="h-9 w-[76px]"
          onChange={(e) => onChange(exercise.id, { reps: e.target.value })}
        />
      </TableCell>
      <TableCell>
        <Input
          value={exercise.weight}
          aria-label={`Weight for ${exercise.name}`}
          className="h-9 w-[100px]"
          onChange={(e) => onChange(exercise.id, { weight: e.target.value })}
        />
      </TableCell>
      <TableCell>
        <EditableSelect
          value={exercise.rest}
          options={REST_OPTIONS}
          ariaLabel={`Rest for ${exercise.name}`}
          onChange={(value) => onChange(exercise.id, { rest: value })}
        />
      </TableCell>
      {showAdvanced && (
        <TableCell>
          <EditableSelect
            value={exercise.tempo}
            options={TEMPO_OPTIONS}
            ariaLabel={`Tempo for ${exercise.name}`}
            onChange={(value) => onChange(exercise.id, { tempo: value })}
          />
        </TableCell>
      )}
      {showAdvanced && (
        <TableCell>
          <EditableSelect
            value={exercise.rpe}
            options={RPE_OPTIONS}
            ariaLabel={`RPE for ${exercise.name}`}
            onChange={(value) => onChange(exercise.id, { rpe: value })}
            width="w-[90px]"
          />
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => onDuplicate(exercise.id)}
                  aria-label={`Duplicate ${exercise.name}`}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate exercise</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(exercise.id)}
                  aria-label={`Remove ${exercise.name}`}
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

// ---- Exercise Mobile Card ----

function ExerciseMobileCard({
  exercise,
  index,
  onChange,
  onDuplicate,
  onDelete,
}: {
  exercise: Exercise;
  index: number;
  onChange: (id: string, patch: Partial<Exercise>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
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
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => onDuplicate(exercise.id)}
            aria-label={`Duplicate ${exercise.name}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(exercise.id)}
            aria-label={`Remove ${exercise.name}`}
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
            onChange={(value) => onChange(exercise.id, { sets: value })}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Reps</p>
          <Input
            value={exercise.reps}
            aria-label={`Reps for ${exercise.name}`}
            className="h-9"
            onChange={(e) => onChange(exercise.id, { reps: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Weight</p>
          <Input
            value={exercise.weight}
            aria-label={`Weight for ${exercise.name}`}
            className="h-9"
            onChange={(e) => onChange(exercise.id, { weight: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Rest</p>
          <EditableSelect
            value={exercise.rest}
            options={REST_OPTIONS}
            ariaLabel={`Rest for ${exercise.name}`}
            onChange={(value) => onChange(exercise.id, { rest: value })}
            width="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Tempo</p>
          <EditableSelect
            value={exercise.tempo}
            options={TEMPO_OPTIONS}
            ariaLabel={`Tempo for ${exercise.name}`}
            onChange={(value) => onChange(exercise.id, { tempo: value })}
            width="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">RPE</p>
          <EditableSelect
            value={exercise.rpe}
            options={RPE_OPTIONS}
            ariaLabel={`RPE for ${exercise.name}`}
            onChange={(value) => onChange(exercise.id, { rpe: value })}
            width="w-full"
          />
        </div>
      </div>
    </div>
  );
}

function EmptyTemplateState({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ClipboardList className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">
        No Workout Template Selected
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Choose a workout template to automatically populate the exercise list.
      </p>
      <Button className="mt-5" onClick={onSelect}>
        Select Template
      </Button>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function EditTrainingSessionPage() {
  const [details, setDetails] = useState<SessionDetails>(
    INITIAL_SESSION_DETAILS,
  );
  const [exercises, setExercises] = useState<Exercise[]>(
    buildPullDayExercises(),
  );
  const [settings, setSettings] = useState<SessionSettings>(INITIAL_SETTINGS);
  const [templateBanner, setTemplateBanner] = useState<string | null>(
    "8 exercises loaded from Pull Day template.",
  );
  const [showAdvancedColumns, setShowAdvancedColumns] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const selectedTemplate = useMemo(
    () => WORKOUT_TEMPLATES.find((t) => t.id === details.templateId) ?? null,
    [details.templateId],
  );

  const selectedMember = useMemo(
    () => MEMBERS.find((m) => m.id === details.memberId) ?? null,
    [details.memberId],
  );

  const sessionDurationMinutes = durationMinutes(
    details.startTime,
    details.endTime,
  );
  const volume = useMemo(() => estimateVolume(exercises), [exercises]);
  const setsCount = useMemo(() => totalSets(exercises), [exercises]);
  const focusMuscles = useMemo(() => getFocusMuscles(exercises), [exercises]);

  const availableLibraryExercises = useMemo(
    () =>
      EXERCISE_LIBRARY.filter(
        (libEx) => !exercises.some((ex) => ex.name === libEx.name),
      ),
    [exercises],
  );

  // ---- Handlers ----

  function handleTemplateSelect(templateId: string) {
    const template = WORKOUT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setDetails((prev) => ({ ...prev, templateId }));
    setExercises(template.exercises.map((ex) => ({ ...ex, id: nextId("ex") })));
    setTemplateBanner(
      `${template.exerciseCount} exercises loaded from ${template.name} template.`,
    );
  }

  function handleExerciseChange(id: string, patch: Partial<Exercise>) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)),
    );
  }

  function handleDuplicateExercise(id: string) {
    setExercises((prev) => {
      const index = prev.findIndex((ex) => ex.id === id);
      if (index === -1) return prev;
      const copy: Exercise = { ...prev[index], id: nextId("ex") };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  }

  function handleDeleteExercise(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }

  function handleAddExercise(item: ExerciseLibraryItem) {
    setExercises((prev) => [
      ...prev,
      {
        id: nextId("ex"),
        name: item.name,
        muscleGroup: item.muscleGroup,
        equipment: item.equipment,
        sets: 3,
        reps: "10-12",
        weight: "—",
        rest: "60 sec",
        tempo: "2-0-2",
        rpe: "7-8",
      },
    ]);
    setAddExerciseOpen(false);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }
  function handleDragEnter(index: number) {
    if (index !== dragIndex) setOverIndex(index);
  }
  function handleDragEnd() {
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      setExercises((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(overIndex, 0, moved);
        return next;
      });
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Edit Training Session
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Update session details, assigned template, exercises, and workout
              settings.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Session Details Card */}
            <Card>
              <CardHeader>
                <SectionHeader
                  icon={ClipboardList}
                  title="Session Details"
                  description="Configure the session information and assign a workout template."
                />
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <FieldLabel required>Session Name</FieldLabel>
                    <Input
                      value={details.name}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g. Pull Day – Strength Focus"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel required>Workout Template</FieldLabel>
                    <TemplateCombobox
                      templates={WORKOUT_TEMPLATES}
                      value={details.templateId}
                      onSelect={handleTemplateSelect}
                    />
                    {templateBanner ? (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {templateBanner}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel required>Member</FieldLabel>
                    <MemberCombobox
                      members={MEMBERS}
                      value={details.memberId}
                      onSelect={(memberId) =>
                        setDetails((prev) => ({ ...prev, memberId }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel required>Session Date</FieldLabel>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        value={details.date}
                        onChange={(e) =>
                          setDetails((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel required>Session Type</FieldLabel>
                    <Select
                      value={details.sessionType}
                      onValueChange={(val) =>
                        setDetails((prev) => ({
                          ...prev,
                          sessionType: val as SessionType,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel required>Start Time</FieldLabel>
                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="time"
                        value={details.startTime}
                        onChange={(e) =>
                          setDetails((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel required>End Time</FieldLabel>
                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="time"
                        value={details.endTime}
                        onChange={(e) =>
                          setDetails((prev) => ({
                            ...prev,
                            endTime: e.target.value,
                          }))
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>Location (Optional)</FieldLabel>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={details.location}
                        onChange={(e) =>
                          setDetails((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="e.g. Main Floor"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <FieldLabel>Notes (Optional)</FieldLabel>
                    <div className="relative">
                      <Textarea
                        value={details.notes}
                        maxLength={250}
                        onChange={(e) =>
                          setDetails((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Add any notes for this training session..."
                        rows={3}
                        className="resize-none"
                      />
                      <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground">
                        {details.notes.length} / 250
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exercises Card */}
            <Card>
              <CardHeader>
                <SectionHeader
                  icon={Dumbbell}
                  title="Exercises in This Session"
                  description="Exercises are loaded from the selected template and can be customized."
                  action={
                    selectedTemplate ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdvancedColumns((prev) => !prev)}
                      >
                        <Settings2 className="mr-2 h-3.5 w-3.5" />
                        {showAdvancedColumns ? "Hide" : "Customize"} Exercises
                      </Button>
                    ) : null
                  }
                />
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedTemplate ? (
                  <EmptyTemplateState
                    onSelect={() =>
                      handleTemplateSelect(WORKOUT_TEMPLATES[0].id)
                    }
                  />
                ) : (
                  <>
                    <Alert className="border-primary/20 bg-primary/5">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertTitle className="text-sm font-medium">
                        Template-loaded exercises
                      </AlertTitle>
                      <AlertDescription className="text-xs text-muted-foreground">
                        Exercises below are automatically loaded from the
                        selected template. You may customize them before saving.
                      </AlertDescription>
                    </Alert>

                    {/* Desktop table */}
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
                            {showAdvancedColumns && (
                              <TableHead>Tempo</TableHead>
                            )}
                            {showAdvancedColumns && <TableHead>RPE</TableHead>}
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercises.map((exercise, index) => (
                            <ExerciseTableRow
                              key={exercise.id}
                              exercise={exercise}
                              index={index}
                              showAdvanced={showAdvancedColumns}
                              onChange={handleExerciseChange}
                              onDuplicate={handleDuplicateExercise}
                              onDelete={handleDeleteExercise}
                              isDragging={dragIndex === index}
                              dragHandlers={{
                                onDragStart: () => handleDragStart(index),
                                onDragEnter: () => handleDragEnter(index),
                                onDragEnd: handleDragEnd,
                              }}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                      {exercises.map((exercise, index) => (
                        <ExerciseMobileCard
                          key={exercise.id}
                          exercise={exercise}
                          index={index}
                          onChange={handleExerciseChange}
                          onDuplicate={handleDuplicateExercise}
                          onDelete={handleDeleteExercise}
                        />
                      ))}
                    </div>

                    {/* Add Exercise — inline popover trigger matching new.tsx */}
                    <Popover
                      open={addExerciseOpen}
                      onOpenChange={setAddExerciseOpen}
                    >
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
                              {availableLibraryExercises.map((item) => (
                                <CommandItem
                                  key={item.name}
                                  value={`${item.name} ${item.muscleGroup}`}
                                  onSelect={() => handleAddExercise(item)}
                                >
                                  <div className="flex w-full items-center justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-medium text-foreground">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {item.equipment}
                                      </p>
                                    </div>
                                    <MuscleBadge muscle={item.muscleGroup} />
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <Separator />

                    {/* Exercise Summary Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        {
                          icon: Dumbbell,
                          label: "Exercises",
                          value: `${exercises.length}`,
                        },
                        {
                          icon: Layers,
                          label: "Total Sets",
                          value: `${setsCount}`,
                        },
                        {
                          icon: Clock3,
                          label: "Duration",
                          value: `${sessionDurationMinutes || selectedTemplate.durationMinutes} min`,
                        },
                        {
                          icon: Sparkles,
                          label: "Volume",
                          value: (
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium",
                                VOLUME_STYLES[volume],
                              )}
                            >
                              {volume}
                            </Badge>
                          ),
                        },
                      ].map(({ icon: Icon, label, value }) => (
                        <div
                          key={label}
                          className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {label}
                            </p>
                            <div className="text-sm font-semibold text-foreground">
                              {value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Session Settings Card */}
            <Card>
              <CardHeader>
                <SectionHeader
                  icon={Settings2}
                  title="Session Settings"
                  description="Fine-tune how this session behaves during training."
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <FieldLabel>Rest Timer</FieldLabel>
                    <Select
                      value={settings.restTimer}
                      onValueChange={(val) =>
                        setSettings((prev) => ({
                          ...prev,
                          restTimer: val as RestTimerMode,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Show Timer">Show Timer</SelectItem>
                        <SelectItem value="Hide Timer">Hide Timer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>Default Rest Time</FieldLabel>
                    <Select
                      value={settings.defaultRestSeconds}
                      onValueChange={(val) =>
                        setSettings((prev) => ({
                          ...prev,
                          defaultRestSeconds: val,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["30 sec", "45 sec", "60 sec", "75 sec", "90 sec"].map(
                          (sec) => (
                            <SelectItem key={sec} value={sec}>
                              {sec}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>RPE Tracking</FieldLabel>
                    <Select
                      value={settings.rpeTracking}
                      onValueChange={(val) =>
                        setSettings((prev) => ({
                          ...prev,
                          rpeTracking: val as RpeTrackingMode,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Enable">Enable</SelectItem>
                        <SelectItem value="Disable">Disable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>Session Reminder</FieldLabel>
                    <div className="relative">
                      <Bell className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Select
                        value={settings.reminder}
                        onValueChange={(val) =>
                          setSettings((prev) => ({
                            ...prev,
                            reminder: val as ReminderOption,
                          }))
                        }
                      >
                        <SelectTrigger className="pl-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REMINDER_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt === "None" ? "No reminder" : `${opt} before`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Summary */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Session Summary
                </h2>
              </div>
              <div className="mt-5 space-y-4">
                <SummaryRow
                  icon={Layers}
                  label="Template"
                  value={selectedTemplate?.name ?? "Not selected"}
                />
                <SummaryRow
                  icon={User}
                  label="Member"
                  value={selectedMember?.name ?? "Not selected"}
                />
                <SummaryRow
                  icon={Calendar}
                  label="Date"
                  value={formatDate(details.date)}
                />
                <SummaryRow
                  icon={Clock3}
                  label="Time"
                  value={formatTimeRange(details.startTime, details.endTime)}
                />
                <SummaryRow
                  icon={Timer}
                  label="Duration"
                  value={`${sessionDurationMinutes || 0} min`}
                />
                <SummaryRow
                  icon={Target}
                  label="Type"
                  value={details.sessionType}
                />
                <SummaryRow
                  icon={MapPin}
                  label="Location"
                  value={details.location || "—"}
                />
                <SummaryRow
                  icon={CheckCircle2}
                  label="Status"
                  value={
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Scheduled
                    </span>
                  }
                />

                <Separator />

                <SummaryRow
                  icon={Dumbbell}
                  label="Exercises"
                  value={`${exercises.length}`}
                />
                <SummaryRow
                  icon={Layers}
                  label="Total Sets"
                  value={`${setsCount}`}
                />
                <SummaryRow
                  icon={Sparkles}
                  label="Estimated Volume"
                  value={
                    <Badge
                      variant="outline"
                      className={cn("font-medium", VOLUME_STYLES[volume])}
                    >
                      {volume}
                    </Badge>
                  }
                />
                <SummaryRow
                  icon={Target}
                  label="Focus Muscles"
                  value={focusMuscles}
                />
              </div>
            </div>

            {/* Template Information */}
            {selectedTemplate ? (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Template Information
                  </h2>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="flex h-24 items-center justify-center rounded-xl bg-primary/5">
                    <Dumbbell className="h-8 w-8 text-primary/40" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedTemplate.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTemplate.type} · {selectedTemplate.difficulty}
                    </p>
                  </div>
                  <SummaryRow
                    icon={Target}
                    label="Primary Goal"
                    value={selectedTemplate.primaryGoal}
                  />
                  <SummaryRow
                    icon={Users}
                    label="Target Muscles"
                    value={selectedTemplate.targetMuscles}
                  />
                  <SummaryRow
                    icon={Dumbbell}
                    label="Exercise Count"
                    value={`${selectedTemplate.exerciseCount}`}
                  />
                  <SummaryRow
                    icon={Clock3}
                    label="Estimated Duration"
                    value={`${selectedTemplate.durationMinutes} min`}
                  />
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View Template
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Editing Tips */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Editing Tips
                </h2>
              </div>
              <ul className="mt-4 space-y-2.5">
                {EDITING_TIPS.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Quick Actions
                </h2>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Duplicate Session
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Assign Homework
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Separator />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Session
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
