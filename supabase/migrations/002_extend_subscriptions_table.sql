-- Migration: 002_extend_subscriptions_table.sql
-- Purpose: Extend subscriptions table for Lifetime & Monthly plans

BEGIN;

-- Note: Most columns already exist in base schema (000_create_subscriptions_table.sql)
-- Only adding missing columns that are not in the base schema
-- Removed redundant columns: interval, amount, currency, stripe_subscription_id, etc.

-- No additional columns needed - all columns already exist in base schema

-- Note: All indexes already exist in base schema (000_create_subscriptions_table.sql)
-- No additional indexes needed

COMMIT;