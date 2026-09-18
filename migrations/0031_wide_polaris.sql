DROP POLICY "Anyone (authenticated or anonymous) can submit a bug report" ON "bug_reports" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone (authenticated or anonymous) can submit a contact form" ON "contact_submissions" CASCADE;--> statement-breakpoint
CREATE POLICY "Anyone can submit a bug report" ON "bug_reports" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Anyone can submit a contact form" ON "contact_submissions" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);