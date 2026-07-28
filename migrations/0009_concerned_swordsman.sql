ALTER TABLE "members" ALTER COLUMN "profile_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "contact_email" varchar(320);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "contact_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "clerk_invitation_id" varchar(255);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "invitation_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "invitation_accepted_at" timestamp with time zone;