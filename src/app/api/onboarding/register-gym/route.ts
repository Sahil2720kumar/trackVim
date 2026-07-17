import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { eq, isNull, and } from "drizzle-orm";
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
      { status: 400 },
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
      { status: 409 },
    );
  }

  const MAX_ATTEMPTS = 5;
  let gym: typeof gyms.$inferSelect | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const code = generateGymCode();

      gym = await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(gyms)
          .values({ name, address, code, ownerId: dbUser.id })
          .returning();

        const [updated] = await tx
          .update(users)
          .set({ role: "owner", gymId: inserted.id, updatedAt: new Date() })
          .where(and(eq(users.id, dbUser.id), isNull(users.role)))
          .returning({ id: users.id });

        if (!updated) {
          throw tx.rollback();
        }

        return inserted;
      });

      break;
    } catch (err: any) {
      const isUniqueViolation = err?.code === "23505";

      if (!isUniqueViolation) {
        console.error("[register-gym] DB error:", err);
        return NextResponse.json(
          { error: "Failed to create gym" },
          { status: 500 },
        );
      }

      if (attempt === MAX_ATTEMPTS - 1) {
        console.error(
          "[register-gym] Could not generate a unique gym code after",
          MAX_ATTEMPTS,
          "attempts",
        );
        return NextResponse.json(
          { error: "Could not generate a unique gym code, please try again" },
          { status: 500 },
        );
      }
    }
  }

  if (!gym) {
    return NextResponse.json(
      { error: "Failed to create gym" },
      { status: 500 },
    );
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "owner", gymId: gym.id },
    });
  } catch (err) {
    console.error(
      "[register-gym] Clerk metadata sync failed for userId:",
      userId,
      "gymId:",
      gym.id,
      err,
    );
  }

  return NextResponse.json({ gym }, { status: 201 });
}
