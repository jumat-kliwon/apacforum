CREATE TABLE "permissions" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"group" varchar(40) NOT NULL,
	"label" varchar(80) NOT NULL,
	"description" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_key" varchar(60) NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_key_pk" PRIMARY KEY("role_id","permission_key")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" varchar(40) NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(255),
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE varchar(40);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'participant';--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_key_permissions_key_fk" FOREIGN KEY ("permission_key") REFERENCES "public"."permissions"("key") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
-- Starting data. `db:bootstrap` keeps the permissions in sync with shared/utils/access.ts afterwards.
INSERT INTO "permissions" ("key", "group", "label", "description") VALUES
  ('dashboard.view', 'Events', 'Event dashboard', 'Registration and revenue stats of each event'),
  ('events.manage', 'Events', 'Events & tickets', 'Create, edit, publish, archive and delete events and their ticket types'),
  ('registrations.manage', 'Events', 'Registrations', 'View participants; verify, reject, check in, email, edit and delete them'),
  ('transactions.manage', 'Finance', 'Transactions & refunds', 'View invoices and payments, and refund them'),
  ('exports.manage', 'Finance', 'CSV exports', 'Download participant and transaction lists'),
  ('news.manage', 'Content', 'News & Media', 'Write, publish and delete articles'),
  ('email_templates.view', 'Content', 'Email templates', 'Preview the emails sent to participants'),
  ('access.manage', 'Access', 'Users & roles', 'Create staff accounts, assign roles and edit role permissions');--> statement-breakpoint
INSERT INTO "roles" ("id", "key", "name", "description", "is_system") VALUES
  (gen_random_uuid(), 'superadmin', 'Superadmin', 'Full access to the CMS', true),
  (gen_random_uuid(), 'participant', 'Participant', 'Registered for an event; no CMS access', true),
  (gen_random_uuid(), 'admin', 'Admin', 'Manages news and events: event settings, tickets and registrations', false);--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_key")
  SELECT "id", unnest(ARRAY['news.manage', 'events.manage', 'registrations.manage']) FROM "roles" WHERE "key" = 'admin';--> statement-breakpoint
-- any role value without a matching role would block the foreign key below
UPDATE "users" SET "role" = 'participant' WHERE "role" NOT IN (SELECT "key" FROM "roles");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_roles_key_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("key") ON DELETE no action ON UPDATE cascade;