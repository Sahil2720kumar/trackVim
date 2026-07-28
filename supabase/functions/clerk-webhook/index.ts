// supabase/functions/clerk-webhook/index.ts
//
// Deno Edge Function version of the Clerk webhook, using the withSupabase
// wrapper. Deploy with:
//
//   supabase functions deploy clerk-webhook
//
// This is a public webhook endpoint — Clerk signs requests with its own
// svix-* headers, not a Supabase JWT, so it uses `auth: 'none'` and we
// verify the signature ourselves in code. Because auth is not 'user',
// set verify_jwt = false for this function in supabase/config.toml:
//
//   [functions.clerk-webhook]
//   verify_jwt = false
//
// Then point Clerk's webhook endpoint at:
//   https://<project-ref>.supabase.co/functions/v1/clerk-webhook
//
// Set the signing secret (from Clerk's webhook dashboard) as a function
// secret — NOT a repo env var:
//   supabase secrets set CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxx
//
// SUPABASE_URL / SUPABASE_PUBLISHABLE_KEYS / SUPABASE_SECRET_KEYS are
// pre-populated automatically — withSupabase reads them for you, no
// manual env setup needed.

import { withSupabase } from "npm:@supabase/server@^1";
import { Webhook } from "npm:svix@1.24.0";

const webhookSecret = Deno.env.get("CLERK_WEBHOOK_SIGNING_SECRET")!;

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await req.text();

    let evt: any;
    try {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Clerk webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Public endpoint verified above via svix, so we use supabaseAdmin
    // (bypasses RLS) for all writes below — there is no end-user JWT here.
    switch (evt.type) {
      case "user.created": {
        const clerkUser = evt.data;
        const meta = (clerkUser.public_metadata ?? {}) as {
          role?: "trainer" | "member";
          gymId?: string;
          trainerId?: string;
          memberId?: string;
        };

        const email: string | null =
          clerkUser.email_addresses?.[0]?.email_address ?? null;
        const phone: string | null =
          clerkUser.phone_numbers?.[0]?.phone_number ?? null;
        const fullName =
          [clerkUser.first_name, clerkUser.last_name]
            .filter(Boolean)
            .join(" ") || null;

        const { data: user, error: userError } = await ctx.supabaseAdmin
          .from("users")
          .upsert(
            {
              clerk_id: clerkUser.id,
              email,
              full_name: fullName,
              phone,
              avatar_url: clerkUser.image_url ?? null,
              role:
                meta.role === "trainer"
                  ? "trainer"
                  : meta.role === "member"
                    ? "member"
                    : null,
            },
            { onConflict: "clerk_id" },
          )
          .select()
          .single();
        // --- Trainer invite acceptance -----------------------------------
        if (meta.role === "trainer" && meta.trainerId) {
          const { error } = await ctx.supabaseAdmin
            .from("trainers")
            .update({
              profile_id: user.id,
              status: "Active",
              invitation_accepted_at: new Date().toISOString(),
            })
            .eq("id", meta.trainerId)
            .is("profile_id", null); // never overwrite an already-linked row

          if (error) console.error("Failed to link trainer invitation:", error);
        }

        // --- Member invite acceptance (walk-in member registering later) --
        if (meta.role === "member" && meta.memberId) {
          const { error } = await ctx.supabaseAdmin
            .from("members")
            .update({
              profile_id: user.id,
              invitation_accepted_at: new Date().toISOString(),
            })
            .eq("id", meta.memberId)
            .is("profile_id", null);

          if (error) console.error("Failed to link member invitation:", error);
        }

        break;
      }

      case "user.updated": {
        const clerkUser = evt.data;
        const { error } = await ctx.supabaseAdmin
          .from("users")
          .update({
            email: clerkUser.email_addresses?.[0]?.email_address ?? null,
            full_name:
              [clerkUser.first_name, clerkUser.last_name]
                .filter(Boolean)
                .join(" ") || null,
            phone: clerkUser.phone_numbers?.[0]?.phone_number ?? null,
            avatar_url: clerkUser.image_url ?? null,
          })
          .eq("clerk_id", clerkUser.id);

        if (error) console.error("Failed to sync user.updated:", error);
        break;
      }

      case "user.deleted": {
        const clerkUser = evt.data;
        // Soft delete only — gyms.owner_id's onDelete:"restrict" FK, plus
        // years of history referencing users.id, means we never hard-delete.
        const { error } = await ctx.supabaseAdmin
          .from("users")
          .update({
            account_status: "Inactive",
            deleted_at: new Date().toISOString(),
          })
          .eq("clerk_id", clerkUser.id);

        if (error) console.error("Failed to soft-delete user:", error);
        break;
      }

      default:
        // Unhandled event types are expected — not an error.
        break;
    }

    return new Response("ok", { status: 200 });
  }),
};
