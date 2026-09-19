import { useSupabaseClient } from "@/lib/supabase/client";
import {
  getPublicHomepageStats,
  getPublicSubscriptionPlans,
} from "@/services/public.query";
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

export function usePublicSubscriptionPlans() {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["public-subscription-plans"],

    queryFn: async () => {
      const result = await getPublicSubscriptionPlans(supabase);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },

    staleTime: 5 * 60_000,
  });
}
