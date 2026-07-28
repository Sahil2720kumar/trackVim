DROP INDEX "gym_memberships_gym_idx";--> statement-breakpoint
DROP INDEX "gym_memberships_status_idx";--> statement-breakpoint
DROP INDEX "gym_subscriptions_period_idx";--> statement-breakpoint
DROP INDEX "applications_status_idx";--> statement-breakpoint
CREATE INDEX "attendance_member_date_idx" ON "attendance" USING btree ("member_id","attendance_date" desc);--> statement-breakpoint
CREATE INDEX "exercises_gym_idx" ON "exercises" USING btree ("gym_id") WHERE gym_id is not null;--> statement-breakpoint
CREATE INDEX "gym_memberships_active_enddate_idx" ON "gym_memberships" USING btree ("end_date") WHERE status = 'Active';--> statement-breakpoint
CREATE UNIQUE INDEX "gym_subscriptions_gym_period_idx" ON "gym_subscriptions" USING btree ("gym_id","billing_period_start");--> statement-breakpoint
CREATE INDEX "gym_subscriptions_overdue_check_idx" ON "gym_subscriptions" USING btree ("due_date") WHERE status = 'Pending';--> statement-breakpoint
CREATE INDEX "gyms_owner_idx" ON "gyms" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "gyms_billing_status_idx" ON "gyms" USING btree ("status","billing_start_date") WHERE billing_start_date is not null;--> statement-breakpoint
CREATE INDEX "applications_gym_status_idx" ON "membership_applications" USING btree ("gym_id","status");--> statement-breakpoint
CREATE INDEX "messages_receiver_unread_idx" ON "messages" USING btree ("receiver_id","is_read") WHERE is_read = false;--> statement-breakpoint
CREATE UNIQUE INDEX "payment_receipts_current_idx" ON "payment_receipts" USING btree ("payment_id") WHERE is_current = true;--> statement-breakpoint
CREATE INDEX "payments_gym_status_idx" ON "payments" USING btree ("gym_id","status") WHERE status in ('Pending', 'PendingVerification', 'Overdue');--> statement-breakpoint
CREATE INDEX "session_exercises_exercise_idx" ON "session_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_payments_gateway_order_idx" ON "subscription_payments" USING btree ("gateway_order_id") WHERE gateway_order_id is not null;--> statement-breakpoint
CREATE INDEX "template_exercises_exercise_idx" ON "template_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "trainer_assignments_member_idx" ON "trainer_assignments" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "sessions_gym_status_date_idx" ON "training_sessions" USING btree ("gym_id","status","session_date") WHERE status = 'Upcoming';