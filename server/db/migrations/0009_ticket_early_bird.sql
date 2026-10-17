ALTER TABLE "ticket_types" ADD COLUMN "is_early_bird" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD COLUMN "early_bird_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_early_bird_until" CHECK ("ticket_types"."is_early_bird" = ("ticket_types"."early_bird_until" is not null));