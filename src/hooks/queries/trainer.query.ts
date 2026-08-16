// hooks/queries/useTrainer.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/lib/supabase/client";
import {
  getMyTrainerProfile,
  getMyAssignedMembers,
  getUpcomingSessions,
  getSessionWithExercises,
  getTrainerNotifications,
  getAllExercises,
  getTrainerGymId,
  getWorkoutTemplates,
  getAllSessions,
  getWorkoutTemplateById,
} from "@/services/trainer.query";

export function useMyTrainerProfile(
  gymId: string | null,
  trainerId: string | null,
) {
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["trainerProfile", gymId, trainerId],
    queryFn: () => {
      if (!gymId || !trainerId) {
        throw new Error("Gym ID and Trainer ID are required");
      }
      return getMyTrainerProfile(supabase, gymId, trainerId);
    },
    enabled: !!gymId && !!trainerId,
  });
}

export function useMyAssignedMembers(
  gymId: string | null,
  trainerId: string | null,
) {
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["assignedMembers", gymId, trainerId],
    queryFn: () => {
      if (!gymId || !trainerId) {
        throw new Error("Gym ID and Trainer ID are required");
      }
      return getMyAssignedMembers(supabase, gymId, trainerId);
    },
    enabled: !!gymId && !!trainerId,
  });
}

export function useAllSessions(gymId: string | null, trainerId: string | null) {
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["allSessions", gymId, trainerId],
    queryFn: () => {
      if (!gymId || !trainerId) {
        throw new Error("Gym ID and Trainer ID are required");
      }
      return getAllSessions(supabase, gymId, trainerId);
    },
    enabled: !!gymId && !!trainerId,
  });
}

export function useUpcomingSessions(
  gymId: string | null,
  trainerId: string | null,
) {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["upcomingSessions", gymId, trainerId],
    queryFn: () => {
      if (!gymId || !trainerId) {
        throw new Error("Gym ID and Trainer ID are required");
      }
      return getUpcomingSessions(supabase, gymId, trainerId);
    },
    enabled: !!supabase && !!gymId && !!trainerId,
  });
}

export function useSessionWithExercises(sessionId: string | null) {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["sessionWithExercises", sessionId],
    queryFn: () => {
      if (!sessionId) {
        throw new Error("Session ID is required");
      }
      return getSessionWithExercises(supabase, sessionId);
    },
    enabled: !!supabase && !!sessionId,
  });
}

export function useTrainerNotifications() {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["trainerNotifications"],
    queryFn: () => getTrainerNotifications(supabase),
    enabled: !!supabase,
  });
}

export function useAllExercises(gymId: string | null) {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["exercises", gymId],

    queryFn: () => {
      if (!gymId) {
        throw new Error("Gym ID is required");
      }

      return getAllExercises(supabase, gymId);
    },

    enabled: !!gymId,
  });
}

export function useTrainerGymId(trainerId: string | null) {
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["trainerGymId", trainerId],
    queryFn: () => {
      if (!trainerId) {
        throw new Error("Trainer ID is required");
      }
      return getTrainerGymId(supabase, trainerId);
    },
    enabled: !!trainerId,
  });
}

export function useWorkoutTemplates(gymId: string | null) {
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["workoutTemplates", gymId],

    queryFn: async () => {
      if (!gymId) {
        throw new Error("Gym ID is required");
      }

      return getWorkoutTemplates(supabase, gymId);
    },

    enabled: !!gymId,
  });
}

export function useWorkoutTemplateById(templateId: string | null) {
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["workoutTemplateById", templateId],
    queryFn: () => {
      if (!templateId) {
        throw new Error("Template ID is required");
      }
      return getWorkoutTemplateById(supabase, templateId);
    },
    enabled: !!templateId,
  });
}
