"use client";

// ============================================================================
// Imports
// ============================================================================
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Clock3,
  Target,
  Dumbbell,
  Layers3,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { bigSquareButton } from "@/lib/styles";

// Shared form building blocks — same primitives MemberForm.tsx uses, so
// every gym form (Add Member, Create Template, ...) shares one look & feel.
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
  SummaryRow,
} from "@/components/GymFormFields";

import {
  TEMPLATE_TYPES,
  PRIMARY_GOALS,
  DIFFICULTY_LEVELS,
  MUSCLE_GROUPS,
  EQUIPMENT_OPTIONS,
  REST_OPTIONS,
  MUSCLE_GROUP_STYLES,
  DIFFICULTY_STYLES,
  MOCK_SCREEN_STATE,
  EXERCISE_LIBRARY,
  EMPTY_FORM_VALUES,
  EMPTY_EXERCISES,
  STATUS_STYLES,
  templateFormSchema,
  createRowId,
  calculateTotalSets,
  type MuscleGroup,
  type DifficultyLevel,
  type LibraryExercise,
  type TemplateExercise,
  type TemplateFormValues,
  type TemplateMeta,
} from "@/mock/trainer/createTemplateData";

// Give the <form> a stable id so a header button rendered outside this
// component (e.g. in the server page.tsx, following the MemberForm
// pattern) can submit it via the HTML `form="..."` attribute.
export const TEMPLATE_FORM_ID = "create-template-form";

// ============================================================================
// Small display helpers (exercise table only — no GymFormFields equivalent)
// ============================================================================

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

// Multi-select chip field used for muscle groups / equipment. Styled to
// match the FormInput/FormSelect label treatment from GymFormFields since
// there's no multi-select primitive there yet.
function MultiSelectField({
  id,
  label,
  options,
  selected,
  onChange,
  placeholder,
  error,
}: {
  id?: string;
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <select
        id={id}
        value=""
        onChange={(e) => {
          const value = e.target.value;
          if (value && !selected.includes(value))
            onChange([...selected, value]);
        }}
        className={`w-full px-3 py-2 rounded-lg border transition-colors ${
          error
            ? "border-destructive bg-destructive/5"
            : "border-border bg-background hover:border-border/80 focus:border-primary"
        } focus:outline-none focus:ring-2 focus:ring-primary/20`}
      >
        <option value="">{placeholder}</option>
        {options
          .filter((opt) => !selected.includes(opt))
          .map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
      </select>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-primary pl-2.5 pr-1.5 py-1 text-xs font-medium text-primary-foreground"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(selected.filter((s) => s !== item))}
                className="rounded-full p-0.5 hover:bg-primary-foreground/20"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && (
        <span className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </span>
      )}
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

function PageSkeleton() {
  return (
    <div className="space-y-6">
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
// Main Form Component
// ============================================================================

interface CreateTemplateFormProps {
  /** "create" starts every field blank; "edit" expects initialValues/initialExercises. */
  mode?: "create" | "edit";
  /** Pre-fill values, e.g. MOCK_EDIT_TEMPLATE_VALUES from create-template-data.ts. Omit for a blank form. */
  initialValues?: Partial<TemplateFormValues>;
  /** Pre-fill exercises, e.g. MOCK_EDIT_TEMPLATE_EXERCISES. Omit for an empty exercise list. */
  initialExercises?: TemplateExercise[];
  /** Created-by / last-updated / status, shown in edit mode only. */
  meta?: TemplateMeta;
}

export default function CreateTemplateForm({
  mode = "create",
  initialValues,
  initialExercises,
  meta,
}: CreateTemplateFormProps) {
  const router = useRouter();

  const [exercises, setExercises] = useState<TemplateExercise[]>(
    initialExercises ?? EMPTY_EXERCISES,
  );
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [exercisesError, setExercisesError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema) as Resolver<TemplateFormValues>,
    defaultValues: initialValues ?? EMPTY_FORM_VALUES,
    mode: "onBlur",
  });

  const name = watch("name");
  const type = watch("type");
  const goal = watch("goal");
  const difficulty = watch("difficulty");
  const muscleGroups = watch("muscleGroups") ?? [];
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

    // In a real integration this would POST/PATCH to the templates API.
    console.log(mode === "edit" ? "Template updated:" : "Template saved:", {
      ...values,
      exercises,
    });

    setSubmitSuccess(true);
    window.setTimeout(() => setSubmitSuccess(false), 4000);
  }

  if (MOCK_SCREEN_STATE === "loading") {
    return <PageSkeleton />;
  }

  return (
    <form id={TEMPLATE_FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate>
      {submitSuccess && (
        <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-foreground dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-sm text-emerald-700 dark:text-emerald-400">
            {mode === "edit"
              ? "Template updated successfully."
              : "Template saved successfully."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Form */}
        <div className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
          {/* Template Details */}
          <SectionCard title="Template Details" icon={Target}>
            <FormInput
              label="Template Name"
              placeholder="e.g., Pull Day"
              required
              {...register("name")}
              error={errors.name}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Template Type"
                options={TEMPLATE_TYPES.map((t) => ({ value: t, label: t }))}
                {...register("type")}
                error={errors.type}
              />
              <FormSelect
                label="Primary Goal"
                options={PRIMARY_GOALS.map((g) => ({ value: g, label: g }))}
                {...register("goal")}
                error={errors.goal}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Difficulty Level"
                options={DIFFICULTY_LEVELS.map((level) => ({
                  value: level,
                  label: level,
                }))}
                {...register("difficulty")}
                error={errors.difficulty}
              />
              <FormInput
                label="Estimated Duration (min)"
                type="number"
                min={1}
                required
                {...register("duration")}
                error={errors.duration}
              />
            </div>

            <Controller
              control={control}
              name="muscleGroups"
              render={({ field }) => (
                <MultiSelectField
                  label="Target Muscle Groups"
                  options={MUSCLE_GROUPS}
                  selected={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Select muscle groups..."
                  error={errors.muscleGroups?.message}
                />
              )}
            />

            <FormTextarea
              label="Description (Optional)"
              placeholder="Add a brief description of this workout template..."
              maxLength={250}
              {...register("description")}
              error={errors.description}
            />
            <p className="-mt-3 text-right text-xs text-muted-foreground">
              {descriptionValue.length} / 250
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Default Rest Between Sets"
                options={REST_OPTIONS.map((opt) => ({
                  value: opt,
                  label: opt,
                }))}
                {...register("restBetweenSets")}
                error={errors.restBetweenSets}
              />
              <Controller
                control={control}
                name="equipment"
                render={({ field }) => (
                  <MultiSelectField
                    label="Equipment"
                    options={EQUIPMENT_OPTIONS}
                    selected={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Select equipment..."
                    error={errors.equipment?.message}
                  />
                )}
              />
            </div>
          </SectionCard>

          {/* Exercises */}
          <SectionCard title="Exercises" icon={Dumbbell}>
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercises.map((exercise, index) => (
                        <ExerciseTableRow
                          key={exercise.rowId}
                          exercise={exercise}
                          index={index}
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
                    <p className="text-2xl font-bold">{stats.totalExercises}</p>
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
          </SectionCard>

          {/* Trainer Notes */}
          <SectionCard title="Trainer Notes (Optional)" icon={Layers3}>
            <FormTextarea
              label="Notes"
              placeholder="Add coaching tips or special instructions for this workout template..."
              maxLength={500}
              {...register("notes")}
              error={errors.notes}
            />
            <div className="-mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {meta && `Added by ${meta.createdBy} • ${meta.lastUpdated}`}
              </span>
              <span>{notesValue.length} / 500</span>
            </div>
          </SectionCard>

          {/* Footer Actions */}
          <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 sm:px-6 py-4 -mx-4 sm:-mx-6 -mb-6 sm:-mb-8 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className={bigSquareButton}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={bigSquareButton}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 size-4 border-2 border-background border-t-foreground rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  {mode === "edit" ? "Save Changes" : "Save Template"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 order-1 lg:order-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Template Summary */}
            <SectionCard title="Template Summary" icon={Dumbbell}>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Template Name
                </p>
                <p className="font-semibold text-lg">{name || "Untitled"}</p>
              </div>

              <div className="space-y-3 text-sm">
                <SummaryRow label="Type" value={type || "—"} />
                <SummaryRow label="Goal" value={goal || "—"} />
                <SummaryRow
                  label="Difficulty"
                  value={
                    difficulty ? (
                      <DifficultyBadge difficulty={difficulty} />
                    ) : (
                      "—"
                    )
                  }
                />
                <SummaryRow
                  label="Muscle Groups"
                  value={
                    muscleGroups.length > 0 ? (
                      <div className="flex flex-wrap justify-end gap-1">
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
                  label="Est. Duration"
                  value={`${duration || 0} minutes`}
                />
                <SummaryRow label="Exercises" value={stats.totalExercises} />
                <SummaryRow label="Total Sets" value={stats.totalSets} />
                <SummaryRow
                  label="Status"
                  value={
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[meta?.status ?? "draft"]}
                    >
                      {meta?.status === "active" ? "Active" : "Draft"}
                    </Badge>
                  }
                  border={false}
                />
              </div>
            </SectionCard>

            {/* Quick Tips */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 space-y-3">
              <div>
                <p className="font-semibold text-sm text-foreground mb-3">
                  Quick Tips
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Add 6-10 exercises for a complete workout.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Place compound exercises first.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Follow logical exercise progression.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Keep templates reusable for clients.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
