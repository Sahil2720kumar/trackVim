import { createClient } from "@/lib/supabase/server";
import { getTodayDateStr } from "@/lib/utils";

// ============================================================================
// Read-only data-fetching functions
//
// These are NOT Server Actions (no "use server" directive). They're plain
// async functions meant to be awaited directly inside Server Components /
// route handlers (e.g. `const { data } = await getMyAssignedMembers(gymId, trainerId)`).
// Keeping them out of the actions file avoids turning every read into a
// Server Action endpoint, which adds pointless serialization/network
// overhead for data that never mutates anything.
// ============================================================================

/**
 * Returns global exercises (gym_id is null) + gym-specific exercises.
 */
export async function getExercises(gymId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .or(`gym_id.is.null,gym_id.eq.${gymId}`)
    .order("name", { ascending: true });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getMyTrainerProfile(gymId: string, trainerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("gym_id", gymId)
    .eq("id", trainerId)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}
export async function getMyAssignedMembers(gymId: string, trainerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainer_assignments")
    .select(
      `
      *,
      members(
        id, full_name, contact_email, contact_phone, photo_url,
        gender, date_of_birth, account_status, member_code,
        fitness_goal, medical_conditions
      ),
      gym_memberships:gym_memberships!inner(id, status, start_date, end_date,
        membership_plans(plan_name, plan_color))
    `,
    )
    .eq("gym_id", gymId)
    .eq("trainer_id", trainerId)
    .eq("is_active", true);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getUpcomingSessions(gymId: string, trainerId: string) {
  const supabase = await createClient();

  const { data: gym } = await supabase
    .from("gyms")
    .select("timezone")
    .eq("id", gymId)
    .maybeSingle();

  const today = getTodayDateStr(gym?.timezone ?? "Asia/Kolkata");

  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      `
      *,
      members(id, full_name, photo_url),
      session_exercises(*, exercises(name, muscle_group, equipment))
    `,
    )
    .eq("gym_id", gymId)
    .eq("trainer_id", trainerId)
    .eq("status", "Upcoming")
    .gte("session_date", today)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getSessionWithExercises(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      `
      *,
      members(id, full_name, photo_url, fitness_goal),
      workout_templates(id, name),
      session_exercises(
        *,
        exercises(id, name, muscle_group, equipment, description)
      )
    `,
    )
    .eq("id", sessionId)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getWorkoutTemplateWithExercises(templateId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_templates")
    .select(
      `
      *,
      template_exercises(
        *,
        exercises(id, name, muscle_group, equipment, description)
      )
    `,
    )
    .eq("id", templateId)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function getTrainerNotifications() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}
