"use client";

// ============================================================================
// Shared training-session form.
//
// Used by both the "Create Session" and "Edit Session" pages — pass
// `mode="edit"` plus `defaultValues` / `defaultExercises` to preload it,
// and `sidebarExtra` / `tipsTitle` / `tips` to customize the sidebar for
// editing (e.g. a Quick Actions card, a different tips list).
// ============================================================================

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Clock3,
  Dumbbell,
  ClipboardList,
  Plus,
  Bell,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Settings2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Footprints,
  Wind,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { bigSquareButton } from "@/lib/styles";

import {
  FormInput,
  FormSelect,
  FormTextarea,
  FieldLabel,
  FieldError,
  SectionCard,
  InfoBanner,
  SuccessMessage,
  MuscleBadge,
  StatusBadge,
  SearchableCombobox,
  MemberOptionContent,
  TemplateOptionContent,
  ExerciseTableRow,
  ExerciseMobileCard,
  EmptyTemplateState,
  SessionSummaryCard,
  TemplatePreviewCard,
  TrainerTipsCard,
  createRowId,
  type Member,
  type LibraryExercise,
  type SessionExercise,
  type WorkoutTemplate,
  type SessionType,
} from "@/components/trainer/TrainingSessionFields";

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

const DEFAULT_REST_OPTIONS = ["30 sec", "45 sec", "60 sec", "75 sec", "90 sec"];
const REMINDER_OPTIONS = [
  "No reminder",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
];
const TIME_PATTERN = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i;

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

export function getTemplateIcon(templateId: string) {
  return TEMPLATE_ICONS[templateId] ?? Dumbbell;
}

// Default stable id so the header's "Create Session" button (rendered
// outside this component) can submit the form via the HTML `form="..."`
// attribute. Pass `formId` to override for a second instance on the page
// (e.g. the edit page uses its own id).
export const SESSION_FORM_ID = "training-session-form";

// ============================================================================
// Mock Data (exported so other pages, e.g. Edit, can reuse the same members
// / templates instead of re-declaring their own).
// ============================================================================

export const MOCK_MEMBERS: Member[] = [
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
  },
];

export const MOCK_TEMPLATES: WorkoutTemplate[] = [
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

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

export const DEFAULT_FORM_VALUES: SessionFormValues = {
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
  reminder: "15 minutes before",
};

// ============================================================================
// Component
// ============================================================================

export interface CreateSessionFormProps {
  /** "create" shows a fresh, empty form. "edit" is purely cosmetic here —
   * pass defaultValues/defaultExercises to actually preload data. */
  mode?: "create" | "edit";
  /** Override the <form id> — needed if both a create and an edit form
   * could ever be mounted on the page at once. */
  formId?: string;
  /** Preloaded field values (merged over DEFAULT_FORM_VALUES). */
  defaultValues?: Partial<SessionFormValues>;
  /** Preloaded exercise rows (e.g. from an existing session). */
  defaultExercises?: SessionExercise[];
  submitLabel?: string;
  submittingLabel?: string;
  /** Extra sidebar content rendered below the tips card (e.g. Quick Actions). */
  sidebarExtra?: ReactNode;
  tipsTitle?: string;
  tips?: string[];
}

export default function CreateSessionForm({
  mode = "create",
  formId = SESSION_FORM_ID,
  defaultValues,
  defaultExercises,
  submitLabel,
  submittingLabel,
  sidebarExtra,
  tipsTitle,
  tips,
}: CreateSessionFormProps) {
  const router = useRouter();

  const resolvedSubmitLabel =
    submitLabel ?? (mode === "edit" ? "Save Changes" : "Create Session");
  const resolvedSubmittingLabel =
    submittingLabel ?? (mode === "edit" ? "Saving…" : "Creating…");

  const mergedDefaults = useMemo(
    () => ({ ...DEFAULT_FORM_VALUES, ...defaultValues }),
    [defaultValues],
  );

  const [exercises, setExercises] = useState<SessionExercise[]>(
    defaultExercises ?? [],
  );
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
    defaultValues: mergedDefaults,
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
    };
    setExercises((prev) => [...prev, newExercise]);
    setExercisesError(null);
    setAddExerciseOpen(false);
  }

  function handleCancel() {
    reset(mergedDefaults);
    setExercises(defaultExercises ?? []);
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

    // In a real integration this would POST/PATCH to the sessions API.
    console.log("Saving training session", { ...values, exercises });

    setSubmitSuccess(true);
    window.setTimeout(() => setSubmitSuccess(false), 4000);
  }

  return (
    <>
      {submitSuccess && (
        <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-foreground dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-sm text-emerald-700 dark:text-emerald-400">
            Session saved successfully.
          </AlertDescription>
        </Alert>
      )}

      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Session Details */}
            <SectionCard title="Session Details" icon={ClipboardList}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                  label="Session Name"
                  placeholder="Pull Day – Strength Focus"
                  required
                  {...register("sessionName")}
                  error={errors.sessionName}
                />

                <div className="flex flex-col gap-1.5 min-w-0">
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
                    renderTrigger={(t) => (
                      <TemplateOptionContent
                        template={t}
                        icon={getTemplateIcon(t.id)}
                      />
                    )}
                    renderItem={(t) => (
                      <TemplateOptionContent
                        template={t}
                        icon={getTemplateIcon(t.id)}
                      />
                    )}
                  />
                  <FieldError message={errors.templateId?.message} />
                  {selectedTemplate && !errors.templateId && (
                    <SuccessMessage
                      text={`${selectedTemplate.exercises.length} exercises will be added automatically`}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1.5 min-w-0">
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

                <FormInput
                  label="Session Date"
                  type="date"
                  icon={Calendar}
                  required
                  {...register("sessionDate")}
                  error={errors.sessionDate}
                />

                <FormInput
                  label="Start Time"
                  type="text"
                  placeholder="07:00 AM"
                  icon={Clock3}
                  required
                  {...register("startTime")}
                  error={errors.startTime}
                />

                <FormInput
                  label="End Time"
                  type="text"
                  placeholder="08:00 AM"
                  icon={Clock3}
                  required
                  {...register("endTime")}
                  error={errors.endTime}
                />

                <Controller
                  control={control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormSelect
                      label="Session Type"
                      options={SESSION_TYPES.map((type) => ({
                        value: type,
                        label: type,
                      }))}
                      value={field.value}
                      onChange={(e: any) => field.onChange(e.target.value)}
                    />
                  )}
                />

                <FormInput
                  label="Location (Optional)"
                  placeholder="Main Floor"
                  icon={MapPin}
                  {...register("location")}
                  error={errors.location}
                />

                <div className="sm:col-span-2">
                  <FormTextarea
                    label="Notes (Optional)"
                    placeholder="Add any notes for this training session..."
                    maxLength={250}
                    value={notesValue}
                    {...register("notes")}
                    error={errors.notes}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Exercises */}
            <SectionCard
              title="Exercises in This Session"
              icon={Dumbbell}
              subtitle="Automatically loaded from the selected workout template."
            >
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

                  <Popover
                    open={addExerciseOpen}
                    onOpenChange={setAddExerciseOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm font-medium text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
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
                                className="rounded-lg py-2.5"
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
            </SectionCard>

            {/* Session Settings */}
            <SectionCard title="Session Settings" icon={Settings2}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Controller
                  control={control}
                  name="restTimer"
                  render={({ field }) => (
                    <FormSelect
                      label="Rest Timer"
                      options={[
                        { value: "Show Timer", label: "Show Timer" },
                        { value: "Hide Timer", label: "Hide Timer" },
                      ]}
                      value={field.value}
                      onChange={(e: any) => field.onChange(e.target.value)}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="defaultRestTime"
                  render={({ field }) => (
                    <FormSelect
                      label="Default Rest Time"
                      options={DEFAULT_REST_OPTIONS.map((o) => ({
                        value: o,
                        label: o,
                      }))}
                      value={field.value}
                      onChange={(e: any) => field.onChange(e.target.value)}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="reminder"
                  render={({ field }) => (
                    <FormSelect
                      label="Session Reminder (Optional)"
                      icon={Bell}
                      options={REMINDER_OPTIONS.map((o) => ({
                        value: o,
                        label: o,
                      }))}
                      value={field.value}
                      onChange={(e: any) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </SectionCard>
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
              icon={
                selectedTemplate
                  ? getTemplateIcon(selectedTemplate.id)
                  : undefined
              }
              onViewTemplate={() => setViewTemplateOpen(true)}
            />
            <TrainerTipsCard title={tipsTitle} tips={tips} />
            {sidebarExtra}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 sm:px-6 py-4 mt-6 -mx-4 sm:-mx-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className={bigSquareButton}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={bigSquareButton}
          >
            {isSubmitting ? resolvedSubmittingLabel : resolvedSubmitLabel}
          </Button>
        </div>
      </form>

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
                <Button
                  type="button"
                  variant="outline"
                  className={bigSquareButton}
                  onClick={() => setViewTemplateOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
