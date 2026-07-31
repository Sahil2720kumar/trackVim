"use server";

import { createMemberSchema } from "@/db/validators";
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
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to create a member profile.",
    };
  }

  // 2. Extract & validate
  const parsed = createMemberSchema.safeParse(extractMemberFields(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid member data.",
    };
  }
  const memberData = parsed.data;

  // 3. Photo upload
  const photoFile = formData.get("photoFile");
  let photoUrl: string | undefined;

  try {
    if (photoFile instanceof File && photoFile.size > 0) {
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
    })
    .eq("clerk_id", userId)
    .select("id,email")
    .single();

  if (userError) return { success: false, error: userError.message };

  const internalUserId = userData.id;

  // 5. Insert member row
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      profile_id: internalUserId,
      member_code: generateMemberCode(),
      // ── Identity ───────────────────────────────────────────────────
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
      photo_url: photoUrl ?? null,

      // ── Address ────────────────────────────────────────────────────
      address: memberData.address ?? null,
      city: memberData.city ?? null,
      state: memberData.state ?? null,
      pin_code: memberData.pinCode ?? null,

      // ── Health ─────────────────────────────────────────────────────
      fitness_goal: memberData.fitnessGoal ?? null,
      medical_conditions: memberData.medicalConditions ?? null,
      allergies: memberData.allergies ?? null,
      physical_notes: memberData.physicalNotes ?? null,
      height_cm: memberData.heightCm ? Number(memberData.heightCm) : null,
      weight_kg: memberData.weightKg ? Number(memberData.weightKg) : null,

      // ── Emergency contact ──────────────────────────────────────────
      emergency_contact_name: memberData.emergencyContactName ?? null,
      emergency_contact_phone: memberData.emergencyContactPhone ?? null,
      // emergency_contact_relationship:
      //   memberData.emergencyContactRelationship ?? null,
      emergency_contact_address: memberData.emergencyContactAddress ?? null,

      // ── Misc ───────────────────────────────────────────────────────
      additional_notes: memberData.additionalNotes ?? null,
      account_status: "Active",
    })
    .select("id")
    .single();

  if (memberError) return { success: false, error: memberError.message };

  // 6. Update Clerk metadata
  await clerkClient().then((client) =>
    client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "member",
        onboardingComplete: true,
      },
    }),
  );

  return { success: true, data: { id: member.id } };
}

/**
 * Update member's own profile.
 * The `members_guard_self_update` trigger blocks changing account_status
 * (owner-only) from this path.
 */
export async function updateMyProfileAction(
  memberId: string,
  payload: Partial<{
    fullName: string;
    contactEmail: string;
    contactPhone: string;
    dateOfBirth: string;
    gender: "Male" | "Female" | "Other";
    occupation: string;
    bloodGroup: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
    photoUrl: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    heightCm: number;
    weightKg: number;
    fitnessGoal: string;
    medicalConditions: string;
    allergies: string;
    physicalNotes: string;
    emergencyContactName: string;
    emergencyContactRelationship:
      | "Mother"
      | "Father"
      | "Sister"
      | "Brother"
      | "Spouse"
      | "Sibling"
      | "Friend"
      | "Other";
    emergencyContactPhone: string;
    emergencyContactAddress: string;
    additionalNotes: string;
  }>,
): Promise<ActionResult> {
  const supabase = await createClient();

  const fieldMap: Record<string, string> = {
    fullName: "full_name",
    contactEmail: "contact_email",
    contactPhone: "contact_phone",
    dateOfBirth: "date_of_birth",
    gender: "gender",
    occupation: "occupation",
    bloodGroup: "blood_group",
    photoUrl: "photo_url",
    address: "address",
    city: "city",
    state: "state",
    pinCode: "pin_code",
    heightCm: "height_cm",
    weightKg: "weight_kg",
    fitnessGoal: "fitness_goal",
    medicalConditions: "medical_conditions",
    allergies: "allergies",
    physicalNotes: "physical_notes",
    emergencyContactName: "emergency_contact_name",
    emergencyContactRelationship: "emergency_contact_relationship",
    emergencyContactPhone: "emergency_contact_phone",
    emergencyContactAddress: "emergency_contact_address",
    additionalNotes: "additional_notes",
  };

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  for (const [key, col] of Object.entries(fieldMap)) {
    const val = (payload as Record<string, unknown>)[key];
    if (val !== undefined) update[col] = val;
  }

  const { error } = await supabase
    .from("members")
    .update(update as any)
    .eq("id", memberId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/profile");
  return { success: true, data: undefined };
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
  const supabase = await createClient();

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
export async function applyForMembershipAction(payload: {
  gymId: string;
  memberId: string;
  planId: string;
  message?: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  // Prevent duplicate pending applications
  const { data: existing } = await supabase
    .from("membership_applications")
    .select("id, status")
    .eq("gym_id", payload.gymId)
    .eq("member_id", payload.memberId)
    .eq("status", "Pending")
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "You already have a pending application to this gym.",
    };
  }

  const { data, error } = await supabase
    .from("membership_applications")
    .insert({
      gym_id: payload.gymId,
      member_id: payload.memberId,
      plan_id: payload.planId,
      message: payload.message,
      status: "Pending",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "You already have a pending application to this gym.",
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/my/applications");
  return { success: true, data: { id: data.id } };
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
export async function submitPaymentAction(
  paymentId: string,
  payload: {
    method:
      | "Cash"
      | "UPI"
      | "Card"
      | "Bank Transfer"
      | "Net Banking"
      | "Razorpay";
    receiptFileUrl: string;
    fileType?: string;
    transactionRef?: string;
  },
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await (supabase.rpc as any)("submit_payment", {
    p_payment_id: paymentId,
    p_method: payload.method,
    p_receipt_file_url: payload.receiptFileUrl,
    p_file_type: payload.fileType ?? "image",
    p_transaction_ref: payload.transactionRef ?? undefined,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/my/payments");
  return { success: true, data: undefined };
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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", messageId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
