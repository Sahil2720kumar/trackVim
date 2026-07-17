import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";



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
      const { id, email_addresses, first_name, last_name, public_metadata,username } =
        event.data;
      const email = email_addresses?.[0]?.email_address ?? "";
      const name = [first_name, last_name].filter(Boolean).join(" ") || null;

      // If this user was created by accepting an owner's trainer invitation,
      // Clerk has already copied that invitation's publicMetadata
      // ({ role: "trainer", gymId }) onto the user by the time this webhook
      // fires. Trust it — the owner set it server-side when creating the
      // invitation, the client never had a chance to supply it. A plain
      // self-serve signup has no publicMetadata yet, so role/gymId stay
      // null and the user goes through /onboarding as normal.
      const invitedRole = public_metadata?.role as
        | "trainer"
        | "owner"
        | "member"
        | undefined;
      const invitedGymId = public_metadata?.gymId as string | undefined;

      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(users).values({
          clerkId: id,
          email,
          name,
          username,
          role: invitedRole ?? null,
          gymId: invitedGymId ?? null,
        });
      }
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
