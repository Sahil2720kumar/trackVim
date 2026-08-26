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
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["gym-by-code", code, activeMemberId],
    queryFn: async () => {
      const result = await findGymByCode(supabase, code);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId && code.length > 0,
    staleTime: SLOW,
  });
}

export function useActiveGyms(city?: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["active-gyms", city ?? null, activeMemberId],
    queryFn: async () => {
      const result = await listActiveGyms(supabase, { city });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useDiscoverGyms(city?: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["discover-gyms", activeMemberId, city ?? null],
    queryFn: async () => {
      const result = await getDiscoverGyms(supabase, activeMemberId!, city);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

/** `gymId` is a route param here (browsing a gym pre-membership), not store state. */
export function useGymDetail(gymId: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["gym-detail", gymId, activeMemberId],
    queryFn: async () => {
      const result = await getGymDetail(supabase, gymId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!gymId && !!activeMemberId,
    staleTime: SLOW,
  });
}

/** `planId` is a route param; `gymId` too — applying to a gym precedes membership. */
export function useMembershipApplicationPageData(
  gymId: string,
  planId: string,
) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["membership-application-page", gymId, planId, activeMemberId],
    queryFn: async () => {
      const result = await MembershipApplicationPageDataByPlanId(
        supabase,
        gymId,
        planId,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!gymId && !!planId && !!activeMemberId,
    staleTime: SLOW,
  });
}

// ============================================================================
// Membership status / applications
// ============================================================================

export function useMyMembershipStatus() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["my-membership-status", activeMemberId, activeGymId],
    queryFn: async () => {
      const result = await getMyMembershipStatusWithPlanDetails(
        supabase,
        activeMemberId!,
        activeGymId!,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId && !!activeGymId,
    staleTime: SLOW,
  });
}

export function useMyApplications() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["my-applications", activeMemberId],
    queryFn: async () => {
      const result = await getMyApplications(supabase, activeMemberId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useMyApplicationById(applicationId: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["my-application", activeMemberId, applicationId],
    queryFn: async () => {
      const result = await getMyApplicationById(
        supabase,
        activeMemberId!,
        applicationId,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId && !!applicationId,
    staleTime: SLOW,
  });
}

// ============================================================================
// Dashboard read-only queries — no route params, RLS-scoped to the caller
// ============================================================================

export function useMyProfile() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["my-profile", activeMemberId],
    queryFn: async () => {
      const result = await getMyProfile(supabase);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useMyMemberships() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["my-memberships", activeMemberId],
    queryFn: async () => {
      const result = await getMyMemberships(supabase);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useMyPayments() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["my-payments", activeMemberId],
    queryFn: async () => {
      const result = await getMyPayments(supabase);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId,
    staleTime: SLOW,
  });
}

/** `activeMembershipId` scopes to the member's current membership's payment. */
export function usePaymentForMembership() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeMembershipId = useMemberStore(
    (state) => state.activeMembershipId,
  );

  return useQuery({
    queryKey: ["payment-for-membership", activeMembershipId, activeMemberId],
    queryFn: async () => {
      const result = await getPaymentForMembership(
        supabase,
        activeMembershipId!,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMembershipId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useMyAttendance() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["my-attendance", activeGymId, activeMemberId],
    queryFn: async () => {
      const result = await getMyAttendance(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useTodayAttendanceStatus() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["today-attendance-status", activeGymId, activeMemberId],
    queryFn: async () => {
      const result = await getTodayAttendanceStatus(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useMemberAttendanceOverview() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["member-attendance-overview", activeMemberId, activeGymId],
    queryFn: async () => {
      const result = await getMemberAttendanceOverview(
        supabase,
        activeMemberId!,
        activeGymId!,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId && !!activeGymId,
    staleTime: FAST,
  });
}

export function useMyTrainingSessions() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["my-training-sessions", activeGymId, activeMemberId],
    queryFn: async () => {
      const result = await getMyTrainingSessions(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useTrainingSessionById(sessionId: string) {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["training-session", sessionId, activeMemberId],
    queryFn: async () => {
      const result = await getTrainingSessionById(supabase, sessionId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!sessionId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useMyUpcomingSessions() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["my-upcoming-sessions", activeGymId, activeMemberId],
    queryFn: async () => {
      const result = await getMyUpcomingSessions(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: FAST,
  });
}

export function useMyAssignedTrainers() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["my-assigned-trainers", activeGymId, activeMemberId],
    queryFn: async () => {
      const result = await getMyAssignedTrainers(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId && !!activeMemberId,
    staleTime: SLOW,
  });
}

export function useMyMembershipDetails() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["my-membership-details", activeMemberId, activeGymId],
    queryFn: async () => {
      const result = await getMyMembershipDetails(
        supabase,
        activeMemberId!,
        activeGymId!,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId && !!activeGymId,
    staleTime: FAST,
  });
}

export function useMyMessages() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["my-messages", activeMemberId],
    queryFn: async () => {
      const result = await getMyMessages(supabase);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId,
    staleTime: FAST,
  });
}

export function useUnreadMessageCount() {
  const { supabase } = useSupabaseClient();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  return useQuery({
    queryKey: ["unread-message-count", activeMemberId],
    queryFn: async () => {
      const result = await getUnreadMessageCount(supabase);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeMemberId,
    staleTime: FAST,
  });
}
