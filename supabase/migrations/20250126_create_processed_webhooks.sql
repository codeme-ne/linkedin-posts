-- Migration: Create processed_webhooks table for webhook idempotency
-- Purpose: Prevent duplicate webhook processing and replay attacks
-- Date: 2025-01-26

-- Create table to track processed Stripe webhooks
CREATE TABLE processed_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast event_id lookups (critical for idempotency checks)
CREATE INDEX idx_processed_webhooks_event_id ON processed_webhooks(event_id);

-- Optional: Add index on processed_at for cleanup queries
CREATE INDEX idx_processed_webhooks_processed_at ON processed_webhooks(processed_at);

-- Add comment for documentation
COMMENT ON TABLE processed_webhooks IS 'Tracks processed Stripe webhook events to prevent duplicate processing and replay attacks';
COMMENT ON COLUMN processed_webhooks.event_id IS 'Stripe event ID (evt_xxx), unique per event';
COMMENT ON COLUMN processed_webhooks.event_type IS 'Stripe event type (e.g., checkout.session.completed)';
COMMENT ON COLUMN processed_webhooks.processed_at IS 'Timestamp when the webhook was successfully processed';

-- Optional: Create RLS policies (if needed)
-- Since this table is only accessed server-side via service role key,
-- RLS is not strictly necessary, but we can add it for defense in depth
ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/read
-- (No user-facing access needed)
CREATE POLICY "Service role full access"
  ON processed_webhooks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
