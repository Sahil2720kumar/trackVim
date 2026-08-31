/**
 * TrackVim — Zod CRUD Validators (Zod v4)
 * ============================================================================
 * Generated from the Drizzle schema (schema.ts) using drizzle-zod as the
 * base, with manual refinements layered on for fields that need stricter
 * validation than "correct SQL type" (emails, phones, URLs, GSTIN, hex
 * colors, monetary amounts, etc).
 *
 * Per table you get three schemas:
 *   - create<Table>Schema — payload for POST/insert. Omits id and all
 *     server-managed timestamp columns (createdAt/updatedAt/deletedAt).
 *     Columns with a DB default (status enums, booleans, etc.) stay
 *     optional; truly required columns stay required.
 *   - update<Table>Schema — payload for PATCH/update. Same shape as
 *     create, but every field is optional (partial update). Does NOT
 *     include `id` — pass that separately as a path/route param and
 *     validate it with <table>IdSchema.
 *   - <table>IdSchema — `{ id: uuid }`, for GET-by-id / PATCH / DELETE
 *     route params.
 *
 * Inferred TS types are exported alongside each schema
 * (Create<Table>Input, Update<Table>Input).
 *
 * NOTE on `numeric` columns: drizzle-zod maps Postgres `numeric` to a
 * `z.string()` by default (matches how node-postgres returns it, avoiding
 * float precision loss). The refinements below constrain those strings to
 * valid non-negative decimal amounts rather than switching to z.number().
 * If your app layer prefers numbers, coerce at the API boundary instead of
 * loosening these.
 *
 * CHANGES FROM THE PREVIOUS VERSION (all fixes, see inline comments too):
 *
 * 1. Zod v4 API — string "format" validators (email/url/uuid/date) moved
 *    to top-level functions (z.email(), z.url(), z.uuid(), z.iso.date(),
 *    z.iso.datetime()). The chained z.string().email() form still runs in
 *    v4 but is deprecated and, worse, doesn't compose with .trim() the
 *    same way — z.email().trim() throws because z.email() isn't a
 *    ZodString anymore. Trimming/lowercasing now happens via z.preprocess
 *    before the format check.
 * 2. z.record(valueSchema) is invalid in v4 — record now requires an
 *    explicit key schema: z.record(z.string(), valueSchema).
 * 3. z.ZodIssueCode.custom replaced with the "custom" string literal in
 *    ctx.addIssue(), since ZodIssueCode isn't guaranteed to exist as a
 *    runtime export across v4 versions the way it did in v3.
 * 4. SECURITY: createGymQrCodeSchema no longer accepts qrIdentifier or
 *    signatureSecret from the client. Both are the values checked when a
 *    scanned QR is validated — accepting them from a POST body would let
 *    any caller forge a check-in code with a known secret. Generate both
 *    server-side.
 * 5. UPDATE-SCHEMA PARITY BUG: several update<Table>Schemas were missing
 *    refinement overrides that the matching create<Table>Schema had
 *    (membershipPlans, trainers, members, workoutTemplates,
 *    trainingSessions). Since this app submits <input type="number">
 *    values as strings, any numeric/date field missing its coercion
 *    override in the *update* schema would 400 on a perfectly valid PATCH
 *    request the moment a user tried to edit it — create worked, edit
 *    silently didn't. Shared `*Refinements` objects now back both
 *    create/update schemas per table so they can't drift apart again.
 * 6. updateTemplateExerciseSchema / updateSessionExerciseSchema used to be
 *    a bare `.partial()` of the create schema, which leaves the foreign
 *    key (templateId/trainingSessionId, exerciseId) both present and
 *    optional — a PATCH body could silently reassign an exercise entry to
 *    a different template/session. Those keys are now omitted from the
 *    update schema entirely.
 * 7. trainers.averageRating / trainers.retentionRate were accepted as
 *    client input on create/update even though they're aggregate values
 *    (same category as membersTrained/completedSessions, which *were*
 *    already correctly excluded). Removed from both — recompute them
 *    server-side from actual session/review data.
 * 8. members.accountStatus is now excluded from updateMemberSchema —
 *    suspending/reinstating a member should go through a dedicated
 *    moderation action, the same pattern already used for
 *    verifyPaymentSchema / reviewMembershipApplicationSchema, not a
 *    generic profile PATCH.
 * 9. Added two sanity checks to membershipPlans: minimumAge must not
 *    exceed maximumAge, and a Percentage-type discountValue can't exceed
 *    100 (both were previously accepted unchecked and would ship a
 *    broken/negative-effective plan silently).
 *
 * UPDATED against the real schema.ts:
 *
 * 10. Fix #6's column-name guess was half right: templateExercises really
 *     does use templateId/exerciseId, but sessionExercises' foreign key is
 *     named `sessionId`, not `trainingSessionId` as I'd guessed. Corrected
 *     below — this would have been a silent no-op (Drizzle's `.omit()`
 *     only errors on unknown keys at the TypeScript level, so a wrong key
 *     here wouldn't fail until you actually tried to reassign the FK and
 *     noticed it wasn't blocked).
 * 11. exercises.muscleGroup is `notNull()` with no `.default()` in the
 *     schema, but the old refinement mapped it to `optionalString`
 *     (optional + nullable). That combination means createExerciseSchema
 *     would accept a request with no muscleGroup, pass validation, and
 *     then fail at the DB with a NOT NULL constraint violation — a 500
 *     instead of a clean 400. Changed to a required trimmed string on the
 *     shared refinement; createUpdateSchema still makes it optional for
 *     PATCH the same way it does for every other "required-looking" field
 *     in this file (planName, name, etc.) — that optionality comes from
 *     createUpdateSchema itself, not from how you write the refinement.
 * 12. gymPhotos.uploadedBy is `notNull()` with no default, and — unlike
 *     paymentReceipts.uploadedBy, whose insert policy has an explicit
 *     `withCheck: uploaded_by = current_user_id()` — the gym_photos RLS
 *     insert policy only checks `gym_id`, not `uploaded_by`. Nothing in
 *     the database stops a gym owner from setting uploadedBy to some other
 *     user's id on upload. createGymPhotoSchema now omits it; set it
 *     server-side from the authenticated session instead of trusting the
 *     payload.
 *
 * Two more of the same "who did this" pattern, not fixed here since
 * they're lower-stakes and I don't want to guess your endpoint structure,
 * but worth a look: gyms.ownerId IS safely constrained (RLS insert policy
 * has `withCheck: owner_id = current_user_id()`), but payments.collectedBy
 * has no equivalent RLS check and is still client-suppliable in
 * createPaymentSchema — same attribution-spoofing shape as uploadedBy was.
 */

import { z } from "zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import {
  users,
  gyms,
  gymPhotos,
  gymLocations,
  gymQrCodes,
  membershipPlans,
  trainers,
  members,
  membershipApplications,
  gymMemberships,
  trainerAssignments,
  payments,
  paymentReceipts,
  attendance,
  exercises,
  workoutTemplates,
  templateExercises,
  trainingSessions,
  sessionExercises,
  messages,
  notifications,
  subscriptionPlans,
  gymSubscriptions,
  subscriptionPayments,
  systemSettings,
  genderEnum,
  bloodGroupEnum,
} from "./schema";

// ============================================================================
// Shared field-level primitives
// ============================================================================

const uuid = z.uuid();

const trim = (v: unknown) => (typeof v === "string" ? v.trim() : v);
const trimLower = (v: unknown) =>
  typeof v === "string" ? v.trim().toLowerCase() : v;

// HTML <input type="number"> always submits a string — coerce before
// validating so z.number().int() checks don't blow up on "42" vs 42.
// z.number().int() itself is unaffected by the v4 format-function move
// (that only applies to string "formats" like email/url/uuid), so this
// stays as-is.
const coerceInt = (min?: number, max?: number) => {
  let s = z.coerce.number().int();
  if (min !== undefined) s = s.min(min);
  if (max !== undefined) s = s.max(max);
  return s;
};
const optionalCoerceInt = (min?: number, max?: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    coerceInt(min, max).optional().nullable(),
  );

// Zod v4: email is a top-level format function, not a ZodString method, so
// trim/lowercase happen in a preprocess step instead of chaining.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const email = z.preprocess(trimLower, z.email().max(320));
const optionalEmail = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : trimLower(v)),
  z.email().max(320).optional().nullable(),
);

// Loose E.164-ish phone check — international, 7-15 digits, optional leading +.
// Not a Zod "format" type, so the plain ZodString chain is unaffected by v4.
const phoneRegex = /^\+?[0-9]{7,15}$/;
const phone = z.string().trim();
const optionalPhone = z.preprocess(
  (v) => (v === "" ? undefined : v),
  phone.regex(phoneRegex, "Invalid phone number").optional().nullable(),
);

const url = z.preprocess(trim, z.url().max(2048));
const optionalUrl = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : trim(v)),
  z.url().max(2048).optional().nullable(),
);

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color like #FF5A1F");

// Postgres `numeric` columns arrive/leave as strings via drizzle-zod.
// This enforces "non-negative decimal with up to 2 fraction digits".
const money = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a non-negative amount, e.g. 1500.00");
const optionalMoney = z.preprocess(
  (v) => (v === "" ? undefined : v),
  money.optional().nullable(),
);

// GSTIN: 15-char alphanumeric, standard Indian GST format.
const gstin = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Invalid GSTIN format",
  );
const optionalGstin = z.preprocess(
  (v) => (v === "" ? undefined : v),
  gstin.optional().nullable(),
);

const postalCode = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9\- ]{3,20}$/);

const optionalPostalCode = z.preprocess(
  (v) => (v === "" ? undefined : v),
  postalCode.optional().nullable(),
);

// Shared optional string — overrides enum columns so <select> submits
// a plain string without drizzle-zod's inferred enum type blowing up.
const optionalString = z.string().trim().optional().nullable();

// Shared optional boolean — handles "" from unchecked checkboxes.
const optionalBool = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.boolean().optional().nullable(),
);

// Zod v4: date/datetime formats moved under z.iso.* (z.string().date() /
// .datetime() still run but are deprecated).
const optionalDate = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.iso.date().optional().nullable(),
);

const optionalTime = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.iso.time().optional().nullable(),
);

// Shared equipment shape — was duplicated verbatim across the gym
// create/update schemas; factored out so the two can't drift.
const equipmentList = z
  .array(
    z.object({
      name: z.string().min(1),
      quantity: z.coerce.number().int().min(0),
    }),
  )
  .optional();

// ============================================================================
// Users
// ============================================================================

const userRefinements = {
  email: optionalEmail,
  phone: optionalPhone,
  avatarUrl: optionalUrl,
  username: z.string().trim().min(3).max(100).optional().nullable(),
};

export const createUserSchema = createInsertSchema(users, userRefinements).omit(
  { id: true, createdAt: true, updatedAt: true, deletedAt: true },
);

export const updateUserSchema = createUpdateSchema(users, userRefinements).omit(
  { id: true, createdAt: true, updatedAt: true, deletedAt: true },
);

export const userIdSchema = z.object({ id: uuid });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================================================
// Gyms
// ============================================================================

function withGstChecks<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data: any, ctx: z.RefinementCtx) => {
    if (!data.gstRegistered) return;
    const required = [
      "gstin",
      "legalBusinessName",
      "billingAddress",
      "gstState",
      "stateCode",
      "placeOfSupply",
      "sacCode",
    ] as const;
    for (const field of required) {
      if (!data[field]) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Required when GST registered",
        });
      }
    }
  });
}

const gymRefinements = {
  name: z.string().trim().min(2).max(200),
  contactEmail: optionalEmail,
  businessEmail: optionalEmail,
  contactPhone: optionalPhone,
  businessPhone: optionalPhone,
  paymentQrUrl: optionalUrl,
  website: optionalUrl,
  logoUrl: optionalUrl,
  postalCode: optionalPostalCode,
  numberOfFloors: optionalCoerceInt(0, 100),
  numberOfRooms: optionalCoerceInt(0, 1000),
  washroomCount: optionalCoerceInt(0, 100),
  saunaRoomCount: optionalCoerceInt(0, 100),
  steamRoomCount: optionalCoerceInt(0, 100),
  showerRoomCount: optionalCoerceInt(0, 100),
  lockerRoomCount: optionalCoerceInt(0, 100),
  amenities: z.array(z.string()).optional(),
  equipment: equipmentList,
  // GST fields
  gstRegistered: z.boolean().optional(),
  gstin: optionalGstin,
  legalBusinessName: optionalString,
  billingAddress: optionalString,
  gstState: optionalString,
  stateCode: optionalString,
  placeOfSupply: optionalString,
  sacCode: optionalString,
  status: optionalString,
};

export const createGymSchema = withGstChecks(
  createInsertSchema(gyms, gymRefinements).omit({
    id: true,
    code: true, // server-generated
    contactEmail: true,
    isVerified: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    ownerId: true,
  }),
);

export const updateGymSchema = withGstChecks(
  createUpdateSchema(gyms, {
    ...gymRefinements,
    // code is patchable (owner can rename); omitted from create because
    // it's server-generated there.
    code: z.string().trim().toUpperCase().min(3).max(10).optional(),
  }).omit({
    id: true,
    ownerId: true, // ownership transfer is a dedicated endpoint
    contactEmail: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  }),
);

export const gymIdSchema = z.object({ id: uuid });

export type CreateGymInput = z.infer<typeof createGymSchema>;
export type UpdateGymInput = z.infer<typeof updateGymSchema>;

// ============================================================================
// Gym Photos
// ============================================================================

const gymPhotoRefinements = {
  photoUrl: url,
  storagePath: z.string().trim().max(1024).optional().nullable(),
  caption: z.string().trim().max(500).optional().nullable(),
};

export const createGymPhotoSchema = createInsertSchema(gymPhotos, {
  ...gymPhotoRefinements,
  sortOrder: z.coerce.number().int().min(0).default(0),
}).omit({
  id: true,
  status: true,
  // The gym_photos RLS insert policy only checks gym_id, not uploaded_by —
  // unlike paymentReceipts, there's no `withCheck: uploaded_by = current_user`
  // backing this column. Set it server-side from the auth session rather
  // than trusting the client.
  uploadedBy: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const updateGymPhotoSchema = createUpdateSchema(gymPhotos, {
  ...gymPhotoRefinements,
  sortOrder: z.coerce.number().int().min(0),
}).omit({
  id: true,
  gymId: true, // photos aren't reassigned between gyms — delete + re-upload instead
  uploadedBy: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const gymPhotoIdSchema = z.object({ id: uuid });

export type CreateGymPhotoInput = z.infer<typeof createGymPhotoSchema>;
export type UpdateGymPhotoInput = z.infer<typeof updateGymPhotoSchema>;

// ============================================================================
// Gym Locations
// ============================================================================

const gymLocationRefinements = {
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500).optional().nullable(),
};

export const createGymLocationSchema = createInsertSchema(
  gymLocations,
  gymLocationRefinements,
).omit({ id: true, createdAt: true });

export const updateGymLocationSchema = createUpdateSchema(
  gymLocations,
  gymLocationRefinements,
).omit({ id: true, gymId: true, createdAt: true });

export const gymLocationIdSchema = z.object({ id: uuid });

export type CreateGymLocationInput = z.infer<typeof createGymLocationSchema>;
export type UpdateGymLocationInput = z.infer<typeof updateGymLocationSchema>;

// ============================================================================
// Gym QR Codes
// ============================================================================

export const createGymQrCodeSchema = createInsertSchema(gymQrCodes, {
  label: z.string().trim().max(100).optional().nullable(),
  rotatingToken: z.string().trim().max(64).optional().nullable(),
}).omit({
  id: true,
  // SECURITY: qrIdentifier and signatureSecret must never be
  // client-suppliable. They're the values checked when a scanned QR is
  // validated — accepting them from a create payload would let any
  // caller forge a valid check-in code by choosing a known secret.
  // Generate both server-side and write them directly, bypassing this
  // schema for those two columns.
  qrIdentifier: true,
  signatureSecret: true,
  createdAt: true,
  updatedAt: true,
});

export const updateGymQrCodeSchema = createUpdateSchema(gymQrCodes, {
  label: z.string().trim().max(100).optional().nullable(),
  rotatingToken: z.string().trim().max(64).optional().nullable(),
}).omit({
  id: true,
  gymId: true,
  qrIdentifier: true, // stable identifier — regenerate via delete + create, not patch
  signatureSecret: true,
  createdAt: true,
  updatedAt: true,
});

export const gymQrCodeIdSchema = z.object({ id: uuid });

export type CreateGymQrCodeInput = z.infer<typeof createGymQrCodeSchema>;
export type UpdateGymQrCodeInput = z.infer<typeof updateGymQrCodeSchema>;

// ============================================================================
// Membership Plans
// ============================================================================

const membershipPlanRefinements = {
  planName: z.string().trim().min(2).max(200),
  shortDescription: z.string().trim().min(1).max(500),
  planColor: z.preprocess(
    (v) => (v === "" ? undefined : v),
    hexColor.optional().nullable(),
  ),
  planPrice: money,
  joiningFee: optionalMoney,
  securityDeposit: optionalMoney,
  discountValue: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/)
      .optional()
      .nullable(),
  ),
  membershipDuration: z.string().trim().min(1).max(50),
  durationMonths: coerceInt(1, 120),
  gracePeriodDays: optionalCoerceInt(0, 365),
  maxFreezeDays: optionalCoerceInt(0, 365),
  selectedFeatures: z.array(z.string()).optional(),
  customFeatures: z.array(z.string()).optional(),
  minimumAge: optionalCoerceInt(0, 120),
  maximumAge: optionalCoerceInt(0, 120),
  maxActiveMembers: optionalCoerceInt(1),
  // Enum overrides
  planCategory: optionalString,
  pricingType: optionalString,
  discountType: optionalString,
  validityStarts: optionalString,
  enrollmentMode: optionalString,
  status: optionalString,
};

function withMembershipPlanChecks<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data: any, ctx: z.RefinementCtx) => {
    if (
      data.minimumAge != null &&
      data.maximumAge != null &&
      data.minimumAge > data.maximumAge
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maximumAge"],
        message: "maximumAge must be greater than or equal to minimumAge",
      });
    }
    if (
      data.discountType === "Percentage" &&
      data.discountValue != null &&
      Number(data.discountValue) > 100
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "A percentage discount cannot exceed 100",
      });
    }
  });
}

// NOTE: previously updateMembershipPlanSchema only overrode 6 of these ~20
// fields — durationMonths, gracePeriodDays, minimumAge, etc. fell through
// to drizzle-zod's default numeric-column mapping, which doesn't accept
// the string values this app's <input type="number"> fields submit. That
// meant editing a plan's duration/age-range/discount after creation would
// 400 even with valid data. Sharing membershipPlanRefinements across both
// schemas closes that gap and stops it from reopening.
export const createMembershipPlanSchema = withMembershipPlanChecks(
  createInsertSchema(membershipPlans, membershipPlanRefinements).omit({
    id: true,
    gymId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  }),
);

export const updateMembershipPlanSchema = withMembershipPlanChecks(
  createUpdateSchema(membershipPlans, membershipPlanRefinements).omit({
    id: true,
    gymId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  }),
);

export const membershipPlanIdSchema = z.object({ id: uuid });

export type CreateMembershipPlanInput = z.infer<
  typeof createMembershipPlanSchema
>;
export type UpdateMembershipPlanInput = z.infer<
  typeof updateMembershipPlanSchema
>;

// ============================================================================
// Trainers
// ============================================================================

// averageRating / retentionRate are aggregate values computed from actual
// session/review data — same category as membersTrained/completedSessions
// below, which were already correctly server-managed. They're intentionally
// NOT in this refinement map and are omitted from both schemas; recompute
// them server-side instead of trusting client input.
const trainerRefinements = {
  invitedEmail: z
    .email()
    .max(320)
    .regex(emailRegex, "Invalid email address")
    .optional()
    .nullable(),
  fullName: z.string().trim().min(1).max(200).optional().nullable(),

  contactPhone: optionalPhone,
  contactEmail: z
    .email()
    .max(320)
    .regex(emailRegex, "Invalid email address")
    .optional()
    .nullable(),
  professionalTitle: z.string().trim().min(5).max(200).optional().nullable(),
  bio: z.string().trim().min(10).max(2000).optional().nullable(),
  experienceYears: optionalCoerceInt(0, 70),
  salary: optionalMoney,
  specializations: z.array(z.string()).optional(),
  maxMembers: optionalCoerceInt(0),
  maxSessionsPerDay: optionalCoerceInt(0, 50),
  workingDays: z.array(z.string()).optional(),
  sessionTypes: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  instagram: optionalUrl,
  startTime: optionalTime,
  endTime: optionalTime,
  linkedin: optionalUrl,
  youtube: optionalUrl,
  websiteUrl: optionalUrl,
  emergencyPhone: optionalPhone,
  emergencyAlternatePhone: optionalPhone,
  postalCode: optionalPostalCode,
  // Enum fields — <select> submits strings, not the inferred enum literal type
  gender: optionalString,
  employmentType: optionalString,
  emergencyRelationship: optionalString,
  status: optionalString,
  // Date fields
  dateOfBirth: optionalDate,
  joiningDate: optionalDate,
  // Boolean fields
  acceptingNewMembers: optionalBool,
  emailNotifications: optionalBool,
  smsNotifications: optionalBool,
  pushNotifications: optionalBool,
  twoFactorEnabled: optionalBool,
};

const trainerSystemManagedOmit = {
  averageRating: true,
  retentionRate: true,
  membersTrained: true,
  completedSessions: true,
  totalReviews: true,
  clerkInvitationId: true,
  invitationSentAt: true,
  invitationAcceptedAt: true,
  gymId: true,
} as const;

export const createTrainerSchema = createInsertSchema(
  trainers,
  trainerRefinements,
).omit({
  id: true,
  contactEmail: true,
  ...trainerSystemManagedOmit,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const updateTrainerSchema = createUpdateSchema(
  trainers,
  trainerRefinements,
).omit({
  id: true,
  profileId: true,
  contactEmail: true,
  ...trainerSystemManagedOmit,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const trainerIdSchema = z.object({ id: uuid });

export type CreateTrainerInput = z.infer<typeof createTrainerSchema>;
export type UpdateTrainerInput = z.infer<typeof updateTrainerSchema>;

// ============================================================================
// Members
// ============================================================================

const memberRefinements = {
  fullName: z.string().trim().min(1).max(200),
  contactPhone: optionalPhone,
  dateOfBirth: optionalDate,
  gender: z.enum(genderEnum.enumValues),
  photoUrl: optionalUrl,
  invitedEmail: z
    .email()
    .max(320)
    .regex(emailRegex, "Invalid email address")
    .optional()
    .nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  pinCode: optionalPostalCode,
  heightCm: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .string()
      .regex(/^\d{2,3}(\.\d)?$/)
      .optional()
      .nullable(),
  ),
  weightKg: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .string()
      .regex(/^\d{2,3}(\.\d)?$/)
      .optional()
      .nullable(),
  ),
  fitnessGoal: z.string().trim().max(500).optional().nullable(),
  medicalConditions: z.string().trim().max(1000).optional().nullable(),
  allergies: z.string().trim().max(1000).optional().nullable(),
  // Enum overrides
  bloodGroup: z.preprocess(
    (value) => (value === "" ? null : value),
    z.enum(bloodGroupEnum.enumValues).nullable().optional(),
  ),
  occupation: optionalString,
  emergencyContactRelationship: optionalString,
  emergencyContactPhone: optionalPhone,
};

// NOTE: previously the update schema didn't override heightCm, weightKg,
// fitnessGoal, medicalConditions, or allergies at all — editing any of
// those after member creation would fail (numeric strings) or skip the
// length caps (free text). Fixed by sharing memberRefinements.
export const createMemberSchema = createInsertSchema(
  members,
  memberRefinements,
).omit({
  id: true,
  memberCode: true, // server-generated
  contactEmail: true,
  clerkInvitationId: true,
  invitationSentAt: true,
  invitationAcceptedAt: true,
  activeGymMembershipId: true, // set by the membership-activation flow, not directly
  accountStatus: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const updateMemberSchema = createUpdateSchema(
  members,
  memberRefinements,
).omit({
  id: true,
  profileId: true,
  memberCode: true,
  activeGymMembershipId: true,
  contactEmail: true,
  // Suspending/reinstating a member is a moderation action, not a generic
  // profile field — same pattern as verifyPaymentSchema /
  // reviewMembershipApplicationSchema below. Previously this WASN'T
  // omitted here (only on create), so a profile-edit endpoint reusing this
  // schema could accidentally let a member flip their own account status.
  accountStatus: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const memberIdSchema = z.object({ id: uuid });

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

//invite Member Form
const membershipFields = z.object({
  planId: uuid,
  startDate: z.iso.date(),
  joiningFee: optionalMoney,
  discount: optionalMoney,
  notes: z.string().trim().max(1000).optional().nullable(),
});

// trainer_assignments has no insert schema of its own yet — trainerId is
// optional here since assigning a trainer at signup is optional.
const trainerAssignmentField = z.object({
  trainerId: uuid.optional().nullable(),
});

export const inviteMemberFormSchema = createMemberSchema
  .merge(membershipFields)
  .merge(trainerAssignmentField);

export type InviteMemberFormInput = z.infer<typeof inviteMemberFormSchema>;

// ============================================================================
// Membership Applications
// ============================================================================

export const createMembershipApplicationSchema = createInsertSchema(
  membershipApplications,
  {
    message: z.string().trim().max(1000).optional().nullable(),
  },
).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

// Applications aren't freely edited after submission — this update schema
// is scoped to the staff review action (approve/reject), not the original
// application content.
export const reviewMembershipApplicationSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
  rejectionReason: z.string().trim().max(500).optional().nullable(),
});

export const membershipApplicationIdSchema = z.object({ id: uuid });

export type CreateMembershipApplicationInput = z.infer<
  typeof createMembershipApplicationSchema
>;
export type ReviewMembershipApplicationInput = z.infer<
  typeof reviewMembershipApplicationSchema
>;

// ============================================================================
// Gym Memberships
// ============================================================================

export const createGymMembershipSchema = createInsertSchema(gymMemberships, {
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  durationMonths: coerceInt(1, 120),
  joiningFee: optionalMoney,
  planPrice: money,
  discount: optionalMoney,
  finalAmount: money,
  notes: z.string().trim().max(1000).optional().nullable(),
})
  .omit({
    id: true,
    status: true,
    paymentVerificationRequired: true,
    activatedAt: true,
    activatedBy: true,
    isFrozen: true,
    freezeStartDate: true,
    freezeEndDate: true,
    totalFreezeDays: true,
    cancelledAt: true,
    cancellationReason: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });
// NOTE (not fixed here, flagging for the team): finalAmount is accepted
// verbatim from the client with no check that it's consistent with
// planPrice - discount + joiningFee. I didn't add that check because I
// don't know your exact discount-application order (e.g. does joiningFee
// get discounted too?) and guessing wrong would just encode a different
// bug. Safer fix is usually to not trust client-submitted finalAmount at
// all — recompute it server-side from planPrice/discount/joiningFee and
// ignore whatever the client sent.

export const updateGymMembershipSchema = createUpdateSchema(gymMemberships, {
  endDate: z.iso.date().optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
  cancellationReason: z.string().trim().max(500).optional().nullable(),
}).omit({
  id: true,
  gymId: true,
  memberId: true,
  planId: true,
  applicationId: true,
  startDate: true,
  planPrice: true,
  finalAmount: true,
  createdAt: true,
  updatedAt: true,
});

export const gymMembershipIdSchema = z.object({ id: uuid });

export type CreateGymMembershipInput = z.infer<
  typeof createGymMembershipSchema
>;
export type UpdateGymMembershipInput = z.infer<
  typeof updateGymMembershipSchema
>;

// ============================================================================
// Trainer Assignments
// ============================================================================

export const createTrainerAssignmentSchema = createInsertSchema(
  trainerAssignments,
  {
    notes: z.string().trim().max(500).optional().nullable(),
  },
).omit({ id: true, assignedAt: true, unassignedAt: true, isActive: true });

export const updateTrainerAssignmentSchema = z.object({
  isActive: z.boolean().optional(),
  unassignedAt: z.iso.datetime().optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const trainerAssignmentIdSchema = z.object({ id: uuid });

export type CreateTrainerAssignmentInput = z.infer<
  typeof createTrainerAssignmentSchema
>;
export type UpdateTrainerAssignmentInput = z.infer<
  typeof updateTrainerAssignmentSchema
>;

// ============================================================================
// Payments & Receipts
// ============================================================================

export const createPaymentSchema = createInsertSchema(payments, {
  amount: money,
  paymentDate: z.iso.date().optional().nullable(),
  dueDate: z.iso.date().optional().nullable(),
  gatewayProvider: z.string().trim().max(50).optional().nullable(),
  gatewayPaymentId: z.string().trim().max(200).optional().nullable(),
  gatewayOrderId: z.string().trim().max(200).optional().nullable(),
  transactionRef: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  method: optionalString,
}).omit({
  id: true,
  receiptId: true,
  status: true,
  verifiedBy: true,
  verifiedAt: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

// Payment status transitions (verify/reject) are a distinct, staff-only
// action from editing payment details — kept separate rather than folded
// into a generic partial-update schema.
export const verifyPaymentSchema = z.object({
  status: z.enum(["Verified", "Rejected"]),
  rejectionReason: z.string().trim().max(500).optional().nullable(),
});

export const paymentIdSchema = z.object({ id: uuid });

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const createPaymentReceiptSchema = createInsertSchema(paymentReceipts, {
  fileUrl: url,
  fileType: z.string().trim().max(20).optional().nullable(),
}).omit({ id: true, isCurrent: true, uploadedAt: true });

export const paymentReceiptIdSchema = z.object({ id: uuid });

export type CreatePaymentReceiptInput = z.infer<
  typeof createPaymentReceiptSchema
>;

// ============================================================================
// Attendance
// ============================================================================

export const createAttendanceSchema = createInsertSchema(attendance, {
  attendanceDate: z.iso.date(),
  notes: z.string().trim().max(500).optional().nullable(),
}).omit({
  id: true,
  checkIn: true,
  checkOut: true,
  durationMinutes: true,
  status: true,
  createdAt: true,
});

// Check-out is the one mutation this table supports post-creation.
export const checkOutAttendanceSchema = z.object({
  checkOut: z.iso.datetime(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const attendanceIdSchema = z.object({ id: uuid });

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type CheckOutAttendanceInput = z.infer<typeof checkOutAttendanceSchema>;

// ============================================================================
// Exercise Library
// ============================================================================

const exerciseRefinements = {
  name: z.string().trim().min(1).max(200),
  equipment: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  // NOT NULL, no default in schema.ts — must be required on create.
  // createUpdateSchema still makes this optional for PATCH on its own.
  muscleGroup: z.string().trim().min(1, "muscleGroup is required"),
};

export const createExerciseSchema = createInsertSchema(
  exercises,
  exerciseRefinements,
).omit({ id: true, createdAt: true });

export const updateExerciseSchema = createUpdateSchema(
  exercises,
  exerciseRefinements,
).omit({ id: true, gymId: true, createdAt: true });

export const exerciseIdSchema = z.object({ id: uuid });

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;

// ============================================================================
// Workout Templates
// ============================================================================

const workoutTemplateRefinements = {
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(2000),
  durationMinutes: optionalCoerceInt(1, 600),
  targetMuscles: z.array(z.string()).optional(),
  additionalNotes: z.string().trim().max(1000).optional().nullable(),
};

// NOTE: durationMinutes was previously only overridden on create — editing
// a template's duration via PATCH would fail against the raw numeric
// column mapping. Fixed by sharing workoutTemplateRefinements.
export const createWorkoutTemplateSchema = createInsertSchema(
  workoutTemplates,
  workoutTemplateRefinements,
).omit({ id: true, status: true, createdAt: true, updatedAt: true });

export const updateWorkoutTemplateSchema = createUpdateSchema(
  workoutTemplates,
  workoutTemplateRefinements,
).omit({
  id: true,
  gymId: true,
  trainerId: true,
  createdAt: true,
  updatedAt: true,
});

export const workoutTemplateIdSchema = z.object({ id: uuid });

export type CreateWorkoutTemplateInput = z.infer<
  typeof createWorkoutTemplateSchema
>;
export type UpdateWorkoutTemplateInput = z.infer<
  typeof updateWorkoutTemplateSchema
>;

const templateExerciseRefinements = {
  position: z.coerce.number().int().min(0).default(0),
  sets: coerceInt(1, 50),
  reps: z.string().trim().max(20),
  weight: z.string().trim().max(30).optional(),
  restSeconds: optionalCoerceInt(0, 3600),
};

export const createTemplateExerciseSchema = createInsertSchema(
  templateExercises,
  templateExerciseRefinements,
).omit({ id: true });

// Previously `.partial()` of the create schema, which left templateId and
// exerciseId present-but-optional — a PATCH body could silently reassign
// which template/exercise this row belongs to. Both are now omitted;
// re-point an entry by deleting and re-creating it instead.
// Column names confirmed against schema.ts: templateId, exerciseId.
export const updateTemplateExerciseSchema = createInsertSchema(
  templateExercises,
  templateExerciseRefinements,
)
  .omit({ id: true, templateId: true, exerciseId: true })
  .partial();

export const templateExerciseIdSchema = z.object({ id: uuid });

export type CreateTemplateExerciseInput = z.infer<
  typeof createTemplateExerciseSchema
>;
export type UpdateTemplateExerciseInput = z.infer<
  typeof updateTemplateExerciseSchema
>;

// ============================================================================
// Training Sessions
// ============================================================================

const trainingSessionRefinements = {
  sessionName: z.string().trim().min(1).max(200),
  location: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  durationMinutes: optionalCoerceInt(1, 600),
  defaultRestSeconds: optionalCoerceInt(0, 3600),
  reminderMinutes: optionalCoerceInt(0, 1440),
  workoutType: optionalString,
  sessionType: optionalString,
};

export const createTrainingSessionSchema = createInsertSchema(
  trainingSessions,
  {
    ...trainingSessionRefinements,
    sessionDate: z.iso.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  },
)
  .omit({
    id: true,
    status: true,
    completedAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

// NOTE: durationMinutes / defaultRestSeconds / reminderMinutes were
// previously missing from the update schema's overrides — same
// coercion-parity bug as membership plans / workout templates above.
export const updateTrainingSessionSchema = createUpdateSchema(
  trainingSessions,
  trainingSessionRefinements,
).omit({
  id: true,
  gymId: true,
  trainerId: true,
  memberId: true,
  // Status transitions (complete/cancel) belong on a dedicated action
  // endpoint — same pattern as payments/applications — not a generic
  // PATCH field.
  status: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const trainingSessionIdSchema = z.object({ id: uuid });

export type CreateTrainingSessionInput = z.infer<
  typeof createTrainingSessionSchema
>;
export type UpdateTrainingSessionInput = z.infer<
  typeof updateTrainingSessionSchema
>;

const sessionExerciseRefinements = {
  position: z.coerce.number().int().min(0).default(0),
  sets: coerceInt(1, 50),
  reps: z.string().trim().max(20),
  weight: z.string().trim().max(30).optional(),
  restSeconds: optionalCoerceInt(0, 3600),
};

export const createSessionExerciseSchema = createInsertSchema(
  sessionExercises,
  sessionExerciseRefinements,
).omit({ id: true });

// Same foreign-key-reassignment fix as updateTemplateExerciseSchema above.
// Column names confirmed against schema.ts — note the FK here is named
// `sessionId` (not `trainingSessionId`, which was my earlier guess before
// I had schema.ts to check against).
export const updateSessionExerciseSchema = createInsertSchema(
  sessionExercises,
  sessionExerciseRefinements,
)
  .omit({ id: true, sessionId: true, exerciseId: true })
  .partial();

export const sessionExerciseIdSchema = z.object({ id: uuid });

export type CreateSessionExerciseInput = z.infer<
  typeof createSessionExerciseSchema
>;
export type UpdateSessionExerciseInput = z.infer<
  typeof updateSessionExerciseSchema
>;

// ============================================================================
// Messages & Notifications
// ============================================================================

export const createMessageSchema = createInsertSchema(messages, {
  subject: z.string().trim().max(200).optional().nullable(),
  body: z.string().trim().min(1).max(5000),
}).omit({ id: true, isRead: true, readAt: true, createdAt: true });

export const markMessageReadSchema = z.object({
  isRead: z.literal(true),
});

export const messageIdSchema = z.object({ id: uuid });

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const createNotificationSchema = createInsertSchema(notifications, {
  type: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(1000).optional().nullable(),
  // Zod v4: z.record() requires an explicit key schema.
  data: z.record(z.string(), z.unknown()).optional(),
}).omit({ id: true, isRead: true, readAt: true, createdAt: true });

export const markNotificationReadSchema = z.object({
  isRead: z.literal(true),
});

export const notificationIdSchema = z.object({ id: uuid });

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// ============================================================================
// SaaS Billing
// ============================================================================

export const createSubscriptionPlanSchema = createInsertSchema(
  subscriptionPlans,
  {
    name: z.string().trim().min(1).max(50),
    maxMembers: optionalCoerceInt(1),
    pricePerMember: optionalMoney,
    flatPrice: optionalMoney,
    features: z.array(z.string()).optional(),
  },
)
  .omit({ id: true, isActive: true, createdAt: true, updatedAt: true })
  .refine(
    (data) =>
      (data.billingModel === "PerMember" &&
        data.pricePerMember != null &&
        data.flatPrice == null) ||
      (data.billingModel === "Flat" &&
        data.flatPrice != null &&
        data.pricePerMember == null),
    {
      message:
        "PerMember plans need pricePerMember (and no flatPrice); Flat plans need flatPrice (and no pricePerMember)",
      path: ["billingModel"],
    },
  );

export const updateSubscriptionPlanSchema = createUpdateSchema(
  subscriptionPlans,
  {
    name: z.string().trim().min(1).max(50),
    pricePerMember: optionalMoney,
    flatPrice: optionalMoney,
    features: z.array(z.string()).optional(),
  },
).omit({ id: true, createdAt: true, updatedAt: true });

export const subscriptionPlanIdSchema = z.object({ id: uuid });

export type CreateSubscriptionPlanInput = z.infer<
  typeof createSubscriptionPlanSchema
>;
export type UpdateSubscriptionPlanInput = z.infer<
  typeof updateSubscriptionPlanSchema
>;

// gymSubscriptions and subscriptionPayments are system/cron/webhook-
// generated (see the changelog at the top of schema.ts — invoice
// generation crons and the Razorpay payment-capture webhook). There's
// intentionally no public "create" validator for either; only narrow
// mutation schemas for the actions a real caller performs.

export const recordSubscriptionPaymentSchema = createInsertSchema(
  subscriptionPayments,
  {
    amount: money,
    gatewayOrderId: z.string().trim().max(200).optional().nullable(),
    gatewayPaymentId: z.string().trim().max(200).optional().nullable(),
  },
).omit({ id: true, status: true, paidAt: true, createdAt: true });

export const gymSubscriptionIdSchema = z.object({ id: uuid });
export const subscriptionPaymentIdSchema = z.object({ id: uuid });

export type RecordSubscriptionPaymentInput = z.infer<
  typeof recordSubscriptionPaymentSchema
>;

// ============================================================================
// System Settings
// ============================================================================

export const createSystemSettingSchema = createInsertSchema(systemSettings, {
  key: z.string().trim().min(1).max(100),
  value: z.unknown(),
}).omit({ id: true, updatedAt: true });

export const updateSystemSettingSchema = z.object({
  value: z.unknown(),
});

export const systemSettingIdSchema = z.object({ id: uuid });

export type CreateSystemSettingInput = z.infer<
  typeof createSystemSettingSchema
>;
export type UpdateSystemSettingInput = z.infer<
  typeof updateSystemSettingSchema
>;
