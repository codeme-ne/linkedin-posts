-- Add platform column to saved_posts table
ALTER TABLE saved_posts
ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'linkedin';

-- Update existing rows to have 'linkedin' as default platform
UPDATE saved_posts 
SET platform = 'linkedin' 
WHERE platform IS NULL;

-- Add check constraint to ensure valid platform values
ALTER TABLE saved_posts
ADD CONSTRAINT valid_platform CHECK (platform IN ('linkedin', 'x', 'instagram'));