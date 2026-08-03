ALTER TABLE "trainers" ADD COLUMN "trainer_code" varchar(20);--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_trainer_code_unique" UNIQUE("trainer_code");