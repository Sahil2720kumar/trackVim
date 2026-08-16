"use client";

import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Clock3,
  Copy,
  Dumbbell,
  GripVertical,
  Trash2,
  ClipboardList,
  Layers,
  Users,
  Calendar,
  Timer,
  Gauge,
  Sparkles,
  Target,
  Eye,
  Lightbulb,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { bigSquareButton } from "@/lib/styles";

/* -----------------------------------------------------------------------
 * Shared training-session building blocks.
 *
 * Styled to match GymFormFields.tsx: rounded-lg bordered inputs with
 * border-border / bg-background / hover:border-border/80 /
 * focus:border-primary + focus:ring-2 focus:ring-primary/20, labels in
 * text-sm font-medium, and errors as text-xs text-destructive with an
 * AlertCircle icon.
 *
 * Every field-like control (FormInput, FormSelect, the combobox trigger,
 * NumberStepper, EditableSelect, and the per-row exercise inputs) shares a
 * single fixed height (h-10) so nothing on the page reads as bigger or
 * smaller than its neighbor.
 *
 * Kept in their own module (not declared inline in a page) so component
 * identity stays stable across renders — declaring these inside a page
 * component is what causes input focus loss on keystroke.
 * --------------------------------------------------------------------- */

// ============================================================================
// Types
// ============================================================================

export type MuscleGroup =
  | "Back"
  | "Biceps"
  | "Triceps"
  | "Chest"
  | "Shoulders"
  | "Rear Delts"
  | "Legs"
  | "Core"
  | "Full Body";

export type SessionType =
  | "Strength"
  | "Hypertrophy"
  | "Functional"
  | "Cardio"
  | "Mobility";

export type TemplateStatus = "Active" | "Draft" | "Archived";

export type VolumeLevel = "Low" | "Medium" | "High";

export interface Member {
  id: string;
  name: string;
  plan: string;
  initials: string;
  photoUrl?: string | null;
}

export interface LibraryExercise {
  id: string;
  name: string;
  equipment: string;
  muscleGroup: MuscleGroup;
}

export interface SessionExercise extends LibraryExercise {
  rowId: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  category: string;
  status: TemplateStatus;
  description: string;
  durationMinutes: number;
  targetMuscles: MuscleGroup[];
  exercises: SessionExercise[];
}

export interface ComboboxOption {
  id: string;
}

export interface SearchableComboboxProps<T extends ComboboxOption> {
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

export interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

// ============================================================================
// Style constants
// ============================================================================

export const REST_OPTIONS = [
  "30 sec",
  "45 sec",
  "60 sec",
  "75 sec",
  "90 sec",
  "120 sec",
];

export const MUSCLE_GROUP_STYLES: Record<MuscleGroup, string> = {
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

export const VOLUME_STYLES: Record<VolumeLevel, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  High: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
};

// Shared "input-like" classes, lifted from GymFormFields, with a fixed h-10
// so every field-sized control on the page lines up exactly.
const fieldClasses = (error?: boolean) =>
  `w-full h-10 px-3 rounded-lg border transition-colors ${
    error
      ? "border-destructive bg-destructive/5"
      : "border-border bg-background hover:border-border/80 focus:border-primary"
  } focus:outline-none focus:ring-2 focus:ring-primary/20`;

// Same treatment for compact controls that live inside table cells / rows.
const compactFieldClasses =
  "h-10 rounded-lg border border-border bg-background px-2 text-sm transition-colors hover:border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

// ============================================================================
// Helper functions
// ============================================================================

export function createRowId(): string {
  return `row-${Math.random().toString(36).slice(2, 10)}`;
}

export function calculateTotalSets(exercises: SessionExercise[]): number {
  return exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
}

export function estimateVolume(exercises: SessionExercise[]): VolumeLevel {
  const totalSets = calculateTotalSets(exercises);
  if (totalSets >= 24) return "High";
  if (totalSets >= 14) return "Medium";
  return "Low";
}

export function getFocusMuscles(exercises: SessionExercise[]): string {
  const unique = Array.from(new Set(exercises.map((e) => e.muscleGroup)));
  return unique.length > 0 ? unique.join(", ") : "—";
}

export function formatDuration(start: string, end: string): string {
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

export function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ============================================================================
// Field primitives (GymFormFields-styled, all h-10)
// ============================================================================

export const FormInput = ({ label, error, icon: Icon, ...props }: any) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <label className="text-sm font-medium text-foreground">
      {label}
      {props.required && <span className="text-destructive ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <input
        className={`${fieldClasses(!!error)} ${Icon ? "pl-9" : ""}`}
        {...props}
      />
    </div>
    {error && (
      <span className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error.message}
      </span>
    )}
  </div>
);

export const FormSelect = ({
  label,
  options,
  error,
  icon: Icon,
  ...props
}: any) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <label className="text-sm font-medium text-foreground">
      {label}
      {props.required && <span className="text-destructive ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <select
        className={`${fieldClasses(!!error)} ${Icon ? "pl-9" : ""}`}
        {...props}
      >
        {options.map((opt: any) => (
          <option key={opt.value || opt.id} value={opt.value || opt.id}>
            {opt.label || opt.name}
          </option>
        ))}
      </select>
    </div>
    {error && (
      <span className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error.message}
      </span>
    )}
  </div>
);

export const FormTextarea = ({
  label,
  error,
  maxLength,
  value,
  ...props
}: any) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <label className="text-sm font-medium text-foreground">
      {label}
      {props.required && <span className="text-destructive ml-1">*</span>}
    </label>
    <div className="relative">
      <textarea
        className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none min-h-[92px] ${
          error
            ? "border-destructive bg-destructive/5"
            : "border-border bg-background hover:border-border/80 focus:border-primary"
        } focus:outline-none focus:ring-2 focus:ring-primary/20`}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      {typeof maxLength === "number" && (
        <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground">
          {(value ?? "").length} / {maxLength}
        </span>
      )}
    </div>
    {error && (
      <span className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error.message}
      </span>
    )}
  </div>
);

export const FieldLabel = ({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
    {children}
    {required && <span className="ml-0.5 text-destructive">*</span>}
  </label>
);

export const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <span
      role="alert"
      className="text-xs text-destructive flex items-center gap-1"
    >
      <AlertCircle className="w-3 h-3" />
      {message}
    </span>
  );
};

export const SectionCard = ({
  title,
  icon: Icon,
  subtitle,
  action,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-card-foreground truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export const SummaryRow = ({
  icon: Icon,
  label,
  value,
  border = true,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  border?: boolean;
}) => (
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

export const InfoBanner = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

export const SuccessMessage = ({ text }: { text: string }) => (
  <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
    <CheckCircle2 className="h-4 w-4" />
    <span>{text}</span>
  </div>
);

export const MuscleBadge = ({ muscle }: { muscle: MuscleGroup }) => (
  <Badge
    variant="outline"
    className={cn("whitespace-nowrap font-medium", MUSCLE_GROUP_STYLES[muscle])}
  >
    {muscle}
  </Badge>
);

export const StatusBadge = ({ status }: { status: TemplateStatus }) => {
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
};

// ============================================================================
// Combobox (member / template picker)
// ============================================================================

export function SearchableCombobox<T extends ComboboxOption>({
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
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={triggerAriaLabel}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 px-3 rounded-lg border transition-colors text-left",
            invalid
              ? "border-destructive bg-destructive/5"
              : "border-border bg-background hover:border-border/80 focus:border-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
          )}
        >
          {value ? (
            renderTrigger(value)
          ) : (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
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
            <CommandGroup
              className="
                p-1.5
                [&_[cmdk-group-items]]:flex
                [&_[cmdk-group-items]]:flex-col
                [&_[cmdk-group-items]]:gap-1
              "
            >
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  className="rounded-lg py-2.5"
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

function MemberAvatar({ member }: { member: Member }) {
  if (member.photoUrl) {
    return (
      <img
        src={member.photoUrl}
        alt={member.name}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
      {member.initials}
    </div>
  );
}

export const MemberOptionContent = ({ member }: { member: Member }) => (
  <div className="flex min-w-0 items-center gap-2.5">
    <MemberAvatar member={member} />
    <div className="min-w-0 text-left">
      <p className="truncate text-sm font-medium text-foreground">
        {member.name}
      </p>
      <p className="truncate text-xs text-muted-foreground">{member.plan}</p>
    </div>
  </div>
);

export const TemplateOptionContent = ({
  template,
  icon: TemplateIcon = Dumbbell,
}: {
  template: WorkoutTemplate;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

// ============================================================================
// Exercise row controls
// ============================================================================

export const ExerciseThumbnail = ({
  muscleGroup,
}: {
  muscleGroup: MuscleGroup;
}) => (
  <div
    className={cn(
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
      MUSCLE_GROUP_STYLES[muscleGroup],
    )}
  >
    <Dumbbell className="h-4 w-4" />
  </div>
);

export const NumberStepper = ({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}) => (
  <div className="flex h-10 w-[84px] items-center rounded-lg border border-border bg-background">
    <button
      type="button"
      aria-label={`Decrease ${ariaLabel}`}
      className="flex h-full w-7 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-l-lg"
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
      className="h-full w-full min-w-0 border-x border-border bg-transparent text-center text-sm font-medium text-foreground focus-visible:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
    <button
      type="button"
      aria-label={`Increase ${ariaLabel}`}
      className="flex h-full w-7 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-r-lg"
      onClick={() => onChange(value + 1)}
    >
      +
    </button>
  </div>
);

export const EditableSelect = ({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) => (
  <select
    aria-label={ariaLabel}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={cn(compactFieldClasses, className)}
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

export const ExerciseTableRow = ({
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
}) => (
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
      <input
        value={exercise.reps}
        aria-label={`Reps for ${exercise.name}`}
        className={cn(compactFieldClasses, "w-[76px]")}
        onChange={(e) => onUpdate(exercise.rowId, { reps: e.target.value })}
      />
    </TableCell>
    <TableCell>
      <input
        value={exercise.weight}
        aria-label={`Weight for ${exercise.name}`}
        className={cn(compactFieldClasses, "w-[100px]")}
        onChange={(e) => onUpdate(exercise.rowId, { weight: e.target.value })}
      />
    </TableCell>
    <TableCell>
      <EditableSelect
        value={exercise.rest}
        options={REST_OPTIONS}
        ariaLabel={`Rest for ${exercise.name}`}
        className="w-[100px]"
        onChange={(value) => onUpdate(exercise.rowId, { rest: value })}
      />
    </TableCell>
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

export const ExerciseMobileCard = ({
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
}) => (
  <div className="rounded-2xl border border-border bg-card p-4">
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
        <input
          value={exercise.reps}
          aria-label={`Reps for ${exercise.name}`}
          className={cn(compactFieldClasses, "w-full")}
          onChange={(e) => onUpdate(exercise.rowId, { reps: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Weight</p>
        <input
          value={exercise.weight}
          aria-label={`Weight for ${exercise.name}`}
          className={cn(compactFieldClasses, "w-full")}
          onChange={(e) => onUpdate(exercise.rowId, { weight: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Rest</p>
        <EditableSelect
          value={exercise.rest}
          options={REST_OPTIONS}
          ariaLabel={`Rest for ${exercise.name}`}
          className="w-full"
          onChange={(value) => onUpdate(exercise.rowId, { rest: value })}
        />
      </div>
    </div>
  </div>
);

// ============================================================================
// Larger composite cards
// ============================================================================

export const EmptyTemplateState = ({
  onSelectTemplate,
}: {
  onSelectTemplate: () => void;
}) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
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
    <Button
      type="button"
      className={cn(bigSquareButton, "mt-5")}
      onClick={onSelectTemplate}
    >
      Select Template
    </Button>
  </div>
);

export const SessionSummaryCard = ({
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
}) => {
  const totalSets = calculateTotalSets(exercises);
  const volume = estimateVolume(exercises);
  const focusMuscles = getFocusMuscles(exercises);

  return (
    <SectionCard title="Session Summary" icon={ClipboardList}>
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

      <SummaryRow icon={Dumbbell} label="Exercises" value={exercises.length} />
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
    </SectionCard>
  );
};

export const TemplatePreviewCard = ({
  template,
  icon: TemplateIcon = Dumbbell,
  onViewTemplate,
}: {
  template: WorkoutTemplate | null;
  icon?: React.ComponentType<{ className?: string }>;
  onViewTemplate: () => void;
}) => (
  <SectionCard title="Template Preview" icon={Eye}>
    {template ? (
      <>
        <div className="flex h-32 items-center justify-center rounded-xl bg-primary/5">
          <TemplateIcon className="h-10 w-10 text-primary/40" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            {template.name}
          </p>
          <StatusBadge status={template.status} />
        </div>
        <p className="text-sm text-muted-foreground">{template.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {template.targetMuscles.map((muscle) => (
            <MuscleBadge key={muscle} muscle={muscle} />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className={cn(bigSquareButton, "w-full justify-center")}
          onClick={onViewTemplate}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Template
        </Button>
      </>
    ) : (
      <p className="text-sm text-muted-foreground">
        Select a template to preview its details here.
      </p>
    )}
  </SectionCard>
);

export const TrainerTipsCard = ({
  title = "Tips for a Great Session",
  tips = [
    "Warm up before starting.",
    "Maintain proper form.",
    "Adjust weight if necessary.",
    "Monitor RPE.",
    "Stay hydrated.",
  ],
}: {
  title?: string;
  tips?: string[];
}) => (
  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
        <Lightbulb className="h-4 w-4" />
      </div>
      <p className="font-semibold text-sm text-foreground">{title}</p>
    </div>
    <ul className="space-y-2 text-xs text-muted-foreground">
      {tips.map((tip) => (
        <li key={tip} className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{tip}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const QuickActionsCard = ({
  actions,
  destructiveAction,
}: {
  actions: QuickAction[];
  destructiveAction?: QuickAction;
}) => (
  <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
        <Zap className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-card-foreground">
        Quick Actions
      </h3>
    </div>
    <div className="space-y-2">
      {actions.map(({ icon: Icon, label, onClick }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          className={cn(bigSquareButton, "w-full justify-start")}
          onClick={onClick}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Button>
      ))}
      {destructiveAction && (
        <>
          <Separator />
          <Button
            type="button"
            variant="ghost"
            className="w-full h-10 justify-start rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={destructiveAction.onClick}
          >
            <destructiveAction.icon className="w-4 h-4 mr-2" />
            {destructiveAction.label}
          </Button>
        </>
      )}
    </div>
  </div>
);
