CREATE TYPE "public"."currency" AS ENUM('IDR', 'USD', 'SGD');--> statement-breakpoint
CREATE TABLE "currency_rates" (
	"currency" "currency" PRIMARY KEY NOT NULL,
	"rate_idr" numeric(18, 4) NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currency_rates_positive" CHECK ("currency_rates"."rate_idr" > 0),
	CONSTRAINT "currency_rates_foreign" CHECK ("currency_rates"."currency" <> 'IDR')
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "currency" "currency" DEFAULT 'IDR' NOT NULL;--> statement-breakpoint
ALTER TABLE "currency_rates" ADD CONSTRAINT "currency_rates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;