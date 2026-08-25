"use client";

import { useSupabaseClient } from "@/lib/supabase/client";
import {
  getBillingOverview,
  getGymInvoices,
  getSubscriptionPlans,
} from "@/services/billing.query";
import { useOwnerStore } from "@/stores/owner.store";
import { useQuery } from "@tanstack/react-query";

export function useBillingOverview() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["billing-overview", activeGymId],
    queryFn: async () => {
      const result = await getBillingOverview(supabase);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: 30_000,
  });
}

export function useGymInvoices() {
  const { supabase } = useSupabaseClient();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  return useQuery({
    queryKey: ["gym-billing-invoices", activeGymId],
    queryFn: async () => {
      const result = await getGymInvoices(supabase, activeGymId!);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!activeGymId,
    staleTime: 30_000,
  });
}

export function useSubscriptionPlans() {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const result = await getSubscriptionPlans(supabase);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
