-- Manual migration application script
-- Run this in Supabase SQL Editor

-- Migration: Add index to saved_posts for better query performance
-- Date: 2025-01-19
-- Purpose: Improve performance when loading saved posts for users

-- Create index on user_id column for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id
ON saved_posts(user_id);

-- Create composite index for user_id and created_at for sorted queries
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_created
ON saved_posts(user_id, created_at DESC);

-- Add comment to explain the indexes
COMMENT ON INDEX idx_saved_posts_user_id IS 'Index for fast lookup of posts by user_id';
COMMENT ON INDEX idx_saved_posts_user_created IS 'Composite index for user posts ordered by creation date';

-- Analyze the table to update statistics for query planner
ANALYZE saved_posts;

-- Mark this migration as applied in the migration history
INSERT INTO supabase_migrations.schema_migrations (version)
VALUES ('20250119_add_saved_posts_index')
ON CONFLICT (version) DO NOTHING;

-- Verify the indexes were created
SELECT
    indexname,
    indexdef,
    tablename
FROM pg_indexes
WHERE tablename = 'saved_posts'
AND indexname IN ('idx_saved_posts_user_id', 'idx_saved_posts_user_created');