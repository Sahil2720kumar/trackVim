// src/hooks/queries/import-members.query.ts

import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/lib/supabase/client";
import { useOwnerStore } from "@/stores/owner.store";
import {
  getImportGymPlans,
  getImportExistingPhones,
} from "@/services/import-members.query";

const SLOW = 5 * 60_000;

export function useImportGymPlans(gymIdParam?: string) {
  const { supabase } = useSupabaseClient();
  const storeGymId = useOwnerStore((state) => state.activeGymId);
  const gymId = gymIdParam || storeGymId;

  return useQuery({
    queryKey: ["import-gym-plans", gymId],
    queryFn: async () => {
      const res = await getImportGymPlans(supabase, gymId!);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    enabled: !!gymId,
    staleTime: SLOW,
  });
}

export function useImportExistingPhones(gymIdParam?: string) {
  const { supabase } = useSupabaseClient();
  const storeGymId = useOwnerStore((state) => state.activeGymId);
  const gymId = gymIdParam || storeGymId;

  return useQuery({
    queryKey: ["import-existing-phones", gymId],
    queryFn: async () => {
      const res = await getImportExistingPhones(supabase, gymId!);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    enabled: !!gymId,
    staleTime: SLOW,
  });
}
