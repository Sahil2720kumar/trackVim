import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

// SECURITY: This is the ONLY place `role: "trainer"` is ever set.
// - Requires an authenticated session (auth()).
// - Requires the caller's own DB row to have role === "owner".
// - gymId is read from the caller's own DB row, never from the request body,
//   so an owner can't invite someone into a gym they don't own.
// - The invited person never chooses their own role — Clerk stamps
//   { role: "trainer", gymId } onto their publicMetadata when they accept,
//   before your webhook ever runs.

const bodySchema = z.object({
  email: z.email().trim(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { email } = parsed.data;

  const [owner] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!owner || owner.role !== "owner" || !owner.gymId) {
    return NextResponse.json(
      { error: "Only a gym owner can invite trainers" },
      { status: 403 }
    );
  }

  const client = await clerkClient();

  try {
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: "trainer", gymId: owner.gymId },
      // Clerk includes invitation emails in every plan tier, including free.
      // See https://clerk.com/docs for current invitation flow options.
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      notify: true,
    });

    return NextResponse.json({ message: "Invitation sent" }, { status: 201 });
  } catch (err) {
    console.error("[invite-trainer] Clerk invitation failed:", err);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
