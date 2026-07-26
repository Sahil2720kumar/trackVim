// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { auth } from "@clerk/nextjs/server";
import type { Database } from "@/db/database.types";

export async function createClient() {
  const { getToken } = await auth();
  const token = await getToken();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => token,
      cookies: { getAll: () => [], setAll: () => {} }, // no-op, Clerk owns session cookies
    },
  );
}
