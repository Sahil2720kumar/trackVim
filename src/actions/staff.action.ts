"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { InviteMemberFormInput, inviteMemberFormSchema } from "@/db/validators";
import { ActionResult } from "./member.action";
import { uploadFile } from "@/lib/cloudinary/upload";
import { generateMemberCode } from "@/lib/utils";

// This mirrors the real walk-in flow implemented in Postgres:
//   create_walkin_member -> [profile update] -> create_walkin_membership
//   -> [optional] record_walkin_payment
// instead of raw table inserts from the app layer. The RPCs own the
// business rules — the staff_gym_ids() authorization check, status
// transitions, the trusted-write flag for the Pending payment stub — so
// this action's job is just to call them in order and surface errors.
//
// IMPORTANT — behavior changes from the earlier draft of this action:
//   • create_walkin_membership hardcodes discount to 0 and computes
//     final_amount from the plan's own price/joining fee. It does NOT
//     take a client-supplied discount or price override. The `discount`
//     field in inviteMemberFormSchema currently has no server-side effect
//     until/unless that RPC gains a p_discount parameter — flagging
//     rather than silently dropping it from the type.
//   • Marking payment as collected does NOT activate the membership.
//     record_walkin_payment only moves the payment Pending ->
//     PendingVerification. Activation is verify_payment() (unchanged,
//     owner-only) — a separate, later step. The old "isPrepaid -> Active"
//     shortcut was wrong; there is no staff-side path to Active at all.
export type PaymentMethod = "Cash" | "UPI" | "Card" | "Bank Transfer";

export async function inviteMemberAction(
  data: InviteMemberFormInput,
  sendInvitation: boolean,
  markPaidNow: boolean,
  transactionRef: string | null,
  photoFile: File | null,
  paymentMethod: PaymentMethod | null,
): Promise<ActionResult<{ memberId: string; membershipId: string }>> {
  // 1. Auth
  const { sessionClaims } = await auth();
  const staffMeta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };

  if (
    (staffMeta.role !== "owner" && staffMeta.role !== "trainer") ||
    !staffMeta.gymId
  ) {
    return {
      success: false,
      error: "Not authorized to add members for a gym.",
    };
  }
  const gymId = staffMeta.gymId;

  // 2. Validate
  const parsed = inviteMemberFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }
  const memberData = parsed.data;

  if (sendInvitation && !memberData.invitedEmail) {
    return {
      success: false,
      error: "An email address is required to send an invitation.",
    };
  }

  const supabase = await createServerClient();

  // 3. Step 1 — "Owner creates member". No auth account yet; profile_id
  // stays null until the member eventually signs up and links it. RLS
  // (staff_gym_ids()) is enforced inside the function, not here.
  const { data: member, error: memberError } = await supabase
    .rpc("create_walkin_member", {
      p_gym_id: gymId,
      p_full_name: memberData.fullName!,
      ...(memberData.invitedEmail && { p_email: memberData.invitedEmail }),
      ...(memberData.contactPhone && { p_phone: memberData.contactPhone }),
      p_member_code: generateMemberCode(),
    })
    .select("id");

  console.log("member", member);
  console.log("memberError", memberError);

  if (memberError || !member) {
    return {
      success: false,
      error: memberError?.message ?? "Failed to create member.",
    };
  }

  let photoUrl: string | null = null;
  if (photoFile && photoFile.size > 0) {
    try {
      photoUrl = await uploadFile(
        photoFile,
        `trackVim/members/${member.id}/photo`,
      );
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to upload photo. Please try again.",
      };
    }
  }

  const { error: profileError } = await supabase
    .from("members")
    .update({
      photo_url: photoUrl,
      date_of_birth: memberData.dateOfBirth || null,
      gender: memberData.gender as
        | "Male"
        | "Female"
        | "Other"
        | null
        | undefined,
      occupation: memberData.occupation || null,
      blood_group:
        (memberData.bloodGroup as
          | "A+"
          | "A-"
          | "B+"
          | "B-"
          | "O+"
          | "O-"
          | "AB+"
          | "AB-"
          | null
          | undefined) || null,
      address: memberData.address || null,
      city: memberData.city || null,
      state: memberData.state || null,
      pin_code: memberData.pinCode || null,
      height_cm: Number(memberData.heightCm) || null,
      weight_kg: Number(memberData.weightKg) || null,
      fitness_goal: memberData.fitnessGoal || null,
      medical_conditions: memberData.medicalConditions || null,
      allergies: memberData.allergies || null,
      physical_notes: memberData.physicalNotes || null,
      emergency_contact_name: memberData.emergencyContactName || null,
      emergency_contact_relationship:
        memberData.emergencyContactRelationship as
          | "Other"
          | "Mother"
          | "Father"
          | "Sister"
          | "Brother"
          | "Spouse"
          | "Sibling"
          | "Friend"
          | null
          | undefined,
      emergency_contact_phone: memberData.emergencyContactPhone || null,
      emergency_contact_address: memberData.emergencyContactAddress || null,
      additional_notes: memberData.additionalNotes || null,
    })
    .eq("id", member.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // 5. Step 3 — "Membership", Option A (no application). This one RPC
  // creates the gym_membership (PaymentPending) AND the Pending payment
  // stub together, atomically.
  const { data: membershipId, error: membershipError } = await supabase.rpc(
    "create_walkin_membership",
    {
      p_gym_id: gymId,
      p_member_id: member.id,
      p_plan_id: memberData.planId,
    },
  );

  if (membershipError || !membershipId) {
    return {
      success: false,
      error: membershipError?.message ?? "Failed to create membership.",
    };
  }

  // 6. Optional trainer assignment — not part of this flow's RPCs, plain
  // insert. trainer_assignments has no RLS-gap concern like members does
  // (the row itself carries gym_id, checked directly by STAFF_GYM_IDS).
  if (memberData.trainerId) {
    const { error: assignmentError } = await supabase
      .from("trainer_assignments")
      .insert({
        gym_id: gymId,
        member_id: member.id,
        trainer_id: memberData.trainerId,
      });
    if (assignmentError) {
      return { success: false, error: assignmentError.message };
    }
  }

  // 7. Step 4 — "If cash is handed over immediately, the staff can create
  // the receipt and move it to verification." Finds the Pending stub
  // create_walkin_membership just inserted and records it as collected.
  // Membership stays PaymentPending either way — see the note at the top.
  if (markPaidNow) {
    const { data: payment, error: paymentLookupError } = await supabase
      .from("payments")
      .select("id")
      .eq("gym_membership_id", membershipId)
      .eq("status", "Pending")
      .single();

    if (paymentLookupError || !payment) {
      return {
        success: false,
        error:
          paymentLookupError?.message ??
          "Could not find the pending payment to record.",
      };
    }

    const { error: recordError } = await supabase.rpc("record_walkin_payment", {
      p_payment_id: payment.id,
      p_method: paymentMethod as "Cash" | "UPI" | "Card" | "Bank Transfer",
      p_transaction_ref: transactionRef || "",
    });

    if (recordError) {
      return { success: false, error: recordError.message };
    }
  }

  // 8. Invitation — fully decoupled per the flow: "Nothing blocks
  // membership if they ignore it." Fire-and-forget; a failure here must
  // not fail or roll back the member/membership that already exist.
  if (sendInvitation && memberData.invitedEmail) {
    try {
      const client = await clerkClient();
      const invitation = await client.invitations.createInvitation({
        emailAddress: memberData.invitedEmail,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
        publicMetadata: {
          role: "member",
          gymId,
          memberId: member.id,
          onboardingComplete: false,
        },
        notify: true,
        ignoreExisting: true,
      });

      const { error: clerkIdError } = await supabase
        .from("members")
        .update({ clerk_invitation_id: invitation.id })
        .eq("id", member.id);
      if (clerkIdError) return { success: false, error: clerkIdError.message };
    } catch (err) {
      console.error("Failed to send member invitation email:", err);
    }
  }

  revalidatePath("/owner/members");

  return {
    success: true,
    data: { memberId: member.id, membershipId },
  };
}

export async function recordWalkinPaymentAction(
  paymentId: string,
  method: PaymentMethod,
  transactionRef?: string | null,
): Promise<ActionResult<{ id: string }>> {
  const { sessionClaims } = await auth();
  const staffMeta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };

  if (
    (staffMeta.role !== "owner" && staffMeta.role !== "trainer") ||
    !staffMeta.gymId
  ) {
    return { success: false, error: "Not authorized to record payments." };
  }

  const supabase = await createServerClient();

  const { error } = await supabase.rpc("record_walkin_payment", {
    p_payment_id: paymentId,
    p_method: method,
    p_transaction_ref: transactionRef || "",
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/owner/payments");
  revalidatePath("/owner/members");

  return { success: true, data: { id: paymentId } };
}
