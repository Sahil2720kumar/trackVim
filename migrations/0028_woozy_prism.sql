CREATE INDEX "members_contact_email_idx" ON "members" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "members_invited_email_idx" ON "members" USING btree ("invited_email");--> statement-breakpoint
CREATE INDEX "trainers_gym_contact_email_idx" ON "trainers" USING btree ("gym_id","contact_email");--> statement-breakpoint
CREATE INDEX "trainers_gym_invited_email_idx" ON "trainers" USING btree ("gym_id","invited_email");