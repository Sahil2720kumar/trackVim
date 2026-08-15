"use client";

import { useAuth } from "@clerk/nextjs";
import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";

import type { Database } from "@/db/database.types";

export function useSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        accessToken: async () => {
          console.log("GET TOKEN CALLED");

          if (typeof window === "undefined") {
            return null;
          }

          const token = await getToken();

          console.log("CLERK TOKEN:", token ? "TOKEN EXISTS" : "NO TOKEN");

          return token ?? null;
        },
      },
    );
  }, [getToken]);

  return {
    supabase,
  };
}
