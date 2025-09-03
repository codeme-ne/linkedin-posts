-- Create generation_usage table for tracking post transformations
CREATE TABLE generation_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for efficient user queries
CREATE INDEX idx_generation_usage_user_id ON generation_usage(user_id);

-- Create index for time-based queries (if needed for analytics)
CREATE INDEX idx_generation_usage_generated_at ON generation_usage(generated_at);

-- Enable Row Level Security
ALTER TABLE generation_usage ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own usage records
CREATE POLICY "Users can view their own generation usage" ON generation_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own usage records
CREATE POLICY "Users can insert their own generation usage" ON generation_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Optional: Create policy for admins to view all records (uncomment if needed)
-- CREATE POLICY "Admins can view all generation usage" ON generation_usage
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM auth.users 
--             WHERE auth.users.id = auth.uid() 
--             AND auth.users.email = 'admin@yourdomain.com'
--         )
--     );