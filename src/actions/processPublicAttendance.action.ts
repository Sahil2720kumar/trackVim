"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export type AttendanceReason =
  | "NOT_A_MEMBER"
  | "INVALID_QR"
  | "NO_ACTIVE_MEMBERSHIP"
  | "PAYMENT_PENDING"
  | "PAYMENT_REJECTED"
  | "MEMBERSHIP_CANCELLED"
  | "MEMBERSHIP_FROZEN"
  | "MEMBERSHIP_EXPIRED"
  | "MEMBERSHIP_NOT_STARTED"
  | "UNKNOWN";

export type AttendanceResult =
  | {
      success: true;
      action: "checked_in" | "checked_out" | "already_done";
      gymName: string;
      checkIn: string;
      checkOut?: string;
      durationMinutes?: number;
    }
  | {
      success: false;
      reason: AttendanceReason;
    };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const REASON_BY_CODE: Record<string, AttendanceReason> = {
  QR001: "INVALID_QR",
  QR002: "NOT_A_MEMBER",
  QR003: "NO_ACTIVE_MEMBERSHIP",
  QR004: "PAYMENT_PENDING",
  QR005: "PAYMENT_REJECTED",
  QR006: "MEMBERSHIP_CANCELLED",
  QR007: "MEMBERSHIP_FROZEN",
  QR008: "MEMBERSHIP_EXPIRED",
  QR009: "MEMBERSHIP_NOT_STARTED",
};

export async function getGymDetailsByToken(
  token: string,
): Promise<{ valid: boolean; gymName?: string }> {
  if (!token || !UUID_RE.test(token)) {
    return { valid: false };
  }

  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.rpc("get_gym_details_by_qr_token", {
      p_token: token,
    });

    if (error) {
      console.error("[getGymDetailsByToken] RPC error:", error);
      return { valid: false };
    }

    if (!data || data.length === 0) {
      return { valid: false };
    }

    return {
      valid: true,
      gymName: data[0].gym_name || undefined,
    };
  } catch (err) {
    console.error("[getGymDetailsByToken] Unexpected error:", err);
    return { valid: false };
  }
}

export async function processPublicAttendance(
  token: string,
  email?: string,
  phone?: string,
): Promise<AttendanceResult> {
  if (!token || !UUID_RE.test(token)) {
    return {
      success: false,
      reason: "INVALID_QR",
    };
  }

  const { userId } = await auth();
  const supabase = await createServerClient();

  // 1. Signed-in member flow
  if (userId) {
    const { data, error } = await supabase.rpc("check_in_or_out", {
      p_token: token,
    });

    if (error) {
      console.error("[processPublicAttendance - auth]", error);
      return {
        success: false,
        reason: REASON_BY_CODE[error.code ?? ""] ?? "UNKNOWN",
      };
    }

    return {
      success: true,
      action: data?.action as "checked_in" | "checked_out" | "already_done",
      gymName: data?.gymName as string,
      checkIn: data?.checkIn as string,
      checkOut: data?.checkOut as string | undefined,
      durationMinutes: data?.durationMinutes as number | undefined,
    };
  }

  // 2. Signed-out member flow
  const cleanEmail = email?.trim() || null;
  const cleanPhone = phone?.trim() || null;

  if (!cleanEmail && !cleanPhone) {
    return {
      success: false,
      reason: "NOT_A_MEMBER",
    };
  }

  const { data, error } = await supabase.rpc("check_in_or_out_public", {
    p_token: token,
    p_email: cleanEmail,
    p_phone: cleanPhone,
  });

  console.log("[processPublicAttendance - public]", {
    token,
    cleanEmail,
    cleanPhone,
    data,
    error,
  });

  if (error) {
    console.error("[processPublicAttendance - public]", error);
    return {
      success: false,
      reason: REASON_BY_CODE[error.code ?? ""] ?? "UNKNOWN",
    };
  }

  return {
    success: true,
    action: data?.action as "checked_in" | "checked_out" | "already_done",
    gymName: data?.gymName as string,
    checkIn: data?.checkIn as string,
    checkOut: data?.checkOut as string | undefined,
    durationMinutes: data?.durationMinutes as number | undefined,
  };
}
