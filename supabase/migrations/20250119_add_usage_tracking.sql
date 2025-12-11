-- Create user profiles table for tracking usage limits
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE, -- Made nullable for social login compatibility
  free_generations_used INTEGER DEFAULT 0 NOT NULL,
  free_generations_limit INTEGER DEFAULT 3 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile (drop first if exists)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile (drop first if exists)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE OR REPLACE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_on_signup();

-- RPC function to check and increment usage (secure server-side)
CREATE OR REPLACE FUNCTION public.check_and_increment_usage()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_has_subscription BOOLEAN;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated',
      'can_generate', false
    );
  END IF;

  -- Check if user has active subscription
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = v_user_id
    AND is_active = true
  ) INTO v_has_subscription;

  -- If user has subscription, always allow
  IF v_has_subscription THEN
    RETURN jsonb_build_object(
      'success', true,
      'can_generate', true,
      'is_premium', true,
      'remaining', -1  -- Unlimited for premium
    );
  END IF;

  -- Lock the row to prevent race conditions (FOR UPDATE)
  -- This ensures atomic read-check-update operation
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- If profile doesn't exist, create it and re-select with lock
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email)
    VALUES (v_user_id, auth.jwt()->>'email')
    ON CONFLICT (id) DO NOTHING;

    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;
  END IF;

  -- Check if user can generate
  IF v_profile.free_generations_used >= v_profile.free_generations_limit THEN
    RETURN jsonb_build_object(
      'success', true,
      'can_generate', false,
      'is_premium', false,
      'used', v_profile.free_generations_used,
      'limit', v_profile.free_generations_limit,
      'remaining', 0
    );
  END IF;

  -- Increment usage counter
  UPDATE public.profiles
  SET
    free_generations_used = free_generations_used + 1,
    updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'can_generate', true,
    'is_premium', false,
    'used', v_profile.free_generations_used + 1,
    'limit', v_profile.free_generations_limit,
    'remaining', v_profile.free_generations_limit - v_profile.free_generations_used - 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get current usage (read-only)
CREATE OR REPLACE FUNCTION public.get_usage_status()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_has_subscription BOOLEAN;
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

  IF v_has_subscription THEN
    RETURN jsonb_build_object(
      'success', true,
      'is_premium', true,
      'can_generate', true,
      'remaining', -1
    );
  END IF;

  -- Get free tier usage
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_profile IS NULL THEN
    -- User doesn't have a profile yet (new user)
    RETURN jsonb_build_object(
      'success', true,
      'is_premium', false,
      'can_generate', true,
      'used', 0,
      'limit', 3,
      'remaining', 3
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'is_premium', false,
    'can_generate', v_profile.free_generations_used < v_profile.free_generations_limit,
    'used', v_profile.free_generations_used,
    'limit', v_profile.free_generations_limit,
    'remaining', GREATEST(0, v_profile.free_generations_limit - v_profile.free_generations_used)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_usage_status() TO authenticated;