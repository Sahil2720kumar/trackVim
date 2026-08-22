"use server";
import { createServerClient } from "@/lib/supabase/server";

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function markAllNotificationsReadAction() {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}
