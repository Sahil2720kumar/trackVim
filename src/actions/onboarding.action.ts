"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function setUserRole(role: "gym_owner" | "member") {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  const client = await clerkClient();

  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role === "gym_owner" ? "owner" : "member",
      },
    });
  } catch (error) {
    return { success: false, error: "Failed to set role." };
  }

  return { success: true };
}
