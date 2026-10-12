CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."partner_category" AS ENUM('academic_home', 'government_regional', 'strategic', 'business_industry', 'knowledge_research', 'technology', 'media');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('virtual_account', 'qris', 'credit_card', 'bank_transfer', 'e_wallet');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('none', 'pending', 'paid', 'expired', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending_verification', 'verified', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."speaker_category" AS ENUM('government', 'business', 'academia', 'communication');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'paid', 'expired', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."tshirt_size" AS ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"impersonated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" "citext" NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" varchar(20) DEFAULT 'participant' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"phone" varchar(32),
	"organization" varchar(200),
	"job_title" varchar(200),
	"country" char(2),
	"city" varchar(120),
	"tshirt_size" "tshirt_size",
	"meal_preference" varchar(60),
	"referral_source" varchar(120),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agenda_days" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"sort_order" smallint NOT NULL,
	"label" varchar(80) NOT NULL,
	"date" date NOT NULL,
	"theme" varchar(255) NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agenda_days_eventId_sortOrder_unique" UNIQUE("event_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(8) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(200) NOT NULL,
	"tagline" varchar(255),
	"description" text DEFAULT '' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"registration_deadline" timestamp with time zone NOT NULL,
	"venue_name" varchar(200) NOT NULL,
	"venue_address" text,
	"city" varchar(120) NOT NULL,
	"capacity" integer NOT NULL,
	"banner_key" text,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"registration_open" boolean DEFAULT true NOT NULL,
	"timezone" varchar(64) DEFAULT 'Asia/Jakarta' NOT NULL,
	"registration_seq" integer DEFAULT 0 NOT NULL,
	"invoice_seq" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_code_unique" UNIQUE("code"),
	CONSTRAINT "events_slug_unique" UNIQUE("slug"),
	CONSTRAINT "events_date_range" CHECK ("events"."end_date" >= "events"."start_date"),
	CONSTRAINT "events_capacity_nonnegative" CHECK ("events"."capacity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"logo_key" text,
	"category" "partner_category" NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speakers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"agenda_day_id" uuid,
	"name" varchar(200) NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" "speaker_category" NOT NULL,
	"photo_key" text,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"code" varchar(6) NOT NULL,
	"name" varchar(120) NOT NULL,
	"price" bigint NOT NULL,
	"pax_per_ticket" smallint DEFAULT 1 NOT NULL,
	"quota" integer NOT NULL,
	"ticket_seq" integer DEFAULT 0 NOT NULL,
	"is_on_sale" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_types_eventId_code_unique" UNIQUE("event_id","code"),
	CONSTRAINT "ticket_types_price_nonnegative" CHECK ("ticket_types"."price" >= 0),
	CONSTRAINT "ticket_types_quota_nonnegative" CHECK ("ticket_types"."quota" >= 0),
	CONSTRAINT "ticket_types_pax_positive" CHECK ("ticket_types"."pax_per_ticket" >= 1)
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reg_no" varchar(32) NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"ticket_type_id" uuid NOT NULL,
	"extra" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "registration_status" DEFAULT 'pending_verification' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'none' NOT NULL,
	"rejection_reason" text,
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"rejected_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"ticket_code" varchar(32),
	"ticket_issued_at" timestamp with time zone,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participants_regNo_unique" UNIQUE("reg_no"),
	CONSTRAINT "participants_ticketCode_unique" UNIQUE("ticket_code")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"invoice_no" varchar(32) NOT NULL,
	"user_id" uuid,
	"participant_id" uuid,
	"event_id" uuid,
	"participant_name" varchar(200) NOT NULL,
	"participant_email" varchar(320) NOT NULL,
	"event_name" varchar(200) NOT NULL,
	"ticket_type_name" varchar(120) NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"method" "payment_method",
	"total" bigint NOT NULL,
	"currency" char(3) DEFAULT 'IDR' NOT NULL,
	"expires_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"items" jsonb NOT NULL,
	"payment" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_invoiceNo_unique" UNIQUE("invoice_no")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_impersonated_by_users_id_fk" FOREIGN KEY ("impersonated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_days" ADD CONSTRAINT "agenda_days_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speakers" ADD CONSTRAINT "speakers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speakers" ADD CONSTRAINT "speakers_agenda_day_id_agenda_days_id_fk" FOREIGN KEY ("agenda_day_id") REFERENCES "public"."agenda_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_index" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_role_index" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_name_trgm" ON "users" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "users_email_trgm" ON "users" USING gin (("email"::text) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "users_organization_trgm" ON "users" USING gin ("organization" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "verifications_identifier_index" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "events_status_start_date_index" ON "events" USING btree ("status","start_date");--> statement-breakpoint
CREATE INDEX "partners_event_id_category_sort_order_index" ON "partners" USING btree ("event_id","category","sort_order");--> statement-breakpoint
CREATE INDEX "speakers_event_id_sort_order_index" ON "speakers" USING btree ("event_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_active_user_event" ON "participants" USING btree ("event_id","user_id") WHERE "participants"."status" not in ('rejected', 'cancelled');--> statement-breakpoint
CREATE INDEX "participants_event_id_status_index" ON "participants" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "participants_event_id_payment_status_index" ON "participants" USING btree ("event_id","payment_status");--> statement-breakpoint
CREATE INDEX "participants_created_at_index" ON "participants" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "participants_user_id_index" ON "participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_status_created_at_index" ON "transactions" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transactions_event_id_index" ON "transactions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_index" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_participant_id_index" ON "transactions" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "transactions_pending_expires_at" ON "transactions" USING btree ("expires_at") WHERE "transactions"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "transactions_invoice_no_trgm" ON "transactions" USING gin ("invoice_no" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "transactions_participant_name_trgm" ON "transactions" USING gin ("participant_name" gin_trgm_ops);