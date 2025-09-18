-- Migration: 007_fix_live_database.sql
-- Purpose: Fix live database to match desired schema (remove lifetime, add indexes)

BEGIN;

-- Remove lifetime from interval constraint
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_interval_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_interval_check
  CHECK (interval IN ('monthly', 'yearly'));

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
  ON public.subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
  ON public.subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active
  ON public.subscriptions(is_active);

-- Add missing index for saved_posts
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id
  ON public.saved_posts(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_posts_platform
  ON public.saved_posts(platform);

-- Enable Row Level Security on saved_posts if not already enabled
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- Create improved RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for saved_posts
DROP POLICY IF EXISTS "Users can view their own saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can insert their own saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can update their own saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can delete their own saved posts" ON public.saved_posts;

CREATE POLICY "Users can view their own saved posts" ON public.saved_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved posts" ON public.saved_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved posts" ON public.saved_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved posts" ON public.saved_posts
  FOR DELETE USING (auth.uid() = user_id);

COMMIT;