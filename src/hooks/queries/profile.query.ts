import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/lib/supabase/client";
import {
  getCurrentMemberProfile,
  getCurrentOwnerProfile,
  getCurrentTrainerProfile,
} from "@/services/profile.query";
import { useUser } from "@clerk/nextjs";

//member
export function useCurrentMemberProfile() {
  const { supabase } = useSupabaseClient();
  const { user, isLoaded } = useUser();

  return useQuery({
    queryKey: ["current-member-profile", user?.id],
    queryFn: async () => {
      const result = await getCurrentMemberProfile(supabase, user!.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: isLoaded && !!user, // don't fire until Clerk has resolved the session
  });
}

//owner
export function useCurrentOwnerProfile() {
  const { supabase } = useSupabaseClient();
  const { user, isLoaded } = useUser();

  return useQuery({
    queryKey: ["current-owner-profile", user?.id],
    queryFn: async () => {
      const result = await getCurrentOwnerProfile(supabase, user!.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: isLoaded && !!user, // don't fire until Clerk has resolved the session
  });
}

// trainer
export function useCurrentTrainerProfile() {
  const { supabase } = useSupabaseClient();
  const { user, isLoaded } = useUser();

  return useQuery({
    queryKey: ["current-trainer-profile", user?.id],
    queryFn: async () => {
      const result = await getCurrentTrainerProfile(supabase, user!.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: isLoaded && !!user, // don't fire until Clerk has resolved the session
  });
}
