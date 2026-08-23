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
    queryFn: () => getGymOwnerInfo(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useOwnerDashboardData() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["owner-dashboard", activeGymId],
    queryFn: () => getOwnerDashboardData(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useMembershipPlans() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["membership-plans", activeGymId],
    queryFn: () => getMembershipPlans(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymRevenueMonthly() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-revenue-monthly", activeGymId],
    queryFn: () => getGymRevenueMonthly(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useTopPerformingPlans() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["top-performing-plans", activeGymId],
    queryFn: () => getTopPerformingPlans(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useTrainersAndPlans() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["trainers-and-plans", activeGymId],
    queryFn: () => getTrainersAndPlans(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymWithDetails() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-with-details", activeGymId],
    queryFn: () => getGymWithDetails(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useApplications() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["applications", activeGymId],
    queryFn: () => getApplications(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useApplicationById(applicationId: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["application", activeGymId, applicationId],
    queryFn: () => getApplicationById(supabase, applicationId, activeGymId!),
    enabled: !!activeGymId && !!applicationId,
    staleTime: SLOW,
  });
}

export function usePendingPayments() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["pending-payments", activeGymId],
    queryFn: () => getPendingPayments(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymMembers() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-members", activeGymId],
    queryFn: () => getGymMembers(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymActiveMembers() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-active-members", activeGymId],
    queryFn: () => getGymActiveMembers(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymSubscriptions() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-subscriptions", activeGymId],
    queryFn: () => getGymSubscriptions(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymAttendance(date?: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-attendance", activeGymId, date],
    queryFn: () => getGymAttendance(supabase, activeGymId!, date),
    enabled: !!activeGymId,
    staleTime: FAST,
  });
}

export function useAllTrainers() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["all-trainers", activeGymId],
    queryFn: () => getAllTrainers(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useTrainerStats() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["trainer-stats", activeGymId],
    queryFn: () => getTrainerStats(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: FAST,
  });
}

export function useTrainerById(trainerId: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["trainer", activeGymId, trainerId],
    queryFn: () => getTrainerById(supabase, trainerId, activeGymId!),
    enabled: !!activeGymId && !!trainerId,
    staleTime: SLOW,
  });
}

export function useMembersAndPlans() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["members-and-plans", activeGymId],
    queryFn: () => getMembersAndPlans(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useMembersWithAttendance() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["members-with-attendance", activeGymId],
    queryFn: () => getMembersWithAttendance(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymMemberStats() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-member-stats", activeGymId],
    queryFn: () => getGymMemberStats(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useMemberByIdWithAttendance(memberId: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["member-with-attendance", activeGymId, memberId],
    queryFn: () =>
      getMembersByIdWithAttendence(supabase, memberId, activeGymId!),
    enabled: !!activeGymId && !!memberId,
    staleTime: SLOW,
  });
}

export function useGymPayments(limit = 200) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-payments", activeGymId, limit],
    queryFn: () => getGymPayments(supabase, activeGymId!, limit),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function useGymPaymentsOverview() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-payments-overview", activeGymId],
    queryFn: () => getGymPaymentsOverview(supabase, activeGymId!),
    enabled: !!activeGymId,
    staleTime: SLOW,
  });
}

export function usePaymentById(paymentId: string) {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["payment", activeGymId, paymentId],
    queryFn: () => getPaymentById(supabase, paymentId, activeGymId!),
    enabled: !!activeGymId && !!paymentId,
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
    queryFn: () => getTrainerSessionStats(supabase, trainerId),
    enabled: !!trainerId,
    staleTime: FAST,
  });
}

export function useMonthlySessionsForTrainer(trainerId: string) {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["monthly-sessions-for-trainer", trainerId],
    queryFn: () => getMonthlySessionsForTrainer(supabase, trainerId),
    enabled: !!trainerId,
    staleTime: FAST,
  });
}
