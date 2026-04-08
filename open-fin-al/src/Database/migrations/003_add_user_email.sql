-- Migration: Add email field to User for per-account identity and SEC user-agent usage
ALTER TABLE User ADD COLUMN email TEXT;
