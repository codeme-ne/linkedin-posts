-- Supabase Auth for saved_posts
-- 1) Add user_id column referencing auth.users (nullable for existing rows)
ALTER TABLE saved_posts
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id);

-- 2) Set default to auth.uid() for new inserts (will be null if not authenticated)
ALTER TABLE saved_posts
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3) Enable RLS (already enabled in previous migration, but ensure it's on)
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- 4) Drop overly-permissive anonymous policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'saved_posts'
      AND policyname = 'Allow all operations for anonymous users'
  ) THEN
    DROP POLICY "Allow all operations for anonymous users" ON saved_posts;
  END IF;
END$$;

-- 5) Policies: only owners can CRUD their rows
CREATE POLICY "Allow select own posts" ON saved_posts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Allow insert own posts" ON saved_posts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow update own posts" ON saved_posts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow delete own posts" ON saved_posts
  FOR DELETE
  USING (user_id = auth.uid());

-- Note: Existing rows without a user_id will be invisible under RLS.
-- Optionally, an admin can backfill user_id values manually if needed.
