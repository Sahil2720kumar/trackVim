import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { users, gyms } from "@/db/schema";
import { generateGymCode } from "@/lib/roles";

const bodySchema = z.object({
  name: z.string().trim().min(2, "Gym name is too short").max(100),
  address: z.string().trim().max(200).optional(),
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
  const { name, address } = parsed.data;

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

  // Ensure a unique invite code (retry a few times on collision)
  let code = generateGymCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db
      .select({ id: gyms.id })
      .from(gyms)
      .where(eq(gyms.code, code))
      .limit(1);
    if (existing.length === 0) break;
    code = generateGymCode();
  }

  const [gym] = await db
    .insert(gyms)
    .values({ name, address, code, ownerId: dbUser.id })
    .returning();

  await db
    .update(users)
    .set({ role: "owner", gymId: gym.id, updatedAt: new Date() })
    .where(eq(users.id, dbUser.id));

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: "owner", gymId: gym.id },
  });

  return NextResponse.json({ gym }, { status: 201 });
}
