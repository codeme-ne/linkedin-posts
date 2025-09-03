-- Migration: 002_extend_subscriptions_table.sql
-- Purpose: Extend subscriptions table for Lifetime & Monthly plans

BEGIN;

-- Add new columns for extended subscription management
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS interval TEXT CHECK (interval IN ('lifetime', 'monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS amount INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'eur',
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

-- Index for Subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
  ON public.subscriptions(stripe_subscription_id);

-- Index for Status queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON public.subscriptions(status);

-- Index for User ID lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id);

COMMIT;