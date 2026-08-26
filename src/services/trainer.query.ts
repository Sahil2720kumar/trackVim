import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayDateStr } from "@/lib/utils";
import { Database } from "@/db/database.types";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getMyTrainerProfile(
  supabase: TypedSupabaseClient,
  gymId: string,
  trainerId: string,
) {
  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("gym_id", gymId)
    .eq("id", trainerId)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type MyTrainerProfileResult = Extract<
  Awaited<ReturnType<typeof getMyTrainerProfile>>,
  { success: true }
>["data"];

export async function getMyAssignedMembers(
  supabase: TypedSupabaseClient,
  gymId: string,
  trainerId: string,
) {
  const { data, error } = await supabase
    .from("trainer_assignments")
    .select(
      `
    *,
    members!inner(
      id,
      full_name,
      contact_email,
      contact_phone,
      photo_url,
      gender,
      date_of_birth,
      account_status,
      member_code,
      fitness_goal,
      medical_conditions,
      gym_memberships:gym_memberships!gym_memberships_member_id_members_id_fk(
        id,
        gym_id,
        status,
        start_date,
        end_date,
        membership_plans(
          plan_name,
          plan_color
        )
      )
    )
  `,
    )
    .eq("gym_id", gymId)
    .eq("trainer_id", trainerId)
    .eq("is_active", true);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type MyAssignedMembersResult = Extract<
  Awaited<ReturnType<typeof getMyAssignedMembers>>,
  { success: true }
>["data"];

export async function getUpcomingSessions(
  supabase: TypedSupabaseClient,
  gymId: string,
  trainerId: string,
) {
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

export type UpcomingSessionsResult = Extract<
  Awaited<ReturnType<typeof getUpcomingSessions>>,
  { success: true }
>["data"];

export async function getAllSessions(
  supabase: TypedSupabaseClient,
  gymId: string,
  trainerId: string,
) {
  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      `
      *,
      members(id, full_name, photo_url)
    `,
    )
    .eq("gym_id", gymId)
    .eq("trainer_id", trainerId)
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type AllSessionsResult = Extract<
  Awaited<ReturnType<typeof getAllSessions>>,
  { success: true }
>["data"];

export async function getSessionWithExercises(
  supabase: TypedSupabaseClient,
  sessionId: string,
) {
  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      `
      *,
      members!inner(
        id, full_name, photo_url, fitness_goal,
        gym_memberships:gym_memberships!gym_memberships_member_id_members_id_fk(
          status, membership_plans(plan_name)
        )
      ),
      workout_templates(id, name, description, difficulty_level),
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

export type SessionWithExercisesResult = Extract<
  Awaited<ReturnType<typeof getSessionWithExercises>>,
  { success: true }
>["data"];

export async function getTrainerNotifications(supabase: TypedSupabaseClient) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type TrainerNotificationsResult = Extract<
  Awaited<ReturnType<typeof getTrainerNotifications>>,
  { success: true }
>["data"];

// training session, workout template, exercises

export async function getAllExercises(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .or(`gym_id.is.null,gym_id.eq.${gymId}`)
    .order("name", { ascending: true });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type AllExercisesResult = Extract<
  Awaited<ReturnType<typeof getAllExercises>>,
  { success: true }
>["data"];

export async function getTrainerGymId(
  supabase: TypedSupabaseClient,
  trainerId: string,
) {
  const { data, error } = await supabase
    .from("trainers")
    .select("gym_id")
    .eq("id", trainerId)
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data: data.gym_id as string };
}

export type TrainerGymIdResult = Extract<
  Awaited<ReturnType<typeof getTrainerGymId>>,
  { success: true }
>["data"];

export async function getWorkoutTemplates(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("workout_templates")
    .select(
      `
      *,
      template_exercises(
        *,
        exercise:exercises(id, name, muscle_group, equipment)
      )
    `,
    )
    .eq("gym_id", gymId)
    .order("updated_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };

  // Supabase doesn't support ordering nested relations inline in this
  // syntax reliably across versions — sort template_exercises by position
  // client-side to be safe.
  const sorted = data.map((row) => ({
    ...row,
    template_exercises: [...(row.template_exercises ?? [])].sort(
      (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
    ),
  }));

  return { success: true as const, data: sorted };
}

export type WorkoutTemplatesResult = Extract<
  Awaited<ReturnType<typeof getWorkoutTemplates>>,
  { success: true }
>["data"];

export async function getWorkoutTemplateById(
  supabase: TypedSupabaseClient,
  templateId: string,
) {
  const { data, error } = await supabase
    .from("workout_templates")
    .select(
      `
      *,
      trainers(full_name),
      template_exercises(
        *,
        exercise:exercises(id, name, muscle_group, equipment, description)
      )
    `,
    )
    .eq("id", templateId)
    .single();

  if (error) return { success: false as const, error: error.message };

  const sorted = {
    ...data,
    template_exercises: [...(data.template_exercises ?? [])].sort(
      (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
    ),
  };

  return { success: true as const, data: sorted };
}

export type WorkoutTemplateByIdResult = Extract<
  Awaited<ReturnType<typeof getWorkoutTemplateById>>,
  { success: true }
>["data"];
