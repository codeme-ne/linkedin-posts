-- Migration: 003_create_pending_subscriptions.sql
-- Purpose: Create table for handling payments made before user registration

BEGIN;

-- Table for payments made before registration
CREATE TABLE IF NOT EXISTS public.pending_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  stripe_session_id TEXT,
  interval TEXT CHECK (interval IN ('monthly', 'yearly')),
  amount INTEGER,
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'expired')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indices for fast lookups
CREATE INDEX idx_pending_subscriptions_email 
  ON public.pending_subscriptions(email);
CREATE INDEX idx_pending_subscriptions_status 
  ON public.pending_subscriptions(status);
CREATE UNIQUE INDEX idx_pending_subscriptions_payment_intent
  ON public.pending_subscriptions(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_pending_subscriptions_expires_at
  ON public.pending_subscriptions(expires_at)
  WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Service-role can manage pending subscriptions (for webhook)
CREATE POLICY "Service role can manage pending subscriptions"
  ON public.pending_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Users can view their own pending subscriptions (by email match)
CREATE POLICY "Users can view their pending subscriptions"
  ON public.pending_subscriptions
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = email
  );

COMMIT;