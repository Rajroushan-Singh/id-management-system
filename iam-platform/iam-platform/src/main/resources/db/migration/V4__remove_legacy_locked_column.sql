-- Timed lockout is represented by locked_until. Remove the old permanent-lock
-- flag so inserts from the current User entity do not violate its NOT NULL rule.
ALTER TABLE users DROP COLUMN IF EXISTS locked;
