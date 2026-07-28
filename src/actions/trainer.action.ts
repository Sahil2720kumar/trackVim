"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Trainer Profile (self-editable fields only)
// ============================================================================

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
  const supabase = await createClient();

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

/**
 * Mark invitation as accepted and link the trainer row to this user's profile.
 */
export async function acceptTrainerInvitation(
  trainerId: string,
  profileId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trainers")
    .update({
      profile_id: profileId,
      invitation_accepted_at: new Date().toISOString(),
      status: "Active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", trainerId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainer");
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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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

export async function addExerciseToTemplate(payload: {
  templateId: string;
  exerciseId: string;
  position?: number;
  sets?: number;
  reps?: string;
  weight?: string;
  restSeconds?: number;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("template_exercises")
    .insert({
      template_id: payload.templateId,
      exercise_id: payload.exerciseId,
      position: payload.position ?? 0,
      sets: payload.sets ?? 3,
      reps: payload.reps ?? "10",
      weight: payload.weight ?? "",
      rest_seconds: payload.restSeconds ?? 60,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainer/templates");
  return { success: true, data: { id: data.id } };
}

export async function updateTemplateExercise(
  templateExerciseId: string,
  payload: Partial<{
    position: number;
    sets: number;
    reps: string;
    weight: string;
    restSeconds: number;
  }>,
): Promise<ActionResult> {
  const supabase = await createClient();

  const update: Record<string, unknown> = {};
  if (payload.position !== undefined) update.position = payload.position;
  if (payload.sets !== undefined) update.sets = payload.sets;
  if (payload.reps !== undefined) update.reps = payload.reps;
  if (payload.weight !== undefined) update.weight = payload.weight;
  if (payload.restSeconds !== undefined)
    update.rest_seconds = payload.restSeconds;

  const { error } = await supabase
    .from("template_exercises")
    .update(update as any)
    .eq("id", templateExerciseId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainer/templates");
  return { success: true, data: undefined };
}

export async function removeExerciseFromTemplate(
  templateExerciseId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("template_exercises")
    .delete()
    .eq("id", templateExerciseId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainer/templates");
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
export async function createTrainingSession(payload: {
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
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      gym_id: payload.gymId,
      trainer_id: payload.trainerId,
      member_id: payload.memberId,
      template_id: payload.templateId,
      session_name: payload.sessionName,
      session_date: payload.sessionDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      duration_minutes: payload.durationMinutes,
      workout_type: payload.workoutType ?? "Strength",
      session_type: payload.sessionType ?? "Personal Training",
      location: payload.location,
      notes: payload.notes,
      show_rest_timer: payload.showRestTimer ?? true,
      default_rest_seconds: payload.defaultRestSeconds ?? 60,
      reminder_minutes: payload.reminderMinutes ?? 15,
      status: "Upcoming",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainer/sessions");
  return { success: true, data: { id: data.id } };
}

/**
 * Seed session exercises by copying from a template.
 * Call this right after createTrainingSession when templateId is provided.
 */
export async function seedSessionFromTemplate(
  sessionId: string,
  templateId: string,
): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient();

  // Fetch template exercises
  const { data: templateExercises, error: fetchError } = await supabase
    .from("template_exercises")
    .select("*")
    .eq("template_id", templateId)
    .order("position", { ascending: true });

  if (fetchError) return { success: false, error: fetchError.message };
  if (!templateExercises || templateExercises.length === 0) {
    return { success: true, data: { count: 0 } };
  }

  const sessionExercises = templateExercises.map((te) => ({
    session_id: sessionId,
    exercise_id: te.exercise_id,
    position: te.position,
    sets: te.sets,
    reps: te.reps,
    weight: te.weight,
    rest_seconds: te.rest_seconds,
  }));

  const { error: insertError } = await supabase
    .from("session_exercises")
    .insert(sessionExercises);

  if (insertError) return { success: false, error: insertError.message };

  return { success: true, data: { count: sessionExercises.length } };
}

export async function updateTrainingSession(
  sessionId: string,
  payload: Partial<{
    sessionName: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    workoutType: string;
    sessionType: string;
    location: string;
    status: "Upcoming" | "InProgress" | "Completed" | "Cancelled";
    notes: string;
  }>,
): Promise<ActionResult> {
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.sessionName !== undefined)
    update.session_name = payload.sessionName;
  if (payload.sessionDate !== undefined)
    update.session_date = payload.sessionDate;
  if (payload.startTime !== undefined) update.start_time = payload.startTime;
  if (payload.endTime !== undefined) update.end_time = payload.endTime;
  if (payload.durationMinutes !== undefined)
    update.duration_minutes = payload.durationMinutes;
  if (payload.workoutType !== undefined)
    update.workout_type = payload.workoutType;
  if (payload.sessionType !== undefined)
    update.session_type = payload.sessionType;
  if (payload.location !== undefined) update.location = payload.location;
  if (payload.notes !== undefined) update.notes = payload.notes;
  if (payload.status !== undefined) {
    update.status = payload.status;
    if (payload.status === "Completed")
      update.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("training_sessions")
    .update(update as any)
    .eq("id", sessionId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/trainer/sessions");
  return { success: true, data: undefined };
}

/**
 * Mark a session as Completed.
 */
export async function completeTrainingSession(
  sessionId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

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

// ============================================================================
// Session Exercises (edit THIS session, not the template)
// ============================================================================

export async function addExerciseToSession(payload: {
  sessionId: string;
  exerciseId: string;
  position?: number;
  sets?: number;
  reps?: string;
  weight?: string;
  restSeconds?: number;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("session_exercises")
    .insert({
      session_id: payload.sessionId,
      exercise_id: payload.exerciseId,
      position: payload.position ?? 0,
      sets: payload.sets ?? 3,
      reps: payload.reps ?? "10",
      weight: payload.weight ?? "",
      rest_seconds: payload.restSeconds ?? 60,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: { id: data.id } };
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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
