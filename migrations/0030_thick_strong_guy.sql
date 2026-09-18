CREATE TYPE "public"."bug_report_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."bug_report_status" AS ENUM('Open', 'In Progress', 'Resolved', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('Pending', 'In Progress', 'Resolved', 'Closed');--> statement-breakpoint
CREATE TABLE "bug_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar(50) NOT NULL,
	"user_id" uuid,
	"title" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"severity" "bug_report_severity" DEFAULT 'medium' NOT NULL,
	"where_occurred" varchar(255),
	"description" text NOT NULL,
	"steps_to_reproduce" text,
	"expected_behavior" text,
	"actual_behavior" text,
	"contact_email" varchar(255) NOT NULL,
	"browser_info" varchar(255),
	"os_info" varchar(100),
	"reported_path" varchar(500),
	"screenshot_url" text,
	"status" "bug_report_status" DEFAULT 'Open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bug_reports_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
ALTER TABLE "bug_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(100) NOT NULL,
	"topic" varchar(100) NOT NULL,
	"subject" varchar(255),
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bug_reports_report_id_idx" ON "bug_reports" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "bug_reports_contact_email_idx" ON "bug_reports" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "bug_reports_status_idx" ON "bug_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bug_reports_user_id_idx" ON "bug_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contact_submissions_email_idx" ON "contact_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_submissions_user_id_idx" ON "contact_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "Anyone (authenticated or anonymous) can submit a bug report" ON "bug_reports" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Users can view their own bug reports" ON "bug_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (user_id = public.current_user_id());--> statement-breakpoint
CREATE POLICY "Anyone (authenticated or anonymous) can submit a contact form" ON "contact_submissions" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Users can view their own contact submissions" ON "contact_submissions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (user_id = public.current_user_id());