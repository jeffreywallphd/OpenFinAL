-- Migration: Add user authentication fields
-- This migration adds PIN authentication fields to the User table

-- Add PIN field (8-digit validation will be handled in application layer)
ALTER TABLE User ADD COLUMN pin TEXT;

-- Add last login timestamp
ALTER TABLE User ADD COLUMN lastLogin DATETIME;

-- Add date created timestamp with default value
ALTER TABLE User ADD COLUMN dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Update existing users to have a dateCreated value
UPDATE User SET dateCreated = CURRENT_TIMESTAMP WHERE dateCreated IS NULL;
