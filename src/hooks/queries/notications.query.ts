// notifications/hooks.ts
"use client";
import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "@/services/notications.query";
import { useSupabaseClient } from "@/lib/supabase/client";
import { useMemberStore } from "@/stores/member.store";

export function useNotifications() {
  const { supabase } = useSupabaseClient();

  const activeGymId = useMemberStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["notifications", activeGymId],

    queryFn: () => getNotifications(supabase, activeGymId!),

    enabled: !!activeGymId,

    staleTime: 30_000,
  });
}
