-- Extensions needed before the tables: citext (emails) and pg_trgm (ILIKE search).
CREATE EXTENSION IF NOT EXISTS citext;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;
