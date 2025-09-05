-- Migration: 005_rollback_is_active_column.sql
-- Purpose: Remove is_active column to restore original functionality

BEGIN;

-- Remove the is_active column
ALTER TABLE public.subscriptions 
  DROP COLUMN IF EXISTS is_active;

-- Remove the index
DROP INDEX IF EXISTS idx_subscriptions_is_active;

COMMIT;
