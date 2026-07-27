ALTER TABLE "gym_subscriptions" ADD COLUMN "invoice_date" date;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "due_date" date;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "is_prorated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "proration_days" integer;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD COLUMN "proration_total_days" integer;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "billing_start_date" date;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "current_plan_id" uuid;--> statement-breakpoint
ALTER TABLE "gyms" ADD CONSTRAINT "gyms_current_plan_id_subscription_plans_id_fk" FOREIGN KEY ("current_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plan_price_check" CHECK (
        (
          billing_model = 'PerMember'
          AND price_per_member IS NOT NULL
          AND flat_price IS NULL
        )
        OR
        (
          billing_model = 'Flat'
          AND flat_price IS NOT NULL
          AND price_per_member IS NULL
        )
      );