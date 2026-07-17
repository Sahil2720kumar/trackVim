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

  const parsed = bodySchema.safeParse(await req.json());
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

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send invitation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
