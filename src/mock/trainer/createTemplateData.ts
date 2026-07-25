import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type MuscleGroup =
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

export type TemplateType =
  | "Strength Training"
  | "Hypertrophy"
  | "Powerlifting"
  | "Functional Training"
  | "Cardio"
  | "Mobility"
  | "HIIT";

export type PrimaryGoal =
  | "Muscle Gain"
  | "Fat Loss"
  | "Strength"
  | "Endurance"
  | "Athletic Performance";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export type ScreenState = "loading" | "loaded";

export interface LibraryExercise {
  id: string;
  name: string;
  equipment: string;
  muscleGroup: MuscleGroup;
}

export interface TemplateExercise extends LibraryExercise {
  rowId: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
}

// ============================================================================
// Constants
// ============================================================================

export const TEMPLATE_TYPES: TemplateType[] = [
  "Strength Training",
  "Hypertrophy",
  "Powerlifting",
  "Functional Training",
  "Cardio",
  "Mobility",
  "HIIT",
];

export const PRIMARY_GOALS: PrimaryGoal[] = [
  "Muscle Gain",
  "Fat Loss",
  "Strength",
  "Endurance",
  "Athletic Performance",
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export const MUSCLE_GROUPS: MuscleGroup[] = [
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

export const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Resistance Band",
  "Bodyweight",
];

export const REST_OPTIONS = [
  "30 sec",
  "45 sec",
  "60 sec",
  "75 sec",
  "90 sec",
  "120 sec",
];

export const MUSCLE_GROUP_STYLES: Record<MuscleGroup, string> = {
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

export const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
  Beginner:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  Intermediate:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  Advanced:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

// Dev toggle mirroring the pattern used across TrackVim screens.
export const MOCK_SCREEN_STATE: ScreenState = "loaded";

// ============================================================================
// Mock Data
// ============================================================================

export const EXERCISE_LIBRARY: LibraryExercise[] = [
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

export const INITIAL_EXERCISES: TemplateExercise[] = [
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
  },
];

// ============================================================================
// Validation Schema
// ============================================================================

export const templateFormSchema = z.object({
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

export type TemplateFormValues = z.infer<typeof templateFormSchema>;

// Used by the "Create Template" page — every field starts blank so the
// trainer is filling in a clean template, not editing pre-filled sample data.
export const EMPTY_FORM_VALUES: Partial<TemplateFormValues> = {
  name: "",
  muscleGroups: [],
  description: "",
  equipment: [],
  notes: "",
};

export const EMPTY_EXERCISES: TemplateExercise[] = [];

// ============================================================================
// Edit-mode mock data
// ============================================================================
// Mirrors what an API/DB fetch for an existing template would return, already
// mapped onto this file's MuscleGroup / TemplateExercise / TemplateFormValues
// shapes so CreateTemplateForm can render create and edit with zero branching
// on data shape — only on which values it's initialized with.

export interface TemplateMeta {
  createdBy: string;
  lastUpdated: string;
  status: "draft" | "active";
}

export const STATUS_STYLES: Record<TemplateMeta["status"], string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export const MOCK_EDIT_TEMPLATE_VALUES: TemplateFormValues = {
  name: "Pull Day",
  type: "Strength Training",
  goal: "Muscle Gain",
  difficulty: "Intermediate",
  // Original mock used "Rear Delts" — mapped onto this file's MuscleGroup
  // union as "Shoulders" so it stays a valid MultiSelectField option.
  muscleGroups: ["Back", "Biceps", "Shoulders"],
  description:
    "A focused pulling workout to build back thickness, improve posture, and develop strong biceps.",
  duration: 60,
  restBetweenSets: "60 sec",
  equipment: ["Barbell", "Cable", "Bodyweight"],
  notes:
    "Use this workout for intermediate members focusing on hypertrophy and back development. Keep rest periods strict for best results.",
};

export const MOCK_EDIT_TEMPLATE_EXERCISES: TemplateExercise[] = [
  {
    rowId: "row-1",
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
    rowId: "row-2",
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
    rowId: "row-3",
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
    rowId: "row-4",
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
    rowId: "row-5",
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
    rowId: "row-6",
    id: "lib-face-pull",
    name: "Face Pull",
    equipment: "Cable",
    muscleGroup: "Shoulders",
    sets: 3,
    reps: "12-15",
    weight: "20 kg",
    rest: "60 sec",
  },
  {
    rowId: "row-7",
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
    rowId: "row-8",
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

export const MOCK_EDIT_TEMPLATE_META: TemplateMeta = {
  createdBy: "Rahul Sharma",
  lastUpdated: "20 Jul 2026",
  status: "active",
};

// ============================================================================
// Helper Functions
// ============================================================================

export function createRowId(): string {
  return `row-${Math.random().toString(36).slice(2, 10)}`;
}

export function calculateTotalSets(exercises: TemplateExercise[]): number {
  return exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
}
