CREATE TYPE "public"."attendance_source" AS ENUM('MemberQr', 'MembershipCard', 'ReceptionManual');--> statement-breakpoint
CREATE TABLE "membership_qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"gym_membership_id" uuid NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_qr_codes_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "membership_qr_codes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "membership_qr_code_id" uuid;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "attendance_source" "attendance_source" DEFAULT 'MemberQr' NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_qr_codes" ADD CONSTRAINT "membership_qr_codes_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_qr_codes" ADD CONSTRAINT "membership_qr_codes_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_qr_codes" ADD CONSTRAINT "membership_qr_codes_gym_membership_id_gym_memberships_id_fk" FOREIGN KEY ("gym_membership_id") REFERENCES "public"."gym_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "membership_qr_codes_gym_idx" ON "membership_qr_codes" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "membership_qr_codes_member_idx" ON "membership_qr_codes" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "membership_qr_codes_membership_idx" ON "membership_qr_codes" USING btree ("gym_membership_id");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_qr_codes_one_active_per_membership_idx" ON "membership_qr_codes" USING btree ("gym_membership_id") WHERE "membership_qr_codes"."is_active" = true;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_membership_qr_code_id_membership_qr_codes_id_fk" FOREIGN KEY ("membership_qr_code_id") REFERENCES "public"."membership_qr_codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Gym staff can view membership QR codes" ON "membership_qr_codes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can create membership QR codes" ON "membership_qr_codes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select public.staff_gym_ids()));--> statement-breakpoint
CREATE POLICY "Gym staff can update membership QR codes" ON "membership_qr_codes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select public.staff_gym_ids())) WITH CHECK (gym_id in (select public.staff_gym_ids()));