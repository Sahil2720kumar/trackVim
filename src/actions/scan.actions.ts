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

// Maps the custom SQLSTATE codes raised by check_in_or_out() to a reason
// the UI can key off of, instead of parsing the exception message text.
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

export async function processAttendance(
  token: string,
): Promise<AttendanceResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, reason: "NOT_A_MEMBER" };
  }

  if (!token || !UUID_RE.test(token)) {
    return { success: false, reason: "INVALID_QR" };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("check_in_or_out", {
    p_token: token,
  });

  if (error) {
    console.error("[processAttendance]", error);
    const reason = REASON_BY_CODE[error.code ?? ""] ?? "UNKNOWN";
    return { success: false, reason };
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
