import { useSupabaseClient } from "@/lib/supabase/client";
import { useMemberStore } from "@/stores/member.store";
import { useQuery } from "@tanstack/react-query";
import { getMemberHomeState } from "@/services/scan.query";

const FAST = 30_000;
const SLOW = 5 * 60_000;

export function useMemberHomeState() {
  const { supabase } = useSupabaseClient();

  const activeMemberId = useMemberStore((state) => state.activeMemberId);

  const activeGymId = useMemberStore((state) => state.activeGymId);

  const activeMembershipId = useMemberStore(
    (state) => state.activeMembershipId,
  );

  console.log({
    activeMemberId,
    activeGymId,
    activeMembershipId,
  });

  return useQuery({
    queryKey: [
      "member-home-state",
      activeMemberId,
      activeGymId,
      activeMembershipId,
    ],

    queryFn: () =>
      getMemberHomeState(
        supabase,
        activeMemberId!,
        activeGymId!,
        activeMembershipId!,
      ),

    enabled: !!activeMemberId,

    staleTime: FAST,
  });
}
