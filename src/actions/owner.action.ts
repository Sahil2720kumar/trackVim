"use server";

import { ROOM_TYPES } from "@/constants/gym-options";
import {
  CreateGymInput,
  createGymSchema,
  createMembershipPlanSchema,
  CreateMembershipPlanInput,
  CreateTrainerInput,
  createTrainerSchema,
  InviteMemberFormInput,
  inviteMemberFormSchema,
} from "@/db/validators";
import { MAX_GALLERY_IMAGES, uploadFile } from "@/lib/cloudinary/upload";
import { extractGymFields, extractTrainerFields } from "@/lib/extractFields";
import { createServerClient } from "@/lib/supabase/server";
import {
  generateGymCode,
  generateMemberCode,
  generateTrainerCode,
} from "@/lib/utils";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { PaymentMethod } from "./staff.action";

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
  data: CreateGymInput,
  files: {
    logo?: File | null;
    paymentQr?: File | null;
    gallery?: File[] | null;
  },
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
  const parsed = createGymSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid gym data.",
    };
  }
  const gymData = parsed.data;

  // 3. Files
  const { logo, paymentQr, gallery = [] } = files;

  if (gallery && gallery.length > MAX_GALLERY_IMAGES) {
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
      logo && logo.size > 0
        ? uploadFile(logo, `${folder}/logo`)
        : Promise.resolve(undefined),
      paymentQr && paymentQr.size > 0
        ? uploadFile(paymentQr, `${folder}/payment-qr`)
        : Promise.resolve(undefined),
      gallery && gallery.length
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

  const internalUserId = userData.id;

  // 6. Insert gym
  const { data: gymData2, error: gymError } = await supabase
    .from("gyms")
    .insert({
      owner_id: internalUserId,
      name: gymData.name,
      code,
      gym_short_name: gymData.gymShortName ?? null,
      gym_description: gymData.gymDescription ?? null,
      contact_email: userData.email ?? null,
      contact_phone: gymData.contactPhone ?? null,
      website: gymData.website ?? null,
      logo_url: logoUrl ?? null,
      payment_qr_url: paymentQrUrl ?? null,
      owner_name: gymData.ownerName ?? null,
      business_name: gymData.businessName ?? null,
      business_email: gymData.businessEmail ?? null,
      business_phone: gymData.businessPhone ?? null,
      address_line1: gymData.addressLine1 ?? null,
      address_line2: gymData.addressLine2 ?? null,
      city: gymData.city ?? null,
      state: gymData.state ?? null,
      state_code: gymData.stateCode ?? null,
      postal_code: gymData.postalCode ?? null,
      country: gymData.country ?? "India",
      timezone: gymData.timezone ?? "Asia/Kolkata",
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
      amenities: gymData.amenities ?? [],
      equipment: gymData.equipment ?? [],
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
            uploaded_by: internalUserId,
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

  const results = await Promise.allSettled(sideEffects);
  const failed = results.find((r) => r.status === "rejected");
  if (failed) {
    return {
      success: false,
      error:
        "Gym created, but finalizing your account failed. Please retry to finish setup.",
    };
  }
  return { success: true, data: { id: gymId, code: gymData2.code } };
}

/**
 * Update gym profile. billing_start_date and current_plan_id are protected by
 * the `gyms_protect_billing_fields` trigger and cannot be updated here.
 */
export async function updateGymSettingsAction(
  gymId: string,
  data: CreateGymInput,
  files?: {
    logo?: File | null;
    paymentQr?: File | null;
  },
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to update gym settings.",
    };
  }

  // 2. Validate — same schema createGymAction uses, since the settings
  // form is built on the same shape of data.
  const parsed = createGymSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid gym data.",
    };
  }
  const gymData = parsed.data;

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

  // 4. Ownership check — gymId comes from the client, don't trust it
  // blindly. Same spirit as the member/trainer self-update ownership
  // checks: confirm this gym actually belongs to this owner before
  // writing anything.
  const { data: existing, error: existingError } = await supabase
    .from("gyms")
    .select("id, owner_id")
    .eq("id", gymId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingError) return { success: false, error: existingError.message };
  if (!existing || existing.owner_id !== userData.id) {
    return { success: false, error: "Gym not found." };
  }

  // 5. Uploads — keyed on gymId so repeated saves overwrite the same
  // path instead of accumulating, same pattern as member/trainer photo
  // uploads.
  const { logo, paymentQr } = files ?? {};
  let logoUrl: string | undefined;
  let paymentQrUrl: string | undefined;

  try {
    const folder = `trackVim/gyms/${gymId}`;
    const [logoResult, qrResult] = await Promise.all([
      logo && logo.size > 0
        ? uploadFile(logo, `${folder}/logo`)
        : Promise.resolve(undefined),
      paymentQr && paymentQr.size > 0
        ? uploadFile(paymentQr, `${folder}/payment-qr`)
        : Promise.resolve(undefined),
    ]);
    logoUrl = logoResult;
    paymentQrUrl = qrResult;
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload images. Please try again.",
    };
  }

  // 6. Same field set createGymAction writes on insert, minus
  // create-only columns (owner_id, code, timezone/contact_email — the
  // latter stays derived from the owner's Clerk email, not form input)
  // and billing fields, which gyms_protect_billing_fields blocks anyway.
  const gymFields = {
    name: gymData.name,
    gym_short_name: gymData.gymShortName ?? null,
    gym_description: gymData.gymDescription ?? null,
    contact_phone: gymData.contactPhone ?? null,
    website: gymData.website ?? null,
    owner_name: gymData.ownerName ?? null,
    business_name: gymData.businessName ?? null,
    business_email: gymData.businessEmail ?? null,
    business_phone: gymData.businessPhone ?? null,
    address_line1: gymData.addressLine1 ?? null,
    address_line2: gymData.addressLine2 ?? null,
    city: gymData.city ?? null,
    state: gymData.state ?? null,
    state_code: gymData.stateCode ?? null,
    postal_code: gymData.postalCode ?? null,
    country: gymData.country ?? "India",
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
    amenities: gymData.amenities ?? [],
    equipment: gymData.equipment ?? [],
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
    updated_at: new Date().toISOString(),
    ...(logoUrl ? { logo_url: logoUrl } : {}),
    ...(paymentQrUrl ? { payment_qr_url: paymentQrUrl } : {}),
  };
  // Drop undefined keys so a partial submission never nulls stored data;
  // null is kept so a cleared field is actually cleared. Same rule
  // updateMemberProfileAction follows.
  const definedGymFields = Object.fromEntries(
    Object.entries(gymFields).filter(([, v]) => v !== undefined),
  );

  const { error: updateError } = await supabase
    .from("gyms")
    .update(definedGymFields)
    .eq("id", gymId);

  if (updateError) return { success: false, error: updateError.message };

  // 7. Keep the owner's users row in sync — same fields createGymAction
  // writes at signup. Deliberately does NOT touch avatar_url: the gym
  // logo is the gym's brand mark, not the owner's personal photo, and
  // createGymAction never conflates the two either.
  const { error: userUpdateError } = await supabase
    .from("users")
    .update({
      full_name: gymData.ownerName,
      phone: gymData.contactPhone ?? gymData.businessPhone,
    })
    .eq("id", userData.id);

  if (userUpdateError) {
    return { success: false, error: userUpdateError.message };
  }

  revalidatePath("/owner/settings");
  return { success: true, data: { id: gymId } };
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
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();

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
  data: CreateMembershipPlanInput,
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const { userId, sessionClaims } = await auth();
  const ownerMeta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (!userId || ownerMeta.role !== "owner" || !ownerMeta.gymId) {
    return {
      success: false,
      error: "Not authorized to create a membership plan.",
    };
  }

  // 2. Validate
  const parsed = createMembershipPlanSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid membership plan data.",
    };
  }
  const plan = parsed.data;

  // 3. use the caller's gym Id
  const gymId = ownerMeta.gymId;

  // 4. Insert — table-level RLS ("Gym staff can manage plans") is the
  // actual authorization boundary here, keyed off gym_id via STAFF_GYM_IDS.
  const supabase = await createServerClient();

  const { data: inserted, error } = await supabase
    .from("membership_plans")
    .insert({
      gym_id: gymId,
      plan_name: plan.planName,
      short_description: plan.shortDescription,
      plan_category: plan.planCategory as
        | "Standard"
        | "Premium"
        | "VIP"
        | "Student"
        | "Corporate"
        | "Personal Training"
        | null,
      plan_color: plan.planColor ?? null,
      plan_icon: plan.planIcon ?? null,

      plan_price: Number(plan.planPrice),
      joining_fee: Number(plan.joiningFee),
      security_deposit: Number(plan.securityDeposit),
      pricing_type: plan.pricingType as "Fixed" | "Recurring" | null,
      discount_type: plan.discountType as "Percentage" | "Amount" | null,
      discount_value: plan.discountValue ? Number(plan.discountValue) : null,

      membership_duration: plan.membershipDuration,
      duration_months: plan.durationMonths,

      validity_starts: plan.validityStarts as
        | "Immediately"
        | "From Joining Date"
        | "Custom Date"
        | null,
      grace_period_days: plan.gracePeriodDays ?? 0,
      allow_freeze: plan.allowFreeze ?? false,
      max_freeze_days: plan.allowFreeze ? (plan.maxFreezeDays ?? null) : null,

      selected_features: plan.selectedFeatures ?? [],
      custom_features: plan.customFeatures ?? [],

      minimum_age: plan.minimumAge ?? 14,
      maximum_age: plan.maximumAge ?? 80,
      max_active_members: plan.maxActiveMembers ?? null,
      enrollment_mode: plan.enrollmentMode as "Open" | "Invite Only" | null,
      cancellation_allowed: plan.cancellationAllowed ?? true,

      status: plan.status as "Active" | "Draft" | "Hidden",
      visibility: plan.visibility ?? "Visible to Everyone",
      is_featured: plan.isFeatured ?? false,

      additional_notes: plan.additionalNotes ?? null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/owner/plans");
  return { success: true, data: { id: inserted.id } };
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
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();

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

export async function inviteTrainerAction(
  data: CreateTrainerInput,
  sendInvitation: boolean,
  photoFile?: File,
): Promise<ActionResult<{ id: string; message?: string }>> {
  const { sessionClaims } = await auth();
  const ownerMeta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };

  if (ownerMeta.role !== "owner" || !ownerMeta.gymId) {
    return {
      success: false,
      error: "Not authorized to invite trainers for a gym.",
    };
  }
  const gymId = ownerMeta.gymId;

  // 2. Validate against the same schema the form uses client-side.
  const parsed = createTrainerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }
  const trainerData = parsed.data;

  if (sendInvitation && !trainerData.invitedEmail) {
    return {
      success: false,
      error: "An email address is required to send an invitation.",
    };
  }

  const supabase = await createServerClient();
  // 3. DB half — placeholder row first, photo_url null for now.

  const trainerCode = generateTrainerCode();
  const { data: trainer, error } = await supabase
    .from("trainers")
    .insert({
      gym_id: gymId,
      full_name: trainerData.fullName,
      invited_email: trainerData.invitedEmail,
      contact_phone: trainerData.contactPhone,
      contact_email: trainerData.invitedEmail,
      trainer_code: trainerCode,
      employee_id: trainerCode,
      professional_title: trainerData.professionalTitle ?? "Trainer",
      joining_date: trainerData.joiningDate ?? new Date().toISOString(),
      experience_years: trainerData.experienceYears ?? 0,
      qualification: trainerData.qualification,
      certification: trainerData.certification ?? "No certification",
      salary: Number(trainerData.salary ?? 0),
      employment_type: trainerData.employmentType as
        | "Full Time"
        | "Part Time"
        | "Contract",
      specializations: trainerData.specializations ?? [],
      working_days: trainerData.workingDays ?? [],
      session_types: trainerData.sessionTypes,
      start_time: trainerData.startTime ?? "09:00",
      end_time: trainerData.endTime ?? "18:00",
      max_members: trainerData.maxMembers,
      max_sessions_per_day: trainerData.maxSessionsPerDay ?? 0,
      accepting_new_members: trainerData.acceptingNewMembers ?? false,
      additional_notes: trainerData.additionalNotes ?? "",
      status: sendInvitation ? "Invited" : "Inactive",
      // invitation_sent_at: sendInvitation ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  // 3.5. Clerk invitation — only when the owner opted to send one.
  if (sendInvitation && trainerData.invitedEmail) {
    try {
      const client = await clerkClient();
      const invitation = await client.invitations.createInvitation({
        emailAddress: trainerData.invitedEmail,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
        publicMetadata: {
          role: "trainer",
          gymId,
          trainerId: trainer.id,
          onboardingComplete: false,
        },
        notify: true,
        ignoreExisting: true,
      });

      const { error: clerkIdError } = await supabase
        .from("trainers")
        .update({
          clerk_invitation_id: invitation.id,
          invitation_sent_at: sendInvitation ? new Date().toISOString() : null,
        })
        .eq("id", trainer.id);
      if (clerkIdError) return { success: false, error: clerkIdError.message };
    } catch (err) {
      // Trainer row already exists at this point — surface the failure
      // rather than silently leaving it stuck in "Invited" with no invite sent.
      const message =
        err instanceof Error ? err.message : "Failed to send invitation.";
      await supabase
        .from("trainers")
        .update({ status: "Inactive", invitation_sent_at: null })
        .eq("id", trainer.id);
      return { success: false, error: message };
    }
  }

  // 4. Photo upload — now trainer.id exists to build the storage path.
  if (photoFile && photoFile.size > 0) {
    try {
      const profileImageUrl = await uploadFile(
        photoFile,
        `trackVim/trainers/${trainer.id}/photo`,
      );
      const { error: photoError } = await supabase
        .from("trainers")
        .update({ photo_url: profileImageUrl })
        .eq("id", trainer.id);
      if (photoError) return { success: false, error: photoError.message };
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

  return {
    success: true,
    data: {
      id: trainer.id,
      message: sendInvitation
        ? "Trainer invited successfully"
        : "Trainer added successfully",
    },
  };
}

//trainers operations

export async function deactivateTrainerAction(trainerId: string) {
  const supabase = await createServerClient();
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (meta.role !== "owner" || !meta.gymId) {
    return { success: false as const, error: "Not authorized." };
  }
  const { error } = await supabase
    .from("trainers")
    .update({ status: "Inactive" })
    .eq("id", trainerId)
    .eq("gym_id", meta.gymId);

  if (error) return { success: false as const, error: error.message };
  revalidatePath("/owner/trainers");
  revalidatePath(`/owner/trainers/[id]`, "page");
  return { success: true as const };
}

export async function deleteTrainerAction(trainerId: string) {
  const supabase = await createServerClient();
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (meta.role !== "owner" || !meta.gymId) {
    return { success: false as const, error: "Not authorized." };
  }
  const { error } = await supabase
    .from("trainers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", trainerId)
    .eq("gym_id", meta.gymId);

  if (error) return { success: false as const, error: error.message };
  revalidatePath("/owner/trainers");
  return { success: true as const };
}

// Renamed from inviteMemberAction — this composes the real walk-in flow:
//   create_walkin_member -> [profile update] -> create_walkin_membership
//   -> [optional] record_walkin_payment -> [owner-only] verify_payment
//
// The last step is new. This form is filled directly by the gym owner
// (see InviteMemberForm), so when they mark payment as collected, there's
// no reason to leave it sitting in PendingVerification waiting for a
// separate verification pass — the owner IS the verifier. verify_payment
// is gated on publicMetadata.role === "owner" specifically (not "trainer"),
// re-checked here even though the RPC/payments_guard_update trigger also
// enforce it server-side — belt and braces, and lets us skip the RPC call
// entirely for a trainer rather than let it fail.

export async function addMemberAction(
  data: InviteMemberFormInput,
  sendInvitation: boolean,
  markPaidNow: boolean,
  transactionRef: string | null,
  photoFile: File | null,
  paymentMethod: PaymentMethod,
): Promise<ActionResult<{ memberId: string; membershipId: string }>> {
  // 1. Auth
  const { sessionClaims } = await auth();
  const ownerMeta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  const isOwner = ownerMeta.role === "owner";

  if ((!isOwner && ownerMeta.role !== "trainer") || !ownerMeta.gymId) {
    return {
      success: false,
      error: "Not authorized to add members for a gym.",
    };
  }
  const gymId = ownerMeta.gymId;

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
  // stays null until the member eventually signs up and links it.
  const { data: member, error: memberError } = await supabase.rpc(
    "create_walkin_member",
    {
      p_gym_id: gymId,
      p_full_name: memberData.fullName!,
      ...(memberData.invitedEmail && { p_email: memberData.invitedEmail }),
      ...(memberData.contactPhone && { p_phone: memberData.contactPhone }),
      p_member_code: generateMemberCode(),
    },
  );

  if (memberError || !member) {
    return {
      success: false,
      error: memberError?.message ?? "Failed to create member.",
    };
  }

  // 4. Step 2 — "Membership", Option A (no application). Creates the
  // gym_membership (PaymentPending) AND the Pending payment stub together.
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

  // 5. Fill in the rest of the profile (+ photo, if provided).
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
      gender: memberData.gender as "Male" | "Female" | "Other",
      occupation: memberData.occupation || null,
      blood_group:
        (memberData.bloodGroup as
          | "A+"
          | "A-"
          | "B+"
          | "B-"
          | "AB+"
          | "AB-"
          | "O+"
          | "O-") || null,
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
        (memberData.emergencyContactRelationship as
          | "Father"
          | "Mother"
          | "Sibling"
          | "Spouse"
          | "Friend"
          | "Other") || null,
      emergency_contact_phone: memberData.emergencyContactPhone || null,
      emergency_contact_address: memberData.emergencyContactAddress || null,
      additional_notes: memberData.additionalNotes || null,
    })
    .eq("id", member.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // 6. Optional trainer assignment.
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

  // 7. Payment. Look up the Pending stub create_walkin_membership just
  // inserted regardless of markPaidNow, since we need its id either way
  // for the verify step below.
  let paymentId: string | null = null;
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
    paymentId = payment.id;

    // 7a. Record — Pending -> PendingVerification. Staff-wide (owner or
    // trainer); this is just "front desk collected the money".
    const { error: recordError } = await supabase.rpc("record_walkin_payment", {
      p_payment_id: payment.id,
      p_method: paymentMethod as "Cash" | "UPI" | "Card" | "Bank Transfer",
      p_transaction_ref: transactionRef || "",
    });

    if (recordError) {
      return { success: false, error: recordError.message };
    }

    // 7b. Verify — owner ONLY. PendingVerification -> Verified, and (per
    // verify_payment's own logic, unchanged/004) the linked gym_membership
    // moves to Active. Trainers stop here at PendingVerification; an
    // actual owner has to come back and verify it, same as any other
    // trainer-recorded payment.
    if (isOwner) {
      const { error: verifyError } = await supabase.rpc("verify_payment", {
        p_payment_id: paymentId,
      });

      if (verifyError) {
        return { success: false, error: verifyError.message };
      }
    }
  }

  // 8. Invitation — decoupled, fire-and-forget.
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
        .update({
          clerk_invitation_id: invitation.id,
          invitation_sent_at: sendInvitation ? new Date().toISOString() : null,
        })
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
  const supabase = await createServerClient();

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

export async function addTrainerAssignment(input: {
  memberId: string;
  gymId: string;
  trainerId: string;
  isPrimary: boolean;
}): Promise<ActionResult> {
  const supabase = await createServerClient();

  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (meta.role !== "owner" || meta.gymId !== input.gymId) {
    return {
      success: false,
      error: "Not authorized to add trainer assignment.",
    };
  }
  const { error } = await supabase.from("trainer_assignments").insert({
    gym_id: input.gymId,
    member_id: input.memberId,
    trainer_id: input.trainerId,
    is_primary: input.isPrimary,
  });
  if (error) {
    return {
      success: false,
      error: "Failed to add trainer assignment",
    };
  }
  revalidatePath(`/owner/members`);
  revalidatePath(`/owner/members/[id]`, "page");
  return { success: true, data: undefined };
}

export async function removeTrainerAssignment(input: {
  assignmentId: string;
  gymId: string;
}): Promise<ActionResult> {
  const supabase = await createServerClient();
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (meta.role !== "owner" || meta.gymId !== input.gymId) {
    return {
      success: false,
      error: "Not authorized to remove trainer assignment.",
    };
  }
  const { error } = await supabase
    .from("trainer_assignments")
    .update({ is_active: false, unassigned_at: new Date().toISOString() })
    .eq("id", input.assignmentId);

  if (error) {
    return {
      success: false,
      error: "Failed to remove trainer assignment",
    };
  }

  revalidatePath(`/owner/members`);
  revalidatePath(`/owner/members/[id]`, "page");
  return { success: true, data: undefined };
}

export async function setPrimaryTrainerAssignment(input: {
  assignmentId: string;
  memberId: string;
  gymId: string;
}): Promise<ActionResult> {
  const supabase = await createServerClient();
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (meta.role !== "owner" || meta.gymId !== input.gymId) {
    return {
      success: false,
      error: "Not authorized to set primary trainer assignment.",
    };
  }
  const { error } = await supabase
    .from("trainer_assignments")
    .update({ is_primary: false })
    .eq("member_id", input.memberId)
    .eq("gym_id", input.gymId)
    .eq("is_active", true);

  const { error: primaryError } = await supabase
    .from("trainer_assignments")
    .update({ is_primary: true })
    .eq("id", input.assignmentId);
  if (primaryError || error) {
    return {
      success: false,
      error: "Failed to set primary trainer assignment",
    };
  }
  revalidatePath(`/owner/members`);
  revalidatePath(`/owner/members/[id]`, "page");
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
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("approve_membership_application", {
    p_application_id: applicationId,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/owner/applications/${applicationId}`);
  revalidatePath("/owner/applications");
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
  const supabase = await createServerClient();

  const { error } = await supabase.rpc("reject_membership_application", {
    p_application_id: applicationId,
    p_reason: reason,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/owner/applications/[applicationId]", "page");
  revalidatePath("/owner/applications");
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

//I move it to Below Renew Part

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
  const supabase = await createServerClient();

  const { error } = await supabase.rpc("reject_payment", {
    p_payment_id: paymentId,
    p_reason: reason,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/owner/applications/[applicationId]`, "page");
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
  payload: {
    planId?: string;
    paymentStatus: "Paid" | "Pending";
    paymentMethod: string;
    transactionRef?: string;
    notes?: string;
    paymentDate: string;
  },
): Promise<ActionResult<{ membershipId: string }>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("renew_membership", {
    p_gym_membership_id: gymMembershipId,
    p_plan_id: payload.planId ?? null,
    p_payment_status: payload.paymentStatus,
    p_payment_method: payload.paymentMethod,
    p_transaction_ref: payload.transactionRef || null,
    p_notes: payload.notes || null,
    p_payment_date: payload.paymentDate,
    // p_collected_by intentionally omitted — RPC derives this from
    // current_user_id() server-side and ignores the client value.
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/owner/members");
  revalidatePath("/trainer/members");

  return {
    success: true,
    data: {
      membershipId: data as string,
    },
  };
}

// Pending -> PendingVerification. Staff-wide (owner or trainer) — this is
// just "front desk collected the money and is recording how".
export async function recordWalkinPaymentAction(input: {
  paymentId: string;
  gymId: string;
  method: "Cash" | "UPI" | "Card" | "Bank Transfer";
  transactionRef?: string;
}) {
  const supabase = await createServerClient();
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };

  if (
    !["owner", "trainer"].includes(meta.role ?? "") ||
    meta.gymId !== input.gymId
  ) {
    return {
      success: false as const,
      error: "Not authorized to record this payment.",
    };
  }

  const { error } = await supabase.rpc("record_walkin_payment", {
    p_payment_id: input.paymentId,
    p_method: input.method,
    p_transaction_ref: input.transactionRef ?? "",
  });

  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/owner/applications/[applicationId]`, "page");
  revalidatePath(`/owner/applications`);
  revalidatePath("/owner/payments");
  return { success: true as const };
}

// PendingVerification -> Verified. Owner-only — verification is the
// authoritative confirmation step, distinct from front-desk collection.
// The RPC itself also enforces the PendingVerification precondition —
// this check is just so the UI fails fast with a clear message instead
// of a raw Postgres error bubbling up.
export async function verifyPaymentAction(input: {
  paymentId: string;
  gymId: string;
}) {
  const supabase = await createServerClient();
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };

  if (meta.role !== "owner" || meta.gymId !== input.gymId) {
    return {
      success: false as const,
      error: "Not authorized to verify this payment.",
    };
  }

  const { error } = await supabase.rpc("verify_payment", {
    p_payment_id: input.paymentId,
  });

  console.log("payment verified error", error);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/owner/payments");
  revalidatePath(`/owner/applications/[applicationId]`, "page");
  revalidatePath(`/owner/applications/`);

  return { success: true as const };
}

/**
 * Manually cancel a membership.
 */
export async function cancelMembershipAction(
  membershipId: string,
  reason?: string,
): Promise<ActionResult> {
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();

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
