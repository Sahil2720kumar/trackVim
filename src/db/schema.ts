/**
 * TrackVim — Drizzle ORM Schema (v3 — RLS + Indexing pass)
 *
 * ============================================================================
 * WHAT CHANGED IN THIS PASS (indexing only — no table/column/RLS changes)
 * ============================================================================
 * Full index audit against actual query patterns: RLS policy predicates,
 * pg_cron jobs (expire_overdue_memberships, generate_first_gym_invoices,
 * generate_gym_subscription_invoices, mark_overdue_gym_subscriptions),
 * RPCs (record_subscription_payment_captured, create_subscription_payment_order,
 * change_gym_subscription_plan), and dashboard-shaped queries.
 *
 * Removed (redundant — fully covered by another existing composite index
 * whose leading column already matches):
 *   - gymMemberships: gym_idx on (gymId)
 *   - gymMemberships: status_idx on (status) — replaced by a partial index
 *     that matches the expiration cron's actual predicate
 *   - membershipApplications: status_idx on (status) — replaced by a
 *     gym-scoped composite matching the staff-dashboard access pattern
 *   - gymSubscriptions: period_idx on (gymId, billingPeriodStart) — exact
 *     duplicate of the unique gym_subscriptions_gym_period_idx from the
 *     006 migration; now mirrored directly in this schema instead
 *
 * Added:
 *   - gyms.ownerId — hit by staff_gym_ids()/my_gym_ids() and RLS policies
 *     on trainers, system_settings, gym_subscriptions, subscription_payments;
 *     was completely unindexed despite being the single most-queried
 *     column in the whole RLS model
 *   - gyms (status, billingStartDate) partial — billing cron gym selection
 *   - gymMemberships (endDate) WHERE status='Active' partial — expiration cron
 *   - membershipApplications (gymId, status) — staff pending-applications dashboard
 *   - trainerAssignments.memberId — member-only RLS lookup not covered by
 *     the existing (gymId, memberId) composite
 *   - payments (gymId, status) partial — staff outstanding-payments dashboard
 *   - paymentReceipts (paymentId) WHERE isCurrent unique partial — also
 *     enforces "one current receipt per payment" at the DB level
 *   - attendance (memberId, attendanceDate desc) — member's cross-gym history
 *   - exercises.gymId partial — gym-scoped exercise library browsing
 *   - trainingSessions (gymId, status, sessionDate) WHERE status='Upcoming' —
 *     "today's/upcoming sessions" dashboard widget
 *   - messages (receiverId, isRead) WHERE NOT isRead — unread inbox
 *   - gymSubscriptions (dueDate) WHERE status='Pending' partial — THE
 *     critical index for the daily mark_overdue_gym_subscriptions() cron,
 *     previously an unindexed full-table filter
 *   - gymSubscriptions unique (gymId, billingPeriodStart) — mirrors the
 *     006 migration's idempotency index directly in schema.ts
 *   - subscriptionPayments.gatewayOrderId unique partial — the Razorpay
 *     webhook handler (record_subscription_payment_captured) looked this
 *     up with zero index backing; every webhook call was a full scan
 *   - templateExercises.exerciseId / sessionExercises.exerciseId — minor,
 *     for future "which templates/sessions use exercise X" tooling
 *
 * NOTE on `.where()`: partial indexes below use the IndexBuilder's
 * `.where(sql...)` method, available in drizzle-orm >= 0.31. If your
 * installed version predates that, apply the equivalent CREATE INDEX ...
 * WHERE statements directly via a raw SQL migration instead — functionally
 * identical, just not expressible in the pgTable builder.
 *
 * Everything below this changelog is unchanged from the v2 schema except
 * for the index arrays called out above — table shapes, columns, RLS
 * policies, and relations are untouched.
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
// RLS helpers (unchanged)
// ============================================================================

const CURRENT_USER_ID = sql`public.current_user_id()`;
const CURRENT_MEMBER_ID = sql`public.current_member_id()`;
const STAFF_GYM_IDS = sql`(select public.staff_gym_ids())`;
const MY_GYM_IDS = sql`(select public.my_gym_ids())`;

// ============================================================================
// Enums (unchanged)
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["owner", "trainer", "member"]);

export const generalStatusEnum = pgEnum("general_status", [
  "Active",
  "Inactive",
  "Suspended",
  "Pending",
]);

export const trainerStatusEnum = pgEnum("trainer_status", [
  "Invited",
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
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
]);

export const relationshipEnum = pgEnum("relationship", [
  "Mother",
  "Father",
  "Sister",
  "Brother",
  "Spouse",
  "Sibling",
  "Friend",
  "Other",
]);

export const planCategoryEnum = pgEnum("plan_category", [
  "Standard",
  "Premium",
  "VIP",
  "Student",
  "Corporate",
  "Personal Training",
]);

export const pricingTypeEnum = pgEnum("pricing_type", ["Fixed", "Recurring"]);
export const discountTypeEnum = pgEnum("discount_type", [
  "Percentage",
  "Amount",
]);
export const planStatusEnum = pgEnum("plan_status", [
  "Active",
  "Draft",
  "Hidden",
]);

export const validityStartsEnum = pgEnum("validity_starts", [
  "Immediately",
  "From Joining Date",
  "Custom Date",
]);

export const enrollmentModeEnum = pgEnum("enrollment_mode", [
  "Open",
  "Invite Only",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "Pending",
  "Approved",
  "Rejected",
]);

export const gymMembershipStatusEnum = pgEnum("gym_membership_status", [
  "PaymentPending",
  "PaymentUploaded",
  "PaymentRejected",
  "Active",
  "Expired",
  "Cancelled",
  "Frozen",
  "Scheduled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
  "Net Banking",
  "Razorpay",
]);

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

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "CheckedIn",
  "CheckedOut",
]);

export const workoutTypeEnum = pgEnum("workout_type", [
  "Strength",
  "Hypertrophy",
  "Functional",
  "Cardio",
  "Mobility",
  "Powerlifting",
  "HIIT",
]);

export const sessionTypeEnum = pgEnum("session_type", [
  "Personal Training",
  "Group Session",
  "Assessment",
  "Consultation",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "Upcoming",
  "InProgress",
  "Completed",
  "Cancelled",
]);

export const templateStatusEnum = pgEnum("template_status", [
  "Active",
  "Draft",
  "Archived",
]);

export const muscleGroupEnum = pgEnum("muscle_group", [
  "Back",
  "Biceps",
  "Triceps",
  "Chest",
  "Shoulders",
  "Rear Delts",
  "Legs",
  "Core",
  "Full Body",
  "Glutes",
  "Forearms",
  "Traps",
]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "Beginner",
  "Intermediate",
  "Advanced",
]);

export const primaryGoalEnum = pgEnum("primary_goal", [
  "Muscle Gain",
  "Fat Loss",
  "Strength",
  "Endurance",
  "Athletic Performance",
]);

export const gymBillingStatusEnum = pgEnum("gym_billing_status", [
  "Trial",
  "Active",
  "Pending",
  "Suspended",
  "Cancelled",
]);

export const subscriptionBillingStatusEnum = pgEnum(
  "subscription_billing_status",
  ["Pending", "Paid", "Overdue", "Cancelled"],
);

export const gatewayPaymentStatusEnum = pgEnum("gateway_payment_status", [
  "Created",
  "Authorized",
  "Captured",
  "Failed",
  "Refunded",
]);

export const billingModelEnum = pgEnum("billing_model", ["PerMember", "Flat"]);

// ============================================================================
// Core identity
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: varchar("clerk_id", { length: 255 }).unique(),
    fullName: text("full_name"),
    email: varchar("email", { length: 320 }),
    username: varchar("username", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role"),
    accountStatus: generalStatusEnum("account_status")
      .notNull()
      .default("Active"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    // clerkId / email already unique-indexed — no bare .unique() column
    // ever needs a second plain index; Postgres backs UNIQUE with a btree
    // automatically.
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_username_idx").on(t.username), // add this
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

export const gyms = pgTable(
  "gyms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    name: text("name").notNull(),
    gymShortName: varchar("gym_short_name", { length: 10 }),
    gymDescription: text("gym_description"),
    contactEmail: varchar("contact_email", { length: 320 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    website: text("website"),
    logoUrl: text("logo_url"),

    code: varchar("code", { length: 10 }).notNull().unique(),
    paymentQrUrl: text("payment_qr_url"), // owner-uploaded QR image, shown to members at payment time
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
    equipment: jsonb("equipment")
      .$type<{ name: string; quantity: number }[]>()
      .default([]),

    billingStartDate: date("billing_start_date"),
    currentPlanId: uuid("current_plan_id").references(
      () => subscriptionPlans.id,
    ),
    billingStatus: gymBillingStatusEnum("billing_status")
      .notNull()
      .default("Trial"),

    isVerified: boolean("is_verified").notNull().default(false),
    status: generalStatusEnum("status").notNull().default("Active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    // NEW — hit by staff_gym_ids()/my_gym_ids() (called from nearly every
    // RLS policy in the schema) plus direct owner_id subqueries in
    // trainers, system_settings, gym_subscriptions, subscription_payments.
    // Was completely unindexed; the single highest-impact addition here.
    index("gyms_owner_idx").on(t.ownerId),

    // NEW — supports generate_first_gym_invoices() and
    // generate_gym_subscription_invoices(), both of which loop over gyms
    // filtered by status IN ('Active','Suspended') AND billing_start_date
    // <= <date>. Partial predicate keeps this small regardless of how many
    // pre-billing/trial gyms exist.
    index("gyms_billing_status_idx")
      .on(t.billingStatus, t.billingStartDate)
      .where(sql`billing_start_date is not null`),

    pgPolicy("Anyone connected to a gym can view it", {
      for: "select",
      to: authenticatedRole,
      using: sql`id in ${MY_GYM_IDS} or owner_id = ${CURRENT_USER_ID}`,
    }),
    // Scope the discovery policy or expose gyms through a narrowed surface.
    // RLS policies are permissive and OR-combined.
    // This policy grants every authenticated user select on all columns of every Active gym row.
    // That includes gstin, legal_business_name, billing_address, business_email, business_phone,
    // sac_code, and payment_qr_url. Public discovery only needs the narrow column set already returned by get_public_gyms.
    pgPolicy("Anyone can discover active gyms", {
      for: "select",
      to: authenticatedRole,
      using: sql`status = 'Active'`,
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

export const gymPhotos = pgTable(
  "gym_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    photoUrl: text("photo_url").notNull(),
    storagePath: text("storage_path"),
    caption: text("caption"),

    isCover: boolean("is_cover").notNull().default(false),
    sortOrder: smallint("sort_order").notNull().default(0),

    status: generalStatusEnum("status").notNull().default("Active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    // Every list/gallery query and the RLS policies below filter by gym_id first.
    index("gym_photos_gym_idx").on(t.gymId),

    // Supports "who uploaded what" lookups and owner_id-style audit queries.
    index("gym_photos_uploaded_by_idx").on(t.uploadedBy),

    // Gallery screens sort by gym, then cover-first, then explicit order —
    // covers the common "cover photo + ordered rest" fetch in one index.
    index("gym_photos_gym_sort_idx").on(t.gymId, t.isCover, t.sortOrder),

    pgPolicy("Anyone connected to a gym can view its photos", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${MY_GYM_IDS} or gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
    pgPolicy("Anyone can view gym photos", {
      for: "select",
      to: authenticatedRole,
      using: sql`deleted_at is null`,
    }),
    pgPolicy("Owners can upload photos to their own gym", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
    pgPolicy("Owners can update their own gym's photos", {
      for: "update",
      to: authenticatedRole,
      using: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
      withCheck: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
    pgPolicy("Owners can delete their own gym's photos", {
      for: "delete",
      to: authenticatedRole,
      using: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
  ],
).enableRLS();

export const gymLocations = pgTable(
  "gym_locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Main Branch"),
    address: text("address"),
    isPrimary: boolean("is_primary").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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

export const gymQrCodes = pgTable(
  "gym_qr_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, {
        onDelete: "cascade",
      }),

    // Keep this for future multi-location support.
    locationId: uuid("location_id").references(() => gymLocations.id, {
      onDelete: "set null",
    }),

    label: text("label").notNull().default("Entrance QR"),

    // Random token encoded inside the QR code.
    // A new token/QR record is created when the owner regenerates it.
    token: uuid("token").notNull().defaultRandom().unique(),

    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("gym_qr_codes_gym_idx").on(t.gymId),

    index("gym_qr_codes_location_idx").on(t.locationId),

    // Only one active QR per gym.
    uniqueIndex("gym_qr_codes_one_active_per_gym_idx")
      .on(t.gymId)
      .where(sql`${t.isActive} = true`),

    pgPolicy("Gym staff can view QR codes", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${STAFF_GYM_IDS}`,
    }),

    pgPolicy("Gym staff can create QR codes", {
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

export const membershipPlans = pgTable(
  "membership_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),

    planName: text("plan_name").notNull(),
    shortDescription: text("short_description").notNull(),
    planCategory: planCategoryEnum("plan_category"),
    planColor: varchar("plan_color", { length: 7 }),
    planIcon: varchar("plan_icon", { length: 30 }),

    planPrice: numeric("plan_price", { precision: 10, scale: 2 }).notNull(),
    joiningFee: numeric("joining_fee", { precision: 10, scale: 2 }).default(
      "0",
    ),
    securityDeposit: numeric("security_deposit", {
      precision: 10,
      scale: 2,
    }).default("0"),
    pricingType: pricingTypeEnum("pricing_type").default("Recurring"),
    discountType: discountTypeEnum("discount_type"),
    discountValue: numeric("discount_value", { precision: 6, scale: 2 }),

    membershipDuration: text("membership_duration").notNull(),
    durationMonths: smallint("duration_months").notNull(),

    validityStarts:
      validityStartsEnum("validity_starts").default("From Joining Date"),
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

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("membership_plans_gym_idx").on(t.gymId),
    pgPolicy("Anyone connected to the gym can view its plans", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${MY_GYM_IDS}`,
    }),
    pgPolicy("Anyone can view public membership plans", {
      for: "select",
      to: authenticatedRole,
      using: sql`
    status = 'Active'
    and deleted_at is null
    and visibility = 'Visible to Everyone'
  `,
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
// Trainers
// ============================================================================

export const trainers = pgTable(
  "trainers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name"),
    contactEmail: varchar("contact_email", { length: 320 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    photoUrl: text("photo_url"),
    trainerCode: varchar("trainer_code", { length: 20 }).unique(),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),

    invitedEmail: varchar("invited_email", { length: 320 }),
    clerkInvitationId: varchar("clerk_invitation_id", { length: 255 }),
    invitationSentAt: timestamp("invitation_sent_at", { withTimezone: true }),
    invitationAcceptedAt: timestamp("invitation_accepted_at", {
      withTimezone: true,
    }),

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
    emergencyAlternatePhone: varchar("emergency_alternate_phone", {
      length: 20,
    }),

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

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    // profileId-only lookups (e.g. usersRelations.trainerProfiles) are
    // covered by this composite's leftmost column — no separate index needed.
    uniqueIndex("trainers_profile_gym_idx").on(t.profileId, t.gymId),
    index("trainers_gym_idx").on(t.gymId),
    uniqueIndex("trainers_employee_id_gym_idx").on(t.gymId, t.employeeId),
    index("trainers_gym_contact_email_idx").on(t.gymId, t.contactEmail),
    index("trainers_gym_invited_email_idx").on(t.gymId, t.invitedEmail),
    pgPolicy("Anyone connected to the gym can view its trainers", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in ${MY_GYM_IDS}`,
    }),
    pgPolicy("Anyone can view active trainers", {
      for: "select",
      to: authenticatedRole,
      using: sql`
    status = 'Active'
  `,
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

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),

    //new field for offline management
    fullName: text("full_name"),
    contactEmail: varchar("contact_email", { length: 320 }),
    contactPhone: varchar("contact_phone", { length: 20 }),

    invitedEmail: varchar("invited_email", { length: 320 }),
    clerkInvitationId: varchar("clerk_invitation_id", { length: 255 }),
    invitationSentAt: timestamp("invitation_sent_at", { withTimezone: true }),
    invitationAcceptedAt: timestamp("invitation_accepted_at", {
      withTimezone: true,
    }),

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
    emergencyContactRelationship: relationshipEnum(
      "emergency_contact_relationship",
    ),
    emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
    emergencyContactAddress: text("emergency_contact_address"),

    activeGymMembershipId: uuid("active_gym_membership_id").references(
      (): any => gymMemberships.id,
      { onDelete: "set null" },
    ),

    accountStatus: generalStatusEnum("account_status")
      .notNull()
      .default("Active"),
    additionalNotes: text("additional_notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("members_profile_idx").on(t.profileId),
    index("members_contact_email_idx").on(t.contactEmail),

    index("members_invited_email_idx").on(t.invitedEmail),
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
    pgPolicy("Gym staff can view profiles of applicants", {
      for: "select",
      to: authenticatedRole,
      using: sql`
        id in (
          select member_id
          from membership_applications
          where gym_id in ${STAFF_GYM_IDS}
        )
      `,
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
// Membership Applications
// ============================================================================

export const membershipApplications = pgTable(
  "membership_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => membershipPlans.id, { onDelete: "restrict" }),

    status: applicationStatusEnum("status").notNull().default("Pending"),
    message: text("message"),
    applicantNotes: jsonb("applicant_notes"),
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("applications_gym_member_idx").on(t.gymId, t.memberId),
    // CHANGED — was a bare status_idx on (status), which doesn't match how
    // staff dashboards actually query ("pending applications for MY gym").
    // Composite with gym_id leading serves that directly; cross-gym status
    // scans were never a real query pattern here.
    index("applications_gym_status_idx").on(t.gymId, t.status),
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
// Gym Memberships
// ============================================================================

export const gymMemberships = pgTable(
  "gym_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => membershipPlans.id, { onDelete: "restrict" }),
    applicationId: uuid("application_id").references(
      () => membershipApplications.id,
      { onDelete: "set null" },
    ),

    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    durationMonths: smallint("duration_months").notNull(),

    joiningFee: numeric("joining_fee", { precision: 10, scale: 2 }).default(
      "0",
    ),
    planPrice: numeric("plan_price", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).default("0"),
    finalAmount: numeric("final_amount", { precision: 10, scale: 2 }).notNull(),

    status: gymMembershipStatusEnum("status")
      .notNull()
      .default("PaymentPending"),

    paymentVerificationRequired: boolean("payment_verification_required")
      .notNull()
      .default(true),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    activatedBy: uuid("activated_by").references(() => users.id),

    isFrozen: boolean("is_frozen").default(false),
    freezeStartDate: date("freeze_start_date"),
    freezeEndDate: date("freeze_end_date"),
    totalFreezeDays: smallint("total_freeze_days").default(0),

    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // REMOVED gym_memberships_gym_idx on (gymId) — redundant. Both
    // gym_member_idx and billing_idx below already have gym_id as their
    // leading column, so a bare "gym_id = X" query already uses one of
    // them. Keeping a third gym_id-leading index was pure write overhead.
    index("gym_memberships_member_idx").on(t.memberId),
    index("gym_memberships_gym_member_idx").on(t.gymId, t.memberId),
    // CHANGED — was a bare status_idx on (status). expire_overdue_memberships()
    // filters WHERE status = 'Active' AND end_date < current_date; a plain
    // status index still scans every Active row before checking end_date,
    // and Active is a small fraction of a table with years of Expired/
    // Cancelled history. This partial index holds only Active rows and is
    // sorted by end_date, matching the cron's predicate exactly.
    index("gym_memberships_active_enddate_idx")
      .on(t.endDate)
      .where(sql`status = 'Active'`),
    // Billing scans "Active rows per gym" constantly — composite index for that exact query.
    index("gym_memberships_billing_idx").on(t.gymId, t.status),
    uniqueIndex("one_active_membership_per_member_gym")
      .on(t.memberId, t.gymId)
      .where(sql`${t.status} = 'Active'`),
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
// Trainer Assignments
// ============================================================================

export const trainerAssignments = pgTable(
  "trainer_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    trainerId: uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "cascade" }),

    isPrimary: boolean("is_primary").notNull().default(false), // NEW

    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    unassignedAt: timestamp("unassigned_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
  },
  (t) => [
    index("trainer_assignments_gym_member_idx").on(t.gymId, t.memberId),
    index("trainer_assignments_trainer_idx").on(t.trainerId),
    index("trainer_assignments_member_idx").on(t.memberId),

    // NEW — can't double-assign the same trainer to the same member while active
    uniqueIndex("trainer_assignments_unique_active")
      .on(t.gymId, t.memberId, t.trainerId)
      .where(sql`is_active = true`),

    // NEW — at most one primary trainer per member, per gym, while active
    uniqueIndex("trainer_assignments_one_primary_per_member")
      .on(t.gymId, t.memberId)
      .where(sql`is_active = true and is_primary = true`),
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

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),
    gymMembershipId: uuid("gym_membership_id").references(
      () => gymMemberships.id,
      { onDelete: "set null" },
    ),

    receiptId: varchar("receipt_id", { length: 20 }), //this is temporarily unnecessary

    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    paymentDate: date("payment_date"),
    dueDate: date("due_date"),
    method: paymentMethodEnum("method"),
    status: paymentStatusEnum("status")
      .notNull()
      .default("PendingVerification"),

    gatewayProvider: text("gateway_provider"),
    gatewayPaymentId: text("gateway_payment_id"),
    gatewayOrderId: text("gateway_order_id"),
    transactionRef: text("transaction_ref"),

    collectedBy: uuid("collected_by").references(() => users.id),
    verifiedBy: uuid("verified_by").references(() => users.id),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("payments_gym_idx").on(t.gymId),
    index("payments_member_idx").on(t.memberId),
    index("payments_membership_idx").on(t.gymMembershipId),
    index("payments_date_idx").on(t.paymentDate),
    // NEW — staff dashboard "outstanding payments at my gym". Partial on
    // the small set of non-final statuses keeps this index tiny relative
    // to years of Verified/Refunded/Cancelled history.
    index("payments_gym_status_idx")
      .on(t.gymId, t.status)
      .where(sql`status in ('Pending', 'PendingVerification', 'Overdue')`),
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

export const paymentReceipts = pgTable(
  "payment_receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),

    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 20 }),
    isCurrent: boolean("is_current").notNull().default(true),

    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("payment_receipts_payment_idx").on(t.paymentId),
    // NEW — speeds up "get the current receipt for a payment" AND, being
    // a unique partial index, enforces "only one is_current=true receipt
    // per payment" at the database level instead of only by app convention.
    uniqueIndex("payment_receipts_current_idx")
      .on(t.paymentId)
      .where(sql`is_current = true`),
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

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    gymMembershipId: uuid("gym_membership_id")
      .notNull()
      .references(() => gymMemberships.id, { onDelete: "restrict" }),
    qrCodeId: uuid("qr_code_id").references(() => gymQrCodes.id, {
      onDelete: "set null",
    }),
    locationId: uuid("location_id").references(() => gymLocations.id, {
      onDelete: "set null",
    }),

    attendanceDate: date("attendance_date").notNull(),
    checkIn: timestamp("check_in", { withTimezone: true }),
    checkOut: timestamp("check_out", { withTimezone: true }),
    durationMinutes: integer("duration_minutes"),
    status: attendanceStatusEnum("status").notNull().default("CheckedIn"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Leading on (memberId, gymId, attendanceDate) — this is THE index the
    // QR check-in/check-out flow hits: exact match on all three columns to
    // decide "insert (check-in)" vs "update (check-out)". Already optimal,
    // unchanged.
    uniqueIndex("attendance_member_gym_date_idx").on(
      t.memberId,
      t.gymId,
      t.attendanceDate,
    ),
    index("attendance_gym_date_idx").on(t.gymId, t.attendanceDate),
    // NEW — a member's attendance history across ALL gyms, most recent
    // first. Not covered by the unique index above since gymId sits
    // between memberId and attendanceDate in that one.
    index("attendance_member_date_idx").on(
      t.memberId,
      sql`${t.attendanceDate} desc`,
    ),
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

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    equipment: text("equipment").notNull(),
    muscleGroup: muscleGroupEnum("muscle_group").notNull(),
    description: text("description"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("exercises_name_idx").on(t.name),
    // NEW — gym-scoped exercise library browsing ("gym_id in MY_GYM_IDS").
    // Partial because gymId IS NULL rows (the global library) are a
    // separate, small, well-known set that doesn't benefit from this index.
    index("exercises_gym_idx")
      .on(t.gymId)
      .where(sql`gym_id is not null`),
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

export const workoutTemplates = pgTable(
  "workout_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    trainerId: uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    category: text("category").notNull(),
    workoutType: workoutTypeEnum("workout_type"),
    primaryGoal: primaryGoalEnum("primary_goal"),
    difficultyLevel: difficultyLevelEnum("difficulty_level"),
    description: text("description").notNull(),
    durationMinutes: smallint("duration_minutes"),
    targetMuscles: jsonb("target_muscles").$type<string[]>().default([]),
    status: templateStatusEnum("status").notNull().default("Draft"),
    equipment: jsonb("equipment").$type<string[]>().default([]),
    defaultRestSeconds: smallint("default_rest_seconds").default(60),

    additionalNotes: text("additional_notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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

export const templateExercises = pgTable(
  "template_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),

    position: smallint("position").notNull().default(0),
    sets: smallint("sets").notNull().default(3),
    reps: varchar("reps", { length: 20 }).notNull().default("10"),
    weight: varchar("weight", { length: 30 }).default(""),
    restSeconds: smallint("rest_seconds").default(60),
  },
  (t) => [
    index("template_exercises_template_idx").on(t.templateId),
    // NEW — minor, low-priority. Only matters for future "which templates
    // use exercise X" tooling; cheap to add now.
    index("template_exercises_exercise_idx").on(t.exerciseId),
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
    pgPolicy("Gym staff can delete template exercises", {
      for: "delete",
      to: authenticatedRole,
      using: sql`template_id in (select id from workout_templates where gym_id in ${STAFF_GYM_IDS})`,
    }),
  ],
).enableRLS();

// ============================================================================
// Training Sessions
// ============================================================================

export const trainingSessions = pgTable(
  "training_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    trainerId: uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "restrict" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),
    templateId: uuid("template_id").references(() => workoutTemplates.id, {
      onDelete: "set null",
    }),

    sessionName: text("session_name").notNull(),
    sessionDate: date("session_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    durationMinutes: smallint("duration_minutes"),

    workoutType: workoutTypeEnum("workout_type").notNull().default("Strength"),
    sessionType: sessionTypeEnum("session_type")
      .notNull()
      .default("Personal Training"),
    location: text("location"),
    status: sessionStatusEnum("status").notNull().default("Upcoming"),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    showRestTimer: boolean("show_rest_timer").default(true),
    defaultRestSeconds: smallint("default_rest_seconds").default(60),
    reminderMinutes: smallint("reminder_minutes").default(15),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("sessions_gym_date_idx").on(t.gymId, t.sessionDate),
    index("sessions_trainer_date_idx").on(t.trainerId, t.sessionDate),
    index("sessions_member_idx").on(t.memberId),
    // NEW — "today's / upcoming sessions at my gym" dashboard widget.
    // Partial on the one status dashboards actually filter for; Completed/
    // Cancelled history never enters this index.
    index("sessions_gym_status_date_idx")
      .on(t.gymId, t.status, t.sessionDate)
      .where(sql`status = 'Upcoming'`),
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
    pgPolicy("Members can update session status via exercise completion", {
      for: "update",
      to: authenticatedRole,
      using: sql`member_id = ${CURRENT_MEMBER_ID}`,
      withCheck: sql`member_id = ${CURRENT_MEMBER_ID}`,
    }),
  ],
).enableRLS();

export const sessionExercises = pgTable(
  "session_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => trainingSessions.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),

    position: smallint("position").notNull().default(0),
    sets: smallint("sets").notNull().default(3),
    reps: varchar("reps", { length: 20 }).notNull().default("10"),
    weight: varchar("weight", { length: 30 }).default(""),
    restSeconds: smallint("rest_seconds").default(60),

    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("session_exercises_session_idx").on(t.sessionId),
    index("session_exercises_exercise_idx").on(t.exerciseId),
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
    // NEW — without this, a member can view but never toggle their own
    // session's exercise checkboxes; only gym staff could mark things done.
    pgPolicy("Members can mark their own session exercises complete", {
      for: "update",
      to: authenticatedRole,
      using: sql`session_id in (select id from training_sessions where member_id = ${CURRENT_MEMBER_ID})`,
      withCheck: sql`session_id in (select id from training_sessions where member_id = ${CURRENT_MEMBER_ID})`,
    }),
  ],
).enableRLS();

// ============================================================================
// Messages & Notifications
// ============================================================================

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: uuid("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    subject: text("subject"),
    body: text("body").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("messages_receiver_idx").on(t.receiverId),
    index("messages_sender_idx").on(t.senderId),
    // NEW — unread inbox count/list is a standing query shape; this avoids
    // a heap re-check of is_read for every row the plain receiver index
    // would otherwise surface.
    index("messages_receiver_unread_idx")
      .on(t.receiverId, t.isRead)
      .where(sql`is_read = false`),
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

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 50 }).notNull(),
    title: text("title").notNull(),
    body: text("body"),
    data: jsonb("data").$type<Record<string, unknown>>().default({}),

    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Already covers both "all my notifications" and "my unread
    // notifications" via leftmost-prefix — no change needed.
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
// ============================================================================

export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).notNull(),
    billingModel: billingModelEnum("billing_model")
      .notNull()
      .default("PerMember"),

    maxMembers: integer("max_members"),
    pricePerMember: numeric("price_per_member", { precision: 10, scale: 2 }),
    flatPrice: numeric("flat_price", { precision: 10, scale: 2 }),

    features: jsonb("features").$type<string[]>().default([]),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Table stays in the single-digit-to-low-dozens row range for the
    // life of the product (pricing tiers) — no index beyond the PK is
    // ever worth its write cost here, regardless of scale elsewhere.
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

export const gymSubscriptions = pgTable(
  "gym_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: "restrict" }),

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

    status: subscriptionBillingStatusEnum("status")
      .notNull()
      .default("Pending"),
    razorpaySubscriptionId: text("razorpay_subscription_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("gym_subscriptions_gym_idx").on(t.gymId),
    // CHANGED — was a plain (non-unique) index("gym_subscriptions_period_idx")
    // on (gymId, billingPeriodStart), which exactly duplicated the unique
    // index the 006 migration adds via raw SQL for idempotency
    // (ON CONFLICT (gym_id, billing_period_start) DO NOTHING). Mirrored
    // here directly as unique instead of keeping both.
    uniqueIndex("gym_subscriptions_gym_period_idx").on(
      t.gymId,
      t.billingPeriodStart,
    ),
    // NEW — the critical index for the daily mark_overdue_gym_subscriptions()
    // cron: WHERE status = 'Pending' AND due_date < current_date. Was
    // completely unindexed; partial predicate means this only ever holds
    // currently-unpaid invoices, never the years of Paid/Cancelled history.
    index("gym_subscriptions_overdue_check_idx")
      .on(t.dueDate)
      .where(sql`status = 'Pending'`),
    pgPolicy("Gym owners can view their own billing history", {
      for: "select",
      to: authenticatedRole,
      using: sql`gym_id in (select id from gyms where owner_id = ${CURRENT_USER_ID})`,
    }),
  ],
).enableRLS();

export const subscriptionPayments = pgTable(
  "subscription_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymSubscriptionId: uuid("gym_subscription_id")
      .notNull()
      .references(() => gymSubscriptions.id, { onDelete: "cascade" }),

    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum("payment_method"),
    gatewayProvider: text("gateway_provider").default("razorpay"),
    gatewayPaymentId: text("gateway_payment_id"),
    gatewayOrderId: text("gateway_order_id"),
    status: gatewayPaymentStatusEnum("status").notNull().default("Created"),

    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("subscription_payments_subscription_idx").on(t.gymSubscriptionId),
    // NEW — critical. record_subscription_payment_captured() (your
    // Razorpay webhook handler) looks up rows by gateway_order_id with
    // zero index backing today: every webhook call was a full table scan.
    // Unique because one gateway order should map to exactly one payment
    // row (create_subscription_payment_order enforces that on the write side).
    uniqueIndex("subscription_payments_gateway_order_idx")
      .on(t.gatewayOrderId)
      .where(sql`gateway_order_id is not null`),
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

export const systemSettings = pgTable(
  "system_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 100 }).notNull(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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
// Relations (unchanged)
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  ownedGym: one(gyms, { fields: [users.id], references: [gyms.ownerId] }),
  trainerProfiles: many(trainers),
  memberProfile: one(members, {
    fields: [users.id],
    references: [members.profileId],
  }),
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

export const gymLocationsRelations = relations(
  gymLocations,
  ({ one, many }) => ({
    gym: one(gyms, { fields: [gymLocations.gymId], references: [gyms.id] }),
    qrCodes: many(gymQrCodes),
  }),
);

export const gymQrCodesRelations = relations(gymQrCodes, ({ one }) => ({
  gym: one(gyms, { fields: [gymQrCodes.gymId], references: [gyms.id] }),
  location: one(gymLocations, {
    fields: [gymQrCodes.locationId],
    references: [gymLocations.id],
  }),
}));

export const membershipPlansRelations = relations(
  membershipPlans,
  ({ one, many }) => ({
    gym: one(gyms, { fields: [membershipPlans.gymId], references: [gyms.id] }),
    applications: many(membershipApplications),
    memberships: many(gymMemberships),
  }),
);

export const trainersRelations = relations(trainers, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [trainers.profileId],
    references: [profiles.id],
  }),
  gym: one(gyms, { fields: [trainers.gymId], references: [gyms.id] }),
  assignments: many(trainerAssignments),
  templates: many(workoutTemplates),
  sessions: many(trainingSessions),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [members.profileId],
    references: [profiles.id],
  }),
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

export const membershipApplicationsRelations = relations(
  membershipApplications,
  ({ one, many }) => ({
    gym: one(gyms, {
      fields: [membershipApplications.gymId],
      references: [gyms.id],
    }),
    member: one(members, {
      fields: [membershipApplications.memberId],
      references: [members.id],
    }),
    plan: one(membershipPlans, {
      fields: [membershipApplications.planId],
      references: [membershipPlans.id],
    }),
    reviewer: one(users, {
      fields: [membershipApplications.reviewedBy],
      references: [users.id],
    }),
    resultingMembership: many(gymMemberships),
  }),
);

export const gymMembershipsRelations = relations(
  gymMemberships,
  ({ one, many }) => ({
    gym: one(gyms, { fields: [gymMemberships.gymId], references: [gyms.id] }),
    member: one(members, {
      fields: [gymMemberships.memberId],
      references: [members.id],
    }),
    plan: one(membershipPlans, {
      fields: [gymMemberships.planId],
      references: [membershipPlans.id],
    }),
    application: one(membershipApplications, {
      fields: [gymMemberships.applicationId],
      references: [membershipApplications.id],
    }),
    payments: many(payments),
    attendanceRecords: many(attendance),
  }),
);

export const trainerAssignmentsRelations = relations(
  trainerAssignments,
  ({ one }) => ({
    gym: one(gyms, {
      fields: [trainerAssignments.gymId],
      references: [gyms.id],
    }),
    member: one(members, {
      fields: [trainerAssignments.memberId],
      references: [members.id],
    }),
    trainer: one(trainers, {
      fields: [trainerAssignments.trainerId],
      references: [trainers.id],
    }),
  }),
);

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  gym: one(gyms, { fields: [payments.gymId], references: [gyms.id] }),
  member: one(members, {
    fields: [payments.memberId],
    references: [members.id],
  }),
  gymMembership: one(gymMemberships, {
    fields: [payments.gymMembershipId],
    references: [gymMemberships.id],
  }),
  receipts: many(paymentReceipts),
}));

export const paymentReceiptsRelations = relations(
  paymentReceipts,
  ({ one }) => ({
    payment: one(payments, {
      fields: [paymentReceipts.paymentId],
      references: [payments.id],
    }),
    uploader: one(users, {
      fields: [paymentReceipts.uploadedBy],
      references: [users.id],
    }),
  }),
);

export const attendanceRelations = relations(attendance, ({ one }) => ({
  gym: one(gyms, { fields: [attendance.gymId], references: [gyms.id] }),
  member: one(members, {
    fields: [attendance.memberId],
    references: [members.id],
  }),
  gymMembership: one(gymMemberships, {
    fields: [attendance.gymMembershipId],
    references: [gymMemberships.id],
  }),
  qrCode: one(gymQrCodes, {
    fields: [attendance.qrCodeId],
    references: [gymQrCodes.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  gym: one(gyms, { fields: [exercises.gymId], references: [gyms.id] }),
  templateExercises: many(templateExercises),
  sessionExercises: many(sessionExercises),
}));

export const workoutTemplatesRelations = relations(
  workoutTemplates,
  ({ one, many }) => ({
    gym: one(gyms, { fields: [workoutTemplates.gymId], references: [gyms.id] }),
    trainer: one(trainers, {
      fields: [workoutTemplates.trainerId],
      references: [trainers.id],
    }),
    exercises: many(templateExercises),
    sessions: many(trainingSessions),
  }),
);

export const templateExercisesRelations = relations(
  templateExercises,
  ({ one }) => ({
    template: one(workoutTemplates, {
      fields: [templateExercises.templateId],
      references: [workoutTemplates.id],
    }),
    exercise: one(exercises, {
      fields: [templateExercises.exerciseId],
      references: [exercises.id],
    }),
  }),
);

export const trainingSessionsRelations = relations(
  trainingSessions,
  ({ one, many }) => ({
    gym: one(gyms, { fields: [trainingSessions.gymId], references: [gyms.id] }),
    trainer: one(trainers, {
      fields: [trainingSessions.trainerId],
      references: [trainers.id],
    }),
    member: one(members, {
      fields: [trainingSessions.memberId],
      references: [members.id],
    }),
    template: one(workoutTemplates, {
      fields: [trainingSessions.templateId],
      references: [workoutTemplates.id],
    }),
    exercises: many(sessionExercises),
  }),
);

export const sessionExercisesRelations = relations(
  sessionExercises,
  ({ one }) => ({
    session: one(trainingSessions, {
      fields: [sessionExercises.sessionId],
      references: [trainingSessions.id],
    }),
    exercise: one(exercises, {
      fields: [sessionExercises.exerciseId],
      references: [exercises.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  gym: one(gyms, { fields: [messages.gymId], references: [gyms.id] }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  gym: one(gyms, { fields: [notifications.gymId], references: [gyms.id] }),
}));

export const subscriptionPlansRelations = relations(
  subscriptionPlans,
  ({ many }) => ({
    gymSubscriptions: many(gymSubscriptions),
  }),
);

export const gymSubscriptionsRelations = relations(
  gymSubscriptions,
  ({ one, many }) => ({
    gym: one(gyms, { fields: [gymSubscriptions.gymId], references: [gyms.id] }),
    plan: one(subscriptionPlans, {
      fields: [gymSubscriptions.planId],
      references: [subscriptionPlans.id],
    }),
    payments: many(subscriptionPayments),
  }),
);

export const subscriptionPaymentsRelations = relations(
  subscriptionPayments,
  ({ one }) => ({
    gymSubscription: one(gymSubscriptions, {
      fields: [subscriptionPayments.gymSubscriptionId],
      references: [gymSubscriptions.id],
    }),
  }),
);

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  gym: one(gyms, { fields: [systemSettings.gymId], references: [gyms.id] }),
}));
