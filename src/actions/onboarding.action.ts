"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function setUserRole(role: "gym_owner" | "member") {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // Don't allow overwriting a role that's already set — this action is
  // for first-time onboarding, not a self-service privilege switch.
  const existingRole = (
    user.publicMetadata as { role?: string } | undefined
  )?.role;
  if (existingRole) {
    return { success: false, error: "Your role has already been set." };
  }

  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role === "gym_owner" ? "owner" : "member",
      },
    });
  } catch (error) {
    console.error("setUserRole failed:", error);
    return { success: false, error: "Failed to set role." };
  }

  return { success: true };
}
