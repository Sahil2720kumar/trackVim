ALTER TABLE "users" DROP CONSTRAINT "users_clerk_id_unique";--> statement-breakpoint
DROP INDEX "members_contact_email_idx";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
DROP INDEX "users_username_idx";--> statement-breakpoint
DROP INDEX "users_clerk_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "members_contact_email_unique_idx" ON "members" USING btree ("contact_email");--> statement-breakpoint
CREATE UNIQUE INDEX "members_contact_phone_unique_idx" ON "members" USING btree ("contact_phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_id_unique_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_unique_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique_idx" ON "users" USING btree ("username");