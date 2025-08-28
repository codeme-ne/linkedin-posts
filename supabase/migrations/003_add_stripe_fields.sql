-- Add Stripe-specific fields to subscriptions table
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS payment_provider text DEFAULT 'stripe';

-- Add index for Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
  ON public.subscriptions(stripe_customer_id);

-- Update the function to handle both payment providers
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