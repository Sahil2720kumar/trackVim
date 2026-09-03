import { useQuery } from "@tanstack/react-query";

import { useSupabaseClient } from "@/lib/supabase/client";
import { useOwnerStore } from "@/stores/owner.store";
import {
  getGymOwnerInfo,
  getOwnerDashboardData,
  getMembershipPlans,
  getGymRevenueMonthly,
  getTopPerformingPlans,
  getTrainersAndPlans,
  getGymWithDetails,
  getApplications,
  getApplicationById,
  getPendingPayments,
  getGymMembers,
  getGymActiveMembers,
  getGymSubscriptions,
  getGymAttendance,
  getAllTrainers,
  getTrainerStats,
  getTrainerById,
  getTrainerSessionStats,
  getMonthlySessionsForTrainer,
  getMembersAndPlans,
  getMembersWithAttendance,
  getGymMemberStats,
  getMembersByIdWithAttendence,
  getGymPayments,
  getGymPaymentsOverview,
  getPaymentById,
  getPlanById,
} from "@/services/owner.query";

const FAST = 30_000; // attendance, sessions, today-status
const SLOW = 5 * 60_000; // profile, memberships, gym detail, discovery

// ============================================================================
// Gym-scoped (activeGymId) — the vast majority of the dashboard
// ============================================================================

export function useGymOwnerInfo() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-owner-info", activeGymId],
    queryFn: async () => {
      const result = await getGymOwnerInfo(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useOwnerDashboardData() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["owner-dashboard", activeGymId],
    queryFn: async () => {
      const result = await getOwnerDashboardData(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useMembershipPlans() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["membership-plans", activeGymId],
    queryFn: async () => {
      const result = await getMembershipPlans(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymRevenueMonthly() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-revenue-monthly", activeGymId],
    queryFn: async () => {
      const result = await getGymRevenueMonthly(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useTopPerformingPlans() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["top-performing-plans", activeGymId],
    queryFn: async () => {
      const result = await getTopPerformingPlans(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useTrainersAndPlans() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["trainers-and-plans", activeGymId],
    queryFn: async () => {
      const result = await getTrainersAndPlans(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymWithDetails() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-with-details", activeGymId],
    queryFn: async () => {
      const result = await getGymWithDetails(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useApplications() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["applications", activeGymId],
    queryFn: async () => {
      const result = await getApplications(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useApplicationById(applicationId: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["application", activeGymId, applicationId],
    queryFn: async () => {
      const result = await getApplicationById(
        supabase,
        applicationId,
        activeGymId!,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!applicationId,
    staleTime: SLOW,
  });
}

export function usePendingPayments() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["pending-payments", activeGymId],
    queryFn: async () => {
      const result = await getPendingPayments(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymMembers() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-members", activeGymId],
    queryFn: async () => {
      const result = await getGymMembers(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymActiveMembers() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-active-members", activeGymId],
    queryFn: async () => {
      const result = await getGymActiveMembers(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymSubscriptions() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-subscriptions", activeGymId],
    queryFn: async () => {
      const result = await getGymSubscriptions(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymAttendance(date?: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-attendance", activeGymId, date],
    queryFn: async () => {
      const result = await getGymAttendance(supabase, activeGymId!, date);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: FAST,
  });
}

export function useAllTrainers() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["all-trainers", activeGymId],
    queryFn: async () => {
      const result = await getAllTrainers(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useTrainerStats() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["trainer-stats", activeGymId],
    queryFn: async () => {
      const result = await getTrainerStats(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: FAST,
  });
}

export function useTrainerById(trainerId: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["trainer", activeGymId, trainerId],
    queryFn: async () => {
      const result = await getTrainerById(supabase, trainerId, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!trainerId,
    staleTime: SLOW,
  });
}

export function useMembersAndPlans() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["members-and-plans", activeGymId],
    queryFn: async () => {
      const result = await getMembersAndPlans(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useMembersWithAttendance() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["members-with-attendance", activeGymId],
    queryFn: async () => {
      const result = await getMembersWithAttendance(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymMemberStats() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-member-stats", activeGymId],
    queryFn: async () => {
      const result = await getGymMemberStats(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useMemberByIdWithAttendance(memberId: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["member-with-attendance", activeGymId, memberId],
    queryFn: async () => {
      const result = await getMembersByIdWithAttendence(
        supabase,
        memberId,
        activeGymId!,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!memberId,
    staleTime: SLOW,
  });
}

export function useGymPayments(limit = 200) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-payments", activeGymId, limit],
    queryFn: async () => {
      const result = await getGymPayments(supabase, activeGymId!, limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymPaymentsOverview() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-payments-overview", activeGymId],
    queryFn: async () => {
      const result = await getGymPaymentsOverview(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function usePaymentById(paymentId: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["payment", activeGymId, paymentId],
    queryFn: async () => {
      const result = await getPaymentById(supabase, paymentId, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!paymentId,
    staleTime: SLOW,
  });
}

export function usePlanById(planId: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["plan", activeGymId, planId],
    queryFn: async () => {
      const result = await getPlanById(supabase, planId, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!planId,
    staleTime: SLOW,
  });
}

// ============================================================================
// Trainer-scoped, no gym filter in the underlying query
// (training_sessions is filtered by trainer_id only)
// ============================================================================

export function useTrainerSessionStats(trainerId: string) {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["trainer-session-stats", trainerId],
    queryFn: async () => {
      const result = await getTrainerSessionStats(supabase, trainerId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!trainerId,
    staleTime: FAST,
  });
}

export function useMonthlySessionsForTrainer(trainerId: string) {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["monthly-sessions-for-trainer", trainerId],
    queryFn: async () => {
      const result = await getMonthlySessionsForTrainer(supabase, trainerId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!trainerId,
    staleTime: FAST,
  });
}
