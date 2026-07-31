// src/lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import type { Database } from "@/db/database.types";

export async function createServerClient() {
  const { getToken } = await auth();

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      async accessToken() {
        return (await getToken()) ?? null;
      },
    },
  );
}
