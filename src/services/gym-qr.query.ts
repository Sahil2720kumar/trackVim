import "server-only";
import { createServerClient } from "@/lib/supabase/server";

export type ActiveQrCode = {
  id: string;
  gymId: string;
  token: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getActiveQrCode(
  gymId: string,
): Promise<ActiveQrCode | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("gym_qr_codes")
    .select("id, gym_id, token, label, is_active, created_at, updated_at")
    .eq("gym_id", gymId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[getActiveQrCode]", error);
    throw new Error("Failed to load QR code");
  }

  if (!data) return null;

  return {
    id: data.id,
    gymId: data.gym_id,
    token: data.token,
    label: data.label,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// This one returns ActiveQrCode | null directly (and throws on error)
// rather than a { success, data } envelope, so there's no matching branch
// for the Extract<..., { success: true }> pattern used elsewhere — a plain
// Awaited<ReturnType<...>> alias is the equivalent here.
export type ActiveQrCodeResult = Awaited<ReturnType<typeof getActiveQrCode>>;
