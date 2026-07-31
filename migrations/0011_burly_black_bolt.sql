CREATE TABLE "gym_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"photo_url" text NOT NULL,
	"storage_path" text,
	"caption" text,
	"is_cover" boolean DEFAULT false NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"status" "general_status" DEFAULT 'Active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "gym_photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "payment_qr_url" text;--> statement-breakpoint
ALTER TABLE "trainers" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "trainers" ADD COLUMN "contact_email" varchar(320);--> statement-breakpoint
ALTER TABLE "trainers" ADD COLUMN "contact_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "gym_photos" ADD CONSTRAINT "gym_photos_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_photos" ADD CONSTRAINT "gym_photos_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gym_photos_gym_idx" ON "gym_photos" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "gym_photos_uploaded_by_idx" ON "gym_photos" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "gym_photos_gym_sort_idx" ON "gym_photos" USING btree ("gym_id","is_cover","sort_order");--> statement-breakpoint
CREATE POLICY "Anyone connected to a gym can view its photos" ON "gym_photos" AS PERMISSIVE FOR SELECT TO "authenticated" USING (gym_id in (select public.my_gym_ids()) or gym_id in (select id from gyms where owner_id = public.current_user_id()));--> statement-breakpoint
CREATE POLICY "Owners can upload photos to their own gym" ON "gym_photos" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (gym_id in (select id from gyms where owner_id = public.current_user_id()));--> statement-breakpoint
CREATE POLICY "Owners can update their own gym's photos" ON "gym_photos" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (gym_id in (select id from gyms where owner_id = public.current_user_id())) WITH CHECK (gym_id in (select id from gyms where owner_id = public.current_user_id()));--> statement-breakpoint
CREATE POLICY "Owners can delete their own gym's photos" ON "gym_photos" AS PERMISSIVE FOR DELETE TO "authenticated" USING (gym_id in (select id from gyms where owner_id = public.current_user_id()));