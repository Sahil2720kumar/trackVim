ALTER TABLE "membership_applications" ADD COLUMN "applicant_notes" jsonb;--> statement-breakpoint
CREATE POLICY "Anyone can view gym photos" ON "gym_photos" AS PERMISSIVE FOR SELECT TO "authenticated" USING (deleted_at is null);--> statement-breakpoint
CREATE POLICY "Anyone can view active trainers" ON "trainers" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
    status = 'Active'
  );