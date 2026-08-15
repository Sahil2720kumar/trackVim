"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { auth, clerkClient } from "@clerk/nextjs/server";

import {
  createTrainerSchema,
  UpdateWorkoutTemplateInput,
  type CreateTrainerInput,
} from "@/db/validators";
import { uploadFile } from "@/lib/cloudinary/upload";
import { restLabelToSeconds } from "@/lib/utils";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Trainer Profile (self-editable fields only)
// ============================================================================

export async function completeTrainerProfileAction(
  trainerId: string,
  data: CreateTrainerInput,
  photoFile?: File | null,
): Promise<ActionResult> {
  const { userId, sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as { trainerId?: string };

  if (!userId || meta.trainerId !== trainerId) {
    return { success: false, error: "Not authorized to update this profile." };
  }

  const parsed = createTrainerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }
  const v = parsed.data;

  let photoUrl: string | undefined;
  if (photoFile instanceof File && photoFile.size > 0) {
    try {
      photoUrl = await uploadFile(
        photoFile,
        `trackVim/trainers/${userId}/photo`,
      );
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to upload photo.",
      };
    }
  }

  const supabase = await createServerClient();

  // if (photoUrl) {
  //   const { error: userError } = await supabase
  //     .from("users")
  //     .update({
  //       avatar_url: photoUrl ?? null,
  //     })
  //     .eq("clerk_id", userId);
  //   if (userError) return { success: false, error: userError.message };
  // }

  const { data: trainerData, error } = await supabase
    .from("trainers")
    .update({
      full_name: v.fullName,
      contact_phone: v.contactPhone,
      bio: v.bio,
      professional_title: v.professionalTitle,
      gender: v.gender as "Male" | "Female" | "Other",
      date_of_birth: v.dateOfBirth,
      qualification: v.qualification,
      certification: v.certification,
      experience_years: v.experienceYears,
      specializations: v.specializations,
      languages: v.languages,
      working_days: v.workingDays,
      start_time: v.startTime,
      end_time: v.endTime,
      max_sessions_per_day: v.maxSessionsPerDay,
      accepting_new_members: v.acceptingNewMembers,
      session_types: v.sessionTypes,
      coaching_experience: v.coachingExperience,
      training_philosophy: v.trainingPhilosophy,
      instagram: v.instagram,
      linkedin: v.linkedin,
      youtube: v.youtube,
      website_url: v.websiteUrl,
      emergency_contact_name: v.emergencyContactName,
      emergency_relationship: v.emergencyRelationship as
        | "Mother"
        | "Father"
        | "Sister"
        | "Brother"
        | "Spouse"
        | "Sibling"
        | "Friend"
        | "Other",
      emergency_phone: v.emergencyPhone,
      emergency_alternate_phone: v.emergencyAlternatePhone,
      address_line: v.addressLine,
      city: v.city,
      state: v.state,
      country: v.country,
      postal_code: v.postalCode,
      additional_notes: v.additionalNotes,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
      status: "Active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", trainerId)
    .select("id,photo_url,full_name,contact_phone")
    .single();

  if (error) return { success: false, error: error.message };

  const { error: userError } = await supabase
    .from("users")
    .update({
      full_name: trainerData.full_name,
      phone: trainerData.contact_phone,
      ...(trainerData.photo_url && {
        avatar_url: trainerData.photo_url,
      }),
    })
    .eq("clerk_id", userId);

  if (userError) {
    return { success: false, error: userError.message };
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { ...meta, role: "trainer", onboardingComplete: true },
    });
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to finalize onboarding.",
    };
  }

  revalidatePath("/trainer/dashboard");
  return { success: true, data: undefined };
}

/**
 * Update self-editable trainer profile fields.
 * The `trainers_guard_self_update` trigger BLOCKS attempts to change:
 *   gym_id, salary, employee_id, status, profile_id, max_members
 * Those are owner-only — use owner.updateTrainerOwnerFields for those.
 */
export async function updateMyTrainerProfile(
  trainerId: string,
  payload: Partial<{
    bio: string;
    professionalTitle: string;
    gender: "Male" | "Female" | "Other";
    dateOfBirth: string;
    qualification: string;
    certification: string;
    experienceYears: number;
    specializations: string[];
    languages: string[];
    workingDays: string[];
    startTime: string;
    endTime: string;
    maxSessionsPerDay: number;
    acceptingNewMembers: boolean;
    sessionTypes: string[];
    coachingExperience: string;
    trainingPhilosophy: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    websiteUrl: string;
    emergencyContactName: string;
    emergencyRelationship:
      | "Mother"
      | "Father"
      | "Sister"
      | "Brother"
      | "Spouse"
      | "Sibling"
      | "Friend"
      | "Other";
    emergencyPhone: string;
    emergencyAlternatePhone: string;
    addressLine: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    additionalNotes: string;
  }>,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const fieldMap: Record<string, string> = {
    bio: "bio",
    professionalTitle: "professional_title",
    gender: "gender",
    dateOfBirth: "date_of_birth",
    qualification: "qualification",
    certification: "certification",
    experienceYears: "experience_years",
    specializations: "specializations",
    languages: "languages",
    workingDays: "working_days",
    startTime: "start_time",
    endTime: "end_time",
    maxSessionsPerDay: "max_sessions_per_day",
    acceptingNewMembers: "accepting_new_members",
    sessionTypes: "session_types",
    coachingExperience: "coaching_experience",
    trainingPhilosophy: "training_philosophy",
    instagram: "instagram",
    linkedin: "linkedin",
    youtube: "youtube",
    websiteUrl: "website_url",
    emergencyContactName: "emergency_contact_name",
    emergencyRelationship: "emergency_relationship",
    emergencyPhone: "emergency_phone",
    emergencyAlternatePhone: "emergency_alternate_phone",
    addressLine: "address_line",
    city: "city",
    state: "state",
    country: "country",
    postalCode: "postal_code",
    emailNotifications: "email_notifications",
    smsNotifications: "sms_notifications",
    pushNotifications: "push_notifications",
    additionalNotes: "additional_notes",
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    const val = (payload as Record<string, unknown>)[key];
    if (val !== undefined) update[col] = val;
  }

  const { error } = await supabase
    .from("trainers")
    .update(update as any)
    .eq("id", trainerId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/trainer/profile");
  return { success: true, data: undefined };
}

// ============================================================================
// Exercise Library
// ============================================================================

/**
 * Add a gym-specific exercise to the library.
 * gymId = null → global exercise (only admins should create those).
 */
export async function createExercise(payload: {
  gymId: string;
  name: string;
  equipment: string;
  muscleGroup:
    | "Back"
    | "Biceps"
    | "Triceps"
    | "Chest"
    | "Shoulders"
    | "Rear Delts"
    | "Legs"
    | "Core"
    | "Full Body"
    | "Glutes"
    | "Forearms"
    | "Traps";
  description?: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      gym_id: payload.gymId,
      name: payload.name,
      equipment: payload.equipment,
      muscle_group: payload.muscleGroup,
      description: payload.description,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainer/exercises");
  return { success: true, data: { id: data.id } };
}

export async function updateExercise(
  exerciseId: string,
  payload: Partial<{
    name: string;
    equipment: string;
    muscleGroup: string;
    description: string;
  }>,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const update: Record<string, unknown> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.equipment !== undefined) update.equipment = payload.equipment;
  if (payload.muscleGroup !== undefined)
    update.muscle_group = payload.muscleGroup;
  if (payload.description !== undefined)
    update.description = payload.description;

  const { error } = await supabase
    .from("exercises")
    .update(update as any)
    .eq("id", exerciseId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/trainer/exercises");
  return { success: true, data: undefined };
}

// ============================================================================
// Workout Templates
// ============================================================================

export async function createWorkoutTemplate(payload: {
  gymId: string;
  trainerId: string;
  name: string;
  category: string;
  description: string;
  workoutType?:
    | "Strength"
    | "Hypertrophy"
    | "Functional"
    | "Cardio"
    | "Mobility"
    | "Powerlifting"
    | "HIIT";
  primaryGoal?:
    | "Muscle Gain"
    | "Fat Loss"
    | "Strength"
    | "Endurance"
    | "Athletic Performance";
  difficultyLevel?: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes?: number;
  targetMuscles?: string[];
  status?: "Active" | "Draft" | "Archived";
  additionalNotes?: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("workout_templates")
    .insert({
      gym_id: payload.gymId,
      trainer_id: payload.trainerId,
      name: payload.name,
      category: payload.category,
      description: payload.description,
      workout_type: payload.workoutType,
      primary_goal: payload.primaryGoal,
      difficulty_level: payload.difficultyLevel,
      duration_minutes: payload.durationMinutes,
      target_muscles: payload.targetMuscles ?? [],
      status: payload.status ?? "Draft",
      additional_notes: payload.additionalNotes,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainer/templates");
  return { success: true, data: { id: data.id } };
}

export async function updateWorkoutTemplate(
  templateId: string,
  payload: Partial<{
    name: string;
    category: string;
    description: string;
    workoutType: string;
    primaryGoal: string;
    difficultyLevel: string;
    durationMinutes: number;
    targetMuscles: string[];
    status: "Active" | "Draft" | "Archived";
    additionalNotes: string;
  }>,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.category !== undefined) update.category = payload.category;
  if (payload.description !== undefined)
    update.description = payload.description;
  if (payload.workoutType !== undefined)
    update.workout_type = payload.workoutType;
  if (payload.primaryGoal !== undefined)
    update.primary_goal = payload.primaryGoal;
  if (payload.difficultyLevel !== undefined)
    update.difficulty_level = payload.difficultyLevel;
  if (payload.durationMinutes !== undefined)
    update.duration_minutes = payload.durationMinutes;
  if (payload.targetMuscles !== undefined)
    update.target_muscles = payload.targetMuscles;
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.additionalNotes !== undefined)
    update.additional_notes = payload.additionalNotes;

  const { error } = await supabase
    .from("workout_templates")
    .update(update as any)
    .eq("id", templateId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/trainer/templates");
  return { success: true, data: undefined };
}

// ============================================================================
// Template Exercises
// ============================================================================

export type TemplateExerciseInput = {
  exerciseId: string;
  sets: number;
  reps: string;
  weight?: string;
  restSeconds?: number;
};

export type WorkoutTemplateInput = {
  name: string;
  type?:
    | "Strength"
    | "Hypertrophy"
    | "Functional"
    | "Cardio"
    | "Mobility"
    | "Powerlifting"
    | "HIIT";
  goal?:
    | "Muscle Gain"
    | "Fat Loss"
    | "Strength"
    | "Endurance"
    | "Athletic Performance";
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  duration?: number;
  muscleGroups?: string[];
  description?: string;
  restBetweenSets?: string;
  equipment?: string[];
  notes?: string;
  exercises: TemplateExerciseInput[];
};

function toTemplateExerciseRows(
  templateId: string,
  exercises: TemplateExerciseInput[],
) {
  return exercises.map((ex, index) => ({
    template_id: templateId,
    exercise_id: ex.exerciseId,
    position: index,
    sets: ex.sets,
    reps: ex.reps,
    weight: ex.weight ?? "",
    rest_seconds: ex.restSeconds ?? 60,
  }));
}

export async function createWorkoutTemplateWithExercises(
  payload: WorkoutTemplateInput,
): Promise<ActionResult<{ id: string }>> {
  const { sessionClaims } = await auth();
  const { trainerId, gymId } = (sessionClaims?.publicMetadata ?? {}) as {
    trainerId?: string;
    gymId?: string;
  };

  if (!trainerId || !gymId) {
    return { success: false, error: "Trainer or Gym not found." };
  }

  if (payload.exercises.length === 0) {
    return {
      success: false,
      error: "Add at least one exercise to the template.",
    };
  }

  const supabase = await createServerClient();

  const { data: template, error } = await supabase
    .from("workout_templates")
    .insert({
      gym_id: gymId,
      trainer_id: trainerId,
      name: payload.name,
      // No dedicated "category" field on the form — mirrors template type
      // until the UI grows a separate category selector.
      category: payload.type ?? "General",
      description: payload.description ?? "",
      workout_type: payload.type,
      primary_goal: payload.goal,
      difficulty_level: payload.difficulty,
      duration_minutes: payload.duration,
      target_muscles: payload.muscleGroups ?? [],
      additional_notes: payload.notes,
      status: "Active",
      equipment: payload.equipment ?? [],
      default_rest_seconds: payload.restBetweenSets
        ? restLabelToSeconds(payload.restBetweenSets)
        : 60,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  const { error: exercisesError } = await supabase
    .from("template_exercises")
    .insert(toTemplateExerciseRows(template.id, payload.exercises));

  if (exercisesError) {
    // Don't leave an empty draft template behind if the exercise insert fails.
    await supabase.from("workout_templates").delete().eq("id", template.id);
    return { success: false, error: exercisesError.message };
  }

  revalidatePath("/trainer/templates");
  return { success: true, data: { id: template.id } };
}

export async function updateWorkoutTemplateWithExercises(
  templateId: string,
  payload: WorkoutTemplateInput,
): Promise<ActionResult<{ id: string }>> {
  const { sessionClaims } = await auth();
  const { trainerId, gymId } = (sessionClaims?.publicMetadata ?? {}) as {
    trainerId?: string;
    gymId?: string;
  };

  if (!trainerId || !gymId) {
    return { success: false, error: "Trainer or Gym not found." };
  }

  if (payload.exercises.length === 0) {
    return {
      success: false,
      error: "Add at least one exercise to the template.",
    };
  }

  const supabase = await createServerClient();

  const { data: template, error } = await supabase
    .from("workout_templates")
    .update({
      name: payload.name,
      category: payload.type ?? "General", // mirrors create — confirmed pattern
      description: payload.description ?? "",
      workout_type: payload.type,
      primary_goal: payload.goal,
      difficulty_level: payload.difficulty,
      duration_minutes: payload.duration,
      target_muscles: payload.muscleGroups ?? [],
      additional_notes: payload.notes,
      equipment: payload.equipment ?? [],
      default_rest_seconds: payload.restBetweenSets
        ? restLabelToSeconds(payload.restBetweenSets)
        : 60,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .eq("gym_id", gymId) // defense in depth alongside RLS, matches insert's scoping
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  // Replace-all strategy: simpler than diffing rowIds client-side, but
  // needs a DELETE policy on template_exercises — flagged last turn,
  // not present in the schema you've shown me. This will fail at
  // runtime (RLS silently returns 0 rows deleted, not an error, so
  // watch for that specifically) until the policy is added.
  const { error: deleteError } = await supabase
    .from("template_exercises")
    .delete()
    .eq("template_id", templateId);

  if (deleteError) return { success: false, error: deleteError.message };

  const { error: exercisesError } = await supabase
    .from("template_exercises")
    .insert(toTemplateExerciseRows(templateId, payload.exercises));

  if (exercisesError) return { success: false, error: exercisesError.message };

  revalidatePath("/trainer/templates");
  revalidatePath(`/trainer/templates/${templateId}`);
  return { success: true, data: { id: template.id } };
}

export async function removeExerciseFromTemplate(
  templateExerciseId: string,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("template_exercises")
    .delete()
    .eq("id", templateExerciseId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/trainer/templates/${templateExerciseId}`);
  return { success: true, data: undefined };
}

// ============================================================================
// Training Sessions
// ============================================================================

/**
 * Create a training session from a workout template.
 * The `notify_session_scheduled` trigger fires automatically and creates a
 * notification for the member. Session exercises should be seeded separately
 * by copying from templateExercises (see seedSessionFromTemplate).
 */

export type SessionExerciseInput = {
  exerciseId: string;
  position: number;
  sets: number;
  reps: string;
  weight?: string;
  restSeconds?: number;
};

export async function createTrainingSessionWithExercises(payload: {
  gymId: string;
  trainerId: string;
  memberId: string;
  templateId?: string;
  sessionName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  workoutType?:
    | "Strength"
    | "Hypertrophy"
    | "Functional"
    | "Cardio"
    | "Mobility"
    | "Powerlifting"
    | "HIIT";
  sessionType?:
    | "Personal Training"
    | "Group Session"
    | "Assessment"
    | "Consultation";
  location?: string;
  notes?: string;
  showRestTimer?: boolean;
  defaultRestSeconds?: number;
  reminderMinutes?: number;
  /** Set true to copy exercises from templateId instead of sending `exercises`. */
  seedFromTemplate?: boolean;
  exercises?: SessionExerciseInput[];
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc(
    "create_training_session_with_exercises",
    {
      p_gym_id: payload.gymId,
      p_trainer_id: payload.trainerId,
      p_member_id: payload.memberId,
      p_template_id: payload.templateId ?? null,
      p_session_name: payload.sessionName,
      p_session_date: payload.sessionDate,
      p_start_time: payload.startTime,
      p_end_time: payload.endTime,
      p_duration_minutes: payload.durationMinutes ?? null,
      p_workout_type: payload.workoutType ?? "Strength",
      p_session_type: payload.sessionType ?? "Personal Training",
      p_location: payload.location ?? null,
      p_notes: payload.notes ?? null,
      p_show_rest_timer: payload.showRestTimer ?? true,
      p_default_rest_seconds: payload.defaultRestSeconds ?? 60,
      p_reminder_minutes: payload.reminderMinutes ?? 15,
      p_exercises: payload.seedFromTemplate
        ? null
        : (payload.exercises ?? []).map((ex) => ({
            exercise_id: ex.exerciseId,
            position: ex.position,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight ?? "",
            rest_seconds: ex.restSeconds ?? 60,
          })),
      p_seed_from_template: payload.seedFromTemplate ?? false,
    },
  );

  if (error) return { success: false, error: error.message };
  revalidatePath("/trainer/sessions");
  return { success: true, data: { id: data as string } };
}

export async function updateTrainingSessionWithExercises(
  sessionId: string,
  payload: {
    gymId: string;
    memberId: string;
    templateId?: string;
    sessionName: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    durationMinutes?: number;
    workoutType?:
      | "Strength"
      | "Hypertrophy"
      | "Functional"
      | "Cardio"
      | "Mobility"
      | "Powerlifting"
      | "HIIT";
    sessionType?:
      | "Personal Training"
      | "Group Session"
      | "Assessment"
      | "Consultation";
    location?: string;
    notes?: string;
    showRestTimer?: boolean;
    defaultRestSeconds?: number;
    reminderMinutes?: number;
    exercises: SessionExerciseInput[];
  },
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc(
    "update_training_session_with_exercises",
    {
      p_session_id: sessionId,
      p_gym_id: payload.gymId,
      p_member_id: payload.memberId,
      p_template_id: payload.templateId ?? null,
      p_session_name: payload.sessionName,
      p_session_date: payload.sessionDate,
      p_start_time: payload.startTime,
      p_end_time: payload.endTime,
      p_duration_minutes: payload.durationMinutes ?? null,
      p_workout_type: payload.workoutType ?? "Strength",
      p_session_type: payload.sessionType ?? "Personal Training",
      p_location: payload.location ?? null,
      p_notes: payload.notes ?? null,
      p_show_rest_timer: payload.showRestTimer ?? true,
      p_default_rest_seconds: payload.defaultRestSeconds ?? 60,
      p_reminder_minutes: payload.reminderMinutes ?? 15,
      p_exercises: payload.exercises.map((ex) => ({
        exercise_id: ex.exerciseId,
        position: ex.position,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight ?? "",
        rest_seconds: ex.restSeconds ?? 60,
      })),
    },
  );

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainer/sessions");
  revalidatePath(`/trainer/training-sessions/${sessionId}`);
  return { success: true, data: { id: data as string } };
}

/**
 * Mark a session as Completed.
 */
export async function completeTrainingSession(
  sessionId: string,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("training_sessions")
    .update({
      status: "Completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainer/sessions");
  return { success: true, data: undefined };
}

export async function toggleSessionExerciseCompletion(
  sessionExerciseId: string,
  completed: boolean,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("session_exercises")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", sessionExerciseId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/trainer/sessions/${sessionExerciseId}`);
  return { success: true, data: undefined };
}

export async function updateSessionExercise(
  sessionExerciseId: string,
  payload: Partial<{
    position: number;
    sets: number;
    reps: string;
    weight: string;
    restSeconds: number;
  }>,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const update: Record<string, unknown> = {};
  if (payload.position !== undefined) update.position = payload.position;
  if (payload.sets !== undefined) update.sets = payload.sets;
  if (payload.reps !== undefined) update.reps = payload.reps;
  if (payload.weight !== undefined) update.weight = payload.weight;
  if (payload.restSeconds !== undefined)
    update.rest_seconds = payload.restSeconds;

  const { error } = await supabase
    .from("session_exercises")
    .update(update as any)
    .eq("id", sessionExerciseId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function removeSessionExercise(
  sessionExerciseId: string,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("session_exercises")
    .delete()
    .eq("id", sessionExerciseId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

// ============================================================================
// Messaging
// ============================================================================

export async function sendMessage(payload: {
  gymId?: string;
  receiverId: string;
  subject?: string;
  body: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createServerClient();

  const { data: currentUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .single();

  if (userError || !currentUser)
    return { success: false, error: "User not found." };

  const { data, error } = await supabase
    .from("messages")
    .insert({
      gym_id: payload.gymId,
      sender_id: currentUser.id,
      receiver_id: payload.receiverId,
      subject: payload.subject,
      body: payload.body,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: { id: data.id } };
}
