"use client";

// ============================================================================
// Shared training-session form.
//
// Used by both the "Create Session" and "Edit Session" pages — pass
// `mode="edit"` plus `defaultValues` / `defaultExercises` to preload it,
// and `sidebarExtra` / `tipsTitle` / `tips` to customize the sidebar for
// editing (e.g. a Quick Actions card, a different tips list).
//
// Data (members, templates, exercise library) is fetched internally via
// react-query, scoped to the active gym/trainer from useTrainerStore —
// mirrors the pattern used in CreateTemplateForm.
// ============================================================================

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { useTrainerStore } from "@/stores/trainer-store";
import {
  useMyAssignedMembers,
  useWorkoutTemplates,
  useAllExercises,
} from "@/hooks/queries/trainer.query";
import {
  createTrainingSessionWithExercises,
  updateTrainingSessionWithExercises,
} from "@/actions/trainer.action";

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
import { formatTime12h, getTomorrowDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

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

// Icon is chosen by matching keywords in the template name, since real
// templates come from the DB with UUIDs rather than the old fixed mock ids.
export function getTemplateIcon(name: string) {
  const key = name.toLowerCase();
  if (key.includes("pull")) return ArrowDownToLine;
  if (key.includes("push")) return ArrowUpFromLine;
  if (key.includes("leg")) return Footprints;
  if (key.includes("mobility") || key.includes("recovery")) return Wind;
  return Dumbbell;
}

// Default stable id so the header's "Create Session" button (rendered
// outside this component) can submit the form via the HTML `form="..."`
// attribute. Pass `formId` to override for a second instance on the page
// (e.g. the edit page uses its own id).
export const SESSION_FORM_ID = "training-session-form";

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
  memberId: "",
  sessionDate: getTomorrowDate(),
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
// Time / duration helpers
// ============================================================================

function to24HourTime(time12h: string): string {
  const match = time12h.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return time12h;
  let hours = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return `${String(hours).padStart(2, "0")}:${match[2]}:00`;
}

function parseRestSeconds(label: string): number {
  const match = label.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

function parseReminderMinutes(label: string): number | null {
  if (label === "No reminder") return null;
  if (label === "1 hour before") return 60;
  const match = label.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function diffMinutes(start12h: string, end12h: string): number | null {
  const toMinutes = (time: string) => {
    const m = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10) % 12;
    if (m[3].toUpperCase() === "PM") h += 12;
    return h * 60 + parseInt(m[2], 10);
  };
  const start = toMinutes(start12h);
  const end = toMinutes(end12h);
  return start !== null && end !== null ? end - start : null;
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function mapAssignedMembers(rows: any[]): Member[] {
  return rows.map((row) => {
    const memberships = row.members?.gym_memberships;
    const membership = Array.isArray(memberships)
      ? memberships[0]
      : memberships;

    return {
      id: row.members.id,
      name: row.members.full_name,
      plan: membership?.membership_plans?.plan_name ?? "No active plan",
      initials: getInitials(row.members.full_name),
      photoUrl: row.members.photo_url ?? null,
    };
  });
}

export function mapExerciseLibrary(rows: any[]): LibraryExercise[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    equipment: row.equipment,
    muscleGroup: row.muscle_group,
  }));
}

export function mapWorkoutTemplates(rows: any[]): WorkoutTemplate[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    status: row.status,
    description: row.description ?? "",
    durationMinutes: row.duration_minutes ?? 0,
    targetMuscles: row.target_muscles ?? [],
    exercises: (row.template_exercises ?? []).map(
      (te: any): SessionExercise => ({
        rowId: createRowId(),
        id: te.exercise.id,
        name: te.exercise.name,
        equipment: te.exercise.equipment,
        muscleGroup: te.exercise.muscle_group,
        sets: te.sets,
        reps: te.reps,
        weight: te.weight || "—",
        rest: te.rest_seconds ? `${te.rest_seconds} sec` : "60 sec",
      }),
    ),
  }));
}

// ============================================================================
// Edit-mode prefill mapper — converts a fetched session row into the shape
// the form's useForm(defaultValues) and exercises state expect.
// ============================================================================

export function mapSessionForEditForm(row: any): {
  defaultValues: Partial<SessionFormValues>;
  defaultExercises: SessionExercise[];
} {
  const reminderLabel = (minutes: number | null): string => {
    if (minutes == null) return "No reminder";
    if (minutes === 60) return "1 hour before";
    return `${minutes} minutes before`;
  };

  const defaultValues: Partial<SessionFormValues> = {
    sessionName: row.session_name,
    templateId: row.template_id ?? "",
    memberId: row.member_id,
    sessionDate: row.session_date,
    startTime: formatTime12h(row.start_time),
    endTime: formatTime12h(row.end_time),
    sessionType: row.workout_type,
    location: row.location ?? "",
    notes: row.notes ?? "",
    restTimer: row.show_rest_timer ? "Show Timer" : "Hide Timer",
    defaultRestTime: `${row.default_rest_seconds ?? 60} sec`,
    reminder: reminderLabel(row.reminder_minutes),
  };

  const defaultExercises: SessionExercise[] = (row.session_exercises ?? [])
    .slice()
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((se: any) => ({
      rowId: createRowId(),
      id: se.exercise_id,
      name: se.exercises?.name ?? "Unknown exercise",
      equipment: se.exercises?.equipment ?? "—",
      muscleGroup: se.exercises?.muscle_group ?? "—",
      sets: se.sets,
      reps: se.reps,
      weight: se.weight || "—",
      rest: se.rest_seconds ? `${se.rest_seconds} sec` : "60 sec",
    }));

  return { defaultValues, defaultExercises };
}

// ============================================================================
// Component
// ============================================================================

export interface CreateSessionFormProps {
  mode?: "create" | "edit";
  formId?: string;
  /** Required in edit mode — the session being updated. */
  sessionId?: string;
  defaultValues?: Partial<SessionFormValues>;
  defaultExercises?: SessionExercise[];
  submitLabel?: string;
  submittingLabel?: string;
  sidebarExtra?: ReactNode;
  tipsTitle?: string;
  tips?: string[];
}

export default function CreateSessionForm({
  mode = "create",
  formId = SESSION_FORM_ID,
  sessionId,
  defaultValues,
  defaultExercises,
  submitLabel,
  submittingLabel,
  sidebarExtra,
  tipsTitle,
  tips,
}: CreateSessionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { activeTrainerId, activeGymId } = useTrainerStore();

  const {
    data: membersResult,
    isLoading: membersLoading,
    error: membersQueryError,
  } = useMyAssignedMembers(activeGymId, activeTrainerId);

  const {
    data: templatesResult,
    isLoading: templatesLoading,
    error: templatesQueryError,
  } = useWorkoutTemplates(activeGymId);

  const {
    data: exercisesResult,
    isLoading: exercisesLoading,
    error: exercisesQueryError,
  } = useAllExercises(activeGymId);

  const isLoading = membersLoading || templatesLoading || exercisesLoading;
  const queryError =
    membersQueryError || templatesQueryError || exercisesQueryError;

  const members: Member[] = useMemo(
    () =>
      membersResult?.success ? mapAssignedMembers(membersResult.data) : [],
    [membersResult],
  );
  const templates: WorkoutTemplate[] = useMemo(
    () =>
      templatesResult?.success ? mapWorkoutTemplates(templatesResult.data) : [],
    [templatesResult],
  );
  const exerciseLibrary: LibraryExercise[] = useMemo(
    () =>
      exercisesResult?.success ? mapExerciseLibrary(exercisesResult.data) : [],
    [exercisesResult],
  );

  const resolvedSubmitLabel =
    submitLabel ?? (mode === "edit" ? "Save Changes" : "Create Session");
  const resolvedSubmittingLabel =
    submittingLabel ?? (mode === "edit" ? "Saving…" : "Creating…");

  const mergedDefaults = useMemo(
    () => ({
      ...DEFAULT_FORM_VALUES,
      memberId: members[0]?.id ?? "",
      ...defaultValues,
    }),
    [defaultValues, members],
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

  // `defaultValues` passed to useForm is only read once, on mount — but
  // `members` (and therefore mergedDefaults.memberId) arrives async from
  // the query. Re-sync the memberId field once real data lands, without
  // clobbering anything the user has already typed.
  useEffect(() => {
    if (members.length > 0 && !watch("memberId")) {
      setValue("memberId", mergedDefaults.memberId, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length]);

  const templateId = watch("templateId");
  const memberId = watch("memberId");
  const sessionDate = watch("sessionDate");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const sessionType = watch("sessionType");
  const notesValue = watch("notes") ?? "";

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templateId, templates],
  );
  const selectedMember = useMemo(
    () => members.find((m) => m.id === memberId) ?? null,
    [memberId, members],
  );

  const availableLibraryExercises = useMemo(
    () =>
      exerciseLibrary.filter(
        (libEx) => !exercises.some((sessionEx) => sessionEx.id === libEx.id),
      ),
    [exercises, exerciseLibrary],
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

  const onSubmit = (values: SessionFormValues) => {
    if (!activeGymId || !activeTrainerId) {
      toast.error("Missing trainer or gym context. Please re-select your gym.");
      return;
    }
    if (mode === "edit" && !sessionId) {
      toast.error("Missing session to update.");
      return;
    }
    if (exercises.length === 0) {
      setExercisesError(
        "Add at least one exercise to this session before creating it.",
      );
      return;
    }
    setExercisesError(null);

    if (isPending) return;
    startTransition(async () => {
      try {
        const matchesTemplateDefaults =
          !!selectedTemplate &&
          exercises.length === selectedTemplate.exercises.length &&
          exercises.every(
            (ex, i) => ex.id === selectedTemplate.exercises[i].id,
          );

        const sharedPayload = {
          gymId: activeGymId,
          memberId: values.memberId,
          templateId: values.templateId || undefined,
          sessionName: values.sessionName,
          sessionDate: values.sessionDate,
          startTime: to24HourTime(values.startTime),
          endTime: to24HourTime(values.endTime),
          durationMinutes:
            diffMinutes(values.startTime, values.endTime) ?? undefined,
          workoutType: values.sessionType,
          location: values.location || undefined,
          notes: values.notes || undefined,
          showRestTimer: values.restTimer === "Show Timer",
          defaultRestSeconds: parseRestSeconds(values.defaultRestTime),
          reminderMinutes: parseReminderMinutes(values.reminder) ?? undefined,
        };

        const exercisePayload = exercises.map((exercise, index) => ({
          exerciseId: exercise.id,
          position: index,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          restSeconds: parseRestSeconds(exercise.rest),
        }));

        const result =
          mode === "edit" && sessionId
            ? await updateTrainingSessionWithExercises(sessionId, {
                ...sharedPayload,
                exercises: exercisePayload,
              })
            : await createTrainingSessionWithExercises({
                ...sharedPayload,
                trainerId: activeTrainerId,
                seedFromTemplate: matchesTemplateDefaults,
                exercises: matchesTemplateDefaults
                  ? undefined
                  : exercisePayload,
              });

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success(
          mode === "edit"
            ? "Session updated successfully"
            : "Session created successfully",
        );
        router.push(
          mode === "edit" && sessionId
            ? `/trainer/sessions/${sessionId}`
            : "/trainer/sessions",
        );
        queryClient.invalidateQueries({
          queryKey: ["sessionWithExercises", sessionId],
        });
        queryClient.invalidateQueries({
          queryKey: ["allSessions", activeGymId, activeTrainerId],
        });
      } catch (error) {
        console.error("Error saving session:", error);
        toast.error("Error saving session. Please try again.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Loading session builder…
      </div>
    );
  }

  if (queryError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Couldn&apos;t load session data. Please refresh and try again.
        </AlertDescription>
      </Alert>
    );
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
                    items={templates}
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
                        icon={getTemplateIcon(t.name)}
                      />
                    )}
                    renderItem={(t) => (
                      <TemplateOptionContent
                        template={t}
                        icon={getTemplateIcon(t.name)}
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
                    items={members}
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
                  ? getTemplateIcon(selectedTemplate.name)
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
            disabled={isSubmitting || isPending}
            className={bigSquareButton}
          >
            {isSubmitting || isPending
              ? resolvedSubmittingLabel
              : resolvedSubmitLabel}
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
