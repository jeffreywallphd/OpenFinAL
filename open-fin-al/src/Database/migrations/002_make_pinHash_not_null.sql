-- Migration: Ensure pinHash column exists and has no NULL values
-- Note: SQLite doesn't support adding NOT NULL to existing columns
-- The NOT NULL constraint is enforced in schema.sql for new databases

-- Ensure no users have NULL pinHash values
-- Delete users without pinHash (or update with a default if needed)
DELETE FROM User WHERE pinHash IS NULL OR pinHash = '';
