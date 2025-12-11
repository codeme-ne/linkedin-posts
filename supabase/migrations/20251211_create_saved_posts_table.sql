-- Migration: Create saved_posts table
-- Date: 2025-12-11
-- Purpose: Create the saved_posts table for storing user-generated social media posts

BEGIN;

-- Create saved_posts table
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL DEFAULT 'linkedin' CHECK (platform IN ('linkedin', 'x', 'instagram')),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_platform ON public.saved_posts(platform);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_created ON public.saved_posts(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved posts" ON public.saved_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved posts" ON public.saved_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved posts" ON public.saved_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved posts" ON public.saved_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_posts_updated_at
  BEFORE UPDATE ON public.saved_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.saved_posts IS 'Stores user-generated social media posts';
COMMENT ON COLUMN public.saved_posts.content IS 'The content of the saved post';
COMMENT ON COLUMN public.saved_posts.platform IS 'Target social media platform (linkedin, x, instagram)';
COMMENT ON COLUMN public.saved_posts.user_id IS 'Reference to the user who created the post';

COMMIT;
