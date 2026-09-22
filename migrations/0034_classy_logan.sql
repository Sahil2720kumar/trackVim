CREATE TYPE "public"."membership_source" AS ENUM('Application', 'Imported', 'WalkIn', 'Renewal');--> statement-breakpoint
CREATE TYPE "public"."payment_source" AS ENUM('Application', 'Imported', 'Manual');--> statement-breakpoint
DROP INDEX "membership_qr_codes_one_active_per_membership_idx";--> statement-breakpoint
ALTER TABLE "gym_memberships" ADD COLUMN "source" "membership_source" DEFAULT 'Application' NOT NULL;--> statement-breakpoint
ALTER TABLE "gym_memberships" ADD COLUMN "imported_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gym_memberships" ADD COLUMN "imported_by" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "source" "payment_source" DEFAULT 'Application' NOT NULL;--> statement-breakpoint
ALTER TABLE "gym_memberships" ADD CONSTRAINT "gym_memberships_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "membership_qr_codes_one_active_per_member_gym_idx" ON "membership_qr_codes" USING btree ("gym_id","member_id") WHERE "membership_qr_codes"."is_active" = true;