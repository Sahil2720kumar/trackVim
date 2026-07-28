// src/lib/supabase/client.ts
"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@clerk/nextjs";
import type { Database } from "@/db/database.types";

export function useSupabaseClient() {
  const { getToken } = useAuth();
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { accessToken: async () => (await getToken()) ?? null },
  );
}
