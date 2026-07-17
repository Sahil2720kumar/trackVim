ALTER TABLE "gym_subscriptions" DROP CONSTRAINT "gym_subscriptions_gym_id_gyms_id_fk";
--> statement-breakpoint
ALTER TABLE "payment_logs" DROP CONSTRAINT "payment_logs_gym_subscription_id_gym_subscriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gym_subscriptions" ADD CONSTRAINT "gym_subscriptions_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_gym_subscription_id_gym_subscriptions_id_fk" FOREIGN KEY ("gym_subscription_id") REFERENCES "public"."gym_subscriptions"("id") ON DELETE cascade ON UPDATE no action;