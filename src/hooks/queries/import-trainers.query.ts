// src/hooks/queries/import-trainers.query.ts

import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/lib/supabase/client";
import { useOwnerStore } from "@/stores/owner.store";
import { checkTrainerEmailConflicts } from "@/services/import-trainers.query";

const STALE_TIME = 60_000;

export function useImportTrainerEmailConflicts(
  gymIdParam: string | undefined,
  emails: string[],
) {
  const { supabase } = useSupabaseClient();
  const storeGymId = useOwnerStore((state) => state.activeGymId);
  const gymId = gymIdParam || storeGymId;

  return useQuery({
    queryKey: ["import-trainer-email-conflicts", gymId, emails],
    queryFn: async () => {
      const res = await checkTrainerEmailConflicts(supabase, gymId!, emails);
      if (!res.success) {
        throw new Error("Failed to check email conflicts.");
      }
      return res.data;
    },
    enabled: !!gymId && emails.length > 0,
    staleTime: STALE_TIME,
  });
}
