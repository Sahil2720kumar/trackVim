// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { auth } from "@clerk/nextjs/server";
import type { Database } from "@/db/database.types";

export async function createClient() {
  const { getToken } = await auth();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => (await getToken()) ?? null,
      cookies: { getAll: () => [], setAll: () => {} }, // no-op, Clerk owns session cookies
    },
  );
}
