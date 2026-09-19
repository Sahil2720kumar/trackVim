"use server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { logAndSanitizeError } from "@/lib/error-handler";

export async function markNotificationReadAction(notificationId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "You must be signed in." };
  }

  const supabase = await createServerClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (userError) {
    return {
      success: false as const,
      error: logAndSanitizeError(
        userError,
        "markNotificationReadAction:userLookup",
      ),
    };
  }
  if (!user) {
    return {
      success: false as const,
      error: "Your account is still being set up. Please retry in a moment.",
    };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id); // ownership scope — only your own notification

  if (error) {
    return {
      success: false as const,
      error: logAndSanitizeError(error, "markNotificationReadAction"),
    };
  }
  return { success: true as const };
}

export async function markAllNotificationsReadAction() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "You must be signed in." };
  }

  const supabase = await createServerClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (userError) {
    return {
      success: false as const,
      error: logAndSanitizeError(
        userError,
        "markAllNotificationsReadAction:userLookup",
      ),
    };
  }
  if (!user) {
    return {
      success: false as const,
      error: "Your account is still being set up. Please retry in a moment.",
    };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id) // scope to caller
    .eq("is_read", false);

  if (error) {
    return {
      success: false as const,
      error: logAndSanitizeError(error, "markAllNotificationsReadAction"),
    };
  }
  return { success: true as const };
}
