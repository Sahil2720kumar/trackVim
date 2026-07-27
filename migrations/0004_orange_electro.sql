CREATE TYPE "public"."application_status" AS ENUM('Pending', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('CheckedIn', 'CheckedOut');--> statement-breakpoint
CREATE TYPE "public"."billing_model" AS ENUM('PerMember', 'Flat');--> statement-breakpoint
CREATE TYPE "public"."blood_group" AS ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('Beginner', 'Intermediate', 'Advanced');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('Percentage', 'Amount');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('Full Time', 'Part Time', 'Contract');--> statement-breakpoint
CREATE TYPE "public"."enrollment_mode" AS ENUM('Open', 'Invite Only');--> statement-breakpoint
CREATE TYPE "public"."gateway_payment_status" AS ENUM('Created', 'Authorized', 'Captured', 'Failed', 'Refunded');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('Male', 'Female', 'Other');--> statement-breakpoint
CREATE TYPE "public"."general_status" AS ENUM('Active', 'Inactive', 'Suspended', 'Pending');--> statement-breakpoint
CREATE TYPE "public"."gym_membership_status" AS ENUM('PaymentPending', 'PaymentUploaded', 'PaymentRejected', 'Active', 'Expired', 'Cancelled', 'Frozen');--> statement-breakpoint
CREATE TYPE "public"."muscle_group" AS ENUM('Back', 'Biceps', 'Triceps', 'Chest', 'Shoulders', 'Rear Delts', 'Legs', 'Core', 'Full Body', 'Glutes', 'Forearms', 'Traps');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('Cash', 'UPI', 'Card', 'Bank Transfer', 'Net Banking', 'Razorpay');--> statement-breakpoint
CREATE TYPE "public"."plan_category" AS ENUM('Standard', 'Premium', 'VIP', 'Student', 'Corporate', 'Personal Training');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('Active', 'Draft', 'Hidden');--> statement-breakpoint
CREATE TYPE "public"."pricing_type" AS ENUM('Fixed', 'Recurring');--> statement-breakpoint
CREATE TYPE "public"."primary_goal" AS ENUM('Muscle Gain', 'Fat Loss', 'Strength', 'Endurance', 'Athletic Performance');--> statement-breakpoint
CREATE TYPE "public"."qr_code_type" AS ENUM('Static', 'Rotating');--> statement-breakpoint
CREATE TYPE "public"."relationship" AS ENUM('Mother', 'Father', 'Sister', 'Brother', 'Spouse', 'Sibling', 'Friend', 'Other');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('Upcoming', 'InProgress', 'Completed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('Personal Training', 'Group Session', 'Assessment', 'Consultation');--> statement-breakpoint
CREATE TYPE "public"."subscription_billing_status" AS ENUM('Pending', 'Paid', 'Overdue', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."template_status" AS ENUM('Active', 'Draft', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."trainer_status" AS ENUM('Invited', 'Active', 'Busy', 'On Leave', 'Offline', 'Inactive');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'trainer', 'member');--> statement-breakpoint
CREATE TYPE "public"."validity_starts" AS ENUM('Immediately', 'From Joining Date', 'Custom Date');--> statement-breakpoint
CREATE TYPE "public"."workout_type" AS ENUM('Strength', 'Hypertrophy', 'Functional', 'Cardio', 'Mobility', 'Powerlifting', 'HIIT');--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"gym_membership_id" uuid NOT NULL,
	"qr_code_id" uuid,
	"location_id" uuid,
	"attendance_date" date NOT NULL,
	"check_in" timestamp with time zone,
	"check_out" timestamp with time zone,
	"duration_minutes" integer,
	"status" "attendance_status" DEFAULT 'CheckedIn' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid,
	"name" text NOT NULL,
	"equipment" text NOT NULL,
	"muscle_group" "muscle_group" NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gym_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"name" text DEFAULT 'Main Branch' NOT NULL,
	"address" text,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gym_locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gym_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"application_id" uuid,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"duration_months" smallint NOT NULL,
	"joining_fee" numeric(10, 2) DEFAULT '0',
	"plan_price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"final_amount" numeric(10, 2) NOT NULL,
	"status" "gym_membership_status" DEFAULT 'PaymentPending' NOT NULL,
	"payment_verification_required" boolean DEFAULT true NOT NULL,
	"activated_at" timestamp with time zone,
	"activated_by" uuid,
	"is_frozen" boolean DEFAULT false,
	"freeze_start_date" date,
	"freeze_end_date" date,
	"total_freeze_days" smallint DEFAULT 0,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gym_memberships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gym_qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"location_id" uuid,
	"label" text DEFAULT 'Entrance QR',
	"qr_identifier" varchar(64) NOT NULL,
	"signature_secret" text NOT NULL,
	"type" "qr_code_type" DEFAULT 'Static' NOT NULL,
	"rotating_token" varchar(64),
	"token_expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gym_qr_codes_qr_identifier_unique" UNIQUE("qr_identifier")
);
--> statement-breakpoint
ALTER TABLE "gym_qr_codes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"member_code" varchar(20),
	"date_of_birth" date,
	"gender" "gender",
	"occupation" text,
	"blood_group" "blood_group",
	"photo_url" text,
	"address" text,
	"city" text,
	"state" text,
	"pin_code" varchar(20),
	"height_cm" numeric(5, 1),
	"weight_kg" numeric(5, 1),
	"fitness_goal" text,
	"medical_conditions" text,
	"allergies" text,
	"physical_notes" text,
	"emergency_contact_name" text,
	"emergency_contact_relationship" "relationship",
	"emergency_contact_phone" varchar(20),
	"emergency_contact_address" text,
	"active_gym_membership_id" uuid,
	"account_status" "general_status" DEFAULT 'Active' NOT NULL,
	"additional_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "members_member_code_unique" UNIQUE("member_code")
);
--> statement-breakpoint
ALTER TABLE "members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "membership_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'Pending' NOT NULL,
	"message" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "membership_applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "membership_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"plan_name" text NOT NULL,
	"short_description" text NOT NULL,
	"plan_category" "plan_category",
	"plan_color" varchar(7),
	"plan_icon" varchar(30),
	"plan_price" numeric(10, 2) NOT NULL,
	"joining_fee" numeric(10, 2) DEFAULT '0',
	"security_deposit" numeric(10, 2) DEFAULT '0',
	"pricing_type" "pricing_type" DEFAULT 'Recurring',
	"discount_type" "discount_type",
	"discount_value" numeric(6, 2),
	"membership_duration" text NOT NULL,
	"duration_months" smallint NOT NULL,
	"validity_starts" "validity_starts" DEFAULT 'From Joining Date',
	"grace_period_days" smallint DEFAULT 0,
	"allow_freeze" boolean DEFAULT false,
	"max_freeze_days" smallint,
	"selected_features" jsonb DEFAULT '[]'::jsonb,
	"custom_features" jsonb DEFAULT '[]'::jsonb,
	"minimum_age" smallint DEFAULT 14,
	"maximum_age" smallint DEFAULT 80,
	"max_active_members" integer,
	"enrollment_mode" "enrollment_mode" DEFAULT 'Open',
	"cancellation_allowed" boolean DEFAULT true,
	"status" "plan_status" DEFAULT 'Active' NOT NULL,
	"visibility" text DEFAULT 'Visible to Everyone',
	"is_featured" boolean DEFAULT false,
	"additional_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "membership_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gym_id" uuid,
	"type" varchar(50) NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"data" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payment_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_type" varchar(20),
	"is_current" boolean DEFAULT true NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_receipts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"gym_membership_id" uuid,
	"receipt_id" varchar(20),
	"amount" numeric(10, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"due_date" date,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'PendingVerification' NOT NULL,
	"gateway_provider" text,
	"gateway_payment_id" text,
	"gateway_order_id" text,
	"transaction_ref" text,
	"collected_by" uuid,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"rejection_reason" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "session_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"sets" smallint DEFAULT 3 NOT NULL,
	"reps" varchar(20) DEFAULT '10' NOT NULL,
	"weight" varchar(30) DEFAULT '',
	"rest_seconds" smallint DEFAULT 60
);
--> statement-breakpoint
ALTER TABLE "session_exercises" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscription_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_subscription_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" "payment_method",
	"gateway_provider" text DEFAULT 'razorpay',
	"gateway_payment_id" text,
	"gateway_order_id" text,
	"status" "gateway_payment_status" DEFAULT 'Created' NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription_payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "system_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "template_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"sets" smallint DEFAULT 3 NOT NULL,
	"reps" varchar(20) DEFAULT '10' NOT NULL,
	"weight" varchar(30) DEFAULT '',
	"rest_seconds" smallint DEFAULT 60
);
--> statement-breakpoint
ALTER TABLE "template_exercises" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "trainer_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"trainer_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unassigned_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "trainer_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"gym_id" uuid NOT NULL,
	"invited_email" varchar(320),
	"clerk_invitation_id" varchar(255),
	"invitation_sent_at" timestamp with time zone,
	"invitation_accepted_at" timestamp with time zone,
	"employee_id" varchar(20),
	"gender" "gender",
	"date_of_birth" date,
	"professional_title" text,
	"bio" text,
	"joining_date" date,
	"experience_years" smallint DEFAULT 0,
	"qualification" text,
	"certification" text,
	"salary" numeric(10, 2),
	"employment_type" "employment_type" DEFAULT 'Full Time',
	"specializations" jsonb DEFAULT '[]'::jsonb,
	"max_members" smallint,
	"max_sessions_per_day" smallint,
	"working_days" jsonb DEFAULT '[]'::jsonb,
	"start_time" time,
	"end_time" time,
	"session_types" jsonb DEFAULT '[]'::jsonb,
	"accepting_new_members" boolean DEFAULT true,
	"languages" jsonb DEFAULT '[]'::jsonb,
	"instagram" text,
	"linkedin" text,
	"youtube" text,
	"website_url" text,
	"members_trained" integer DEFAULT 0,
	"completed_sessions" integer DEFAULT 0,
	"average_rating" numeric(3, 2),
	"total_reviews" integer DEFAULT 0,
	"retention_rate" numeric(5, 2),
	"coaching_experience" text,
	"training_philosophy" text,
	"emergency_contact_name" text,
	"emergency_relationship" "relationship",
	"emergency_phone" varchar(20),
	"emergency_alternate_phone" varchar(20),
	"address_line" text,
	"city" text,
	"state" text,
	"country" text DEFAULT 'India',
	"postal_code" varchar(20),
	"email_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT false,
	"push_notifications" boolean DEFAULT true,
	"two_factor_enabled" boolean DEFAULT false,
	"additional_notes" text,
	"status" "trainer_status" DEFAULT 'Invited' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "trainers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"trainer_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"template_id" uuid,
	"session_name" text NOT NULL,
	"session_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"duration_minutes" smallint,
	"workout_type" "workout_type" DEFAULT 'Strength' NOT NULL,
	"session_type" "session_type" DEFAULT 'Personal Training' NOT NULL,
	"location" text,
	"status" "session_status" DEFAULT 'Upcoming' NOT NULL,
	"completed_at" timestamp with time zone,
	"show_rest_timer" boolean DEFAULT true,
	"default_rest_seconds" smallint DEFAULT 60,
	"reminder_minutes" smallint DEFAULT 15,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "training_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"trainer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"workout_type" "workout_type",
	"primary_goal" "primary_goal",
	"difficulty_level" "difficulty_level",
	"description" text NOT NULL,
	"duration_minutes" smallint,
	"target_muscles" jsonb DEFAULT '[]'::jsonb,
	"status" "template_status" DEFAULT 'Draft' NOT NULL,
	"additional_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gyms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscription_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payment_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "payment_logs" CASCADE;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" DROP CONSTRAINT "gym_subscriptions_razorpay_sub_id_unique";--> statement-breakpoint
ALTER TABLE "subscription_plans" DROP CONSTRAINT "subscription_plans_razorpay_plan_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "gym_subscriptions" DROP CONSTRAINT "gym_subscriptions_plan_id_subscription_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "gyms" DROP CONSTRAINT "gyms_subscription_id_gym_subscriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_gym_id_gyms_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PendingVerification'::text;--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PendingVerification', 'Verified', 'Rejected', 'Partial', 'Overdue', 'Refunded', 'Cancelled');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PendingVerification'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ALTER COLUMN "status" SET DATA TYPE "public"."subscription_billing_status" USING "status"::text::"public"."subscription_billing_status";--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ALTER COLUMN "status" SET DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "gyms" ALTER COLUMN "code" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "gyms" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gyms" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "gyms" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gyms" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscription_plans" ALTER COLUMN "name" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "subscription_plans" ALTER COLUMN "features" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "subscription_plans" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscription_plans" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscription_plans" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscription_plans" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "clerk_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "clerk_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(320);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::text::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "billing_period_start" date NOT NULL;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "billing_period_end" date NOT NULL;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "active_member_count" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "price_per_member" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "total_amount" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "razorpay_subscription_id" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "gym_short_name" varchar(10);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "gym_description" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "contact_email" varchar(320);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "contact_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "owner_name" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "business_name" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "business_email" varchar(320);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "business_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "address_line1" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "address_line2" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "postal_code" varchar(20);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "country" text DEFAULT 'India' NOT NULL;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "timezone" text DEFAULT 'Asia/Kolkata' NOT NULL;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "gst_registered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "gstin" varchar(20);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "legal_business_name" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "billing_address" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "gst_state" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "state_code" varchar(5);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "place_of_supply" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "sac_code" varchar(50);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "number_of_floors" smallint;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "number_of_rooms" smallint;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "has_washroom" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "washroom_count" smallint;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "has_sauna_room" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "sauna_room_count" smallint;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "has_steam_room" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "steam_room_count" smallint;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "has_shower_room" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "shower_room_count" smallint;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "has_locker_room" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "locker_room_count" smallint;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "facility_notes" text;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "amenities" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "equipment" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "status" "general_status" DEFAULT 'Active' NOT NULL;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "billing_model" "billing_model" DEFAULT 'PerMember' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "max_members" integer;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "price_per_member" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "flat_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_status" "general_status" DEFAULT 'Active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_gym_membership_id_gym_memberships_id_fk" FOREIGN KEY ("gym_membership_id") REFERENCES "public"."gym_memberships"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_qr_code_id_gym_qr_codes_id_fk" FOREIGN KEY ("qr_code_id") REFERENCES "public"."gym_qr_codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_location_id_gym_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."gym_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_locations" ADD CONSTRAINT "gym_locations_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_memberships" ADD CONSTRAINT "gym_memberships_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_memberships" ADD CONSTRAINT "gym_memberships_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_memberships" ADD CONSTRAINT "gym_memberships_plan_id_membership_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_memberships" ADD CONSTRAINT "gym_memberships_application_id_membership_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."membership_applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_memberships" ADD CONSTRAINT "gym_memberships_activated_by_users_id_fk" FOREIGN KEY ("activated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_qr_codes" ADD CONSTRAINT "gym_qr_codes_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_qr_codes" ADD CONSTRAINT "gym_qr_codes_location_id_gym_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."gym_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_active_gym_membership_id_gym_memberships_id_fk" FOREIGN KEY ("active_gym_membership_id") REFERENCES "public"."gym_memberships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_plan_id_membership_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD CONSTRAINT "membership_plans_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_gym_membership_id_gym_memberships_id_fk" FOREIGN KEY ("gym_membership_id") REFERENCES "public"."gym_memberships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_collected_by_users_id_fk" FOREIGN KEY ("collected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_gym_subscription_id_gym_subscriptions_id_fk" FOREIGN KEY ("gym_subscription_id") REFERENCES "public"."gym_subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_template_id_workout_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workout_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_template_id_workout_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workout_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_templates" ADD CONSTRAINT "workout_templates_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_templates" ADD CONSTRAINT "workout_templates_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_member_gym_date_idx" ON "attendance" USING btree ("member_id","gym_id","attendance_date");--> statement-breakpoint
CREATE INDEX "attendance_gym_date_idx" ON "attendance" USING btree ("gym_id","attendance_date");--> statement-breakpoint
CREATE INDEX "exercises_name_idx" ON "exercises" USING btree ("name");--> statement-breakpoint
CREATE INDEX "gym_locations_gym_idx" ON "gym_locations" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "gym_memberships_gym_idx" ON "gym_memberships" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "gym_memberships_member_idx" ON "gym_memberships" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "gym_memberships_gym_member_idx" ON "gym_memberships" USING btree ("gym_id","member_id");--> statement-breakpoint
CREATE INDEX "gym_memberships_status_idx" ON "gym_memberships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gym_memberships_billing_idx" ON "gym_memberships" USING btree ("gym_id","status");--> statement-breakpoint
CREATE INDEX "gym_qr_codes_gym_idx" ON "gym_qr_codes" USING btree ("gym_id");--> statement-breakpoint
CREATE UNIQUE INDEX "members_profile_idx" ON "members" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "applications_gym_member_idx" ON "membership_applications" USING btree ("gym_id","member_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "membership_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "membership_plans_gym_idx" ON "membership_plans" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "messages_receiver_idx" ON "messages" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "payment_receipts_payment_idx" ON "payment_receipts" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "payments_gym_idx" ON "payments" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "payments_member_idx" ON "payments" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "payments_membership_idx" ON "payments" USING btree ("gym_membership_id");--> statement-breakpoint
CREATE INDEX "payments_date_idx" ON "payments" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "session_exercises_session_idx" ON "session_exercises" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "subscription_payments_subscription_idx" ON "subscription_payments" USING btree ("gym_subscription_id");--> statement-breakpoint
CREATE INDEX "system_settings_gym_key_idx" ON "system_settings" USING btree ("gym_id","key");--> statement-breakpoint
CREATE INDEX "template_exercises_template_idx" ON "template_exercises" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "trainer_assignments_gym_member_idx" ON "trainer_assignments" USING btree ("gym_id","member_id");--> statement-breakpoint
CREATE INDEX "trainer_assignments_trainer_idx" ON "trainer_assignments" USING btree ("trainer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trainers_profile_gym_idx" ON "trainers" USING btree ("profile_id","gym_id");--> statement-breakpoint
CREATE INDEX "trainers_gym_idx" ON "trainers" USING btree ("gym_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trainers_employee_id_gym_idx" ON "trainers" USING btree ("gym_id","employee_id");--> statement-breakpoint
CREATE INDEX "sessions_gym_date_idx" ON "training_sessions" USING btree ("gym_id","session_date");--> statement-breakpoint
CREATE INDEX "sessions_trainer_date_idx" ON "training_sessions" USING btree ("trainer_id","session_date");--> statement-breakpoint
CREATE INDEX "sessions_member_idx" ON "training_sessions" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "templates_gym_idx" ON "workout_templates" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "templates_trainer_idx" ON "workout_templates" USING btree ("trainer_id");--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD CONSTRAINT "gym_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gym_subscriptions_gym_idx" ON "gym_subscriptions" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "gym_subscriptions_period_idx" ON "gym_subscriptions" USING btree ("gym_id","billing_period_start");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
ALTER TABLE "gym_subscriptions" DROP COLUMN "razorpay_sub_id";--> statement-breakpoint
ALTER TABLE "gym_subscriptions" DROP COLUMN "razorpay_payment_id";--> statement-breakpoint
ALTER TABLE "gym_subscriptions" DROP COLUMN "current_period_start";--> statement-breakpoint
ALTER TABLE "gym_subscriptions" DROP COLUMN "current_period_end";--> statement-breakpoint
ALTER TABLE "gym_subscriptions" DROP COLUMN "trial_ends_at";--> statement-breakpoint
ALTER TABLE "gyms" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "gyms" DROP COLUMN "subscription_status";--> statement-breakpoint
ALTER TABLE "gyms" DROP COLUMN "trial_ends_at";--> statement-breakpoint
ALTER TABLE "gyms" DROP COLUMN "subscription_id";--> statement-breakpoint
ALTER TABLE "subscription_plans" DROP COLUMN "razorpay_plan_id";--> statement-breakpoint
ALTER TABLE "subscription_plans" DROP COLUMN "price_inr";--> statement-breakpoint
ALTER TABLE "subscription_plans" DROP COLUMN "billing_period";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "gym_id";--> statement-breakpoint
CREATE POLICY "Gym owners can view their own billing history" ON "gym_subscriptions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select id from gyms where owner_id = public.current_user_id()));--> statement-breakpoint
CREATE POLICY "Anyone connected to a gym can view it" ON "gyms" AS PERMISSIVE FOR SELECT TO "authenticated" USING (id in (select public.my_gym_ids()) or owner_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Users can create a gym they own" ON "gyms" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (owner_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Owners can update their own gym" ON "gyms" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (owner_id = public.current_user_id()) WITH CHECK (owner_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Any signed-in user can view subscription plans" ON "subscription_plans" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Users can view their own row" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING (clerk_id = (select auth.jwt()->>'sub'));--> statement-breakpoint
CREATE POLICY "Gym staff can view users connected to their gym" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        id in (select owner_id from gyms where id in (select public.my_gym_ids()))
        or id in (select profile_id from trainers where gym_id in (select public.my_gym_ids()))
        or id in (
          select profile_id from members
          where id in (select member_id from gym_memberships where gym_id in (select public.my_gym_ids()))
        )
      );--> statement-breakpoint
CREATE POLICY "Users can update their own row" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (clerk_id = (select auth.jwt()->>'sub')) WITH CHECK (clerk_id = (select auth.jwt()->>'sub'));--> statement-breakpoint
CREATE POLICY "Members can view their own attendance" ON "attendance" AS PERMISSIVE FOR SELECT TO "authenticated" USING (member_id = public.current_member_id());--> statement-breakpoint
CREATE POLICY "Gym staff can view attendance at their gym" ON "attendance" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Members or gym staff can check in" ON "attendance" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (member_id = public.current_member_id() or gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Members or gym staff can check out / correct attendance" ON "attendance" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (member_id = public.current_member_id() or gym_id in (select public.staff_gym_ids())) WITH CHECK (member_id = public.current_member_id() or gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Global exercises are visible to everyone signed in" ON "exercises" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id is null or gym_id in (select public.my_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can add gym-specific exercises" ON "exercises" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can update their gym-specific exercises" ON "exercises" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Anyone connected to the gym can view its locations" ON "gym_locations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.my_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can manage locations" ON "gym_locations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can update locations" ON "gym_locations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Members can view their own memberships" ON "gym_memberships" AS PERMISSIVE FOR SELECT TO "authenticated" USING (member_id = public.current_member_id());--> statement-breakpoint
CREATE POLICY "Gym staff can view memberships at their gym" ON "gym_memberships" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can create memberships" ON "gym_memberships" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can update memberships" ON "gym_memberships" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can view QR codes" ON "gym_qr_codes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can manage QR codes" ON "gym_qr_codes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can update QR codes" ON "gym_qr_codes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Members can view their own profile" ON "members" AS PERMISSIVE FOR SELECT TO "authenticated" USING (profile_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Gym staff can view profiles of their members" ON "members" AS PERMISSIVE FOR SELECT TO "authenticated" USING (id in (select member_id from gym_memberships where gym_id in (select public.staff_gym_ids())));--> statement-breakpoint
CREATE POLICY "Users can create their own member profile" ON "members" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (profile_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Members or their gym staff can update the profile" ON "members" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
        profile_id = public.current_user_id()
        or id in (select member_id from gym_memberships where gym_id in (select public.staff_gym_ids()))
      ) WITH CHECK (
        profile_id = public.current_user_id()
        or id in (select member_id from gym_memberships where gym_id in (select public.staff_gym_ids()))
      );--> statement-breakpoint
CREATE POLICY "Members can view their own applications" ON "membership_applications" AS PERMISSIVE FOR SELECT TO "authenticated" USING (member_id = public.current_member_id());--> statement-breakpoint
CREATE POLICY "Gym staff can view applications to their gym" ON "membership_applications" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Members can apply to a gym" ON "membership_applications" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (member_id = public.current_member_id());--> statement-breakpoint
CREATE POLICY "Gym staff can review applications" ON "membership_applications" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Anyone connected to the gym can view its plans" ON "membership_plans" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.my_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can manage plans" ON "membership_plans" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can update plans" ON "membership_plans" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Participants can view their own messages" ON "messages" AS PERMISSIVE FOR SELECT TO "authenticated" USING (sender_id = public.current_user_id() or receiver_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Users can send messages as themselves" ON "messages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (sender_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Receivers can mark messages read" ON "messages" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (receiver_id = public.current_user_id()) WITH CHECK (receiver_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Users can view their own notifications" ON "notifications" AS PERMISSIVE FOR SELECT TO "authenticated" USING (user_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Users can mark their own notifications read" ON "notifications" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (user_id = public.current_user_id()) WITH CHECK (user_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Members or gym staff can view receipts for their payments" ON "payment_receipts" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        payment_id in (
          select id from payments
          where member_id = public.current_member_id() or gym_id in (select public.staff_gym_ids())
        )
      );--> statement-breakpoint
CREATE POLICY "Members or gym staff can upload receipts for their payments" ON "payment_receipts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        uploaded_by = public.current_user_id()
        and payment_id in (
          select id from payments
          where member_id = public.current_member_id() or gym_id in (select public.staff_gym_ids())
        )
      );--> statement-breakpoint
CREATE POLICY "Members can view their own payments" ON "payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (member_id = public.current_member_id());--> statement-breakpoint
CREATE POLICY "Gym staff can view payments at their gym" ON "payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Members or gym staff can record a payment" ON "payments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (member_id = public.current_member_id() or gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can verify or reject payments" ON "payments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Members or gym staff can view session exercises" ON "session_exercises" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        session_id in (
          select id from training_sessions
          where member_id = public.current_member_id() or gym_id in (select public.staff_gym_ids())
        )
      );--> statement-breakpoint
CREATE POLICY "Gym staff can manage session exercises" ON "session_exercises" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (session_id in (select id from training_sessions where gym_id in (select public.staff_gym_ids())));--> statement-breakpoint
CREATE POLICY "Gym staff can update session exercises" ON "session_exercises" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (session_id in (select id from training_sessions where gym_id in (select public.staff_gym_ids()))) WITH CHECK (session_id in (select id from training_sessions where gym_id in (select public.staff_gym_ids())));--> statement-breakpoint
CREATE POLICY "Gym owners can view their own subscription payments" ON "subscription_payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        gym_subscription_id in (
          select id from gym_subscriptions
          where gym_id in (select id from gyms where owner_id = public.current_user_id())
        )
      );--> statement-breakpoint
CREATE POLICY "Global settings are readable by anyone signed in" ON "system_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id is null);--> statement-breakpoint
CREATE POLICY "Gym owners can view their own gym settings" ON "system_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select id from gyms where owner_id = public.current_user_id()));--> statement-breakpoint
CREATE POLICY "Gym owners can create their own gym settings" ON "system_settings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select id from gyms where owner_id = public.current_user_id()));--> statement-breakpoint
CREATE POLICY "Gym owners can update their own gym settings" ON "system_settings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select id from gyms where owner_id = public.current_user_id())) WITH CHECK (gym_id in (select id from gyms where owner_id = public.current_user_id()));--> statement-breakpoint
CREATE POLICY "Anyone connected to the gym can view template exercises" ON "template_exercises" AS PERMISSIVE FOR SELECT TO "authenticated" USING (template_id in (select id from workout_templates where gym_id in (select public.my_gym_ids())));--> statement-breakpoint
CREATE POLICY "Gym staff can manage template exercises" ON "template_exercises" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (template_id in (select id from workout_templates where gym_id in (select public.staff_gym_ids())));--> statement-breakpoint
CREATE POLICY "Gym staff can update template exercises" ON "template_exercises" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (template_id in (select id from workout_templates where gym_id in (select public.staff_gym_ids()))) WITH CHECK (template_id in (select id from workout_templates where gym_id in (select public.staff_gym_ids())));--> statement-breakpoint
CREATE POLICY "Members can view their own trainer assignments" ON "trainer_assignments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (member_id = public.current_member_id());--> statement-breakpoint
CREATE POLICY "Gym staff can view assignments at their gym" ON "trainer_assignments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can manage trainer assignments" ON "trainer_assignments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can update trainer assignments" ON "trainer_assignments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Anyone connected to the gym can view its trainers" ON "trainers" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.my_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym owners can invite/manage trainers" ON "trainers" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select id from gyms where owner_id = public.current_user_id()));--> statement-breakpoint
CREATE POLICY "Gym staff or the trainer themself can update the row" ON "trainers" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids()) or profile_id = public.current_user_id()) WITH CHECK (gym_id in (select public.staff_gym_ids()) or profile_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Members can view their own sessions" ON "training_sessions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (member_id = public.current_member_id());--> statement-breakpoint
CREATE POLICY "Gym staff can view sessions at their gym" ON "training_sessions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can create sessions" ON "training_sessions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can update sessions" ON "training_sessions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Anyone connected to the gym can view its templates" ON "workout_templates" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.my_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can create templates" ON "workout_templates" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can update templates" ON "workout_templates" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
DROP TYPE "public"."billing_period";--> statement-breakpoint
DROP TYPE "public"."gym_access_status";--> statement-breakpoint
DROP TYPE "public"."gym_subscription_status";--> statement-breakpoint
DROP TYPE "public"."role";