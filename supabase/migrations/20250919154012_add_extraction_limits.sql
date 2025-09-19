-- Add extraction limits to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS free_extractions_used integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_extractions_limit integer NOT NULL DEFAULT 3;

-- Create or replace function for atomic extraction increment
CREATE OR REPLACE FUNCTION increment_extraction_usage(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_used integer;
  v_limit integer;
  v_is_premium boolean;
BEGIN
  -- Check if user has active subscription
  SELECT COALESCE(s.is_active, false) INTO v_is_premium
  FROM profiles p
  LEFT JOIN subscriptions s ON s.user_id = p.id
  WHERE p.id = p_user_id;

  -- Premium users don't consume free extractions
  IF v_is_premium THEN
    RETURN json_build_object(
      'success', true,
      'is_premium', true,
      'message', 'Premium user - unlimited extractions'
    );
  END IF;

  -- Get current usage for free users
  SELECT free_extractions_used, free_extractions_limit
  INTO v_used, v_limit
  FROM profiles
  WHERE id = p_user_id;

  -- Check if limit reached
  IF v_used >= v_limit THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Extraction limit reached',
      'used', v_used,
      'limit', v_limit
    );
  END IF;

  -- Increment usage
  UPDATE profiles
  SET free_extractions_used = free_extractions_used + 1,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'remaining', v_limit - v_used - 1,
    'used', v_used + 1,
    'limit', v_limit
  );
END;
$$;

-- Create function to get extraction limits
CREATE OR REPLACE FUNCTION get_extraction_limits(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_used integer;
  v_limit integer;
  v_is_premium boolean;
  v_premium_used integer;
  v_premium_limit integer;
BEGIN
  -- Check if user has active subscription
  SELECT COALESCE(s.is_active, false) INTO v_is_premium
  FROM profiles p
  LEFT JOIN subscriptions s ON s.user_id = p.id
  WHERE p.id = p_user_id;

  -- Get free tier usage
  SELECT free_extractions_used, free_extractions_limit
  INTO v_used, v_limit
  FROM profiles
  WHERE id = p_user_id;

  -- For premium users, return unlimited status
  IF v_is_premium THEN
    RETURN json_build_object(
      'is_premium', true,
      'premium_used', 0,
      'premium_limit', null,  -- null indicates unlimited
      'premium_remaining', null,  -- null indicates unlimited
      'free_used', v_used,
      'free_limit', v_limit,
      'free_remaining', v_limit - v_used
    );
  END IF;

  -- For free users
  RETURN json_build_object(
    'is_premium', false,
    'free_used', v_used,
    'free_limit', v_limit,
    'free_remaining', v_limit - v_used
  );
END;
$$;

-- Create function to reset monthly extraction counts
CREATE OR REPLACE FUNCTION reset_monthly_extractions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset free extraction usage at the beginning of each month
  UPDATE profiles
  SET free_extractions_used = 0,
      updated_at = now()
  WHERE free_extractions_used > 0;

  -- Update extraction reset timestamp for subscriptions
  UPDATE subscriptions
  SET extraction_reset_at = date_trunc('month', now()) + interval '1 month'
  WHERE is_active = true;
END;
$$;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.free_extractions_used IS 'Number of free URL extractions used by the user';
COMMENT ON COLUMN public.profiles.free_extractions_limit IS 'Maximum number of free URL extractions allowed per month';
COMMENT ON FUNCTION increment_extraction_usage IS 'Atomically increment extraction usage for a user, checking limits first';
COMMENT ON FUNCTION get_extraction_limits IS 'Get current extraction usage and limits for a user';
COMMENT ON FUNCTION reset_monthly_extractions IS 'Reset monthly extraction counts - should be called via cron job';