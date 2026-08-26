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
    .select(
      `
      *,
      gyms(id, name, logo_url, timezone)
    `,
    )
    .eq("gym_id", gymId)
    .eq("id", trainerId)
    .maybeSingle();

  if (error) return { success: false as const, error: error.message };
  if (!data) {
    return { success: false as const, error: "Trainer profile not found." };
  }
  return { success: true as const, data };
}

export type MyTrainerProfileResult = Extract<
  Awaited<ReturnType<typeof getMyTrainerProfile>>,
  { success: true }
>["data"];

export async function getTodaysSessions(
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
      members(id, full_name, photo_url)
    `,
    )
    .eq("gym_id", gymId)
    .eq("trainer_id", trainerId)
    .eq("session_date", today)
    .order("start_time", { ascending: true });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type TodaysSessionsResult = Extract<
  Awaited<ReturnType<typeof getTodaysSessions>>,
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

  const assignments = data ?? [];
  const memberIds = assignments
    .map((a) => a.members?.id)
    .filter((id): id is string => Boolean(id));

  const attendanceByMember = new Map<string, number>();

  if (memberIds.length > 0) {
    const { data: stats, error: statsError } = await supabase.rpc(
      "get_member_attendance_stats",
      {
        p_member_ids: memberIds,
        p_gym_id: gymId,
        p_as_of: getTodayDateStr("Asia/Kolkata"),
      },
    );

    if (!statsError && stats) {
      for (const stat of stats) {
        attendanceByMember.set(stat.member_id, Number(stat.attendance_rate));
      }
    }
  }

  const result = assignments.map((assignment) => ({
    ...assignment,
    members: assignment.members
      ? {
          ...assignment.members,
          attendanceRate: attendanceByMember.get(assignment.members.id) ?? 0,
        }
      : assignment.members,
  }));

  return { success: true as const, data: result };
}

export type MyAssignedMembersResult = Extract<
  Awaited<ReturnType<typeof getMyAssignedMembers>>,
  { success: true }
>["data"];

// Unchanged — still needed for lastSession/nextSession labels, since
// getMyAssignedMembers' RPC only returns an attendance rate, not session dates.
export async function getMemberSessionHistory(
  supabase: TypedSupabaseClient,
  gymId: string,
  trainerId: string,
) {
  const ninetyDaysAgoStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().slice(0, 10);
  })();

  const { data, error } = await supabase
    .from("training_sessions")
    .select("member_id, session_date, start_time, status")
    .eq("gym_id", gymId)
    .eq("trainer_id", trainerId)
    .gte("session_date", ninetyDaysAgoStr)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export type MemberSessionHistoryResult = Extract<
  Awaited<ReturnType<typeof getMemberSessionHistory>>,
  { success: true }
>["data"];

export async function getTrainerDashboardData(
  supabase: TypedSupabaseClient,
  gymId: string,
  trainerId: string,
) {
  try {
    const { data: gym } = await supabase
      .from("gyms")
      .select("timezone")
      .eq("id", gymId)
      .maybeSingle();

    const asOfDate = getTodayDateStr(gym?.timezone ?? "Asia/Kolkata");
    const sevenDaysAgoIso = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d.toISOString();
    })();

    const [
      assignedMembersResult,
      todaysSessionsResult,
      upcomingResult,
      attendanceResult,
      sessionHistoryResult,
    ] = await Promise.all([
      getMyAssignedMembers(supabase, gymId, trainerId), // CHANGED
      getTodaysSessions(supabase, gymId, trainerId),
      supabase
        .from("training_sessions")
        .select("id", { count: "exact", head: true })
        .eq("gym_id", gymId)
        .eq("trainer_id", trainerId)
        .eq("status", "Upcoming")
        .gt("session_date", asOfDate),
      supabase.rpc("get_trainer_attendance_summary", {
        p_gym_id: gymId,
        p_trainer_id: trainerId,
        p_as_of: asOfDate,
      }),
      getMemberSessionHistory(supabase, gymId, trainerId),
    ]);

    if (!assignedMembersResult.success) {
      throw new Error(
        `assignments fetch failed: ${assignedMembersResult.error}`,
      );
    }

    if (!todaysSessionsResult.success) {
      throw new Error(
        `today's sessions fetch failed: ${todaysSessionsResult.error}`,
      );
    }

    if (!sessionHistoryResult.success) {
      throw new Error(
        `session history fetch failed: ${sessionHistoryResult.error}`,
      );
    }

    const { count: upcomingSessionsCount, error: upcomingError } =
      upcomingResult;
    if (upcomingError) {
      throw new Error(
        `upcoming sessions fetch failed: ${upcomingError.message}`,
      );
    }

    const { data: attendanceRows, error: attendanceError } = attendanceResult;
    if (attendanceError) {
      throw new Error(
        `get_trainer_attendance_summary failed: ${attendanceError.message}`,
      );
    }
    const attendance = attendanceRows?.[0] as
      | {
          attendance_today_count: number;
          attendance_rate_today: number;
          attendance_rate_yesterday: number;
        }
      | undefined;

    const assignedMembers = assignedMembersResult.data;

    const assignedMembersCount = assignedMembers.length;
    const newAssignmentsThisWeek = assignedMembers.filter(
      (a) => a.assigned_at && a.assigned_at >= sevenDaysAgoIso,
    ).length;

    const todaysSessions = todaysSessionsResult.data;
    const todaysCompletedCount = todaysSessions.filter(
      (s) => s.status === "Completed",
    ).length;
    const todaysUpcomingCount = todaysSessions.filter(
      (s) => s.status === "Upcoming",
    ).length;

    const attendanceTodayCount = attendance?.attendance_today_count ?? 0;

    return {
      success: true as const,
      data: {
        assignedMembersCount,
        newAssignmentsThisWeek,
        assignedMembers,
        sessionHistory: sessionHistoryResult.data,
        todaysSessions,
        todaysSessionsCount: todaysSessions.length,
        todaysCompletedCount,
        todaysUpcomingCount,
        attendanceTodayCount,
        attendanceAbsentCount: Math.max(
          assignedMembersCount - attendanceTodayCount,
          0,
        ),
        attendanceRateToday: Number(attendance?.attendance_rate_today ?? 0),
        attendanceRateYesterday: Number(
          attendance?.attendance_rate_yesterday ?? 0,
        ),
        upcomingSessionsCount: upcomingSessionsCount ?? 0,
      },
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export type TrainerDashboardResult = Extract<
  Awaited<ReturnType<typeof getTrainerDashboardData>>,
  { success: true }
>["data"];

// export async function getMyAssignedMembers(
//   supabase: TypedSupabaseClient,
//   gymId: string,
//   trainerId: string,
// ) {
//   const { data, error } = await supabase
//     .from("trainer_assignments")
//     .select(
//       `
//     *,
//     members!inner(
//       id,
//       full_name,
//       contact_email,
//       contact_phone,
//       photo_url,
//       gender,
//       date_of_birth,
//       account_status,
//       member_code,
//       fitness_goal,
//       medical_conditions,
//       gym_memberships:gym_memberships!gym_memberships_member_id_members_id_fk(
//         id,
//         gym_id,
//         status,
//         start_date,
//         end_date,
//         membership_plans(
//           plan_name,
//           plan_color
//         )
//       )
//     )
//   `,
//     )
//     .eq("gym_id", gymId)
//     .eq("trainer_id", trainerId)
//     .eq("is_active", true);

//   if (error) return { success: false as const, error: error.message };

//   const assignments = data ?? [];
//   const memberIds = assignments
//     .map((a) => a.members?.id)
//     .filter((id): id is string => Boolean(id));

//   const attendanceByMember = new Map<string, number>();

//   if (memberIds.length > 0) {
//     const { data: stats, error: statsError } = await supabase.rpc(
//       "get_member_attendance_stats",
//       {
//         p_member_ids: memberIds,
//         p_gym_id: gymId,
//         p_as_of: getTodayDateStr("Asia/Kolkata"),
//       },
//     );

//     if (!statsError && stats) {
//       for (const stat of stats) {
//         attendanceByMember.set(stat.member_id, Number(stat.attendance_rate));
//       }
//     }
//   }

//   const result = assignments.map((assignment) => ({
//     ...assignment,
//     members: assignment.members
//       ? {
//           ...assignment.members,
//           attendanceRate: attendanceByMember.get(assignment.members.id) ?? 0,
//         }
//       : assignment.members,
//   }));

//   console.log("result", result);
//   return { success: true as const, data: result };
// }

// export type MyAssignedMembersResult = Extract<
//   Awaited<ReturnType<typeof getMyAssignedMembers>>,
//   { success: true }
// >["data"];

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
