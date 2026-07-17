import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { users, gyms } from "@/db/schema";


const bodySchema = z.object({
  code: z.string().trim().min(4).max(12),
});

const JOIN_CODE_ROLE = "member" as const;

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
  const { code } = parsed.data;
  const role = JOIN_CODE_ROLE;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (dbUser.role) {
    return NextResponse.json(
      { error: "You've already completed onboarding" },
      { status: 409 }
    );
  }

  const [gym] = await db
    .select()
    .from(gyms)
    .where(eq(gyms.code, code))
    .limit(1);

  if (!gym) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  await db
    .update(users)
    .set({ role, gymId: gym.id, updatedAt: new Date() })
    .where(eq(users.id, dbUser.id));

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role, gymId: gym.id },
  });

  return NextResponse.json({ gym }, { status: 200 });
}
