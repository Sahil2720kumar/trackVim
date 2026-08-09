ALTER TABLE "gym_qr_codes" DROP CONSTRAINT "gym_qr_codes_qr_identifier_unique";--> statement-breakpoint
ALTER TABLE "gym_qr_codes" ALTER COLUMN "label" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gym_qr_codes" ADD COLUMN "token" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE INDEX "gym_qr_codes_location_idx" ON "gym_qr_codes" USING btree ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gym_qr_codes_one_active_per_gym_idx" ON "gym_qr_codes" USING btree ("gym_id") WHERE "gym_qr_codes"."is_active" = true;--> statement-breakpoint
ALTER TABLE "gym_qr_codes" DROP COLUMN "qr_identifier";--> statement-breakpoint
ALTER TABLE "gym_qr_codes" DROP COLUMN "signature_secret";--> statement-breakpoint
ALTER TABLE "gym_qr_codes" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "gym_qr_codes" DROP COLUMN "rotating_token";--> statement-breakpoint
ALTER TABLE "gym_qr_codes" DROP COLUMN "token_expires_at";--> statement-breakpoint
ALTER TABLE "gym_qr_codes" ADD CONSTRAINT "gym_qr_codes_token_unique" UNIQUE("token");--> statement-breakpoint
ALTER POLICY "Gym staff can manage QR codes" ON "gym_qr_codes" RENAME TO "Gym staff can create QR codes";