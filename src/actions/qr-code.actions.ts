"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export type QrCode = {
  id: string;
  token: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ActionResult =
  | { success: true; qrCode: QrCode }
  | { success: false; error: string };

function toQrCode(row: any): QrCode {
  return {
    id: row.id,
    token: row.token,
    label: row.label,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureActiveQrCodeAction(
  gymId: string,
): Promise<ActionResult> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const claimGymId = (sessionClaims?.publicMetadata as any)?.gymId;

  if (claimGymId !== gymId) {
    return {
      success: false,
      error: "You are not authorized for this gym.",
    };
  }

  const supabase = await createServerClient();

  const { data: existing, error: existingError } = await supabase
    .from("gym_qr_codes")
    .select("id, token, label, is_active, created_at, updated_at")
    .eq("gym_id", gymId)
    .eq("is_active", true)
    .maybeSingle();

  if (existingError) {
    console.error("[ensureActiveQrCodeAction]", existingError);

    return {
      success: false,
      error: "Failed to load QR code.",
    };
  }

  if (existing) {
    return {
      success: true,
      qrCode: toQrCode(existing),
    };
  }

  const { data, error } = await supabase
    .rpc("regenerate_gym_qr_code", {
      p_gym_id: gymId,
    })
    .single();

  if (error || !data) {
    console.error("[ensureActiveQrCodeAction]", error);

    return {
      success: false,
      error: "Failed to create QR code.",
    };
  }

  return {
    success: true,
    qrCode: toQrCode(data),
  };
}

export async function regenerateQrCodeAction(
  gymId: string,
): Promise<ActionResult> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const claimGymId = (sessionClaims?.publicMetadata as any)?.gymId;

  if (claimGymId !== gymId) {
    return {
      success: false,
      error: "You are not authorized for this gym.",
    };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .rpc("regenerate_gym_qr_code", {
      p_gym_id: gymId,
    })
    .single();

  if (error || !data) {
    console.error("[regenerateQrCodeAction]", error);

    return {
      success: false,
      error: "Failed to regenerate QR code.",
    };
  }

  revalidatePath("/owner/qr-codes");

  return {
    success: true,
    qrCode: toQrCode(data),
  };
}
