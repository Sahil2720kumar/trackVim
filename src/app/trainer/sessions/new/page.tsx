"use client";

// ============================================================================
// Imports
// ============================================================================
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Clock3,
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
  ChevronsUpDown,
  Check,
  GripVertical,
  MapPin,
  Eye,
  Gauge,
  Timer,
  Layers,
  Target,
  Lightbulb,
  Sparkles,
  AlertCircle,
  X,
  Save,
  ArrowDownToLine,
  ArrowUpFromLine,
  Footprints,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

type MuscleGroup =
  | "Back"
  | "Biceps"
  | "Triceps"
  | "Chest"
  | "Shoulders"
  | "Rear Delts"
  | "Legs"
  | "Core"
  | "Full Body";

type SessionType =
  | "Strength"
  | "Hypertrophy"
  | "Functional"
  | "Cardio"
  | "Mobility";

type TemplateStatus = "Active" | "Draft" | "Archived";

type VolumeLevel = "Low" | "Medium" | "High";

interface Member {
  id: string;
  name: string;
  plan: string;
  initials: string;
}

interface LibraryExercise {
  id: string;
  name: string;
  equipment: string;
  muscleGroup: MuscleGroup;
}

interface SessionExercise extends LibraryExercise {
  rowId: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  tempo: string;
  rpe: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  category: string;
  status: TemplateStatus;
  description: string;
  durationMinutes: number;
  targetMuscles: MuscleGroup[];
  exercises: SessionExercise[];
}

interface ComboboxOption {
  id: string;
}

interface SearchableComboboxProps<T extends ComboboxOption> {
  id?: string;
  items: T[];
  value: T | null;
  onChange: (item: T) => void;
  getSearchText: (item: T) => string;
  renderTrigger: (item: T | null) => ReactNode;
  renderItem: (item: T, isSelected: boolean) => ReactNode;
  placeholder: string;
  emptyText: string;
  triggerAriaLabel: string;
  invalid?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SESSION_TYPES: SessionType[] = [
  "Strength",
  "Hypertrophy",
  "Functional",
  "Cardio",
  "Mobility",
];

const REST_OPTIONS = [
  "30 sec",
  "45 sec",
  "60 sec",
  "75 sec",
  "90 sec",
  "120 sec",
];
const TEMPO_OPTIONS = [
  "2-0-2-0",
  "3-1-1-0",
  "3-0-3-0",
  "4-0-1-0",
  "Controlled",
];
const RPE_OPTIONS = ["6", "6-7", "7", "7-8", "8", "8-9", "9", "9-10"];
const DEFAULT_REST_OPTIONS = ["30 sec", "45 sec", "60 sec", "75 sec", "90 sec"];
const REMINDER_OPTIONS = [
  "No reminder",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
];
const TIME_PATTERN = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i;

const MUSCLE_GROUP_STYLES: Record<MuscleGroup, string> = {
  Back: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  Biceps:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  Triceps:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Chest:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  Shoulders:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  "Rear Delts":
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  Legs: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  Core: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  "Full Body":
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/20",
};

const VOLUME_STYLES: Record<VolumeLevel, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  High: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
};

// One distinct lucide icon per template so the picker is scannable at a glance.
const TEMPLATE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "tpl-pull": ArrowDownToLine,
  "tpl-push": ArrowUpFromLine,
  "tpl-legs": Footprints,
  "tpl-mobility": Wind,
};

function getTemplateIcon(templateId: string) {
  return TEMPLATE_ICONS[templateId] ?? Dumbbell;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_MEMBERS: Member[] = [
  { id: "mem-1", name: "Aman Verma", plan: "Premium Plan", initials: "AV" },
  { id: "mem-2", name: "Priya Sharma", plan: "Elite Plan", initials: "PS" },
  { id: "mem-3", name: "Rahul Bora", plan: "Standard Plan", initials: "RB" },
  { id: "mem-4", name: "Neha Kalita", plan: "Premium Plan", initials: "NK" },
  { id: "mem-5", name: "Vikram Das", plan: "Elite Plan", initials: "VD" },
];

const PULL_DAY_EXERCISES: SessionExercise[] = [
  {
    rowId: "ex-1",
    id: "lib-deadlift",
    name: "Deadlift",
    equipment: "Barbell",
    muscleGroup: "Back",
    sets: 4,
    reps: "6-8",
    weight: "100 kg",
    rest: "120 sec",
    tempo: "3-1-1-0",
    rpe: "8-9",
  },
  {
    rowId: "ex-2",
    id: "lib-pullup",
    name: "Pull Up",
    equipment: "Bodyweight",
    muscleGroup: "Back",
    sets: 4,
    reps: "8-10",
    weight: "Bodyweight",
    rest: "90 sec",
    tempo: "2-0-2-0",
    rpe: "8",
  },
  {
    rowId: "ex-3",
    id: "lib-bent-row",
    name: "Bent Over Row",
    equipment: "Barbell",
    muscleGroup: "Back",
    sets: 4,
    reps: "8-10",
    weight: "70 kg",
    rest: "90 sec",
    tempo: "3-0-2-0",
    rpe: "8",
  },
  {
    rowId: "ex-4",
    id: "lib-lat-pulldown",
    name: "Lat Pulldown",
    equipment: "Cable",
    muscleGroup: "Back",
    sets: 3,
    reps: "10-12",
    weight: "60 kg",
    rest: "75 sec",
    tempo: "2-0-2-0",
    rpe: "7-8",
  },
  {
    rowId: "ex-5",
    id: "lib-seated-row",
    name: "Seated Cable Row",
    equipment: "Cable",
    muscleGroup: "Back",
    sets: 3,
    reps: "10-12",
    weight: "55 kg",
    rest: "75 sec",
    tempo: "2-0-2-0",
    rpe: "7-8",
  },
  {
    rowId: "ex-6",
    id: "lib-face-pull",
    name: "Face Pull",
    equipment: "Rope",
    muscleGroup: "Rear Delts",
    sets: 3,
    reps: "12-15",
    weight: "20 kg",
    rest: "60 sec",
    tempo: "2-0-2-0",
    rpe: "7",
  },
  {
    rowId: "ex-7",
    id: "lib-barbell-curl",
    name: "Barbell Curl",
    equipment: "Barbell",
    muscleGroup: "Biceps",
    sets: 3,
    reps: "8-12",
    weight: "30 kg",
    rest: "60 sec",
    tempo: "2-0-2-0",
    rpe: "8",
  },
  {
    rowId: "ex-8",
    id: "lib-hammer-curl",
    name: "Hammer Curl",
    equipment: "Dumbbell",
    muscleGroup: "Biceps",
    sets: 3,
    reps: "10-12",
    weight: "12.5 kg",
    rest: "60 sec",
    tempo: "2-0-2-0",
    rpe: "7-8",
  },
];

const PUSH_DAY_EXERCISES: SessionExercise[] = [
  {
    rowId: "ex-9",
    id: "lib-bench",
    name: "Barbell Bench Press",
    equipment: "Barbell",
    muscleGroup: "Chest",
    sets: 4,
    reps: "6-8",
    weight: "80 kg",
    rest: "120 sec",
    tempo: "3-1-1-0",
    rpe: "8-9",
  },
  {
    rowId: "ex-10",
    id: "lib-ohp",
    name: "Overhead Press",
    equipment: "Barbell",
    muscleGroup: "Shoulders",
    sets: 4,
    reps: "8-10",
    weight: "45 kg",
    rest: "90 sec",
    tempo: "2-0-2-0",
    rpe: "8",
  },
  {
    rowId: "ex-11",
    id: "lib-incline-db",
    name: "Incline Dumbbell Press",
    equipment: "Dumbbell",
    muscleGroup: "Chest",
    sets: 3,
    reps: "10-12",
    weight: "26 kg",
    rest: "75 sec",
    tempo: "2-0-2-0",
    rpe: "7-8",
  },
  {
    rowId: "ex-12",
    id: "lib-lateral-raise",
    name: "Lateral Raise",
    equipment: "Dumbbell",
    muscleGroup: "Shoulders",
    sets: 3,
    reps: "12-15",
    weight: "10 kg",
    rest: "60 sec",
    tempo: "2-0-2-0",
    rpe: "7",
  },
  {
    rowId: "ex-13",
    id: "lib-tricep-pushdown",
    name: "Tricep Pushdown",
    equipment: "Cable",
    muscleGroup: "Triceps",
    sets: 3,
    reps: "10-12",
    weight: "25 kg",
    rest: "60 sec",
    tempo: "2-0-2-0",
    rpe: "8",
  },
  {
    rowId: "ex-14",
    id: "lib-dips",
    name: "Dips",
    equipment: "Bodyweight",
    muscleGroup: "Triceps",
    sets: 3,
    reps: "8-10",
    weight: "Bodyweight",
    rest: "75 sec",
    tempo: "2-0-2-0",
    rpe: "8",
  },
];

const LEG_DAY_EXERCISES: SessionExercise[] = [
  {
    rowId: "ex-15",
    id: "lib-squat",
    name: "Back Squat",
    equipment: "Barbell",
    muscleGroup: "Legs",
    sets: 4,
    reps: "6-8",
    weight: "110 kg",
    rest: "150 sec",
    tempo: "3-1-1-0",
    rpe: "9",
  },
  {
    rowId: "ex-16",
    id: "lib-rdl",
    name: "Romanian Deadlift",
    equipment: "Barbell",
    muscleGroup: "Legs",
    sets: 4,
    reps: "8-10",
    weight: "85 kg",
    rest: "120 sec",
    tempo: "3-0-2-0",
    rpe: "8",
  },
  {
    rowId: "ex-17",
    id: "lib-leg-press",
    name: "Leg Press",
    equipment: "Machine",
    muscleGroup: "Legs",
    sets: 3,
    reps: "10-12",
    weight: "180 kg",
    rest: "90 sec",
    tempo: "2-0-2-0",
    rpe: "8",
  },
  {
    rowId: "ex-18",
    id: "lib-leg-curl",
    name: "Seated Leg Curl",
    equipment: "Machine",
    muscleGroup: "Legs",
    sets: 3,
    reps: "10-12",
    weight: "40 kg",
    rest: "75 sec",
    tempo: "2-0-2-0",
    rpe: "7-8",
  },
  {
    rowId: "ex-19",
    id: "lib-calf-raise",
    name: "Standing Calf Raise",
    equipment: "Machine",
    muscleGroup: "Legs",
    sets: 4,
    reps: "12-15",
    weight: "70 kg",
    rest: "60 sec",
    tempo: "2-0-2-0",
    rpe: "8",
  },
];

const MOCK_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "tpl-pull",
    name: "Pull Day",
    category: "Strength Training",
    status: "Active",
    description:
      "Target the back, biceps, and rear delts with compound and isolation pulling movements.",
    durationMinutes: 60,
    targetMuscles: ["Back", "Biceps", "Rear Delts"],
    exercises: PULL_DAY_EXERCISES,
  },
  {
    id: "tpl-push",
    name: "Push Day",
    category: "Strength Training",
    status: "Active",
    description:
      "Build pressing strength across the chest, shoulders, and triceps.",
    durationMinutes: 55,
    targetMuscles: ["Chest", "Shoulders", "Triceps"],
    exercises: PUSH_DAY_EXERCISES,
  },
  {
    id: "tpl-legs",
    name: "Leg Day – Power Focus",
    category: "Strength Training",
    status: "Active",
    description:
      "Heavy compound lower-body work for maximum strength development.",
    durationMinutes: 65,
    targetMuscles: ["Legs"],
    exercises: LEG_DAY_EXERCISES,
  },
  {
    id: "tpl-mobility",
    name: "Recovery & Mobility Flow",
    category: "Mobility",
    status: "Draft",
    description: "Light mobility circuit for active recovery days.",
    durationMinutes: 30,
    targetMuscles: ["Full Body", "Core"],
    exercises: [],
  },
];

const EXERCISE_LIBRARY: LibraryExercise[] = [
  ...PULL_DAY_EXERCISES,
  ...PUSH_DAY_EXERCISES,
  ...LEG_DAY_EXERCISES,
  {
    id: "lib-plank",
    name: "Plank",
    equipment: "Bodyweight",
    muscleGroup: "Core",
  },
  {
    id: "lib-farmer-carry",
    name: "Farmer's Carry",
    equipment: "Dumbbell",
    muscleGroup: "Full Body",
  },
].filter(
  (exercise, index, all) =>
    all.findIndex((candidate) => candidate.id === exercise.id) === index,
);

// ============================================================================
// Validation Schema
// ============================================================================

const sessionFormSchema = z
  .object({
    sessionName: z
      .string()
      .trim()
      .min(3, "Session name must be at least 3 characters")
      .max(80, "Session name must be under 80 characters"),
    templateId: z.string().min(1, "Please select a workout template"),
    memberId: z.string().min(1, "Please select a member"),
    sessionDate: z.string().min(1, "Session date is required"),
    startTime: z
      .string()
      .min(1, "Start time is required")
      .regex(TIME_PATTERN, "Use the format hh:mm AM/PM"),
    endTime: z
      .string()
      .min(1, "End time is required")
      .regex(TIME_PATTERN, "Use the format hh:mm AM/PM"),
    sessionType: z.enum(SESSION_TYPES as [SessionType, ...SessionType[]]),
    location: z
      .string()
      .max(100, "Location must be under 100 characters")
      .optional(),
    notes: z.string().max(250, "Notes must be under 250 characters").optional(),
    restTimer: z.enum(["Show Timer", "Hide Timer"]),
    defaultRestTime: z.string().min(1),
    rpeTracking: z.enum(["Enable", "Disable"]),
    reminder: z.string().min(1),
  })
  .refine(
    (data) => {
      const toMinutes = (time: string) => {
        const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
        if (!match) return null;
        let hours = parseInt(match[1], 10) % 12;
        const minutes = parseInt(match[2], 10);
        if (match[3].toUpperCase() === "PM") hours += 12;
        return hours * 60 + minutes;
      };
      const start = toMinutes(data.startTime);
      const end = toMinutes(data.endTime);
      if (start === null || end === null) return true;
      return end > start;
    },
    { message: "End time must be after start time", path: ["endTime"] },
  );

type SessionFormValues = z.infer<typeof sessionFormSchema>;

const DEFAULT_FORM_VALUES: SessionFormValues = {
  sessionName: "",
  templateId: "",
  memberId: MOCK_MEMBERS[0].id,
  sessionDate: "2026-07-22",
  startTime: "07:00 AM",
  endTime: "08:00 AM",
  sessionType: "Strength",
  location: "",
  notes: "",
  restTimer: "Show Timer",
  defaultRestTime: "60 sec",
  rpeTracking: "Enable",
  reminder: "15 minutes before",
};

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function createRowId(): string {
  return `row-${Math.random().toString(36).slice(2, 10)}`;
}

function calculateTotalSets(exercises: SessionExercise[]): number {
  return exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
}

function estimateVolume(exercises: SessionExercise[]): VolumeLevel {
  const totalSets = calculateTotalSets(exercises);
  if (totalSets >= 24) return "High";
  if (totalSets >= 14) return "Medium";
  return "Low";
}

function getFocusMuscles(exercises: SessionExercise[]): string {
  const unique = Array.from(new Set(exercises.map((e) => e.muscleGroup)));
  return unique.length > 0 ? unique.join(", ") : "—";
}

function formatDuration(start: string, end: string): string {
  const toMinutes = (time: string): number | null => {
    const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10) % 12;
    const minutes = parseInt(match[2], 10);
    if (match[3].toUpperCase() === "PM") hours += 12;
    return hours * 60 + minutes;
  };
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  if (startMinutes === null || endMinutes === null) return "—";
  const diff = endMinutes - startMinutes;
  if (diff <= 0) return "—";
  return `${diff} min`;
}

function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ============================================================================
// Reusable Components
// ============================================================================

// Shared action-button classes — matches the outline/primary pattern used
// across TrackVim toolbars (icon + label, hidden label on the smallest
// breakpoint, flat enterprise styling with no shadow).
const OUTLINE_BUTTON_CLASSES =
  "inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium text-foreground disabled:pointer-events-none disabled:opacity-50";
const PRIMARY_BUTTON_CLASSES =
  "inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:pointer-events-none disabled:opacity-50";

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

function StatusBadge({ status }: { status: TemplateStatus }) {
  const styles: Record<TemplateStatus, string> = {
    Active:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    Draft: "bg-muted text-muted-foreground border-border",
    Archived: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      {status}
    </Badge>
  );
}

function InfoBanner({ text }: { text: string }) {
  return (
    <Alert className="border-primary/20 bg-primary/5 text-foreground">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-sm text-muted-foreground">
        {text}
      </AlertDescription>
    </Alert>
  );
}

function SuccessMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="h-4 w-4" />
      <span>{text}</span>
    </div>
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

// Generic searchable combobox built on shadcn Popover + Command.
function SearchableCombobox<T extends ComboboxOption>({
  id,
  items,
  value,
  onChange,
  getSearchText,
  renderTrigger,
  renderItem,
  placeholder,
  emptyText,
  triggerAriaLabel,
  invalid,
}: SearchableComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={triggerAriaLabel}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-auto w-full justify-between px-3 py-2 font-normal",
            invalid && "border-destructive focus-visible:ring-destructive",
          )}
        >
          {value ? (
            renderTrigger(value)
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          filter={(itemId, search) => {
            const item = items.find((i) => i.id === itemId);
            if (!item) return 0;
            return getSearchText(item)
              .toLowerCase()
              .includes(search.toLowerCase())
              ? 1
              : 0;
          }}
        >
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="space-y-1 p-1.5">
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  className="rounded-md py-2.5"
                  onSelect={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value?.id === item.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {renderItem(item, value?.id === item.id)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function MemberOptionContent({ member }: { member: Member }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {member.initials}
      </div>
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-medium text-foreground">
          {member.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">{member.plan}</p>
      </div>
    </div>
  );
}

function TemplateOptionContent({ template }: { template: WorkoutTemplate }) {
  const TemplateIcon = getTemplateIcon(template.id);
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <TemplateIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-medium text-foreground">
            {template.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {template.category}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <ClipboardList className="h-3 w-3" />
        {template.exercises.length}
        <span className="mx-1">·</span>
        <Clock3 className="h-3 w-3" />
        {template.durationMinutes}m
      </div>
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
  exercise: SessionExercise;
  index: number;
  showAdvanced: boolean;
  onUpdate: (rowId: string, patch: Partial<SessionExercise>) => void;
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
  exercise: SessionExercise;
  index: number;
  onUpdate: (rowId: string, patch: Partial<SessionExercise>) => void;
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

function EmptyTemplateState({
  onSelectTemplate,
}: {
  onSelectTemplate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ClipboardList className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">
        No Workout Template Selected
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Choose a workout template to automatically load exercises into this
        session.
      </p>
      <button
        type="button"
        className={cn(PRIMARY_BUTTON_CLASSES, "mt-5")}
        onClick={onSelectTemplate}
      >
        <Plus className="h-4 w-4" />
        Select Template
      </button>
    </div>
  );
}

function SessionSummaryCard({
  member,
  template,
  sessionDate,
  startTime,
  endTime,
  sessionType,
  exercises,
}: {
  member: Member | null;
  template: WorkoutTemplate | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  exercises: SessionExercise[];
}) {
  const totalSets = calculateTotalSets(exercises);
  const volume = estimateVolume(exercises);
  const focusMuscles = getFocusMuscles(exercises);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <SectionHeading icon={ClipboardList} title="Session Summary" />
      <div className="mt-5 space-y-4">
        <SummaryRow
          icon={Layers}
          label="Template"
          value={template?.name ?? "Not selected"}
        />
        <SummaryRow
          icon={Users}
          label="Member"
          value={member?.name ?? "Not selected"}
        />
        <SummaryRow
          icon={Calendar}
          label="Date"
          value={formatDisplayDate(sessionDate)}
        />
        <SummaryRow
          icon={Clock3}
          label="Time"
          value={`${startTime} – ${endTime}`}
        />
        <SummaryRow
          icon={Timer}
          label="Duration"
          value={formatDuration(startTime, endTime)}
        />
        <SummaryRow icon={Gauge} label="Type" value={sessionType} />

        <Separator />

        <SummaryRow
          icon={Dumbbell}
          label="Exercises"
          value={exercises.length}
        />
        <SummaryRow icon={Layers} label="Total Sets" value={totalSets} />
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
        <SummaryRow icon={Target} label="Focus Muscles" value={focusMuscles} />
      </div>
    </div>
  );
}

function TemplatePreviewCard({
  template,
  onViewTemplate,
}: {
  template: WorkoutTemplate | null;
  onViewTemplate: () => void;
}) {
  const TemplateIcon = template ? getTemplateIcon(template.id) : Dumbbell;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <SectionHeading icon={Eye} title="Template Preview" />
      {template ? (
        <div className="mt-5 space-y-4">
          <div className="flex h-32 items-center justify-center rounded-xl bg-primary/5">
            <TemplateIcon className="h-10 w-10 text-primary/40" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {template.name}
            </p>
            <StatusBadge status={template.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {template.targetMuscles.map((muscle) => (
              <MuscleBadge key={muscle} muscle={muscle} />
            ))}
          </div>
          <button
            type="button"
            className={cn(OUTLINE_BUTTON_CLASSES, "w-full justify-center")}
            onClick={onViewTemplate}
          >
            <Eye className="h-4 w-4" />
            View Template
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Select a template to preview its details here.
        </p>
      )}
    </div>
  );
}

function TrainerTipsCard() {
  const tips = [
    "Warm up before starting.",
    "Maintain proper form.",
    "Adjust weight if necessary.",
    "Monitor RPE.",
    "Stay hydrated.",
  ];
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
          <Lightbulb className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Tips for a Great Session
        </h2>
      </div>
      <ul className="mt-4 space-y-2.5">
        {tips.map((tip) => (
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
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function CreateTrainingSessionPage() {
  const router = useRouter();

  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [showAdvancedColumns, setShowAdvancedColumns] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [viewTemplateOpen, setViewTemplateOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [exercisesError, setExercisesError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema) as Resolver<SessionFormValues>,
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onBlur",
  });

  const templateId = watch("templateId");
  const memberId = watch("memberId");
  const sessionDate = watch("sessionDate");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const sessionType = watch("sessionType");
  const notesValue = watch("notes") ?? "";

  const selectedTemplate = useMemo(
    () => MOCK_TEMPLATES.find((t) => t.id === templateId) ?? null,
    [templateId],
  );
  const selectedMember = useMemo(
    () => MOCK_MEMBERS.find((m) => m.id === memberId) ?? null,
    [memberId],
  );

  const availableLibraryExercises = useMemo(
    () =>
      EXERCISE_LIBRARY.filter(
        (libEx) => !exercises.some((sessionEx) => sessionEx.id === libEx.id),
      ),
    [exercises],
  );

  function handleSelectTemplate(template: WorkoutTemplate) {
    setValue("templateId", template.id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setExercises(
      template.exercises.map((exercise) => ({
        ...exercise,
        rowId: createRowId(),
      })),
    );
    setExercisesError(null);
    if (!watch("sessionName")) {
      setValue("sessionName", `${template.name} – Strength Focus`, {
        shouldValidate: true,
      });
    }
  }

  function handleUpdateExercise(
    rowId: string,
    patch: Partial<SessionExercise>,
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
      const duplicate: SessionExercise = {
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
    const newExercise: SessionExercise = {
      ...libraryExercise,
      rowId: createRowId(),
      sets: 3,
      reps: "10-12",
      weight: "—",
      rest: "60 sec",
      tempo: "2-0-2-0",
      rpe: "7-8",
    };
    setExercises((prev) => [...prev, newExercise]);
    setExercisesError(null);
    setAddExerciseOpen(false);
  }

  function handleCancel() {
    reset(DEFAULT_FORM_VALUES);
    setExercises([]);
    setShowAdvancedColumns(false);
    setSubmitSuccess(false);
    setExercisesError(null);
    router.back();
  }

  function onSubmit(values: SessionFormValues) {
    if (exercises.length === 0) {
      setExercisesError(
        "Add at least one exercise to this session before creating it.",
      );
      return;
    }
    setExercisesError(null);

    // In a real integration this would POST to the sessions API.
    console.log("Creating training session", { ...values, exercises });

    setSubmitSuccess(true);
    window.setTimeout(() => setSubmitSuccess(false), 4000);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create New Session
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workout template and configure session details. Exercises
            will be added automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={OUTLINE_BUTTON_CLASSES}
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={PRIMARY_BUTTON_CLASSES}
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSubmitting ? "Creating…" : "Create Session"}
            </span>
          </button>
        </div>
      </div>

      {submitSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50 text-foreground dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-sm text-emerald-700 dark:text-emerald-400">
            Session created successfully.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Session Details Card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHeading icon={ClipboardList} title="Session Details" />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="session-name" required>
                  Session Name
                </FieldLabel>
                <Input
                  id="session-name"
                  placeholder="Pull Day – Strength Focus"
                  aria-invalid={!!errors.sessionName || undefined}
                  className={cn(
                    errors.sessionName &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  {...register("sessionName")}
                />
                <FieldError message={errors.sessionName?.message} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="template-select" required>
                  Workout Template
                </FieldLabel>
                <SearchableCombobox
                  id="template-select"
                  items={MOCK_TEMPLATES}
                  value={selectedTemplate}
                  onChange={handleSelectTemplate}
                  getSearchText={(t) => `${t.name} ${t.category}`}
                  placeholder="Select a template"
                  emptyText="No templates found."
                  triggerAriaLabel="Workout Template"
                  invalid={!!errors.templateId}
                  renderTrigger={(t) => <TemplateOptionContent template={t} />}
                  renderItem={(t) => <TemplateOptionContent template={t} />}
                />
                <FieldError message={errors.templateId?.message} />
                {selectedTemplate && !errors.templateId && (
                  <SuccessMessage
                    text={`${selectedTemplate.exercises.length} exercises will be added automatically`}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="member-select" required>
                  Member
                </FieldLabel>
                <SearchableCombobox
                  id="member-select"
                  items={MOCK_MEMBERS}
                  value={selectedMember}
                  onChange={(m) =>
                    setValue("memberId", m.id, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  getSearchText={(m) => `${m.name} ${m.plan}`}
                  placeholder="Select a member"
                  emptyText="No members found."
                  triggerAriaLabel="Member"
                  invalid={!!errors.memberId}
                  renderTrigger={(m) => <MemberOptionContent member={m} />}
                  renderItem={(m) => <MemberOptionContent member={m} />}
                />
                <FieldError message={errors.memberId?.message} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="session-date" required>
                  Session Date
                </FieldLabel>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="session-date"
                    type="date"
                    aria-invalid={!!errors.sessionDate || undefined}
                    className={cn(
                      "pl-9",
                      errors.sessionDate &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    {...register("sessionDate")}
                  />
                </div>
                <FieldError message={errors.sessionDate?.message} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="start-time" required>
                  Start Time
                </FieldLabel>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="start-time"
                    type="text"
                    placeholder="07:00 AM"
                    aria-invalid={!!errors.startTime || undefined}
                    className={cn(
                      "pl-9",
                      errors.startTime &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    {...register("startTime")}
                  />
                </div>
                <FieldError message={errors.startTime?.message} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="end-time" required>
                  End Time
                </FieldLabel>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="end-time"
                    type="text"
                    placeholder="08:00 AM"
                    aria-invalid={!!errors.endTime || undefined}
                    className={cn(
                      "pl-9",
                      errors.endTime &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    {...register("endTime")}
                  />
                </div>
                <FieldError message={errors.endTime?.message} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="session-type">Session Type</FieldLabel>
                <Controller
                  control={control}
                  name="sessionType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="session-type">
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
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="location">Location (Optional)</FieldLabel>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Main Floor"
                    className="pl-9"
                    {...register("location")}
                  />
                </div>
                <FieldError message={errors.location?.message} />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <FieldLabel htmlFor="notes">Notes (Optional)</FieldLabel>
                <div className="relative">
                  <Textarea
                    id="notes"
                    placeholder="Add any notes for this training session..."
                    maxLength={250}
                    className="min-h-[92px] resize-none"
                    {...register("notes")}
                  />
                  <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground">
                    {notesValue.length} / 250
                  </span>
                </div>
                <FieldError message={errors.notes?.message} />
              </div>
            </div>
          </div>

          {/* Exercises Card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHeading
              icon={Dumbbell}
              title="Exercises in This Session"
              subtitle="Automatically loaded from the selected workout template."
              action={
                selectedTemplate && (
                  <button
                    type="button"
                    className={OUTLINE_BUTTON_CLASSES}
                    onClick={() => setShowAdvancedColumns((prev) => !prev)}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    <span>
                      {showAdvancedColumns ? "Hide" : "Customize"} Exercises
                    </span>
                  </button>
                )
              }
            />

            <div className="mt-5 space-y-4">
              {exercisesError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {exercisesError}
                  </AlertDescription>
                </Alert>
              )}

              {selectedTemplate ? (
                <>
                  <InfoBanner text="Exercises are automatically loaded from the selected template. You can customize them before saving." />

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
                          <CommandGroup className="space-y-1 p-1.5">
                            {availableLibraryExercises.map((libEx) => (
                              <CommandItem
                                key={libEx.id}
                                value={`${libEx.name} ${libEx.muscleGroup}`}
                                className="rounded-md py-2.5"
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
                </>
              ) : (
                <EmptyTemplateState
                  onSelectTemplate={() =>
                    document.getElementById("template-select")?.focus()
                  }
                />
              )}
            </div>
          </div>

          {/* Session Settings Card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHeading icon={Settings2} title="Session Settings" />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="rest-timer">Rest Timer</FieldLabel>
                <Controller
                  control={control}
                  name="restTimer"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="rest-timer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Show Timer">Show Timer</SelectItem>
                        <SelectItem value="Hide Timer">Hide Timer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="default-rest">
                  Default Rest Time
                </FieldLabel>
                <Controller
                  control={control}
                  name="defaultRestTime"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="default-rest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_REST_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="rpe-tracking">RPE Tracking</FieldLabel>
                <Controller
                  control={control}
                  name="rpeTracking"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="rpe-tracking">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Enable">Enable</SelectItem>
                        <SelectItem value="Disable">Disable</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-3 sm:max-w-xs">
                <FieldLabel htmlFor="reminder">
                  Session Reminder (Optional)
                </FieldLabel>
                <div className="relative">
                  <Bell className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Controller
                    control={control}
                    name="reminder"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="reminder" className="pl-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REMINDER_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SessionSummaryCard
            member={selectedMember}
            template={selectedTemplate}
            sessionDate={sessionDate}
            startTime={startTime}
            endTime={endTime}
            sessionType={sessionType}
            exercises={exercises}
          />
          <TemplatePreviewCard
            template={selectedTemplate}
            onViewTemplate={() => setViewTemplateOpen(true)}
          />
          <TrainerTipsCard />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          className={OUTLINE_BUTTON_CLASSES}
          onClick={handleCancel}
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Cancel</span>
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={PRIMARY_BUTTON_CLASSES}
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isSubmitting ? "Creating…" : "Create Session"}
          </span>
        </button>
      </div>

      {/* View Template Dialog */}
      <Dialog open={viewTemplateOpen} onOpenChange={setViewTemplateOpen}>
        <DialogContent className="max-w-2xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{selectedTemplate.name}</DialogTitle>
                  <StatusBadge status={selectedTemplate.status} />
                </div>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-1.5">
                {selectedTemplate.targetMuscles.map((muscle) => (
                  <MuscleBadge key={muscle} muscle={muscle} />
                ))}
              </div>

              <div className="max-h-[360px] overflow-y-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exercise</TableHead>
                      <TableHead>Muscle Group</TableHead>
                      <TableHead>Sets</TableHead>
                      <TableHead>Reps</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTemplate.exercises.map((exercise) => (
                      <TableRow key={exercise.rowId}>
                        <TableCell className="text-sm font-medium text-foreground">
                          {exercise.name}
                        </TableCell>
                        <TableCell>
                          <MuscleBadge muscle={exercise.muscleGroup} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {exercise.sets}
                        </TableCell>
                        <TableCell className="text-sm">
                          {exercise.reps}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  className={OUTLINE_BUTTON_CLASSES}
                  onClick={() => setViewTemplateOpen(false)}
                >
                  Close
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </form>
  );
}
