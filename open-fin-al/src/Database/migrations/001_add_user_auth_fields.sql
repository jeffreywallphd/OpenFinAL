-- Migration: Add user authentication fields
-- This migration adds PIN authentication fields to the User table

-- Add PIN field (8-digit validation will be handled in application layer)
ALTER TABLE User ADD COLUMN pinHash TEXT;

-- Add last login timestamp
ALTER TABLE User ADD COLUMN lastLogin DATETIME;

-- Add date created timestamp with default value
ALTER TABLE User ADD COLUMN dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Add risk tolerance field with CHECK constraint (SQLite doesn't support ENUM)
-- Note: SQLite doesn't enforce CHECK constraints on ALTER TABLE ADD COLUMN
-- The constraint is enforced in schema.sql for new databases
ALTER TABLE User ADD COLUMN riskTolerance TEXT CHECK(riskTolerance IN ('low', 'low/mid', 'mid', 'mid/high', 'high')) DEFAULT 'low';

-- Update existing users to have a dateCreated value
UPDATE User SET dateCreated = CURRENT_TIMESTAMP WHERE dateCreated IS NULL;
