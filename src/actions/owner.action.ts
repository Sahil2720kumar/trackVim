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
import {
  deleteFile,
  MAX_GALLERY_IMAGES,
  uploadFile,
} from "@/lib/cloudinary/upload";
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
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to register a gym.",
    };
  }

  // ------------------------------------------------------------
  // 2. VALIDATE
  // ------------------------------------------------------------

  const validationStart = performance.now();

  const parsed = createGymSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid gym data.",
    };
  }

  const gymData = parsed.data;

  // ------------------------------------------------------------
  // 3. FILES
  // ------------------------------------------------------------

  const { logo, paymentQr, gallery = [] } = files;

  if (gallery.length > MAX_GALLERY_IMAGES) {
    return {
      success: false,
      error: `You can upload up to ${MAX_GALLERY_IMAGES} gallery images.`,
    };
  }

  // ------------------------------------------------------------
  // 4. UPLOAD ALL FILES IN PARALLEL
  // ------------------------------------------------------------

  let logoUrl: string | null = null;
  let paymentQrUrl: string | null = null;
  let galleryUrls: string[] = [];

  const uploadedPaths: string[] = [];

  try {
    const folder = `trackVim/gyms/${userId}`;

    const [logoResult, qrResult, galleryResult] = await Promise.all([
      // Logo
      logo && logo.size > 0
        ? uploadFile(logo, `${folder}/logo`)
        : Promise.resolve(null),

      // Payment QR
      paymentQr && paymentQr.size > 0
        ? uploadFile(paymentQr, `${folder}/payment-qr`)
        : Promise.resolve(null),

      // Gallery
      gallery.length > 0
        ? Promise.all(
            gallery.map((file) => uploadFile(file, `${folder}/gallery`)),
          )
        : Promise.resolve([] as string[]),
    ]);

    logoUrl = logoResult;
    paymentQrUrl = qrResult;
    galleryUrls = galleryResult;

    // Keep track of uploaded files so they can be
    // cleaned up if the database transaction fails.
    if (logoUrl) {
      uploadedPaths.push(logoUrl);
    }

    if (paymentQrUrl) {
      uploadedPaths.push(paymentQrUrl);
    }

    uploadedPaths.push(...galleryUrls);
  } catch (error) {
    console.error("UPLOAD FAILED:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload images. Please try again.",
    };
  }

  // ------------------------------------------------------------
  // 5. SUPABASE
  // ------------------------------------------------------------

  const supabase = await createServerClient();

  // ------------------------------------------------------------
  // 6. GENERATE GYM CODE
  // ------------------------------------------------------------

  const code = generateGymCode();

  // ------------------------------------------------------------
  // 7. SINGLE RPC TRANSACTION
  // ------------------------------------------------------------

  const rpcStart = performance.now();

  const { data: rpcData, error: rpcError } = await supabase.rpc("create_gym", {
    p_clerk_id: userId,
    p_owner_name: gymData.ownerName,
    p_phone: gymData.contactPhone ?? gymData.businessPhone ?? null,
    p_name: gymData.name,
    p_code: code,
    p_gym_short_name: gymData.gymShortName ?? null,
    p_gym_description: gymData.gymDescription ?? null,
    p_contact_email: null,
    p_contact_phone: gymData.contactPhone ?? null,
    p_website: gymData.website ?? null,
    p_logo_url: logoUrl,
    p_payment_qr_url: paymentQrUrl,
    p_business_name: gymData.businessName ?? null,
    p_business_email: gymData.businessEmail ?? null,
    p_business_phone: gymData.businessPhone ?? null,
    p_address_line1: gymData.addressLine1 ?? null,
    p_address_line2: gymData.addressLine2 ?? null,
    p_city: gymData.city ?? null,
    p_state: gymData.state ?? null,
    p_state_code: gymData.stateCode ?? null,
    p_postal_code: gymData.postalCode ?? null,
    p_country: gymData.country ?? "India",
    p_timezone: gymData.timezone ?? "Asia/Kolkata",
    p_number_of_floors: gymData.numberOfFloors ?? null,
    p_number_of_rooms: gymData.numberOfRooms ?? null,
    p_facility_notes: gymData.facilityNotes ?? null,
    p_has_washroom: gymData.hasWashroom ?? false,
    p_washroom_count: gymData.washroomCount ?? null,
    p_has_sauna_room: gymData.hasSaunaRoom ?? false,
    p_sauna_room_count: gymData.saunaRoomCount ?? null,
    p_has_steam_room: gymData.hasSteamRoom ?? false,
    p_steam_room_count: gymData.steamRoomCount ?? null,
    p_has_shower_room: gymData.hasShowerRoom ?? false,
    p_shower_room_count: gymData.showerRoomCount ?? null,
    p_has_locker_room: gymData.hasLockerRoom ?? false,
    p_locker_room_count: gymData.lockerRoomCount ?? null,
    p_amenities: gymData.amenities ?? [],
    p_equipment: gymData.equipment ?? [],
    p_gst_registered: gymData.gstRegistered ?? false,
    p_gstin: gymData.gstin ?? null,
    p_legal_business_name: gymData.legalBusinessName ?? null,
    p_billing_address: gymData.billingAddress ?? null,
    p_gst_state: gymData.gstState ?? null,
    p_place_of_supply: gymData.placeOfSupply ?? null,
    p_sac_code: gymData.sacCode ?? null,
    p_gallery_urls: galleryUrls,
  });

  if (rpcError || !rpcData?.length) {
    console.error("CREATE GYM RPC FAILED:", rpcError);

    // Database transaction has already rolled back.
    // Now clean up storage files.
    if (uploadedPaths.length > 0) {
      const cleanupStart = performance.now();

      await Promise.allSettled(uploadedPaths.map((path) => deleteFile(path)));

      console.log(
        "FILE CLEANUP:",
        `${(performance.now() - cleanupStart).toFixed(2)}ms`,
      );
    }

    return {
      success: false,
      error: rpcError?.message ?? "Failed to create gym.",
    };
  }

  // ------------------------------------------------------------
  // 9. GET RESULT
  // ------------------------------------------------------------

  const gym = rpcData[0];

  const gymId = gym.gym_id;
  const gymCode = gym.gym_code;

  // ------------------------------------------------------------
  // 10. CLERK METADATA
  // ------------------------------------------------------------

  try {
    const client = await clerkClient();

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "owner",
        gymId,
        onboardingComplete: true,
      },
    });
  } catch (error) {
    console.error("CLERK METADATA UPDATE FAILED:", error);
  }

  // ------------------------------------------------------------
  // 11. SUCCESS
  // ------------------------------------------------------------
  return {
    success: true,
    data: {
      id: gymId,
      code: gymCode,
    },
  };
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
    gallery?: File[] | null;
    existingGalleryUrls?: string[];
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

  // 5. Uploads — keyed on gymId
  const { logo, paymentQr, gallery = [], existingGalleryUrls } = files ?? {};
  let logoUrl: string | undefined;
  let paymentQrUrl: string | undefined;
  let newGalleryUrls: string[] = [];

  try {
    const folder = `trackVim/gyms/${gymId}`;
    const [logoResult, qrResult, galleryResult] = await Promise.all([
      logo && logo.size > 0
        ? uploadFile(logo, `${folder}/logo`)
        : Promise.resolve(undefined),
      paymentQr && paymentQr.size > 0
        ? uploadFile(paymentQr, `${folder}/payment-qr`)
        : Promise.resolve(undefined),
      gallery && gallery.length > 0
        ? Promise.all(
            gallery.map((file) => uploadFile(file, `${folder}/gallery`)),
          )
        : Promise.resolve([] as string[]),
    ]);
    logoUrl = logoResult;
    paymentQrUrl = qrResult;
    newGalleryUrls = galleryResult;
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload images. Please try again.",
    };
  }

  const finalGalleryUrls =
    existingGalleryUrls !== undefined
      ? [...existingGalleryUrls, ...newGalleryUrls]
      : newGalleryUrls.length > 0
        ? newGalleryUrls
        : undefined;

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

  // 6b. Sync gym_photos table
  if (existingGalleryUrls !== undefined || newGalleryUrls.length > 0) {
    const { data: currentPhotos } = await supabase
      .from("gym_photos")
      .select("id, photo_url")
      .eq("gym_id", gymId);

    if (
      existingGalleryUrls !== undefined &&
      currentPhotos &&
      currentPhotos.length > 0
    ) {
      const keepUrls = new Set(existingGalleryUrls);
      const idsToDelete = currentPhotos
        .filter((p) => !keepUrls.has(p.photo_url))
        .map((p) => p.id);

      if (idsToDelete.length > 0) {
        await supabase.from("gym_photos").delete().in("id", idsToDelete);
      }
    }

    if (newGalleryUrls.length > 0) {
      const remainingCount = existingGalleryUrls
        ? existingGalleryUrls.length
        : 0;
      const newPhotoRows = newGalleryUrls.map((url, index) => ({
        gym_id: gymId,
        uploaded_by: userData.id,
        photo_url: url,
        is_cover: remainingCount === 0 && index === 0,
        sort_order: remainingCount + index,
      }));
      await supabase.from("gym_photos").insert(newPhotoRows);
    }
  }

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
  // ============================================================
  // 1. AUTHORIZATION
  // ============================================================

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

  // ============================================================
  // 2. VALIDATE INPUT
  // ============================================================

  const parsed = createTrainerSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }

  const trainerData = parsed.data;

  // ============================================================
  // 3. INVITATION EMAIL VALIDATION
  // ============================================================

  if (sendInvitation && !trainerData.invitedEmail) {
    return {
      success: false,
      error: "An email address is required to send an invitation.",
    };
  }

  // ============================================================
  // 4. NORMALIZE EMAIL
  // ============================================================

  const normalizedEmail =
    trainerData.invitedEmail?.trim().toLowerCase() || null;

  // ============================================================
  // 5. CREATE SUPABASE CLIENT
  // ============================================================

  const supabase = await createServerClient();

  // ============================================================
  // 6. EXISTING GLOBAL USER ID
  // ============================================================

  let existingUserId: string | null = null;

  // ============================================================
  // 7. CHECK EMAIL CONFLICT
  // ============================================================

  if (normalizedEmail) {
    const { data: emailConflict, error: emailConflictError } =
      await supabase.rpc("check_trainer_email_conflict", {
        p_gym_id: gymId,
        p_email: normalizedEmail,
      });

    if (emailConflictError) {
      console.error(
        "Failed to check trainer email conflict:",
        emailConflictError,
      );

      return {
        success: false,
        error: "Could not verify email availability. Please try again.",
      };
    }

    // ==========================================================
    // RPC RESULT
    // ==========================================================

    const conflict = emailConflict?.[0];

    if (!conflict) {
      return {
        success: false,
        error: "Could not verify email availability. Please try again.",
      };
    }

    // ==========================================================
    // OWNER EMAIL
    // ==========================================================

    if (conflict.conflict_type === "owner") {
      return {
        success: false,
        error:
          "This email address already belongs to an owner account and cannot be used for a trainer.",
      };
    }

    // ==========================================================
    // MEMBER EMAIL
    // ==========================================================

    if (conflict.conflict_type === "member") {
      return {
        success: false,
        error:
          "This email address already belongs to a member account and cannot be used for a trainer.",
      };
    }

    // ==========================================================
    // TRAINER ALREADY EXISTS IN THIS GYM
    // ==========================================================

    if (conflict.conflict_type === "trainer") {
      return {
        success: false,
        error: "A trainer with this email address already exists in this gym.",
      };
    }

    // ==========================================================
    // AVAILABLE
    //
    // If user_id exists:
    //
    // Existing global trainer account
    //
    // We create a NEW trainer row and connect it to
    // the existing users.id.
    // ==========================================================

    if (conflict.conflict_type === "available") {
      existingUserId = conflict.user_id ?? null;
    }
  }

  // ============================================================
  // 8. GENERATE TRAINER CODE
  // ============================================================

  const trainerCode = generateTrainerCode();

  // ============================================================
  // 9. DETERMINE STATUS
  //
  // Existing trainer account:
  //     Active
  //
  // New account + invitation:
  //     Invited
  //
  // New account + no invitation:
  //     Inactive
  // ============================================================

  const trainerStatus = existingUserId
    ? "Active"
    : sendInvitation
      ? "Invited"
      : "Inactive";

  // ============================================================
  // 10. CREATE NEW GYM-SPECIFIC TRAINER ROW
  //
  // IMPORTANT:
  //
  // We ALWAYS insert a NEW trainers row.
  //
  // We NEVER reuse the trainer ID from another gym.
  //
  // Existing trainer account:
  //
  //   users.id
  //        ↓
  //   trainers.profile_id
  //
  // Gym A:
  //   trainers.id = A
  //
  // Gym B:
  //   trainers.id = B
  //
  // Both:
  //   profile_id = same users.id
  // ============================================================

  const { data: trainer, error: trainerError } = await supabase
    .from("trainers")
    .insert({
      gym_id: gymId,

      /*
       * Existing trainer account:
       *
       * profile_id = existing global users.id
       *
       * New trainer:
       *
       * profile_id = null
       */
      profile_id: existingUserId,

      full_name: trainerData.fullName,

      invited_email: normalizedEmail,

      contact_email: normalizedEmail,

      contact_phone: trainerData.contactPhone || null,

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

      /*
       * Existing global trainer account:
       *     Active
       *
       * New invited trainer:
       *     Invited
       *
       * New non-invited trainer:
       *     Inactive
       */
      status: trainerStatus,
    })
    .select("id")
    .single();

  // ============================================================
  // 11. TRAINER INSERT ERROR
  // ============================================================

  if (trainerError || !trainer) {
    console.error("Failed to create trainer:", trainerError);

    return {
      success: false,
      error: trainerError?.message ?? "Failed to create trainer.",
    };
  }

  // ============================================================
  // 12. SEND CLERK INVITATION
  //
  // IMPORTANT:
  //
  // ONLY send invitation when there is NO existing user.
  //
  // Existing trainer account already has a Clerk account,
  // so creating another invitation is unnecessary.
  // ============================================================

  if (sendInvitation && normalizedEmail && !existingUserId) {
    try {
      const client = await clerkClient();

      // ========================================================
      // CREATE CLERK INVITATION
      // ========================================================

      const invitation = await client.invitations.createInvitation({
        emailAddress: normalizedEmail,

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

      // ========================================================
      // SAVE INVITATION ID
      // ========================================================

      const { error: clerkIdError } = await supabase
        .from("trainers")
        .update({
          clerk_invitation_id: invitation.id,

          invitation_sent_at: new Date().toISOString(),
        })
        .eq("id", trainer.id);

      if (clerkIdError) {
        console.error("Failed to save Clerk invitation:", clerkIdError);

        return {
          success: false,
          error: clerkIdError.message,
        };
      }
    } catch (err) {
      console.error("Failed to send trainer invitation:", err);

      // ========================================================
      // ROLLBACK TRAINER STATUS
      // ========================================================

      await supabase
        .from("trainers")
        .update({
          status: "Inactive",
          invitation_sent_at: null,
          clerk_invitation_id: null,
        })
        .eq("id", trainer.id);

      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to send invitation.",
      };
    }
  }

  // ============================================================
  // 13. PHOTO UPLOAD
  // ============================================================

  if (photoFile && photoFile.size > 0) {
    try {
      const profileImageUrl = await uploadFile(
        photoFile,
        `trackVim/trainers/${trainer.id}/photo`,
      );

      const { error: photoError } = await supabase
        .from("trainers")
        .update({
          photo_url: profileImageUrl,
        })
        .eq("id", trainer.id);

      if (photoError) {
        console.error("Failed to save trainer photo:", photoError);

        return {
          success: false,
          error: photoError.message,
        };
      }
    } catch (err) {
      console.error("Failed to upload trainer photo:", err);

      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to upload photo. Please try again.",
      };
    }
  }

  // ============================================================
  // 14. REVALIDATE
  // ============================================================

  revalidatePath("/owner/trainers");

  revalidatePath(`/owner/trainers/${trainer.id}`);

  // ============================================================
  // 15. SUCCESS MESSAGE
  // ============================================================

  return {
    success: true,

    data: {
      id: trainer.id,

      message: existingUserId
        ? "Trainer added successfully."
        : sendInvitation
          ? "Trainer invited successfully."
          : "Trainer added successfully.",
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
    .update({ deleted_at: new Date().toISOString(), status: "Inactive" })
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
  // ============================================================
  // 1. AUTH
  // ============================================================

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

  // ============================================================
  // 2. VALIDATE
  // ============================================================

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

  // ============================================================
  // 3. NORMALIZE EMAIL
  // ============================================================

  const normalizedEmail = memberData.invitedEmail?.trim().toLowerCase() || null;

  // Existing global member ID, if found.
  let existingMemberId: string | null = null;

  // ============================================================
  // 4. GLOBAL EMAIL CONFLICT CHECK
  //
  // IMPORTANT:
  // This is now handled by SECURITY DEFINER RPC.
  //
  // We do NOT directly query users/trainers/members here because
  // normal RLS can hide globally existing records.
  // ============================================================

  if (normalizedEmail) {
    const { data: emailConflict, error: emailConflictError } =
      await supabase.rpc("check_member_email_conflict", {
        p_email: normalizedEmail,
      });

    if (emailConflictError) {
      console.error(
        "Failed to check member email conflict:",
        emailConflictError,
      );

      return {
        success: false,
        error: "Could not verify email availability. Please try again.",
      };
    }

    const conflict = emailConflict?.[0];

    if (!conflict) {
      return {
        success: false,
        error: "Could not verify email availability. Please try again.",
      };
    }

    // ----------------------------------------------------------
    // EXISTING OWNER
    // ----------------------------------------------------------

    if (conflict.conflict_type === "owner") {
      return {
        success: false,
        error:
          "This email address already belongs to an owner account and cannot be added as a member.",
      };
    }

    // ----------------------------------------------------------
    // EXISTING TRAINER
    // ----------------------------------------------------------

    if (conflict.conflict_type === "trainer") {
      return {
        success: false,
        error:
          "This email address already belongs to a trainer account and cannot be added as a member.",
      };
    }

    // ----------------------------------------------------------
    // EXISTING GLOBAL MEMBER
    // ----------------------------------------------------------

    if (conflict.conflict_type === "member") {
      existingMemberId = conflict.member_id;

      if (!existingMemberId) {
        return {
          success: false,
          error: "Existing member record is invalid.",
        };
      }

      // --------------------------------------------------------
      // CHECK CURRENT GYM MEMBERSHIP
      //
      // This query is gym-scoped, so normal RLS is appropriate.
      // --------------------------------------------------------

      const { data: existingGymMembership, error: gymMembershipError } =
        await supabase
          .from("gym_memberships")
          .select("id")
          .eq("gym_id", gymId)
          .eq("member_id", existingMemberId)
          .limit(1)
          .maybeSingle();

      if (gymMembershipError) {
        console.error(
          "Failed to check existing gym membership:",
          gymMembershipError,
        );

        return {
          success: false,
          error: "Could not verify gym membership. Please try again.",
        };
      }

      if (existingGymMembership) {
        return {
          success: false,
          error: "Member already in the gym.",
        };
      }
    }
  }

  // ============================================================
  // 5. CREATE OR REUSE MEMBER
  // ============================================================

  let member: { id: string } | null = null;

  if (existingMemberId) {
    // ----------------------------------------------------------
    // EXISTING GLOBAL MEMBER
    // ----------------------------------------------------------

    member = {
      id: existingMemberId,
    };
  } else {
    // ----------------------------------------------------------
    // NEW MEMBER
    // ----------------------------------------------------------

    const { data: createdMember, error: memberError } = await supabase.rpc(
      "create_walkin_member",
      {
        p_gym_id: gymId,
        p_full_name: memberData.fullName!,
        ...(normalizedEmail && {
          p_email: normalizedEmail,
        }),
        ...(memberData.contactPhone && {
          p_phone: memberData.contactPhone,
        }),
        p_member_code: generateMemberCode(),
      },
    );

    if (memberError || !createdMember) {
      console.error("Failed to create member:", memberError);

      return {
        success: false,
        error: memberError?.message ?? "Failed to create member.",
      };
    }

    member = createdMember;
  }

  // ============================================================
  // 6. CREATE MEMBERSHIP
  // ============================================================

  const { data: membershipId, error: membershipError } = await supabase.rpc(
    "create_walkin_membership",
    {
      p_gym_id: gymId,
      p_member_id: member.id,
      p_plan_id: memberData.planId,
    },
  );

  if (membershipError || !membershipId) {
    console.error("Failed to create membership:", membershipError);

    return {
      success: false,
      error: membershipError?.message ?? "Failed to create membership.",
    };
  }

  // ============================================================
  // 7. UPLOAD PHOTO
  // ============================================================

  let photoUrl: string | null = null;

  if (photoFile && photoFile.size > 0) {
    try {
      photoUrl = await uploadFile(
        photoFile,
        `trackVim/members/${member.id}/photo`,
      );
    } catch (err) {
      console.error("Failed to upload member photo:", err);

      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to upload photo. Please try again.",
      };
    }
  }

  // ============================================================
  // 8. UPDATE MEMBER PROFILE
  // ============================================================

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
    console.error("Failed to update member profile:", profileError);

    return {
      success: false,
      error: profileError.message,
    };
  }

  // ============================================================
  // 9. OPTIONAL TRAINER ASSIGNMENT
  // ============================================================

  if (memberData.trainerId) {
    const { error: assignmentError } = await supabase
      .from("trainer_assignments")
      .insert({
        gym_id: gymId,
        member_id: member.id,
        trainer_id: memberData.trainerId,
      });

    if (assignmentError) {
      console.error("Failed to assign trainer:", assignmentError);

      return {
        success: false,
        error: assignmentError.message,
      };
    }
  }

  // ============================================================
  // 10. PAYMENT
  // ============================================================

  let paymentId: string | null = null;

  if (markPaidNow) {
    const { data: payment, error: paymentLookupError } = await supabase
      .from("payments")
      .select("id")
      .eq("gym_membership_id", membershipId)
      .eq("status", "Pending")
      .single();

    if (paymentLookupError || !payment) {
      console.error("Failed to find pending payment:", paymentLookupError);

      return {
        success: false,
        error:
          paymentLookupError?.message ??
          "Could not find the pending payment to record.",
      };
    }

    paymentId = payment.id;

    // ----------------------------------------------------------
    // 10A. RECORD PAYMENT
    // ----------------------------------------------------------

    const { error: recordError } = await supabase.rpc("record_walkin_payment", {
      p_payment_id: payment.id,
      p_method: paymentMethod as "Cash" | "UPI" | "Card" | "Bank Transfer",
      p_transaction_ref: transactionRef || "",
    });

    if (recordError) {
      console.error("Failed to record payment:", recordError);

      return {
        success: false,
        error: recordError.message,
      };
    }

    // ----------------------------------------------------------
    // 10B. OWNER VERIFIES PAYMENT
    // ----------------------------------------------------------

    if (isOwner) {
      const { error: verifyError } = await supabase.rpc("verify_payment", {
        p_payment_id: paymentId,
      });

      if (verifyError) {
        console.error("Failed to verify payment:", verifyError);

        return {
          success: false,
          error: verifyError.message,
        };
      }
    }
  }

  // ============================================================
  // 11. INVITATION
  //
  // Only invite newly created global members.
  //
  // Existing members already have their own account/invitation
  // lifecycle, so we must NEVER send a new invitation here.
  // ============================================================

  if (sendInvitation && normalizedEmail && !existingMemberId) {
    try {
      const client = await clerkClient();

      const invitation = await client.invitations.createInvitation({
        emailAddress: normalizedEmail,
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
          invitation_sent_at: new Date().toISOString(),
        })
        .eq("id", member.id);

      if (clerkIdError) {
        console.error("Failed to save Clerk invitation:", clerkIdError);

        return {
          success: false,
          error: clerkIdError.message,
        };
      }
    } catch (err) {
      /*
       * Invitation failure should NOT fail member creation.
       */
      console.error("Failed to send member invitation email:", err);
    }
  }

  // ============================================================
  // 12. REVALIDATE
  // ============================================================

  revalidatePath("/owner/members");

  return {
    success: true,
    data: {
      memberId: member.id,
      membershipId,
    },
  };
}

//Delete membership

type DeleteMemberResult = {
  memberName: string;
};

export async function deleteMemberAction(
  memberId: string,
): Promise<ActionResult<DeleteMemberResult>> {
  // ============================================================
  // 1. AUTH
  // ============================================================

  const { sessionClaims } = await auth();

  const ownerMeta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };

  const isStaff = ownerMeta.role === "owner" || ownerMeta.role === "trainer";

  if (!isStaff || !ownerMeta.gymId) {
    return {
      success: false,
      error: "Not authorized to remove members from a gym.",
    };
  }

  const gymId = ownerMeta.gymId;

  // ============================================================
  // 2. VALIDATE MEMBER ID
  // ============================================================

  if (!memberId?.trim()) {
    return {
      success: false,
      error: "Member ID is required.",
    };
  }

  // ============================================================
  // 3. SUPABASE
  // ============================================================

  const supabase = await createServerClient();

  // ============================================================
  // 4. REMOVE MEMBER FROM THIS GYM
  //
  // IMPORTANT:
  //
  // This removes ONLY the gym_memberships relationship.
  //
  // It does NOT delete:
  // - members row
  // - users row
  // - global member account
  //
  // The RPC is responsible for:
  // - authorization
  // - verifying membership belongs to gym
  // - deleting gym_memberships
  // - cleaning trainer assignment
  // - clearing active_gym_membership_id
  // ============================================================

  const { data, error } = await supabase.rpc("remove_member_from_gym", {
    p_gym_id: gymId,
    p_member_id: memberId,
  });

  // ============================================================
  // 5. HANDLE RPC ERROR
  // ============================================================

  if (error) {
    console.error("Failed to remove member from gym:", {
      memberId,
      gymId,
      error,
    });

    return {
      success: false,
      error: error.message || "Failed to remove member. Please try again.",
    };
  }

  // ============================================================
  // 6. READ RPC RESULT
  //
  // Expected:
  //
  // [
  //   {
  //     success: true,
  //     member_name: "Sahil Kumar"
  //   }
  // ]
  // ============================================================

  const result = data?.[0];

  if (!result?.success) {
    return {
      success: false,
      error: "Failed to remove member.",
    };
  }

  // ============================================================
  // 7. REVALIDATE
  // ============================================================

  revalidatePath("/owner/members");

  // If this route exists:
  revalidatePath(`/owner/members/${memberId}`);

  // ============================================================
  // 8. SUCCESS
  // ============================================================

  return {
    success: true,
    data: {
      memberName: result.member_name,
    },
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
