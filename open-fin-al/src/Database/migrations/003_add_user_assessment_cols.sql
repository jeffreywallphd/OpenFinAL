-- Migration: Add user assessment fields
-- This migration adds fields to the User table
-- This is done by Team 2 adaptive learning assuming Team 3 & 4 put their output as user assessment in these new columns


ALTER TABLE User ADD COLUMN overalKnowledgeLevel TEXT;

ALTER TABLE User ADD COLUMN riskScore TEXT;