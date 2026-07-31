"use server";

import { ROOM_TYPES } from "@/constants/gym-options";
import { createGymSchema } from "@/db/validators";
import { MAX_GALLERY_IMAGES, uploadFile } from "@/lib/cloudinary/upload";
import { extractGymFields } from "@/lib/extractFields";
import { createServerClient } from "@/lib/supabase/server";
import { generateGymCode } from "@/lib/utils";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Gym Management
// ============================================================================

/**
 * Create a new gym.
 * The `gyms_set_billing_defaults` trigger automatically sets:
 *   - billing_start_date = today + 1 month
 *   - current_plan_id    = Basic
 */

export async function createGymAction(
  formData: FormData,
): Promise<ActionResult<{ id: string; code: string }>> {
  // 1. Auth
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to register a gym.",
    };
  }

  // 2. Validate
  const parsed = createGymSchema.safeParse(extractGymFields(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid gym data.",
    };
  }
  const gymData = parsed.data;

  // 3. Files
  const logo = formData.get("logo");
  const paymentQr = formData.get("paymentQr");
  const gallery = formData
    .getAll("gallery")
    .filter((v): v is File => v instanceof File);

  if (gallery.length > MAX_GALLERY_IMAGES) {
    return {
      success: false,
      error: `You can upload up to ${MAX_GALLERY_IMAGES} gallery images.`,
    };
  }

  // 4. Upload all files in parallel
  let logoUrl: string | undefined;
  let paymentQrUrl: string | undefined;
  let galleryUrls: string[] = [];

  try {
    const folder = `trackVim/gyms/${userId}`;
    const [logoResult, qrResult, galleryResult] = await Promise.all([
      logo instanceof File && logo.size > 0
        ? uploadFile(logo, `${folder}/logo`)
        : Promise.resolve(undefined),
      paymentQr instanceof File && paymentQr.size > 0
        ? uploadFile(paymentQr, `${folder}/payment-qr`)
        : Promise.resolve(undefined),
      gallery.length
        ? Promise.all(gallery.map((f) => uploadFile(f, `${folder}/gallery`)))
        : Promise.resolve([]),
    ]);
    logoUrl = logoResult;
    paymentQrUrl = qrResult;
    galleryUrls = galleryResult;
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload images. Please try again.",
    };
  }

  const supabase = await createServerClient();
  const code = generateGymCode();

  // 5. Update user row first — we need users.id for gyms.owner_id
  const { data: userData, error: userError } = await supabase
    .from("users")
    .update({
      full_name: gymData.ownerName,
      phone: gymData.contactPhone ?? gymData.businessPhone,
      role: "owner",
      account_status: "Active",
    })
    .eq("clerk_id", userId)
    .select("id,email")
    .single();

  if (userError) return { success: false, error: userError.message };

  const internalUserId = userData.id; // UUID from users table

  // 6. Insert gym — owner_id now correctly references users.id (UUID)
  const { data: gymData2, error: gymError } = await supabase
    .from("gyms")
    .insert({
      owner_id: internalUserId,

      // ── Core identity ──────────────────────────────────────────────
      name: gymData.name,
      code,
      gym_short_name: gymData.gymShortName ?? null,
      gym_description: gymData.gymDescription ?? null,

      // ── Contact ────────────────────────────────────────────────────
      contact_email: userData.email ?? null,
      contact_phone: gymData.contactPhone ?? null,
      website: gymData.website ?? null,
      logo_url: logoUrl ?? null,
      payment_qr_url: paymentQrUrl ?? null,

      // ── Owner / business ───────────────────────────────────────────
      owner_name: gymData.ownerName ?? null,
      business_name: gymData.businessName ?? null,
      business_email: gymData.businessEmail ?? null,
      business_phone: gymData.businessPhone ?? null,

      // ── Address ────────────────────────────────────────────────────
      address_line1: gymData.addressLine1 ?? null,
      address_line2: gymData.addressLine2 ?? null,
      city: gymData.city ?? null,
      state: gymData.state ?? null,
      state_code: gymData.stateCode ?? null,
      postal_code: gymData.postalCode ?? null,
      country: gymData.country ?? "India",
      timezone: gymData.timezone ?? "Asia/Kolkata",

      // ── Facilities ─────────────────────────────────────────────────
      number_of_floors: gymData.numberOfFloors ?? null,
      number_of_rooms: gymData.numberOfRooms ?? null,
      facility_notes: gymData.facilityNotes ?? null,

      has_washroom: gymData.hasWashroom ?? false,
      washroom_count: gymData.hasWashroom
        ? (gymData.washroomCount ?? null)
        : null,

      has_sauna_room: gymData.hasSaunaRoom ?? false,
      sauna_room_count: gymData.hasSaunaRoom
        ? (gymData.saunaRoomCount ?? null)
        : null,

      has_steam_room: gymData.hasSteamRoom ?? false,
      steam_room_count: gymData.hasSteamRoom
        ? (gymData.steamRoomCount ?? null)
        : null,

      has_shower_room: gymData.hasShowerRoom ?? false,
      shower_room_count: gymData.hasShowerRoom
        ? (gymData.showerRoomCount ?? null)
        : null,

      has_locker_room: gymData.hasLockerRoom ?? false,
      locker_room_count: gymData.hasLockerRoom
        ? (gymData.lockerRoomCount ?? null)
        : null,

      // ── Extras ─────────────────────────────────────────────────────
      amenities: gymData.amenities ?? [],
      equipment: gymData.equipment ?? [],

      // ── GST ────────────────────────────────────────────────────────
      gst_registered: gymData.gstRegistered ?? false,
      gstin: gymData.gstRegistered ? (gymData.gstin ?? null) : null,
      legal_business_name: gymData.gstRegistered
        ? (gymData.legalBusinessName ?? null)
        : null,
      billing_address: gymData.gstRegistered
        ? (gymData.billingAddress ?? null)
        : null,
      gst_state: gymData.gstRegistered ? (gymData.gstState ?? null) : null,
      place_of_supply: gymData.gstRegistered
        ? (gymData.placeOfSupply ?? null)
        : null,
      sac_code: gymData.gstRegistered ? (gymData.sacCode ?? null) : null,
    })
    .select("id, code")
    .single();

  if (gymError) return { success: false, error: gymError.message };

  const gymId = gymData2.id;

  // 7. Gallery photos + Clerk metadata in parallel
  const sideEffects: PromiseLike<unknown>[] = [
    clerkClient().then((client) =>
      client.users.updateUserMetadata(userId, {
        publicMetadata: { role: "owner", gymId, onboardingComplete: true },
      }),
    ),
  ];

  if (galleryUrls.length) {
    sideEffects.push(
      supabase
        .from("gym_photos")
        .insert(
          galleryUrls.map((url, i) => ({
            gym_id: gymId,
            uploaded_by: internalUserId, // ← consistent with FK
            photo_url: url,
            is_cover: i === 0,
            sort_order: i,
          })),
        )
        .then(({ error }) => {
          if (error) console.error("gym_photos insert failed:", error);
        }),
    );
  }

  await Promise.all(sideEffects);
  // revalidatePath("/owner/dashboard");
  return { success: true, data: { id: gymId, code: gymData2.code } };
}

/**
 * Update gym profile. billing_start_date and current_plan_id are protected by
 * the `gyms_protect_billing_fields` trigger and cannot be updated here.
 */
export async function updateGymAction(
  gymId: string,
  payload: Partial<{
    name: string;
    gymShortName: string;
    gymDescription: string;
    contactEmail: string;
    contactPhone: string;
    website: string;
    logoUrl: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    amenities: string[];
    equipment: { name: string; quantity: number }[];
    gstRegistered: boolean;
    gstin: string;
    legalBusinessName: string;
    billingAddress: string;
    gstState: string;
    stateCode: string;
    numberOfFloors: number;
    numberOfRooms: number;
    hasWashroom: boolean;
    hasLockerRoom: boolean;
    hasSaunaRoom: boolean;
    hasSteamRoom: boolean;
    hasShowerRoom: boolean;
    facilityNotes: string;
  }>,
): Promise<ActionResult> {
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  const fieldMap: Record<string, string> = {
    name: "name",
    gymShortName: "gym_short_name",
    gymDescription: "gym_description",
    contactEmail: "contact_email",
    contactPhone: "contact_phone",
    website: "website",
    logoUrl: "logo_url",
    addressLine1: "address_line1",
    addressLine2: "address_line2",
    city: "city",
    state: "state",
    postalCode: "postal_code",
    country: "country",
    amenities: "amenities",
    equipment: "equipment",
    gstRegistered: "gst_registered",
    gstin: "gstin",
    legalBusinessName: "legal_business_name",
    billingAddress: "billing_address",
    gstState: "gst_state",
    stateCode: "state_code",
    numberOfFloors: "number_of_floors",
    numberOfRooms: "number_of_rooms",
    hasWashroom: "has_washroom",
    hasLockerRoom: "has_locker_room",
    hasSaunaRoom: "has_sauna_room",
    hasSteamRoom: "has_steam_room",
    hasShowerRoom: "has_shower_room",
    facilityNotes: "facility_notes",
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    const val = (payload as Record<string, unknown>)[key];
    if (val !== undefined) update[col] = val;
  }

  const { error } = await supabase
    .from("gyms")
    .update(update as any)
    .eq("id", gymId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true, data: undefined };
}

/**
 * Switch the gym's TrackVim platform subscription plan.
 * RPC `change_gym_subscription_plan` internally sets the bypass flag and
 * updates gyms.current_plan_id in one transaction.
 */
export async function changeGymSubscriptionPlanAction(
  gymId: string,
  newPlanId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("change_gym_subscription_plan", {
    p_gym_id: gymId,
    p_new_plan_id: newPlanId,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/billing");
  return { success: true, data: undefined };
}

// ============================================================================
// Gym Locations
// ============================================================================

export async function createGymLocationAction(payload: {
  gymId: string;
  name?: string;
  address?: string;
  isPrimary?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gym_locations")
    .insert({
      gym_id: payload.gymId,
      name: payload.name ?? "Main Branch",
      address: payload.address,
      is_primary: payload.isPrimary ?? false,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true, data: { id: data.id } };
}

export async function updateGymLocationAction(
  locationId: string,
  payload: Partial<{ name: string; address: string; isPrimary: boolean }>,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("gym_locations")
    .update({
      name: payload.name,
      address: payload.address,
      is_primary: payload.isPrimary,
    })
    .eq("id", locationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true, data: undefined };
}

// ============================================================================
// QR Codes
// ============================================================================

export async function createGymQrCodeAction(payload: {
  gymId: string;
  locationId?: string;
  label?: string;
  qrIdentifier: string;
  signatureSecret: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gym_qr_codes")
    .insert({
      gym_id: payload.gymId,
      location_id: payload.locationId,
      label: payload.label ?? "Entrance QR",
      qr_identifier: payload.qrIdentifier,
      signature_secret: payload.signatureSecret,
      type: "Static",
      is_active: true,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true, data: { id: data.id } };
}

export async function toggleQrCodeActiveAction(
  qrCodeId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("gym_qr_codes")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", qrCodeId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true, data: undefined };
}

// ============================================================================
// Membership Plans
// ============================================================================

export async function createMembershipPlanAction(
  gymId: string,
  payload: {
    planName: string;
    shortDescription: string;
    planPrice: number;
    durationMonths: number;
    membershipDuration: string;
    joiningFee?: number;
    securityDeposit?: number;
    planCategory?:
      | "Standard"
      | "Premium"
      | "VIP"
      | "Student"
      | "Corporate"
      | "Personal Training";
    planColor?: string;
    planIcon?: string;
    selectedFeatures?: string[];
    customFeatures?: string[];
    enrollmentMode?: "Open" | "Invite Only";
    status?: "Active" | "Draft" | "Hidden";
    minimumAge?: number;
    maximumAge?: number;
    maxActiveMembers?: number;
    allowFreeze?: boolean;
    maxFreezeDays?: number;
    isFeatured?: boolean;
    additionalNotes?: string;
  },
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("membership_plans")
    .insert({
      gym_id: gymId,
      plan_name: payload.planName,
      short_description: payload.shortDescription,
      plan_price: payload.planPrice,
      duration_months: payload.durationMonths,
      membership_duration: payload.membershipDuration,
      joining_fee: payload.joiningFee ?? 0,
      security_deposit: payload.securityDeposit ?? 0,
      plan_category: payload.planCategory,
      plan_color: payload.planColor,
      plan_icon: payload.planIcon,
      selected_features: payload.selectedFeatures ?? [],
      custom_features: payload.customFeatures ?? [],
      enrollment_mode: payload.enrollmentMode ?? "Open",
      status: payload.status ?? "Active",
      minimum_age: payload.minimumAge ?? 14,
      maximum_age: payload.maximumAge ?? 80,
      max_active_members: payload.maxActiveMembers,
      allow_freeze: payload.allowFreeze ?? false,
      max_freeze_days: payload.maxFreezeDays,
      is_featured: payload.isFeatured ?? false,
      additional_notes: payload.additionalNotes,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/plans");
  return { success: true, data: { id: data.id } };
}

export async function updateMembershipPlanAction(
  planId: string,
  payload: Partial<{
    planName: string;
    shortDescription: string;
    planPrice: number;
    durationMonths: number;
    membershipDuration: string;
    joiningFee: number;
    status: "Active" | "Draft" | "Hidden";
    selectedFeatures: string[];
    customFeatures: string[];
    enrollmentMode: "Open" | "Invite Only";
    isFeatured: boolean;
    additionalNotes: string;
    allowFreeze: boolean;
    maxFreezeDays: number;
    maxActiveMembers: number;
  }>,
): Promise<ActionResult> {
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.planName !== undefined) update.plan_name = payload.planName;
  if (payload.shortDescription !== undefined)
    update.short_description = payload.shortDescription;
  if (payload.planPrice !== undefined)
    update.plan_price = payload.planPrice.toString();
  if (payload.durationMonths !== undefined)
    update.duration_months = payload.durationMonths;
  if (payload.membershipDuration !== undefined)
    update.membership_duration = payload.membershipDuration;
  if (payload.joiningFee !== undefined)
    update.joining_fee = payload.joiningFee.toString();
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.selectedFeatures !== undefined)
    update.selected_features = payload.selectedFeatures;
  if (payload.customFeatures !== undefined)
    update.custom_features = payload.customFeatures;
  if (payload.enrollmentMode !== undefined)
    update.enrollment_mode = payload.enrollmentMode;
  if (payload.isFeatured !== undefined) update.is_featured = payload.isFeatured;
  if (payload.additionalNotes !== undefined)
    update.additional_notes = payload.additionalNotes;
  if (payload.allowFreeze !== undefined)
    update.allow_freeze = payload.allowFreeze;
  if (payload.maxFreezeDays !== undefined)
    update.max_freeze_days = payload.maxFreezeDays;
  if (payload.maxActiveMembers !== undefined)
    update.max_active_members = payload.maxActiveMembers;

  const { error } = await supabase
    .from("membership_plans")
    .update(update as any)
    .eq("id", planId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/plans");
  return { success: true, data: undefined };
}

export async function deleteMembershipPlanAction(
  planId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  // Soft-delete: set to Hidden so existing memberships on this plan still reference it.
  const { error } = await supabase
    .from("membership_plans")
    .update({
      status: "Hidden",
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/plans");
  return { success: true, data: undefined };
}

// ============================================================================
// Trainer Management (owner-only fields)
// ============================================================================

/**
 * Invite a new trainer. Creates a trainers row with status='Invited'.
 * Trainer fills in their profile (bio, availability, etc.) after accepting.
 */
export async function inviteTrainerAction(payload: {
  gymId: string;
  invitedEmail: string;
  clerkInvitationId?: string;
  professionalTitle?: string;
  employmentType?: "Full Time" | "Part Time" | "Contract";
  salary?: number;
  joiningDate?: string;
  employeeId?: string;
  maxMembers?: number;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainers")
    .insert({
      gym_id: payload.gymId,
      invited_email: payload.invitedEmail,
      clerk_invitation_id: payload.clerkInvitationId,
      invitation_sent_at: new Date().toISOString(),
      professional_title: payload.professionalTitle,
      employment_type: payload.employmentType ?? "Full Time",
      salary: payload.salary?.toString(),
      joining_date: payload.joiningDate,
      employee_id: payload.employeeId,
      max_members: payload.maxMembers,
      status: "Invited",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/trainers");
  return { success: true, data: { id: data.id } };
}

/**
 * Update owner-controlled fields on a trainer row.
 * The `trainers_guard_self_update` trigger allows these ONLY when is_gym_owner()=true.
 * Fields: gym_id, salary, employee_id, status, profile_id, max_members.
 */
export async function updateTrainerOwnerFieldsAction(
  trainerId: string,
  payload: Partial<{
    salary: number;
    status: "Invited" | "Active" | "Busy" | "On Leave" | "Offline" | "Inactive";
    employeeId: string;
    maxMembers: number;
  }>,
): Promise<ActionResult> {
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.salary !== undefined) update.salary = payload.salary.toString();
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.employeeId !== undefined) update.employee_id = payload.employeeId;
  if (payload.maxMembers !== undefined) update.max_members = payload.maxMembers;

  const { error } = await supabase
    .from("trainers")
    .update(update)
    .eq("id", trainerId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/trainers");
  return { success: true, data: undefined };
}

// ============================================================================
// Trainer Assignments
// ============================================================================

export async function assignTrainerToMemberAction(payload: {
  gymId: string;
  memberId: string;
  trainerId: string;
  notes?: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainer_assignments")
    .insert({
      gym_id: payload.gymId,
      member_id: payload.memberId,
      trainer_id: payload.trainerId,
      notes: payload.notes,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/members");
  return { success: true, data: { id: data.id } };
}

export async function unassignTrainerAction(
  assignmentId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trainer_assignments")
    .update({ is_active: false, unassigned_at: new Date().toISOString() })
    .eq("id", assignmentId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/members");
  return { success: true, data: undefined };
}

// ============================================================================
// Membership Application Review (RPCs)
// ============================================================================

/**
 * Approve a pending membership application — atomic RPC.
 * Application(Pending) → Approved
 * gym_membership created (PaymentPending)
 * payment stub created (Pending)
 * notification sent to member
 *
 * Returns the new gym_memberships.id.
 */
export async function approveMembershipApplicationAction(
  applicationId: string,
): Promise<ActionResult<{ membershipId: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("approve_membership_application", {
    p_application_id: applicationId,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/members");
  return { success: true, data: { membershipId: data as string } };
}

/**
 * Reject a pending membership application — atomic RPC.
 * Application(Pending) → Rejected, notification sent.
 * No membership row is ever created for a rejected application.
 */
export async function rejectMembershipApplicationAction(
  applicationId: string,
  reason: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("reject_membership_application", {
    p_application_id: applicationId,
    p_reason: reason,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/applications");
  return { success: true, data: undefined };
}

// ============================================================================
// Payment Verification (RPCs)
// ============================================================================

/**
 * Verify a member's payment — atomic RPC.
 * Payment(PendingVerification) → Verified
 * Membership → Active (dates computed from today)
 * Notification sent to member.
 */
export async function verifyPaymentAction(
  paymentId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("verify_payment", {
    p_payment_id: paymentId,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/members");
  return { success: true, data: undefined };
}

/**
 * Reject a member's payment — atomic RPC.
 * Payment(PendingVerification) → Rejected
 * Membership → PaymentRejected
 * Notification sent to member (member re-uploads via submit_payment RPC).
 */
export async function rejectPaymentAction(
  paymentId: string,
  reason: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("reject_payment", {
    p_payment_id: paymentId,
    p_reason: reason,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/payments");
  return { success: true, data: undefined };
}

// ============================================================================
// Membership Renewal (RPC)
// ============================================================================

/**
 * Renew a gym membership — atomic RPC.
 * Creates a NEW gym_memberships row + payment stub (Pending).
 * Old membership is never mutated (full history preserved).
 * Optionally switches to a different plan via planId.
 * Returns the new gym_memberships.id.
 */
export async function renewMembershipAction(
  gymMembershipId: string,
  planId?: string,
): Promise<ActionResult<{ membershipId: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("renew_membership", {
    p_gym_membership_id: gymMembershipId,
    p_plan_id: planId ?? null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/members");
  return { success: true, data: { membershipId: data as string } };
}

/**
 * Manually cancel a membership.
 */
export async function cancelMembershipAction(
  membershipId: string,
  reason?: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("gym_memberships")
    .update({
      status: "Cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", membershipId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/members");
  return { success: true, data: undefined };
}

// ============================================================================
// Member Account Status (owner-only)
// ============================================================================

/**
 * Suspend or reinstate a member account.
 * The `members_guard_self_update` trigger enforces owner-only access.
 */
export async function setMemberAccountStatusAction(
  memberId: string,
  status: "Active" | "Inactive" | "Suspended",
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("members")
    .update({ account_status: status, updated_at: new Date().toISOString() })
    .eq("id", memberId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/members");
  return { success: true, data: undefined };
}

// ============================================================================
// Platform Billing (TrackVim → Owner)
// ============================================================================

/**
 * Create a Razorpay payment order record for a platform invoice.
 * Call AFTER you create the actual Razorpay Order server-side using the
 * Razorpay secret key. This RPC stores the gateway_order_id ↔ invoice mapping
 * that the webhook handler (record_subscription_payment_captured) looks up.
 *
 * Returns the subscription_payments.id.
 */
export async function createSubscriptionPaymentOrderAction(
  gymSubscriptionId: string,
  gatewayOrderId: string,
): Promise<ActionResult<{ paymentId: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "create_subscription_payment_order",
    {
      p_gym_subscription_id: gymSubscriptionId,
      p_gateway_order_id: gatewayOrderId, //razoypay orderId create via create-razorpay-order
    },
  );

  if (error) return { success: false, error: error.message };
  return { success: true, data: { paymentId: data as string } };
}

// ============================================================================
// Attendance corrections (staff direct-write access)
// ============================================================================

/**
 * Manually correct an attendance record (e.g. forgotten check-out).
 * Staff retain direct write access to `attendance`; only members lost it
 * (they must use check_in_or_out RPC).
 */
export async function correctAttendanceAction(
  attendanceId: string,
  payload: {
    checkOut: string;
    durationMinutes?: number;
    notes?: string;
  },
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("attendance")
    .update({
      check_out: payload.checkOut,
      duration_minutes: payload.durationMinutes,
      status: "CheckedOut",
      notes: payload.notes,
    })
    .eq("id", attendanceId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/attendance");
  return { success: true, data: undefined };
}

// ============================================================================
// Notifications (mutation)
// ============================================================================

export async function markNotificationReadAction(
  notificationId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
