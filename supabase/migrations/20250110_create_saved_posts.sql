-- Create saved_posts table (same structure as saved_tweets but for LinkedIn posts)
CREATE TABLE IF NOT EXISTS saved_posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for anonymous users
CREATE POLICY "Allow all operations for anonymous users" ON saved_posts
  FOR ALL
  USING (true)
  WITH CHECK (true);