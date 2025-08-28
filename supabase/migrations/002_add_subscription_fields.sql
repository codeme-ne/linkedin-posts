-- Add subscription fields to users table
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS 
  subscription_status text DEFAULT 'free',
  subscription_id text,
  customer_id text,
  trial_ends_at timestamp with time zone,
  subscription_ends_at timestamp with time zone;

-- Create subscriptions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lemonsqueezy_subscription_id text UNIQUE,
  lemonsqueezy_customer_id text,
  lemonsqueezy_product_id text,
  status text NOT NULL DEFAULT 'free', -- free, trial, active, cancelled, expired
  trial_ends_at timestamp with time zone,
  renews_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only backend (service role) can update subscriptions
CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Function to get user's subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid uuid)
RETURNS TABLE(
  status text,
  trial_ends_at timestamp with time zone,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.status,
    s.trial_ends_at,
    CASE 
      WHEN s.status IN ('active', 'trial') AND (s.ends_at IS NULL OR s.ends_at > now()) THEN true
      ELSE false
    END as is_active
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;