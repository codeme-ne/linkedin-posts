-- MANUAL MIGRATION: Run these commands in your Supabase Dashboard SQL Editor
-- This migration removes all usage tracking tables for ShipFast simplification
-- 
-- Date: 2025-09-05
-- Reason: Radikale Vereinfachung auf ShipFast-Pattern - ein einziges is_active Flag steuert alles

-- Drop generation usage table (used for free tier counting)
DROP TABLE IF EXISTS public.generation_usage CASCADE;

-- Drop extraction usage table (used for premium extraction limits)  
DROP TABLE IF EXISTS public.extraction_usage CASCADE;

-- Drop pending subscriptions table (already replaced by simplified webhook)
DROP TABLE IF EXISTS public.pending_subscriptions CASCADE;

-- Optional: Drop any related functions that might exist
DROP FUNCTION IF EXISTS public.get_monthly_extraction_usage(uuid, text);
DROP FUNCTION IF EXISTS public.increment_generation_usage(uuid, text);

-- Cleanup: Remove extraction limits from subscriptions table since premium is now unlimited
ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS extraction_limit,
DROP COLUMN IF EXISTS extraction_reset_at;

-- Verification: Show remaining tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%usage%';

-- This should return no results after successful cleanup