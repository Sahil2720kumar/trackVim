/**
 * TrackVim — Drizzle ORM Schema (v2 + RLS)
 *
 * ============================================================================
 * WHY THIS VERSION IS DIFFERENT FROM v1
 * ============================================================================
 * v1 assumed one member belongs to exactly one gym (members.gymId).
 * That breaks the moment a member joins a second gym, and it also meant
 * "membership" and "gym relationship" were the same row — which made
 * renewals, applications, and payment-verification impossible to model
 * cleanly.
 *
 * v2 rules (derived from the business workflow docs):
 *   1. `members` is a GLOBAL, gym-agnostic profile (one per user, ever).
 *   2. `gym_memberships` is the bridge: member ↔ gym ↔ plan, with its own
 *      lifecycle (PaymentPending → PaymentUploaded → Active → Expired...).
 *      SaaS billing counts ACTIVE rows here per gym — never a manual counter.
 *   3. `membership_applications` happens BEFORE a gym_membership exists.
 *      Approval creates a gym_membership row; nothing is skipped.
 *   4. Renewals never update an old gym_membership row — they insert a new
 *      one. History is permanent, exactly as the workflow doc requires.
 *   5. Attendance is single shared gym QR (with optional location + optional
 *      rotating-token support for later), one row per member/gym/day,
 *      updated (not re-inserted) on check-out.
 *   6. Trainer assignment is its own table, not a column on `members`,
 *      because a member can now have a different trainer per gym.
 *   7. SaaS billing (TrackVim → gym owner) is fully separate from gym
 *      payments (member → gym): subscription_plans / gym_subscriptions /
 *      subscription_payments.
 *
 * ============================================================================
 * KNOWN, INTENTIONAL SIMPLIFICATIONS (documented so they're not "bugs")
 * ============================================================================
 *   - Trainers are still scoped to ONE gym directly (trainers.gymId). The
 *     docs never asked for multi-gym trainers. If you need freelance
 *     trainers working across gyms later, mirror the members/gym_memberships
 *     pattern with a `trainer_gym_assignments` table — don't retrofit gymId.
 *   - "Only one PENDING application per member per gym" and "only one
 *     ACTIVE gym_membership per member per gym" are enforced at the
 *     APPLICATION layer, not via a partial unique index. Postgres partial
 *     unique indexes are the more bulletproof option long-term — add one
 *     once you're comfortable with the exact status set (it tends to
 *     change early on and a wrong partial index silently blocks valid rows).
 *   - `system_settings` allows gymId = NULL for global settings but does
 *     NOT enforce single-row-per-key via a unique index, because Postgres
 *     treats NULL != NULL in unique constraints (two "global" rows for the
 *     same key wouldn't conflict). Enforce this in application code, or add
 *     a sentinel non-null "GLOBAL" gym row if you want the DB to guarantee it.
 *
 * ============================================================================
 * ROW LEVEL SECURITY (RLS) — added in this version
 * ============================================================================
 * Auth identity is Clerk, not Supabase Auth — so there's no native
 * `auth.uid()` row to key off. What we get from Supabase's Clerk (third-party
 * auth) integration is `auth.jwt()->>'sub'`, the Clerk user id, which is
 * stored on `users.clerk_id`. Every policy below resolves the acting
 * app-user through that column via the CURRENT_USER_ID helper.
 *
 * From there, three more helpers build up the access model:
 *   - CURRENT_MEMBER_ID : the `members.id` row owned by the current user
 *   - STAFF_GYM_IDS     : gyms the current user owns OR trainers at
 *   - MY_GYM_IDS         : STAFF_GYM_IDS + gyms the current user is a member of
 *
 * General shape used almost everywhere:
 *   - "management" tables (plans, trainers, memberships, payments,
 *     billing, templates, sessions, attendance writes, etc.) are writable
 *     only by STAFF_GYM_IDS (gym owner or a trainer at that gym).
 *   - "personal" tables (own payments, own attendance, own applications,
 *     own memberships) are readable by the owning member (CURRENT_MEMBER_ID)
 *     in addition to gym staff.
 *   - purely platform-internal tables (SaaS billing, notifications) are
 *     scoped to the gym owner or the notified user respectively.
 *
 * These policies are a reasonable *default* access model, not a verified
 * spec of your product's exact sharing rules — a few calls here (e.g.
 * whether trainers see payment amounts, whether QR signature secrets are
 * safe to expose to any gym member) are judgment calls flagged inline with
 * comments. Review before shipping.
 *
 * No DELETE policies are defined anywhere: this schema uses soft deletes
 * (`deletedAt`) throughout, and omitting a policy for an operation means
 * that operation is denied by default under RLS for `authenticatedRole`.
 * Hard deletes, if you ever need them, should go through the service role
 * (which bypasses RLS entirely), not the client.
 *
 * Also not covered: INSERT on `users` (created by the Clerk webhook, which
 * should run with the service role) and writes to `subscription_plans` /
 * `notifications` (both system/service-role-managed).
 *
 * ============================================================================
 * CHANGELOG (this pass)
 * ============================================================================
 *   - FIXED: `members.activeGymMembershipId` previously had no FK at all,
 *     despite a comment promising one "after gymMemberships is defined
 *     (circular)". Drizzle's `.references(() => table.column)` callback is
 *     lazily evaluated, so it can point at a table declared later in the
 *     same file without any special handling — there was nothing circular
 *     to work around. The FK is now actually declared below, with
 *     onDelete: "set null" so deleting the referenced gym_membership can't
 *     leave a dangling pointer.
 */

import {
  pgTable,
  pgEnum,
  pgPolicy,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  time,
  jsonb,
  smallint,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { authenticatedRole } from "drizzle-orm/supabase";

// ============================================================================
// RLS helpers
// ============================================================================

/**
 * These four helpers used to be raw `sql` fragments that got pasted
 * verbatim into every policy's `using`/`withCheck` clause. That worked, but
 * it meant e.g. `gyms`' SELECT policy directly queried `gym_memberships`,
 * whose own SELECT policy directly queried `gyms` back — a real two-table
 * (and, via `users`, three-table) round trip through RLS on every single
 * row check, not just a one-time cost.
 *
 * Fix: each helper now calls a `SECURITY DEFINER` SQL function (defined in
 * the companion migration `sql/000_rls_helper_functions.sql`, which must
 * run BEFORE these policies are created). A `SECURITY DEFINER` function
 * executes its body as the function's *owner* — here, a role with
 * BYPASSRLS — so the query inside `staff_gym_ids()` that reads `gyms` and
 * `trainers` does NOT re-trigger `gyms`' or `trainers`' own RLS policies.
 * The recursive round-trip is gone, not just centralized.
 *
 * They're also marked `STABLE`, so Postgres can cache one result per
 * statement instead of re-running the function per row.
 *
 * IMPORTANT: because these are now real functions owned by a privileged
 * role, they are the ONLY approved way to compute "my gyms" / "my member
 * id" anywhere in the app or in future policies — never re-inline the old
 * raw subqueries, or the recursion comes right back.
 */

/** Internal `users.id` for the caller, resolved from the Clerk JWT subject. */
const CURRENT_USER_ID = sql`public.current_user_id()`;

/** Internal `members.id` for the caller, if their user account has one. */
const CURRENT_MEMBER_ID = sql`public.current_member_id()`;

/** Gyms the caller runs (owner) or works at (trainer) — i.e. can manage. */
const STAFF_GYM_IDS = sql`(select public.staff_gym_ids())`;

/** Every gym the caller has any relationship to: staff, or a member of. */
const MY_GYM_IDS = sql`(select public.my_gym_ids())`;

// ============================================================================
// Enums
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["owner", "trainer", "member"]);

/** Platform-wide account status — for suspending abusive accounts etc. */
export const generalStatusEnum = pgEnum("general_status", [
  "Active",
  "Inactive",
  "Suspended",
  "Pending",
]);

export const trainerStatusEnum = pgEnum("trainer_status", [
  "Invited",   // owner created the row, Clerk invite sent, not yet accepted
  "Active",
  "Busy",
  "On Leave",
  "Offline",
  "Inactive",
]);

export const employmentTypeEnum = pgEnum("employment_type", [
  "Full Time",
  "Part Time",
  "Contract",
]);

export const genderEnum = pgEnum("gender", ["Male", "Female", "Other"]);

export const bloodGroupEnum = pgEnum("blood_group", [
  "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-",
]);

export const relationshipEnum = pgEnum("relationship", [
  "Mother", "Father", "Sister", "Brother", "Spouse", "Sibling", "Friend", "Other",
]);

export const planCategoryEnum = pgEnum("plan_category", [
  "Standard", "Premium", "VIP", "Student", "Corporate", "Personal Training",
]);

export const pricingTypeEnum = pgEnum("pricing_type", ["Fixed", "Recurring"]);
export const discountTypeEnum = pgEnum("discount_type", ["Percentage", "Amount"]);
export const planStatusEnum = pgEnum("plan_status", ["Active", "Draft", "Hidden"]);

export const validityStartsEnum = pgEnum("validity_starts", [
  "Immediately", "From Joining Date", "Custom Date",
]);

export const enrollmentModeEnum = pgEnum("enrollment_mode", ["Open", "Invite Only"]);

/** Application to join a gym — happens BEFORE any gym_membership row exists */
export const applicationStatusEnum = pgEnum("application_status", [
  "Pending",
  "Approved",
  "Rejected",
]);

/**
 * The actual member↔gym↔plan subscription lifecycle.
 * Created only after an application is Approved.
 */
export const gymMembershipStatusEnum = pgEnum("gym_membership_status", [
  "PaymentPending",   // approved, awaiting member to pay
  "PaymentUploaded",  // member uploaded receipt, awaiting owner verification
  "PaymentRejected",  // owner rejected receipt, member must re-upload
  "Active",
  "Expired",
  "Cancelled",
  "Frozen",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "Cash", "UPI", "Card", "Bank Transfer", "Net Banking", "Razorpay",
]);

/** Status for a member→gym payment (includes the receipt-verification flow) */
export const paymentStatusEnum = pgEnum("payment_status", [
  "Pending",
  "PendingVerification",
  "Verified",
  "Rejected",
  "Partial",
  "Overdue",
  "Refunded",
  "Cancelled",
]);

export const qrCodeTypeEnum = pgEnum("qr_code_type", ["Static", "Rotating"]);

/** NO_RECORD is simply "no row exists" — not stored as a value */
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "CheckedIn",
  "CheckedOut",
]);

export const workoutTypeEnum = pgEnum("workout_type", [
  "Strength", "Hypertrophy", "Functional", "Cardio", "Mobility", "Powerlifting", "HIIT",
]);

export const sessionTypeEnum = pgEnum("session_type", [
  "Personal Training", "Group Session", "Assessment", "Consultation",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "Upcoming", "InProgress", "Completed", "Cancelled",
]);

export const templateStatusEnum = pgEnum("template_status", [
  "Active", "Draft", "Archived",
]);

export const muscleGroupEnum = pgEnum("muscle_group", [
  "Back", "Biceps", "Triceps", "Chest", "Shoulders", "Rear Delts", "Legs",
  "Core", "Full Body", "Glutes", "Forearms", "Traps",
]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "Beginner", "Intermediate", "Advanced",
]);

export const primaryGoalEnum = pgEnum("primary_goal", [
  "Muscle Gain", "Fat Loss", "Strength", "Endurance", "Athletic Performance",
]);

/** TrackVim's own SaaS billing status (platform ← gym owner) */
export const subscriptionBillingStatusEnum = pgEnum("subscription_billing_status", [
  "Pending", "Paid", "Overdue", "Cancelled",
]);

/** Gateway lifecycle for the platform subscription payment itself */
export const gatewayPaymentStatusEnum = pgEnum("gateway_payment_status", [
  "Created", "Authorized", "Captured", "Failed", "Refunded",
]);

export const billingModelEnum = pgEnum("billing_model", ["PerMember", "Flat"]);

// ============================================================================
// Core identity
// ============================================================================

/**
 * users — one row per human, platform-wide. Auth identity only (Clerk).
 * Role-specific data lives in gyms.ownerId / trainers / members.
 *
 * RLS: everyone can read their own row. Gym owners/trainers can also read
 * the user rows of people connected to their gym (other staff, their
 * members) since names/avatars/contact info need to render in owner and
 * trainer UIs. INSERT is intentionally not opened to authenticatedRole —
 * account rows are created by the Clerk webhook under the service role.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: varchar("clerk_id", { length: 255 }).unique(),
    fullName: text("full_name"),
    username: varchar("username", { length: 100 }),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role"), // signup-intent hint only; real access = related rows
    accountStatus: generalStatusEnum("account_status").notNull().default("Active"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_clerk_id_idx").on(t.clerkId),
    pgPolicy("Users can view their own row", {
      for: "select",
      to: authenticatedRole,
      using: sql`clerk_id = (select auth.jwt()->>'sub')`,
    }),
    pgPolicy("Gym staff can view users connected to their gym", {
      for: "select",
      to: authenticatedRole,
      using: sql`
        id in (select owner_id from gyms where id in ${MY_GYM_IDS})
        or id in (select profile_id from trainers where gym_id in ${MY_GYM_IDS})
        or id in (
          select profile_id from members
          where id in (select member_id from gym_memberships where gym_id in ${MY_GYM_IDS})
        )
      `,
    }),
    pgPolicy("Users can update their own row", {
      for: "update",
      to: authenticatedRole,
      using: sql`clerk_id = (select auth.jwt()->>'sub')`,
      withCheck: sql`clerk_id = (select auth.jwt()->>'sub')`,
    }),
  ],
).enableRLS();

export const profiles = users;

// ============================================================================
// Gyms, locations, QR codes
// ============================================================================

/**
 * RLS: any authenticated user can create a gym they'll own. Visible to the
 * owner and anyone connected to it (staff or member); only the owner can
 * update it.
 */
export const gyms = pgTable(
  "gyms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "restrict" }),

    name: text("name").notNull(),
    gymShortName: varchar("gym_short_name", { length: 10 }),
    gymDescription: text("gym_description"),
    contactEmail: varchar("contact_email", { length: 320 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    website: text("website"),
    logoUrl: text("logo_url"),

    /** Unique code members use to discover/join this gym (e.g. "Q8K7PW") */
    code: varchar("code", { length: 10 }).notNull().unique(),

    ownerName: text("owner_name"),
    businessName: text("business_name"),
    businessEmail: varchar("business_email", { length: 320 }),
    businessPhone: varchar("business_phone", { length: 20 }),

    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    postalCode: varchar("postal_code", { length: 20 }),
    country: text("country").notNull().default("India"),
    timezone: text("timezone").notNull().default("Asia/Kolkata"),

    gstRegistered: boolean("gst_registered").notNull().default(false),
    gstin: varchar("gstin", { length: 20 }),
    legalBusinessName: text("legal_business_name"),
    billingAddress: text("billing_address"),
    gstState: text("gst_state"),
    stateCode: varchar("state_code", { length: 5 }),
    placeOfSupply: text("place_of_supply"),
    sacCode: varchar("sac_code", { length: 50 }),

    numberOfFloors: smallint("number_of_floors"),
    numberOfRooms: smallint("number_of_rooms"),
    hasWashroom: boolean("has_washroom").default(false),
    washroomCount: smallint("washroom_count"),
    hasSaunaRoom: boolean("has_sauna_room").default(false),
    saunaRoomCount: smallint("sauna_room_count"),
    hasSteamRoom: boolean("has_steam_room").default(false),
    steamRoomCount: smallint("steam_room_count"),
    hasShowerRoom: boolean("has_shower_room").default(false),
    showerRoomCount: smallint("shower_room_count"),
    hasLockerRoom: boolean("has_locker_room").default(false),
    lockerRoomCount: smallint("locker_room_count"),
    facilityNotes: text("facility_notes"),

    amenities: jsonb("amenities").$type<string[]>().default([]),
    equipment: jsonb("equipment").$type<{ name: string; quantity: number }[]>().default([]),

    billingStartDate: date("billing_start_date"),
    currentPlanId: uuid("current_plan_id").references(() => subscriptionPlans.id),

    isVerified: boolean("is_verified").notNull().default(false), // owner KYC/verification
    status: generalStatusEnum("status").notNull().default("Active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    pgPolicy("Anyone connected to a gym can view it", {
      for: "select",
      to: authenticatedRole,
      using: sql`id in ${MY_GYM_IDS} or owner_id = ${CURRENT_USER_ID}`,
    }),
    pgPolicy("Users can create a gym they own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`owner_id = ${CURRENT_USER_ID}`,
    }),
    pgPolicy("Owners can update their own gym", {
      for: "update",
      to: authenticatedRole,
      using: sql`owner_id = ${CURRENT_USER_ID}`,
      withCheck: sql`owner_id = ${CURRENT_USER_ID}`,
    }),
  ],
).enableRLS();

/**
 * gym_locations — future-proofing for multi-branch gyms.
 * MVP: every gym gets exactly one row with isPrimary = true.
 *
 * RLS: readable by anyone connected to the gym; writable by gym staff only.
 */
export const gymLocations = pgTable(
  "gym_locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Main Branch"),
    address: text("address"),
    isPrimary: boolean("is_primary").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("gym_locations_gym_idx").on(t.gymId),
    pgPolicy("Anyone connected to the gym can view its locations", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${MY_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can manage locations", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can update locations", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

/**
 * gym_qr_codes — one static QR per gym (or per location) shown at the
 * entrance. Same QR is scanned for both check-in and check-out; the
 * server decides which based on whether an open attendance row exists.
 * `rotatingToken` / `tokenExpiresAt` are unused today but let you upgrade
 * to a rotating, harder-to-forge QR later without a schema migration.
 *
 * RLS: NOTE — `signatureSecret` is a server-side HMAC secret and this
 * table's select policy currently exposes it to any member of the gym,
 * which defeats its purpose (a member could forge scans). If clients read
 * this table directly, split `signatureSecret` into a staff-only table or
 * view before shipping; scan verification should really happen through a
 * server function rather than a client SELECT anyway.
 */
export const gymQrCodes = pgTable(
  "gym_qr_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").references(() => gymLocations.id, { onDelete: "set null" }),

    label: text("label").default("Entrance QR"),
    qrIdentifier: varchar("qr_identifier", { length: 64 }).notNull().unique(),
    signatureSecret: text("signature_secret").notNull(), // HMAC secret to prevent forged QR images
    type: qrCodeTypeEnum("type").notNull().default("Static"),
    rotatingToken: varchar("rotating_token", { length: 64 }),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),

    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("gym_qr_codes_gym_idx").on(t.gymId),
    pgPolicy("Gym staff can view QR codes", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can manage QR codes", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can update QR codes", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

// ============================================================================
// Membership Plans
// ============================================================================

/**
 * RLS: readable by anyone connected to the gym (members need to browse
 * plans to apply). Writable by gym staff only. Note: this does NOT cover
 * public/anonymous plan discovery for prospective members who haven't
 * joined yet — that needs a separate `anonRole` (or a security-definer
 * function) scoped to `status = 'Active'` plans if you want unauthenticated
 * browsing.
 */
export const membershipPlans = pgTable(
  "membership_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),

    planName: text("plan_name").notNull(),
    shortDescription: text("short_description").notNull(),
    planCategory: planCategoryEnum("plan_category"),
    planColor: varchar("plan_color", { length: 7 }),
    planIcon: varchar("plan_icon", { length: 30 }),

    planPrice: numeric("plan_price", { precision: 10, scale: 2 }).notNull(),
    joiningFee: numeric("joining_fee", { precision: 10, scale: 2 }).default("0"),
    securityDeposit: numeric("security_deposit", { precision: 10, scale: 2 }).default("0"),
    pricingType: pricingTypeEnum("pricing_type").default("Recurring"),
    discountType: discountTypeEnum("discount_type"),
    discountValue: numeric("discount_value", { precision: 6, scale: 2 }),

    /** Display string, e.g. "12 Months" — kept for UI copy */
    membershipDuration: text("membership_duration").notNull(),
    /** Actual numeric duration used in date math — never parse the string above */
    durationMonths: smallint("duration_months").notNull(),

    validityStarts: validityStartsEnum("validity_starts").default("From Joining Date"),
    gracePeriodDays: smallint("grace_period_days").default(0),
    allowFreeze: boolean("allow_freeze").default(false),
    maxFreezeDays: smallint("max_freeze_days"),

    selectedFeatures: jsonb("selected_features").$type<string[]>().default([]),
    customFeatures: jsonb("custom_features").$type<string[]>().default([]),

    minimumAge: smallint("minimum_age").default(14),
    maximumAge: smallint("maximum_age").default(80),
    maxActiveMembers: integer("max_active_members"),
    enrollmentMode: enrollmentModeEnum("enrollment_mode").default("Open"),
    cancellationAllowed: boolean("cancellation_allowed").default(true),

    status: planStatusEnum("status").notNull().default("Active"),
    visibility: text("visibility").default("Visible to Everyone"),
    isFeatured: boolean("is_featured").default(false),

    additionalNotes: text("additional_notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("membership_plans_gym_idx").on(t.gymId),
    pgPolicy("Anyone connected to the gym can view its plans", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${MY_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can manage plans", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can update plans", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

// ============================================================================
// Trainers (still single-gym — see note at top of file)
// ============================================================================

/**
 * RLS: readable by anyone connected to the gym (members need to see trainer
 * bios). Row creation/management is staff-only (the owner invites
 * trainers); a trainer may also update their own row (bio, availability,
 * socials, etc.) once linked.
 */
export const trainers = pgTable(
  "trainers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /**
     * Nullable on purpose: this row is created by the OWNER before the
     * trainer has a Clerk account. It's linked the moment the trainer
     * accepts the Clerk invitation — see clerkInvitationId below.
     * Postgres allows multiple NULLs in the profileGymIdx unique index,
     * so several pending (unlinked) invites for the same gym are fine.
     */
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),

    /**
     * Set at invite time so you can display/manage the pending row before
     * profileId exists, and so the webhook can match this exact row via
     * publicMetadata rather than by email.
     */
    invitedEmail: varchar("invited_email", { length: 320 }),
    clerkInvitationId: varchar("clerk_invitation_id", { length: 255 }),
    invitationSentAt: timestamp("invitation_sent_at", { withTimezone: true }),
    invitationAcceptedAt: timestamp("invitation_accepted_at", { withTimezone: true }),

    employeeId: varchar("employee_id", { length: 20 }),

    gender: genderEnum("gender"),
    dateOfBirth: date("date_of_birth"),
    professionalTitle: text("professional_title"),
    bio: text("bio"),

    joiningDate: date("joining_date"),
    experienceYears: smallint("experience_years").default(0),
    qualification: text("qualification"),
    certification: text("certification"),
    salary: numeric("salary", { precision: 10, scale: 2 }),
    employmentType: employmentTypeEnum("employment_type").default("Full Time"),
    specializations: jsonb("specializations").$type<string[]>().default([]),

    maxMembers: smallint("max_members"),
    maxSessionsPerDay: smallint("max_sessions_per_day"),

    workingDays: jsonb("working_days").$type<string[]>().default([]),
    startTime: time("start_time"),
    endTime: time("end_time"),
    sessionTypes: jsonb("session_types").$type<string[]>().default([]),
    acceptingNewMembers: boolean("accepting_new_members").default(true),

    languages: jsonb("languages").$type<string[]>().default([]),

    instagram: text("instagram"),
    linkedin: text("linkedin"),
    youtube: text("youtube"),
    websiteUrl: text("website_url"),

    membersTrained: integer("members_trained").default(0),
    completedSessions: integer("completed_sessions").default(0),
    averageRating: numeric("average_rating", { precision: 3, scale: 2 }),
    totalReviews: integer("total_reviews").default(0),
    retentionRate: numeric("retention_rate", { precision: 5, scale: 2 }),

    coachingExperience: text("coaching_experience"),
    trainingPhilosophy: text("training_philosophy"),

    emergencyContactName: text("emergency_contact_name"),
    emergencyRelationship: relationshipEnum("emergency_relationship"),
    emergencyPhone: varchar("emergency_phone", { length: 20 }),
    emergencyAlternatePhone: varchar("emergency_alternate_phone", { length: 20 }),

    addressLine: text("address_line"),
    city: text("city"),
    state: text("state"),
    country: text("country").default("India"),
    postalCode: varchar("postal_code", { length: 20 }),

    emailNotifications: boolean("email_notifications").default(true),
    smsNotifications: boolean("sms_notifications").default(false),
    pushNotifications: boolean("push_notifications").default(true),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),

    additionalNotes: text("additional_notes"),
    status: trainerStatusEnum("status").notNull().default("Invited"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("trainers_profile_gym_idx").on(t.profileId, t.gymId),
    index("trainers_gym_idx").on(t.gymId),
    uniqueIndex("trainers_employee_id_gym_idx").on(t.gymId, t.employeeId),
    pgPolicy("Anyone connected to the gym can view its trainers", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${MY_GYM_IDS}`,
    }),
    pgPolicy("Gym owners can invite/manage trainers", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
    pgPolicy("Gym staff or the trainer themself can update the row", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS} or profile_id = ${CURRENT_USER_ID}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS} or profile_id = ${CURRENT_USER_ID}`,
    }),
  ],
).enableRLS();

// ============================================================================
// Members — GLOBAL, gym-agnostic profile
// ============================================================================

/**
 * members — one row per user, ever, platform-wide. Does NOT carry gymId
 * or trainerId. Which gyms a member belongs to and who their trainer is at
 * each gym lives in `gym_memberships` and `trainer_assignments`.
 *
 * RLS: a member sees/edits their own global profile. Gym staff can also
 * see (and, for operational notes, update) the profile of anyone who is a
 * member at one of their gyms.
 */
export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),

    /** Global human-readable ID, e.g. "MBR-000123" (unique platform-wide) */
    memberCode: varchar("member_code", { length: 20 }).unique(),

    dateOfBirth: date("date_of_birth"),
    gender: genderEnum("gender"),
    occupation: text("occupation"),
    bloodGroup: bloodGroupEnum("blood_group"),
    photoUrl: text("photo_url"),

    address: text("address"),
    city: text("city"),
    state: text("state"),
    pinCode: varchar("pin_code", { length: 20 }),

    heightCm: numeric("height_cm", { precision: 5, scale: 1 }),
    weightKg: numeric("weight_kg", { precision: 5, scale: 1 }),
    fitnessGoal: text("fitness_goal"),
    medicalConditions: text("medical_conditions"),
    allergies: text("allergies"),
    physicalNotes: text("physical_notes"),

    emergencyContactName: text("emergency_contact_name"),
    emergencyContactRelationship: relationshipEnum("emergency_contact_relationship"),
    emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
    emergencyContactAddress: text("emergency_contact_address"),

    /**
     * Which gym_membership is "active" in the app's gym switcher right now.
     * FIXED: previously declared with no FK at all. `.references()` accepts
     * a lazy callback, so it can safely point at `gymMemberships` even
     * though that table is defined further down this same file — no
     * migration-order trick needed. onDelete: "set null" means if that
     * specific gym_membership row is ever hard-deleted, this just clears
     * back to null instead of leaving a dangling pointer or blocking the
     * delete outright.
     */
    activeGymMembershipId: uuid("active_gym_membership_id")
      .references((): any => gymMemberships.id, { onDelete: "set null" }),

    accountStatus: generalStatusEnum("account_status").notNull().default("Active"),
    additionalNotes: text("additional_notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("members_profile_idx").on(t.profileId),
    pgPolicy("Members can view their own profile", {
      for: "select",
      to: authenticatedRole,
      using: sql`profile_id = ${CURRENT_USER_ID}`,
    }),
    pgPolicy("Gym staff can view profiles of their members", {
      for: "select",
      to: authenticatedRole,
      using: sql`id in (select member_id from gym_memberships where gym_id in ${STAFF_GYM_IDS})`,
    }),
    pgPolicy("Users can create their own member profile", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`profile_id = ${CURRENT_USER_ID}`,
    }),
    pgPolicy("Members or their gym staff can update the profile", {
      for: "update",
      to: authenticatedRole,
      using: sql`
        profile_id = ${CURRENT_USER_ID}
        or id in (select member_id from gym_memberships where gym_id in ${STAFF_GYM_IDS})
      `,
      withCheck: sql`
        profile_id = ${CURRENT_USER_ID}
        or id in (select member_id from gym_memberships where gym_id in ${STAFF_GYM_IDS})
      `,
    }),
  ],
).enableRLS();

// ============================================================================
// Membership Applications (before payment, before gym_membership exists)
// ============================================================================

/**
 * RLS: a member sees/creates their own applications; gym staff see and
 * review (approve/reject) applications to their gym.
 */
export const membershipApplications = pgTable(
  "membership_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").notNull().references(() => membershipPlans.id, { onDelete: "restrict" }),

    status: applicationStatusEnum("status").notNull().default("Pending"),
    message: text("message"), // member's note on application

    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("applications_gym_member_idx").on(t.gymId, t.memberId),
    index("applications_status_idx").on(t.status),
    pgPolicy("Members can view their own applications", {
      for: "select",
      to: authenticatedRole,
      using: sql`member_id = ${CURRENT_MEMBER_ID}`,
    }),
    pgPolicy("Gym staff can view applications to their gym", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Members can apply to a gym", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`member_id = ${CURRENT_MEMBER_ID}`,
    }),
    pgPolicy("Gym staff can review applications", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

// ============================================================================
// Gym Memberships — the core member↔gym↔plan subscription record
// ============================================================================

/**
 * gym_memberships — created only when an application is Approved.
 * SaaS billing counts rows here with status = 'Active' per gym.
 * Renewals INSERT a new row; the old one is left as Expired for history.
 *
 * RLS: a member reads their own membership rows; only gym staff can write
 * them (rows are created/updated by the approval and renewal flows, which
 * run as gym staff actions — a member never inserts a gym_membership
 * directly, only an application).
 */
export const gymMemberships = pgTable(
  "gym_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").notNull().references(() => membershipPlans.id, { onDelete: "restrict" }),
    applicationId: uuid("application_id").references(() => membershipApplications.id, { onDelete: "set null" }),

    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    durationMonths: smallint("duration_months").notNull(),

    joiningFee: numeric("joining_fee", { precision: 10, scale: 2 }).default("0"),
    planPrice: numeric("plan_price", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).default("0"),
    finalAmount: numeric("final_amount", { precision: 10, scale: 2 }).notNull(),

    status: gymMembershipStatusEnum("status").notNull().default("PaymentPending"),

    /** Set false for gyms that skip receipt upload and mark cash paid directly */
    paymentVerificationRequired: boolean("payment_verification_required").notNull().default(true),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    activatedBy: uuid("activated_by").references(() => users.id),

    isFrozen: boolean("is_frozen").default(false),
    freezeStartDate: date("freeze_start_date"),
    freezeEndDate: date("freeze_end_date"),
    totalFreezeDays: smallint("total_freeze_days").default(0),

    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("gym_memberships_gym_idx").on(t.gymId),
    index("gym_memberships_member_idx").on(t.memberId),
    index("gym_memberships_gym_member_idx").on(t.gymId, t.memberId),
    index("gym_memberships_status_idx").on(t.status),
    // Billing scans "Active rows per gym" constantly — composite index for that exact query.
    index("gym_memberships_billing_idx").on(t.gymId, t.status),
    pgPolicy("Members can view their own memberships", {
      for: "select",
      to: authenticatedRole,
      using: sql`member_id = ${CURRENT_MEMBER_ID}`,
    }),
    pgPolicy("Gym staff can view memberships at their gym", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can create memberships", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can update memberships", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

// ============================================================================
// Trainer Assignments — per-gym, per-member trainer link
// ============================================================================

/**
 * RLS: a member reads their own assignments; assignment management is
 * staff-only.
 */
export const trainerAssignments = pgTable(
  "trainer_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    trainerId: uuid("trainer_id").notNull().references(() => trainers.id, { onDelete: "cascade" }),

    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    unassignedAt: timestamp("unassigned_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
  },
  (t) => [
    index("trainer_assignments_gym_member_idx").on(t.gymId, t.memberId),
    index("trainer_assignments_trainer_idx").on(t.trainerId),
    pgPolicy("Members can view their own trainer assignments", {
      for: "select",
      to: authenticatedRole,
      using: sql`member_id = ${CURRENT_MEMBER_ID}`,
    }),
    pgPolicy("Gym staff can view assignments at their gym", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can manage trainer assignments", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can update trainer assignments", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

// ============================================================================
// Payments & Receipts (member → gym)
// ============================================================================

/**
 * RLS: a member sees/creates their own payment records (e.g. uploading a
 * receipt creates a PendingVerification row); only gym staff can verify or
 * reject a payment (update).
 */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "restrict" }),
    gymMembershipId: uuid("gym_membership_id").references(() => gymMemberships.id, { onDelete: "set null" }),

    receiptId: varchar("receipt_id", { length: 20 }),

    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    paymentDate: date("payment_date"),
    dueDate: date("due_date"),
    method: paymentMethodEnum("method"),
    status: paymentStatusEnum("status").notNull().default("PendingVerification"),

    // Online-gateway fields (Razorpay) — null for cash/manual entries
    gatewayProvider: text("gateway_provider"),
    gatewayPaymentId: text("gateway_payment_id"),
    gatewayOrderId: text("gateway_order_id"),
    transactionRef: text("transaction_ref"),

    collectedBy: uuid("collected_by").references(() => users.id), // staff who recorded it
    verifiedBy: uuid("verified_by").references(() => users.id),   // owner who verified it
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("payments_gym_idx").on(t.gymId),
    index("payments_member_idx").on(t.memberId),
    index("payments_membership_idx").on(t.gymMembershipId),
    index("payments_date_idx").on(t.paymentDate),
    pgPolicy("Members can view their own payments", {
      for: "select",
      to: authenticatedRole,
      using: sql`member_id = ${CURRENT_MEMBER_ID}`,
    }),
    pgPolicy("Gym staff can view payments at their gym", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Members or gym staff can record a payment", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`member_id = ${CURRENT_MEMBER_ID} or gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can verify or reject payments", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

/**
 * payment_receipts — supports multiple uploads per payment (member
 * re-uploads after a rejection). `isCurrent` marks the one the owner
 * should review; older ones stay for audit history.
 *
 * RLS: scoped through the parent payment row's ownership (member who owns
 * the payment, or that payment's gym staff).
 */
export const paymentReceipts = pgTable(
  "payment_receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),

    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 20 }), // "image" | "pdf"
    isCurrent: boolean("is_current").notNull().default(true),

    uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("payment_receipts_payment_idx").on(t.paymentId),
    pgPolicy("Members or gym staff can view receipts for their payments", {
      for: "select",
      to: authenticatedRole,
      using: sql`
        payment_id in (
          select id from payments
          where member_id = ${CURRENT_MEMBER_ID} or gym_id in ${STAFF_GYM_IDS}
        )
      `,
    }),
    pgPolicy("Members or gym staff can upload receipts for their payments", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`
        uploaded_by = ${CURRENT_USER_ID}
        and payment_id in (
          select id from payments
          where member_id = ${CURRENT_MEMBER_ID} or gym_id in ${STAFF_GYM_IDS}
        )
      `,
    }),
  ],
).enableRLS();

// ============================================================================
// Attendance
// ============================================================================

/**
 * attendance — one row per member per gym per day.
 * First scan of the shared gym QR inserts (check-in); second scan updates
 * the SAME row (check-out). Never re-inserted for the same day.
 *
 * RLS: a member sees/creates their own attendance rows (self check-in);
 * gym staff can see and correct attendance at their gym (e.g. manual
 * check-out, front-desk overrides).
 */
export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    gymMembershipId: uuid("gym_membership_id").notNull().references(() => gymMemberships.id, { onDelete: "restrict" }),
    qrCodeId: uuid("qr_code_id").references(() => gymQrCodes.id, { onDelete: "set null" }),
    locationId: uuid("location_id").references(() => gymLocations.id, { onDelete: "set null" }),

    attendanceDate: date("attendance_date").notNull(),
    checkIn: timestamp("check_in", { withTimezone: true }),
    checkOut: timestamp("check_out", { withTimezone: true }),
    durationMinutes: integer("duration_minutes"),
    status: attendanceStatusEnum("status").notNull().default("CheckedIn"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("attendance_member_gym_date_idx").on(
      t.memberId, t.gymId, t.attendanceDate,
    ),
    index("attendance_gym_date_idx").on(t.gymId, t.attendanceDate),
    pgPolicy("Members can view their own attendance", {
      for: "select",
      to: authenticatedRole,
      using: sql`member_id = ${CURRENT_MEMBER_ID}`,
    }),
    pgPolicy("Gym staff can view attendance at their gym", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Members or gym staff can check in", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`member_id = ${CURRENT_MEMBER_ID} or gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Members or gym staff can check out / correct attendance", {
      for: "update",
      to: authenticatedRole,
      using: sql`member_id = ${CURRENT_MEMBER_ID} or gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`member_id = ${CURRENT_MEMBER_ID} or gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

// ============================================================================
// Exercise Library
// ============================================================================

/**
 * RLS: `gymId IS NULL` rows are the global library, visible to everyone
 * signed in. Gym-specific exercises are visible to anyone connected to
 * that gym, writable only by that gym's staff.
 */
export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "cascade" }), // null = global library

    name: text("name").notNull(),
    equipment: text("equipment").notNull(),
    muscleGroup: muscleGroupEnum("muscle_group").notNull(),
    description: text("description"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("exercises_name_idx").on(t.name),
    pgPolicy("Global exercises are visible to everyone signed in", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id is null or gym_id in ${MY_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can add gym-specific exercises", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can update their gym-specific exercises", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

// ============================================================================
// Workout Templates
// ============================================================================

/**
 * RLS: visible to anyone connected to the gym; writable by gym staff.
 * (A trainer authoring a template is still "gym staff" for this purpose —
 * we don't further restrict a template to only its author, since other
 * trainers at the same gym should be able to reuse/edit shared templates.)
 */
export const workoutTemplates = pgTable(
  "workout_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    trainerId: uuid("trainer_id").notNull().references(() => trainers.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    category: text("category").notNull(),
    workoutType: workoutTypeEnum("workout_type"),
    primaryGoal: primaryGoalEnum("primary_goal"),
    difficultyLevel: difficultyLevelEnum("difficulty_level"),
    description: text("description").notNull(),
    durationMinutes: smallint("duration_minutes"),
    targetMuscles: jsonb("target_muscles").$type<string[]>().default([]),
    status: templateStatusEnum("status").notNull().default("Draft"),

    additionalNotes: text("additional_notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("templates_gym_idx").on(t.gymId),
    index("templates_trainer_idx").on(t.trainerId),
    pgPolicy("Anyone connected to the gym can view its templates", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${MY_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can create templates", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can update templates", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

/**
 * RLS: scoped through the parent template's gym.
 */
export const templateExercises = pgTable(
  "template_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: uuid("template_id").notNull().references(() => workoutTemplates.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "restrict" }),

    position: smallint("position").notNull().default(0),
    sets: smallint("sets").notNull().default(3),
    reps: varchar("reps", { length: 20 }).notNull().default("10"),
    weight: varchar("weight", { length: 30 }).default(""),
    restSeconds: smallint("rest_seconds").default(60),
  },
  (t) => [
    index("template_exercises_template_idx").on(t.templateId),
    pgPolicy("Anyone connected to the gym can view template exercises", {
      for: "select",
      to: authenticatedRole,
      using: sql`template_id in (select id from workout_templates where gym_id in ${MY_GYM_IDS})`,
    }),
    pgPolicy("Gym staff can manage template exercises", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`template_id in (select id from workout_templates where gym_id in ${STAFF_GYM_IDS})`,
    }),
    pgPolicy("Gym staff can update template exercises", {
      for: "update",
      to: authenticatedRole,
      using: sql`template_id in (select id from workout_templates where gym_id in ${STAFF_GYM_IDS})`,
      withCheck: sql`template_id in (select id from workout_templates where gym_id in ${STAFF_GYM_IDS})`,
    }),
  ],
).enableRLS();

// ============================================================================
// Training Sessions
// ============================================================================

/**
 * training_sessions — created FROM a template (exercises get copied into
 * session_exercises at creation time). Editing sets/reps/exercises on a
 * session never touches the original template — that's the whole point
 * of the copy: per your workflow, "changes affect ONLY this session".
 *
 * RLS: a member views their own sessions; gym staff view/manage sessions
 * at their gym (a trainer schedules and runs their sessions as gym staff).
 */
export const trainingSessions = pgTable(
  "training_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    trainerId: uuid("trainer_id").notNull().references(() => trainers.id, { onDelete: "restrict" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "restrict" }),
    templateId: uuid("template_id").references(() => workoutTemplates.id, { onDelete: "set null" }),

    sessionName: text("session_name").notNull(),
    sessionDate: date("session_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    durationMinutes: smallint("duration_minutes"),

    workoutType: workoutTypeEnum("workout_type").notNull().default("Strength"),
    sessionType: sessionTypeEnum("session_type").notNull().default("Personal Training"),
    location: text("location"),
    status: sessionStatusEnum("status").notNull().default("Upcoming"),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    showRestTimer: boolean("show_rest_timer").default(true),
    defaultRestSeconds: smallint("default_rest_seconds").default(60),
    reminderMinutes: smallint("reminder_minutes").default(15),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("sessions_gym_date_idx").on(t.gymId, t.sessionDate),
    index("sessions_trainer_date_idx").on(t.trainerId, t.sessionDate),
    index("sessions_member_idx").on(t.memberId),
    pgPolicy("Members can view their own sessions", {
      for: "select",
      to: authenticatedRole,
      using: sql`member_id = ${CURRENT_MEMBER_ID}`,
    }),
    pgPolicy("Gym staff can view sessions at their gym", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can create sessions", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
    pgPolicy("Gym staff can update sessions", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
      withCheck: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),
  ],
).enableRLS();

/**
 * RLS: scoped through the parent session's gym / member.
 */
export const sessionExercises = pgTable(
  "session_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => trainingSessions.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "restrict" }),

    position: smallint("position").notNull().default(0),
    sets: smallint("sets").notNull().default(3),
    reps: varchar("reps", { length: 20 }).notNull().default("10"),
    weight: varchar("weight", { length: 30 }).default(""),
    restSeconds: smallint("rest_seconds").default(60),
  },
  (t) => [
    index("session_exercises_session_idx").on(t.sessionId),
    pgPolicy("Members or gym staff can view session exercises", {
      for: "select",
      to: authenticatedRole,
      using: sql`
        session_id in (
          select id from training_sessions
          where member_id = ${CURRENT_MEMBER_ID} or gym_id in ${STAFF_GYM_IDS}
        )
      `,
    }),
    pgPolicy("Gym staff can manage session exercises", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`session_id in (select id from training_sessions where gym_id in ${STAFF_GYM_IDS})`,
    }),
    pgPolicy("Gym staff can update session exercises", {
      for: "update",
      to: authenticatedRole,
      using: sql`session_id in (select id from training_sessions where gym_id in ${STAFF_GYM_IDS})`,
      withCheck: sql`session_id in (select id from training_sessions where gym_id in ${STAFF_GYM_IDS})`,
    }),
  ],
).enableRLS();

// ============================================================================
// Messages & Notifications
// ============================================================================

/**
 * RLS: a direct-message model — only the two participants can see a row,
 * only the sender can create one, only the receiver can update it (marking
 * read).
 */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "cascade" }), // null = platform-level
    senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    receiverId: uuid("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    subject: text("subject"),
    body: text("body").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("messages_receiver_idx").on(t.receiverId),
    index("messages_sender_idx").on(t.senderId),
    pgPolicy("Participants can view their own messages", {
      for: "select",
      to: authenticatedRole,
      using: sql`sender_id = ${CURRENT_USER_ID} or receiver_id = ${CURRENT_USER_ID}`,
    }),
    pgPolicy("Users can send messages as themselves", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`sender_id = ${CURRENT_USER_ID}`,
    }),
    pgPolicy("Receivers can mark messages read", {
      for: "update",
      to: authenticatedRole,
      using: sql`receiver_id = ${CURRENT_USER_ID}`,
      withCheck: sql`receiver_id = ${CURRENT_USER_ID}`,
    }),
  ],
).enableRLS();

/**
 * RLS: a user only ever sees their own notifications, and can mark them
 * read. Creation is system-generated (service role) — no insert policy for
 * authenticatedRole.
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 50 }).notNull(), // e.g. "application_approved", "payment_verified"
    title: text("title").notNull(),
    body: text("body"),
    data: jsonb("data").$type<Record<string, unknown>>().default({}), // deep-link payload

    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("notifications_user_idx").on(t.userId),
    index("notifications_user_unread_idx").on(t.userId, t.isRead),
    pgPolicy("Users can view their own notifications", {
      for: "select",
      to: authenticatedRole,
      using: sql`user_id = ${CURRENT_USER_ID}`,
    }),
    pgPolicy("Users can mark their own notifications read", {
      for: "update",
      to: authenticatedRole,
      using: sql`user_id = ${CURRENT_USER_ID}`,
      withCheck: sql`user_id = ${CURRENT_USER_ID}`,
    }),
  ],
).enableRLS();

// ============================================================================
// SaaS Billing — TrackVim (platform) ← Gym Owner
// Completely separate from `payments` (which is member → gym).
// ============================================================================

/**
 * subscription_plans — TrackVim's own pricing tiers (Basic/Standard/Premium).
 * RLS: public pricing, readable by any signed-in user; managed only by the
 * service role (no write policy for authenticatedRole).
 */
export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).notNull(), // "Basic" | "Standard" | "Premium"
    billingModel: billingModelEnum("billing_model").notNull().default("PerMember"),

    maxMembers: integer("max_members"), // cap for this tier; null = unlimited
    pricePerMember: numeric("price_per_member", { precision: 10, scale: 2 }),
    flatPrice: numeric("flat_price", { precision: 10, scale: 2 }),

    features: jsonb("features").$type<string[]>().default([]),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    check(
      "subscription_plan_price_check",
      sql`
        (
          billing_model = 'PerMember'
          AND price_per_member IS NOT NULL
          AND flat_price IS NULL
        )
        OR
        (
          billing_model = 'Flat'
          AND flat_price IS NOT NULL
          AND price_per_member IS NULL
        )
      `,
    ),
    pgPolicy("Any signed-in user can view subscription plans", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ],
).enableRLS();

/**
 * gym_subscriptions — one row per gym per billing period.
 * `activeMemberCount` is a SNAPSHOT taken at billing time — it is computed
 * by counting gym_memberships WHERE status = 'Active', never hand-edited.
 *
 * RLS: only the gym owner can see their own billing history. Rows are
 * generated by a billing job (service role) — no write policy here.
 */
export const gymSubscriptions = pgTable(
  "gym_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").notNull().references(() => subscriptionPlans.id, { onDelete: "restrict" }),

    billingPeriodStart: date("billing_period_start").notNull(),
    billingPeriodEnd: date("billing_period_end").notNull(),
    activeMemberCount: integer("active_member_count").notNull(),
    pricePerMember: numeric("price_per_member", { precision: 10, scale: 2 }),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    invoiceDate: date("invoice_date"),
    dueDate: date("due_date"),
    isProrated: boolean("is_prorated").notNull().default(false),
    prorationDays: integer("proration_days"),
    prorationTotalDays: integer("proration_total_days"),

    status: subscriptionBillingStatusEnum("status").notNull().default("Pending"),
    razorpaySubscriptionId: text("razorpay_subscription_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("gym_subscriptions_gym_idx").on(t.gymId),
    index("gym_subscriptions_period_idx").on(t.gymId, t.billingPeriodStart),
    pgPolicy("Gym owners can view their own billing history", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
  ],
).enableRLS();

/**
 * RLS: same shape as gym_subscriptions — owner-only read, scoped through
 * the parent subscription row.
 */
export const subscriptionPayments = pgTable(
  "subscription_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymSubscriptionId: uuid("gym_subscription_id").notNull().references(() => gymSubscriptions.id, { onDelete: "cascade" }),

    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum("payment_method"),
    gatewayProvider: text("gateway_provider").default("razorpay"),
    gatewayPaymentId: text("gateway_payment_id"),
    gatewayOrderId: text("gateway_order_id"),
    status: gatewayPaymentStatusEnum("status").notNull().default("Created"),

    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("subscription_payments_subscription_idx").on(t.gymSubscriptionId),
    pgPolicy("Gym owners can view their own subscription payments", {
      for: "select",
      to: authenticatedRole,
      using: sql`
        gym_subscription_id in (
          select id from gym_subscriptions
          where gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})
        )
      `,
    }),
  ],
).enableRLS();

// ============================================================================
// System Settings
// ============================================================================

/**
 * system_settings — key/value config. gymId = null means platform-global.
 * See file-header note: uniqueness of (gymId, key) for the NULL case is
 * enforced in application code, not the DB.
 *
 * RLS: gym-scoped settings are readable/writable by that gym's owner (not
 * trainers — settings tend to include billing/config data). Global
 * (`gymId IS NULL`) rows are readable by anyone signed in but not writable
 * by authenticatedRole at all — those should only ever be changed by the
 * service role / an admin tool.
 */
export const systemSettings = pgTable(
  "system_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 100 }).notNull(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("system_settings_gym_key_idx").on(t.gymId, t.key),
    pgPolicy("Global settings are readable by anyone signed in", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id is null`,
    }),
    pgPolicy("Gym owners can view their own gym settings", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
    pgPolicy("Gym owners can create their own gym settings", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
    pgPolicy("Gym owners can update their own gym settings", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
      withCheck: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
  ],
).enableRLS();

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  ownedGym: one(gyms, { fields: [users.id], references: [gyms.ownerId] }),
  trainerProfiles: many(trainers),
  memberProfile: one(members, { fields: [users.id], references: [members.profileId] }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  notifications: many(notifications),
}));

export const gymsRelations = relations(gyms, ({ one, many }) => ({
  owner: one(users, { fields: [gyms.ownerId], references: [users.id] }),
  locations: many(gymLocations),
  qrCodes: many(gymQrCodes),
  plans: many(membershipPlans),
  trainers: many(trainers),
  applications: many(membershipApplications),
  memberships: many(gymMemberships),
  payments: many(payments),
  attendanceRecords: many(attendance),
  exercises: many(exercises),
  templates: many(workoutTemplates),
  sessions: many(trainingSessions),
  subscriptions: many(gymSubscriptions),
}));

export const gymLocationsRelations = relations(gymLocations, ({ one, many }) => ({
  gym: one(gyms, { fields: [gymLocations.gymId], references: [gyms.id] }),
  qrCodes: many(gymQrCodes),
}));

export const gymQrCodesRelations = relations(gymQrCodes, ({ one }) => ({
  gym: one(gyms, { fields: [gymQrCodes.gymId], references: [gyms.id] }),
  location: one(gymLocations, { fields: [gymQrCodes.locationId], references: [gymLocations.id] }),
}));

export const membershipPlansRelations = relations(membershipPlans, ({ one, many }) => ({
  gym: one(gyms, { fields: [membershipPlans.gymId], references: [gyms.id] }),
  applications: many(membershipApplications),
  memberships: many(gymMemberships),
}));

export const trainersRelations = relations(trainers, ({ one, many }) => ({
  profile: one(profiles, { fields: [trainers.profileId], references: [profiles.id] }),
  gym: one(gyms, { fields: [trainers.gymId], references: [gyms.id] }),
  assignments: many(trainerAssignments),
  templates: many(workoutTemplates),
  sessions: many(trainingSessions),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  profile: one(profiles, { fields: [members.profileId], references: [profiles.id] }),
  activeGymMembership: one(gymMemberships, {
    fields: [members.activeGymMembershipId],
    references: [gymMemberships.id],
  }),
  applications: many(membershipApplications),
  gymMemberships: many(gymMemberships),
  trainerAssignments: many(trainerAssignments),
  payments: many(payments),
  attendanceRecords: many(attendance),
  sessions: many(trainingSessions),
}));

export const membershipApplicationsRelations = relations(membershipApplications, ({ one, many }) => ({
  gym: one(gyms, { fields: [membershipApplications.gymId], references: [gyms.id] }),
  member: one(members, { fields: [membershipApplications.memberId], references: [members.id] }),
  plan: one(membershipPlans, { fields: [membershipApplications.planId], references: [membershipPlans.id] }),
  reviewer: one(users, { fields: [membershipApplications.reviewedBy], references: [users.id] }),
  resultingMembership: many(gymMemberships),
}));

export const gymMembershipsRelations = relations(gymMemberships, ({ one, many }) => ({
  gym: one(gyms, { fields: [gymMemberships.gymId], references: [gyms.id] }),
  member: one(members, { fields: [gymMemberships.memberId], references: [members.id] }),
  plan: one(membershipPlans, { fields: [gymMemberships.planId], references: [membershipPlans.id] }),
  application: one(membershipApplications, { fields: [gymMemberships.applicationId], references: [membershipApplications.id] }),
  payments: many(payments),
  attendanceRecords: many(attendance),
}));

export const trainerAssignmentsRelations = relations(trainerAssignments, ({ one }) => ({
  gym: one(gyms, { fields: [trainerAssignments.gymId], references: [gyms.id] }),
  member: one(members, { fields: [trainerAssignments.memberId], references: [members.id] }),
  trainer: one(trainers, { fields: [trainerAssignments.trainerId], references: [trainers.id] }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  gym: one(gyms, { fields: [payments.gymId], references: [gyms.id] }),
  member: one(members, { fields: [payments.memberId], references: [members.id] }),
  gymMembership: one(gymMemberships, { fields: [payments.gymMembershipId], references: [gymMemberships.id] }),
  receipts: many(paymentReceipts),
}));

export const paymentReceiptsRelations = relations(paymentReceipts, ({ one }) => ({
  payment: one(payments, { fields: [paymentReceipts.paymentId], references: [payments.id] }),
  uploader: one(users, { fields: [paymentReceipts.uploadedBy], references: [users.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  gym: one(gyms, { fields: [attendance.gymId], references: [gyms.id] }),
  member: one(members, { fields: [attendance.memberId], references: [members.id] }),
  gymMembership: one(gymMemberships, { fields: [attendance.gymMembershipId], references: [gymMemberships.id] }),
  qrCode: one(gymQrCodes, { fields: [attendance.qrCodeId], references: [gymQrCodes.id] }),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  gym: one(gyms, { fields: [exercises.gymId], references: [gyms.id] }),
  templateExercises: many(templateExercises),
  sessionExercises: many(sessionExercises),
}));

export const workoutTemplatesRelations = relations(workoutTemplates, ({ one, many }) => ({
  gym: one(gyms, { fields: [workoutTemplates.gymId], references: [gyms.id] }),
  trainer: one(trainers, { fields: [workoutTemplates.trainerId], references: [trainers.id] }),
  exercises: many(templateExercises),
  sessions: many(trainingSessions),
}));

export const templateExercisesRelations = relations(templateExercises, ({ one }) => ({
  template: one(workoutTemplates, { fields: [templateExercises.templateId], references: [workoutTemplates.id] }),
  exercise: one(exercises, { fields: [templateExercises.exerciseId], references: [exercises.id] }),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one, many }) => ({
  gym: one(gyms, { fields: [trainingSessions.gymId], references: [gyms.id] }),
  trainer: one(trainers, { fields: [trainingSessions.trainerId], references: [trainers.id] }),
  member: one(members, { fields: [trainingSessions.memberId], references: [members.id] }),
  template: one(workoutTemplates, { fields: [trainingSessions.templateId], references: [workoutTemplates.id] }),
  exercises: many(sessionExercises),
}));

export const sessionExercisesRelations = relations(sessionExercises, ({ one }) => ({
  session: one(trainingSessions, { fields: [sessionExercises.sessionId], references: [trainingSessions.id] }),
  exercise: one(exercises, { fields: [sessionExercises.exerciseId], references: [exercises.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  gym: one(gyms, { fields: [messages.gymId], references: [gyms.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receiver" }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  gym: one(gyms, { fields: [notifications.gymId], references: [gyms.id] }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  gymSubscriptions: many(gymSubscriptions),
}));

export const gymSubscriptionsRelations = relations(gymSubscriptions, ({ one, many }) => ({
  gym: one(gyms, { fields: [gymSubscriptions.gymId], references: [gyms.id] }),
  plan: one(subscriptionPlans, { fields: [gymSubscriptions.planId], references: [subscriptionPlans.id] }),
  payments: many(subscriptionPayments),
}));

export const subscriptionPaymentsRelations = relations(subscriptionPayments, ({ one }) => ({
  gymSubscription: one(gymSubscriptions, { fields: [subscriptionPayments.gymSubscriptionId], references: [gymSubscriptions.id] }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  gym: one(gyms, { fields: [systemSettings.gymId], references: [gyms.id] }),
}));