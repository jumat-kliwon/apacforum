-- Idempotent: an earlier preview build may already have created this table as 0002_articles.
CREATE TABLE IF NOT EXISTS "articles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"excerpt" varchar(500),
	"content" text DEFAULT '' NOT NULL,
	"thumbnail_key" text,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"author_id" uuid,
	"seo_title" varchar(70),
	"seo_description" varchar(160),
	"seo_keywords" varchar(255),
	"og_image_key" text,
	"canonical_url" text,
	"no_index" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_status_published_at_index" ON "articles" USING btree ("status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_title_trgm" ON "articles" USING gin ("title" gin_trgm_ops);
