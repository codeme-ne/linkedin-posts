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