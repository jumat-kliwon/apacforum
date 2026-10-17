-- RBAC: the existing CMS accounts keep full access as superadmins. `admin` now means news & events only.
UPDATE "users" SET "role" = 'superadmin' WHERE "role" = 'admin';
