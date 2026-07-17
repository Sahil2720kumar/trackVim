import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not set" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  let event: WebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, public_metadata, username } =
        event.data;
      const email = email_addresses?.[0]?.email_address ?? "";
      const name = [first_name, last_name].filter(Boolean).join(" ") || null;

      // Fix 1: validate metadata at runtime instead of blind casting.
      // Only accept role === "trainer" (owners and members go through
      // onboarding themselves; a trainer is the only role an owner can
      // pre-assign via invitation publicMetadata).
      const rawRole = public_metadata?.role;
      const rawGymId = public_metadata?.gymId;

      const invitedRole: "trainer" | null =
        rawRole === "trainer" ? "trainer" : null;

      // gymId must be a non-empty string; reject anything else
      const invitedGymId: string | null =
        invitedRole === "trainer" &&
        typeof rawGymId === "string" &&
        rawGymId.trim().length > 0
          ? rawGymId.trim()
          : null;

      // Fix 2: single conflict-ignore insert instead of select-then-insert.
      // If Clerk delivers this webhook twice, the second insert is a no-op
      // and we still return 200 so Clerk stops retrying.
      await db
        .insert(users)
        .values({
          clerkId: id,
          email,
          name,
          username,
          role: invitedRole,
          gymId: invitedGymId,
        })
        .onConflictDoNothing({ target: users.clerkId });

      break;
    }

    case "user.deleted": {
      if (event.data.id) {
        await db.delete(users).where(eq(users.clerkId, event.data.id));
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}