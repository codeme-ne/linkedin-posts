-- Add premium extraction tracking to profiles table
-- This migration adds rate limiting for premium Firecrawl extractions to prevent cost-based DoS

-- Add fields to track premium extractions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS premium_extractions_used INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS premium_extractions_limit INTEGER DEFAULT 100 NOT NULL,
  ADD COLUMN IF NOT EXISTS premium_extractions_reset_at TIMESTAMPTZ DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month' NOT NULL;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_premium_usage ON public.profiles(id, premium_extractions_used, premium_extractions_limit);

-- RPC function to check and increment premium extraction usage
-- Returns whether the user can extract and increments counter atomically
CREATE OR REPLACE FUNCTION public.check_and_increment_premium_extraction()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_has_subscription BOOLEAN;
  v_current_month_start TIMESTAMPTZ;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated',
      'can_extract', false
    );
  END IF;

  -- Check if user has active subscription
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = v_user_id
    AND is_active = true
  ) INTO v_has_subscription;

  -- Reject if no active subscription
  IF NOT v_has_subscription THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Premium subscription required',
      'can_extract', false
    );
  END IF;

  -- Calculate current month start
  v_current_month_start := date_trunc('month', NOW());

  -- Lock the row to prevent race conditions (FOR UPDATE)
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- If profile doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id,
      email,
      premium_extractions_used,
      premium_extractions_limit,
      premium_extractions_reset_at
    )
    VALUES (
      v_user_id,
      auth.jwt()->>'email',
      0,
      100,
      v_current_month_start + INTERVAL '1 month'
    )
    ON CONFLICT (id) DO NOTHING;

    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;
  END IF;

  -- Reset counter if we're in a new month
  IF v_profile.premium_extractions_reset_at <= NOW() THEN
    UPDATE public.profiles
    SET
      premium_extractions_used = 0,
      premium_extractions_reset_at = v_current_month_start + INTERVAL '1 month',
      updated_at = NOW()
    WHERE id = v_user_id;

    -- Refresh profile data after reset
    v_profile.premium_extractions_used := 0;
    v_profile.premium_extractions_reset_at := v_current_month_start + INTERVAL '1 month';
  END IF;

  -- Check if user has exceeded limit
  IF v_profile.premium_extractions_used >= v_profile.premium_extractions_limit THEN
    RETURN jsonb_build_object(
      'success', true,
      'can_extract', false,
      'is_premium', true,
      'used', v_profile.premium_extractions_used,
      'limit', v_profile.premium_extractions_limit,
      'remaining', 0,
      'reset_at', v_profile.premium_extractions_reset_at
    );
  END IF;

  -- Increment usage counter
  UPDATE public.profiles
  SET
    premium_extractions_used = premium_extractions_used + 1,
    updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'can_extract', true,
    'is_premium', true,
    'used', v_profile.premium_extractions_used + 1,
    'limit', v_profile.premium_extractions_limit,
    'remaining', v_profile.premium_extractions_limit - v_profile.premium_extractions_used - 1,
    'reset_at', v_profile.premium_extractions_reset_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get current premium extraction status (read-only)
CREATE OR REPLACE FUNCTION public.get_premium_extraction_status()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_has_subscription BOOLEAN;
  v_current_month_start TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Check subscription status
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = v_user_id
    AND is_active = true
  ) INTO v_has_subscription;

  IF NOT v_has_subscription THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No active premium subscription',
      'is_premium', false
    );
  END IF;

  -- Calculate current month start
  v_current_month_start := date_trunc('month', NOW());

  -- Get premium extraction usage
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_profile IS NULL THEN
    -- User doesn't have a profile yet (new user)
    RETURN jsonb_build_object(
      'success', true,
      'is_premium', true,
      'can_extract', true,
      'used', 0,
      'limit', 100,
      'remaining', 100,
      'reset_at', v_current_month_start + INTERVAL '1 month'
    );
  END IF;

  -- Check if counter needs reset
  IF v_profile.premium_extractions_reset_at <= NOW() THEN
    RETURN jsonb_build_object(
      'success', true,
      'is_premium', true,
      'can_extract', true,
      'used', 0,
      'limit', v_profile.premium_extractions_limit,
      'remaining', v_profile.premium_extractions_limit,
      'reset_at', v_current_month_start + INTERVAL '1 month'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'is_premium', true,
    'can_extract', v_profile.premium_extractions_used < v_profile.premium_extractions_limit,
    'used', v_profile.premium_extractions_used,
    'limit', v_profile.premium_extractions_limit,
    'remaining', GREATEST(0, v_profile.premium_extractions_limit - v_profile.premium_extractions_used),
    'reset_at', v_profile.premium_extractions_reset_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.check_and_increment_premium_extraction() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_premium_extraction_status() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.check_and_increment_premium_extraction() IS
  'Atomically checks if user can perform premium extraction and increments counter. Prevents cost-based DoS by enforcing monthly limits.';
COMMENT ON FUNCTION public.get_premium_extraction_status() IS
  'Returns current premium extraction usage status without incrementing counter.';
