import { useSupabaseClient } from "@/lib/supabase/client";
import { getPublicHomepageStats } from "@/services/public.query";
import { useQuery } from "@tanstack/react-query";

export function usePublicHomepageStats() {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["public-homepage-stats"],

    queryFn: async () => {
      const result = await getPublicHomepageStats(supabase);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },

    staleTime: 30_000,
  });
}
