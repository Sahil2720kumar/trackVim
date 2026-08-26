CREATE TYPE "public"."gym_billing_status" AS ENUM('Trial', 'Active', 'Pending', 'Suspended', 'Cancelled');--> statement-breakpoint
DROP INDEX "gyms_billing_status_idx";--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "billing_status" "gym_billing_status" DEFAULT 'Trial' NOT NULL;--> statement-breakpoint
CREATE INDEX "gyms_billing_status_idx" ON "gyms" USING btree ("billing_status","billing_start_date") WHERE billing_start_date is not null;