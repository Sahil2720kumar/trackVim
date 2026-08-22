"use client";
import { useQuery } from "@tanstack/react-query";

import {
  findGymByCode,
  getDiscoverGyms,
  getGymDetail,
  getMyApplicationById,
  getMyApplications,
  getMyAssignedTrainers,
  getMyAttendance,
  getMyMembershipDetails,
  getMyMembershipStatusWithPlanDetails,
  getMyMemberships,
  getMyMessages,
  getMyPayments,
  getMyProfile,
  getMyTrainingSessions,
  getMyUpcomingSessions,
  getPaymentForMembership,
  getTodayAttendanceStatus,
  getTrainingSessionById,
  getUnreadMessageCount,
  listActiveGyms,
  MembershipApplicationPageDataByPlanId,
  getMemberAttendanceOverview,
} from "@/services/member.query";
import { useSupabaseClient } from "@/lib/supabase/client";
import { useMemberStore } from "@/stores/member.store";

const FAST = 30_000; // attendance, sessions, today-status
const SLOW = 5 * 60_000; // profile, memberships, gym detail, discovery

// ============================================================================
// Gym Discovery
// ============================================================================

/** Manual/on-demand — only fires once a code has been typed in full. */
export function useFindGymByCode(code: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  return useQuery({
    queryKey: ["gym-by-code", code, activeMemberId],
    queryFn: () => findGymByCode(supabase, code),
    enabled: !!activeMemberId && code.length > 0,
    staleTime: SLOW,
  });
}

export function useActiveGyms(city?: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  return useQuery({
    queryKey: ["active-gyms", city ?? null, activeMemberId],
    queryFn: () => listActiveGyms(supabase, { city }),
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useDiscoverGyms(city?: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["discover-gyms", activeMemberId, city ?? null],
    queryFn: () => getDiscoverGyms(supabase, activeMemberId!, city),
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

/** `gymId` is a route param here (browsing a gym pre-membership), not store state. */
export function useGymDetail(gymId: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  return useQuery({
    queryKey: ["gym-detail", gymId, activeMemberId],
    queryFn: () => getGymDetail(supabase, gymId),
    enabled: !!gymId && !!activeMemberId,
    staleTime: SLOW,
  });
}

/** `planId` is a route param; `gymId` too — applying to a gym precedes membership. */
export function useMembershipApplicationPageData(
  gymId: string,
  planId: string,
) {
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["membership-application-page", gymId, planId, activeMemberId],
    queryFn: () =>
      MembershipApplicationPageDataByPlanId(supabase, gymId, planId),
    enabled: !!gymId && !!planId && !!activeMemberId,
    staleTime: SLOW,
  });
}

// ============================================================================
// Membership status / applications
// ============================================================================

export function useMyMembershipStatus() {
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["my-membership-status", activeMemberId, activeGymId],
    queryFn: () =>
      getMyMembershipStatusWithPlanDetails(
        supabase,
        activeMemberId!,
        activeGymId!,
      ),
    enabled: !!activeMemberId && !!activeGymId,
    staleTime: SLOW,
  });
}

export function useMyApplications() {
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["my-applications", activeMemberId],
    queryFn: () => getMyApplications(supabase, activeMemberId!),
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useMyApplicationById(applicationId: string) {
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["my-application", activeMemberId, applicationId],
    queryFn: () =>
      getMyApplicationById(supabase, activeMemberId!, applicationId),
    enabled: !!activeMemberId && !!applicationId,
    staleTime: SLOW,
  });
}

// ============================================================================
// Dashboard read-only queries — no route params, RLS-scoped to the caller
// ============================================================================

export function useMyProfile() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((s) => s.activeMemberId);

  return useQuery({
    queryKey: ["my-profile", activeMemberId],
    queryFn: () => getMyProfile(supabase),
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useMyMemberships() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((s) => s.activeMemberId);

  return useQuery({
    queryKey: ["my-memberships", activeMemberId],
    queryFn: () => getMyMemberships(supabase),
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useMyPayments() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((s) => s.activeMemberId);

  return useQuery({
    queryKey: ["my-payments", activeMemberId],
    queryFn: () => getMyPayments(supabase),
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

/** `activeMembershipId` scopes to the member's current membership's payment. */
export function usePaymentForMembership() {
  const activeMembershipId = useMemberStore(
    (state) => state.activeMembershipId,
  );
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["payment-for-membership", activeMembershipId, activeMemberId],
    queryFn: () => getPaymentForMembership(supabase, activeMembershipId!),
    enabled: !!activeMembershipId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useMyAttendance() {
  const activeGymId = useMemberStore((state) => state.activeGymId);
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["my-attendance", activeGymId, activeMemberId],
    queryFn: () => getMyAttendance(supabase, activeGymId!),
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useTodayAttendanceStatus() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useMemberStore((state) => state.activeGymId);
  const activeMemberId = useMemberStore((s) => s.activeMemberId);

  return useQuery({
    queryKey: ["today-attendance-status", activeGymId, activeMemberId],
    queryFn: () => getTodayAttendanceStatus(supabase, activeGymId!),
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useMemberAttendanceOverview() {
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["member-attendance-overview", activeMemberId, activeGymId],
    queryFn: () =>
      getMemberAttendanceOverview(supabase, activeMemberId!, activeGymId!),
    enabled: !!activeMemberId && !!activeGymId,
    staleTime: FAST,
  });
}

export function useMyTrainingSessions() {
  const activeGymId = useMemberStore((state) => state.activeGymId);
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["my-training-sessions", activeGymId, activeMemberId],
    queryFn: () => getMyTrainingSessions(supabase, activeGymId!),
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useTrainingSessionById(sessionId: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  return useQuery({
    queryKey: ["training-session", sessionId, activeMemberId],
    queryFn: () => getTrainingSessionById(supabase, sessionId),
    enabled: !!sessionId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useMyUpcomingSessions() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useMemberStore((state) => state.activeGymId);
  const activeMemberId = useMemberStore((s) => s.activeMemberId);

  return useQuery({
    queryKey: ["my-upcoming-sessions", activeGymId, activeMemberId],
    queryFn: () => getMyUpcomingSessions(supabase, activeGymId!),
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useMyAssignedTrainers() {
  const activeGymId = useMemberStore((state) => state.activeGymId);
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  const { supabase } = useSupabaseClient();
  return useQuery({
    queryKey: ["my-assigned-trainers", activeGymId, activeMemberId],
    queryFn: () => getMyAssignedTrainers(supabase, activeGymId!),
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useMyMembershipDetails() {
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["my-membership-details", activeMemberId, activeGymId],
    queryFn: () =>
      getMyMembershipDetails(supabase, activeMemberId!, activeGymId!),
    enabled: !!activeMemberId && !!activeGymId,
    staleTime: FAST,
  });
}

export function useMyMessages() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((s) => s.activeMemberId);

  return useQuery({
    queryKey: ["my-messages", activeMemberId],
    queryFn: () => getMyMessages(supabase),
    staleTime: FAST,
    enabled: !!activeMemberId,
  });
}

export function useUnreadMessageCount() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((s) => s.activeMemberId);
  return useQuery({
    queryKey: ["unread-message-count", activeMemberId],
    queryFn: () => getUnreadMessageCount(supabase),
    staleTime: FAST,
    enabled: !!activeMemberId,
  });
}
