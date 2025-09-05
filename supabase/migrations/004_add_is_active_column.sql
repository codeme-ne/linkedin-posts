-- Migration: 004_add_is_active_column.sql
-- Purpose: Add missing is_active column to subscriptions table

BEGIN;

-- Add is_active column to subscriptions table
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

-- Update existing records to set is_active based on status
UPDATE public.subscriptions 
SET is_active = CASE 
  WHEN status = 'active' THEN TRUE
  WHEN status = 'trial' THEN TRUE
  ELSE FALSE
END;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active 
  ON public.subscriptions(is_active);

COMMIT;
