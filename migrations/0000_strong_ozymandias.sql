CREATE TYPE "public"."billing_period" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."gym_access_status" AS ENUM('trial', 'active', 'halted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."gym_subscription_status" AS ENUM('created', 'active', 'halted', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'trainer', 'member');--> statement-breakpoint
CREATE TABLE "gym_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"razorpay_sub_id" text NOT NULL,
	"razorpay_payment_id" text,
	"status" "gym_subscription_status" DEFAULT 'created' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gym_subscriptions_razorpay_sub_id_unique" UNIQUE("razorpay_sub_id")
);
--> statement-breakpoint
CREATE TABLE "gyms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address" text,
	"owner_id" uuid NOT NULL,
	"subscription_status" "gym_access_status" DEFAULT 'trial' NOT NULL,
	"trial_ends_at" timestamp,
	"subscription_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gyms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payment_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_subscription_id" uuid NOT NULL,
	"razorpay_payment_id" text,
	"razorpay_event" text NOT NULL,
	"amount_inr" integer,
	"status" "payment_status" NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"razorpay_plan_id" text NOT NULL,
	"price_inr" integer NOT NULL,
	"billing_period" "billing_period" NOT NULL,
	"features" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_razorpay_plan_id_unique" UNIQUE("razorpay_plan_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "role",
	"gym_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD CONSTRAINT "gym_subscriptions_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD CONSTRAINT "gym_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_gym_subscription_id_gym_subscriptions_id_fk" FOREIGN KEY ("gym_subscription_id") REFERENCES "public"."gym_subscriptions"("id") ON DELETE no action ON UPDATE no action;