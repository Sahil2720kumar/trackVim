"use server";

import { CreateMemberInput, createMemberSchema } from "@/db/validators";
import { uploadFile } from "@/lib/cloudinary/upload";
import { extractMemberFields } from "@/lib/extractFields";
import { createServerClient } from "@/lib/supabase/server";
import { generateMemberCode } from "@/lib/utils";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Member Profile (self-editable)
// ============================================================================

/**
 * Create the global member profile row (one per user, ever).
 * Called on first login after Clerk sign-up.
 */

export async function createMemberProfileAction(
  data: CreateMemberInput,
  photoFile?: File | null,
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to create a member profile.",
    };
  }

  // 2. Validate
  const parsed = createMemberSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid member data.",
    };
  }
  const memberData = parsed.data;

  // 3. Photo upload — keyed on memberId when we have it (update case) so
  // repeated saves overwrite the same path instead of accumulating, else
  // falls back to userId for the very first save.
  let photoUrl: string | undefined;
  try {
    if (photoFile && photoFile.size > 0) {
      photoUrl = await uploadFile(
        photoFile,
        `trackVim/members/${userId}/photo`,
      );
    }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload photo. Please try again.",
    };
  }

  const supabase = await createServerClient();

  // 4. Update users row first — need users.id (UUID) for members.profile_id FK
  const { data: userData, error: userError } = await supabase
    .from("users")
    .update({
      full_name: memberData.fullName,
      phone: memberData.contactPhone,
      role: "member",
      account_status: "Active",
      // Only touch avatar_url if a new photo actually came in this
      // submission — omitting the key leaves the existing one alone
      // instead of nulling it out on every plain profile edit.
      ...(photoUrl ? { avatar_url: photoUrl } : {}),
    })
    .eq("clerk_id", userId)
    .select("id,email")
    .maybeSingle();

  if (userError) return { success: false, error: userError.message };
  if (!userData) {
    return {
      success: false,
      error: "Your account is still being set up. Please retry in a moment.",
    };
  }

  const internalUserId = userData.id;

  // Shared field set for both insert and update — everything except the
  // create-only columns (profile_id, member_code), which only apply once.
  const memberFields = {
    full_name: memberData.fullName ?? null,
    contact_email: userData.email ?? null,
    contact_phone: memberData.contactPhone ?? null,
    date_of_birth: memberData.dateOfBirth ?? null,
    gender: (memberData.gender as "Male" | "Female" | "Other") ?? null,
    occupation: memberData.occupation ?? null,
    blood_group:
      (memberData.bloodGroup as
        | "A+"
        | "A-"
        | "B+"
        | "B-"
        | "O+"
        | "O-"
        | "AB+"
        | "AB-") ?? null,
    address: memberData.address ?? null,
    city: memberData.city ?? null,
    state: memberData.state ?? null,
    pin_code: memberData.pinCode ?? null,
    fitness_goal: memberData.fitnessGoal ?? null,
    medical_conditions: memberData.medicalConditions ?? null,
    allergies: memberData.allergies ?? null,
    physical_notes: memberData.physicalNotes ?? null,
    height_cm: memberData.heightCm ? Number(memberData.heightCm) : null,
    weight_kg: memberData.weightKg ? Number(memberData.weightKg) : null,
    emergency_contact_name: memberData.emergencyContactName ?? null,
    emergency_contact_phone: memberData.emergencyContactPhone ?? null,
    emergency_contact_address: memberData.emergencyContactAddress ?? null,
    additional_notes: memberData.additionalNotes ?? null,
    account_status: "Active",
    ...(photoUrl ? { photo_url: photoUrl } : {}),
  };

  // Drop undefined keys so a partial submission never nulls stored data.
  // `null` is kept so a cleared field is actually cleared.
  const definedMemberFields = Object.fromEntries(
    Object.entries(memberFields).filter(([, v]) => v !== undefined),
  );

  // 5. Create vs update. Don't trust the memberId param alone — Clerk
  // metadata can be stale (which is exactly how the duplicate-key error
  // happened: metadata never had memberId written into it, so the page
  // always thought this was a fresh signup and this action always tried
  // to INSERT, even though the Clerk webhook had already created a
  // members row for this profile_id). profile_id is the actual source of
  // truth for "does this row already exist".
  const { data: existing, error: existingError } = await supabase
    .from("members")
    .select("id")
    .eq("profile_id", internalUserId)
    .maybeSingle();

  if (existingError) return { success: false, error: existingError.message };

  let member: { id: string };

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("members")
      .update(definedMemberFields)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (updateError) return { success: false, error: updateError.message };
    member = updated;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("members")
      .insert({
        profile_id: internalUserId,
        member_code: generateMemberCode(),
        ...memberFields,
      })
      .select("id")
      .single();

    if (insertError) return { success: false, error: insertError.message };
    member = inserted;
  }

  // 6. Update Clerk metadata — now includes memberId, which is the actual
  // fix for the bug: without this, every future page load has no
  // memberId to check against and falls back to "create" mode again.
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "member",
        memberId: member.id,
        onboardingComplete: true,
      },
    });
  } catch (err) {
    console.log(" error from auth update", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to finalize onboarding. Please retry.",
    };
  }

  return { success: true, data: { id: member.id } };
}

/**
 * Update member's own profile.
 * The `members_guard_self_update` trigger blocks changing account_status
 * (owner-only) from this path.
 */
/**
 * Update member's own profile.
 * The `members_guard_self_update` trigger blocks changing account_status
 * (owner-only) from this path.
 */
export async function updateMemberProfileAction(
  memberId: string,
  data: CreateMemberInput,
  photoFile?: File | null,
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to update your profile.",
    };
  }

  // 2. Validate — same schema as create, since it's the same shape of data.
  const parsed = createMemberSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid member data.",
    };
  }
  const memberData = parsed.data;

  const supabase = await createServerClient();

  // 3. Resolve the caller's internal user row.
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, email")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (userError) return { success: false, error: userError.message };
  if (!userData) {
    return {
      success: false,
      error: "Your account is still being set up. Please retry in a moment.",
    };
  }

  // 4. Ownership check — memberId comes from the client, so don't trust it
  // blindly. Confirm it actually belongs to this user before writing
  // anything (same spirit as create's profile_id lookup, just reversed).
  const { data: existing, error: existingError } = await supabase
    .from("members")
    .select("id, profile_id")
    .eq("id", memberId)
    .maybeSingle();

  if (existingError) return { success: false, error: existingError.message };
  if (!existing || existing.profile_id !== userData.id) {
    return { success: false, error: "Member profile not found." };
  }

  // 5. Photo upload — keyed on memberId so repeated saves overwrite the
  // same path instead of accumulating.
  let photoUrl: string | undefined;
  try {
    if (photoFile && photoFile.size > 0) {
      photoUrl = await uploadFile(
        photoFile,
        `trackVim/members/${memberId}/photo`,
      );
    }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload photo. Please try again.",
    };
  }

  // 6. Keep users row in sync — same fields create touches, minus
  // role/account_status which only apply at signup.
  const { error: userUpdateError } = await supabase
    .from("users")
    .update({
      full_name: memberData.fullName,
      phone: memberData.contactPhone,
      ...(photoUrl ? { avatar_url: photoUrl } : {}),
    })
    .eq("id", userData.id);

  if (userUpdateError)
    return { success: false, error: userUpdateError.message };

  // 7. Same field set as create, minus the create-only columns
  // (profile_id, member_code) and account_status.
  const memberFields = {
    full_name: memberData.fullName ?? null,
    contact_email: userData.email ?? null,
    contact_phone: memberData.contactPhone ?? null,
    date_of_birth: memberData.dateOfBirth ?? null,
    gender: (memberData.gender as "Male" | "Female" | "Other") ?? null,
    occupation: memberData.occupation ?? null,
    blood_group:
      (memberData.bloodGroup as
        | "A+"
        | "A-"
        | "B+"
        | "B-"
        | "O+"
        | "O-"
        | "AB+"
        | "AB-") ?? null,
    address: memberData.address ?? null,
    city: memberData.city ?? null,
    state: memberData.state ?? null,
    pin_code: memberData.pinCode ?? null,
    fitness_goal: memberData.fitnessGoal ?? null,
    medical_conditions: memberData.medicalConditions ?? null,
    allergies: memberData.allergies ?? null,
    physical_notes: memberData.physicalNotes ?? null,
    height_cm: memberData.heightCm ? Number(memberData.heightCm) : null,
    weight_kg: memberData.weightKg ? Number(memberData.weightKg) : null,
    emergency_contact_name: memberData.emergencyContactName ?? null,
    emergency_contact_relationship:
      memberData.emergencyContactRelationship ?? null,
    emergency_contact_phone: memberData.emergencyContactPhone ?? null,
    emergency_contact_address: memberData.emergencyContactAddress ?? null,
    additional_notes: memberData.additionalNotes ?? null,
    updated_at: new Date().toISOString(),
    ...(photoUrl ? { photo_url: photoUrl } : {}),
  };

  // Drop undefined keys so a partial submission never nulls stored data.
  // `null` is kept so a cleared field is actually cleared.
  const definedMemberFields = Object.fromEntries(
    Object.entries(memberFields).filter(([, v]) => v !== undefined),
  );

  const { error: updateError } = await supabase
    .from("members")
    .update(definedMemberFields)
    .eq("id", memberId);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/member/settings");
  return { success: true, data: { id: memberId } };
}

/**
 * Switch the member's "active gym" in the multi-gym switcher.
 * The `members_guard_self_update` trigger ensures the membership belongs to
 * this member — owner cannot do this on behalf of the member.
 */
export async function switchActiveGymMembershipAction(
  memberId: string,
  gymMembershipId: string | null,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("members")
    .update({
      active_gym_membership_id: gymMembershipId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  return { success: true, data: undefined };
}

// ============================================================================
// Membership Application
// ============================================================================

/**
 * Submit a membership application to a gym.
 * RLS: member_id must equal current_member_id().
 */

type SubmitApplicationInput = {
  gymId: string;
  planId: string;
  message?: string;
  emergencyContactPhone?: string;
  fitnessGoal?: string;
  medicalNotes?: string;
};

export type SubmitApplicationResult =
  | { success: true; applicationId: string }
  | { success: false; error: string };

// Maps the RPC's `raise exception 'code'` text to something a member should
// actually see. Anything not in this map (a real DB error, a typo'd
// exception, etc.) falls through to a generic message rather than leaking
// Postgres internals to the client.
const ERROR_MESSAGES: Record<string, string> = {
  member_not_found:
    "We couldn't find your member profile. Please sign in again.",
  gym_not_found: "This gym is no longer accepting applications.",
  plan_not_found: "This plan is no longer available.",
  already_applied:
    "You already have a pending or approved application at this gym.",
};

export async function submitMembershipApplicationAction(
  input: SubmitApplicationInput,
): Promise<SubmitApplicationResult> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("submit_membership_application", {
    p_gym_id: input.gymId,
    p_plan_id: input.planId,
    p_emergency_contact_phone: input.emergencyContactPhone ?? "",
    p_fitness_goal: input.fitnessGoal ?? "",
    p_medical_notes: input.medicalNotes ?? "",
    p_message: input.message ?? "",
  });

  if (error) {
    const code = error.message?.trim();
    console.log(error);
    return {
      success: false,
      error:
        ERROR_MESSAGES[code] ??
        "Something went wrong submitting your application. Please try again.",
    };
  }

  revalidatePath(`/member/discover/${input.gymId}/apply`);
  revalidatePath("/member/applications");
  return { success: true, applicationId: data as string };
}

//session management

type SessionStatus = "Upcoming" | "InProgress" | "Completed" | "Cancelled";

// Recomputes training_sessions.status from the current completion state of
// its session_exercises, and writes it if it changed. Never touches a
// Cancelled session — cancellation is a gym-staff decision, not something
// a member's checkbox should be able to undo.
async function syncSessionStatusFromExercises(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  sessionId: string,
): Promise<ActionResult> {
  const { data: session, error: sessionError } = await supabase
    .from("training_sessions")
    .select("status")
    .eq("id", sessionId)
    .single();

  if (sessionError) return { success: false, error: sessionError.message };
  if (session.status === "Cancelled") return { success: true, data: undefined };

  const { data: exercises, error: exercisesError } = await supabase
    .from("session_exercises")
    .select("completed")
    .eq("session_id", sessionId);

  if (exercisesError) return { success: false, error: exercisesError.message };

  const total = exercises.length;
  const doneCount = exercises.filter((e) => e.completed).length;

  const nextStatus: SessionStatus =
    total > 0 && doneCount === total
      ? "Completed"
      : doneCount > 0
        ? "InProgress"
        : "Upcoming";

  if (nextStatus === session.status) return { success: true, data: undefined };

  const { error: updateError } = await supabase
    .from("training_sessions")
    .update({
      status: nextStatus,
      completed_at:
        nextStatus === "Completed" ? new Date().toISOString() : null,
    })
    .eq("id", sessionId);

  if (updateError) return { success: false, error: updateError.message };
  return { success: true, data: undefined };
}

export async function toggleSessionExerciseCompletionAction(
  sessionExerciseId: string,
  sessionId: string,
  completed: boolean,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("session_exercises")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", sessionExerciseId);

  if (error) return { success: false, error: error.message };

  const syncResult = await syncSessionStatusFromExercises(supabase, sessionId);
  if (!syncResult.success) return syncResult;

  revalidatePath(`/member/sessions/${sessionId}`);
  revalidatePath("/member/sessions");
  return { success: true, data: undefined };
}

export async function markAllSessionExercisesCompletedAction(
  sessionId: string,
  sessionExerciseIds: string[],
): Promise<ActionResult> {
  if (sessionExerciseIds.length === 0) {
    return { success: false, error: "No exercises to mark complete." };
  }

  const supabase = await createServerClient();

  const { error } = await supabase
    .from("session_exercises")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .in("id", sessionExerciseIds);

  if (error) return { success: false, error: error.message };

  const syncResult = await syncSessionStatusFromExercises(supabase, sessionId);
  if (!syncResult.success) return syncResult;

  revalidatePath(`/member/sessions/${sessionId}`);
  revalidatePath("/member/sessions");
  return { success: true, data: undefined };
}

// ============================================================================
// Payment Submission (RPC)
// ============================================================================

/**
 * Submit a payment with a receipt — the member's "I paid, here's proof" step.
 *
 * RPC `submit_payment` enforces:
 *   - Only the payment's member can submit
 *   - Payment must be in Pending or Rejected status
 *   - status is set server-side to PendingVerification (cannot be faked)
 *   - A payment_receipts row is created (old one's is_current flipped to false)
 */

const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  "Payment not found.":
    "We couldn't find this payment. Please refresh and try again.",
  "Not authorized to submit this payment.":
    "You're not authorized to submit this payment.",
};

function getPaymentErrorMessage(rawMessage: string | undefined): string {
  const message = rawMessage?.trim() ?? "";

  if (PAYMENT_ERROR_MESSAGES[message]) {
    return PAYMENT_ERROR_MESSAGES[message];
  }

  if (message.startsWith("Payment is not awaiting submission")) {
    return "This payment has already been submitted or is no longer awaiting submission.";
  }

  return "Something went wrong submitting your payment. Please try again.";
}

type SubmitPaymentInput = {
  gymMembershipId: string;
  gymId: string;
  amount: number;
  method:
    | "UPI"
    | "Cash"
    | "Card"
    | "Bank Transfer"
    | "Net Banking"
    | "Razorpay";
  transactionRef?: string;
  notes?: string;
};

type SubmitPaymentFiles = {
  receipt: File | null;
};

export type SubmitPaymentResult =
  | { success: true; paymentId: string }
  | { success: false; error: string };

export async function submitPaymentAction(
  input: SubmitPaymentInput,
  files: SubmitPaymentFiles,
): Promise<SubmitPaymentResult> {
  const supabase = await createServerClient();
  const { userId, sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    memberId?: string;
  };

  if (!userId || !meta.memberId) {
    return {
      success: false,
      error: "You must be signed in to submit a payment.",
    };
  }

  // Server-side validation
  if (input.method !== "Cash" && !files.receipt) {
    return {
      success: false,
      error:
        "A payment screenshot or receipt is required for this payment method.",
    };
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, status")
    .eq("gym_membership_id", input.gymMembershipId)
    .eq("member_id", meta.memberId)
    .in("status", ["Pending", "Rejected", "PendingVerification"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) {
    console.error("Failed to load pending payment", paymentError);
    return {
      success: false,
      error: "We could not load your payment. Please try again.",
    };
  }
  if (!payment) {
    return { success: false, error: "No pending payment was found." };
  }

  // Upload receipt first (if provided)
  let receiptUrl = "";

  if (files.receipt) {
    try {
      const uploaded = await uploadFile(
        files.receipt,
        `trackVim/members/${userId}/payment-receipts`,
      );

      if (!uploaded) {
        return {
          success: false,
          error: "Failed to upload receipt. Please try again.",
        };
      }

      receiptUrl = uploaded;
    } catch (err) {
      console.error("Receipt upload failed", err);
      return {
        success: false,
        error: "Failed to upload receipt. Please try again.",
      };
    }
  } else if (input.method !== "Cash") {
    // Should be unreachable given the earlier validation, but guard anyway.
    return {
      success: false,
      error: "A receipt is required to submit this payment.",
    };
  }

  // Submit payment via RPC
  const { error } = await supabase.rpc("submit_payment", {
    p_payment_id: payment.id,
    p_method: input.method,
    p_receipt_file_url: receiptUrl, // empty string for Cash with no receipt
    p_file_type: files.receipt?.type ?? "image",
    ...(input.transactionRef
      ? { p_transaction_ref: input.transactionRef }
      : {}),
  });

  if (error) {
    console.error(error);
    return {
      success: false,
      error: getPaymentErrorMessage(error.message),
    };
  }

  revalidatePath(`/member/discover/${input.gymId}/apply`);
  revalidatePath("/member/applications");
  return {
    success: true,
    paymentId: payment.id,
  };
}

// ============================================================================
// Attendance — QR Check-In / Check-Out (RPC)
// ============================================================================

/**
 * Scan a gym's QR code to check in or check out.
 * RPC `check_in_or_out` enforces:
 *   1. QR identifier must be valid and active
 *   2. Member must have an Active gym_membership at that gym (not expired)
 *   3. Same-day state machine: no row → check_in; status=CheckedIn → check_out;
 *      status=CheckedOut → already_done
 *
 * Returns: { action: 'checked_in' | 'checked_out' | 'already_done', ... }
 */

export async function checkInOrOutAction(qrIdentifier: string): Promise<
  ActionResult<{
    action: "checked_in" | "checked_out" | "already_done";
    checkIn?: string;
    checkOut?: string;
    durationMinutes?: number;
  }>
> {
  const supabase = await createServerClient();

  const { data, error } = await (supabase.rpc as any)("check_in_or_out", {
    qr_identifier: qrIdentifier,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/my/attendance");
  return { success: true, data: data as any };
}

// ============================================================================
// Messaging
// ============================================================================

export async function sendMessageAction(payload: {
  gymId?: string;
  receiverId: string;
  subject?: string;
  body: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createServerClient();

  const { data: currentUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .single();

  if (userError || !currentUser)
    return { success: false, error: "User not found." };

  const { data, error } = await supabase
    .from("messages")
    .insert({
      gym_id: payload.gymId,
      sender_id: currentUser.id,
      receiver_id: payload.receiverId,
      subject: payload.subject,
      body: payload.body,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: { id: data.id } };
}

export async function markMessageReadAction(
  messageId: string,
): Promise<ActionResult> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", messageId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
