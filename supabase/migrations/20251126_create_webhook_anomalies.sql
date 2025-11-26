-- Migration: Create webhook_anomalies table for security monitoring
-- Purpose: Track price mismatches and other anomalies in Stripe webhooks
-- Date: 2025-11-26

-- Create table to track webhook anomalies
CREATE TABLE webhook_anomalies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  anomaly_type TEXT NOT NULL,
  expected_value NUMERIC,
  received_value NUMERIC,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for anomaly type queries (for dashboard/reporting)
CREATE INDEX idx_webhook_anomalies_type ON webhook_anomalies(anomaly_type);

-- Create index for event_id lookups
CREATE INDEX idx_webhook_anomalies_event_id ON webhook_anomalies(event_id);

-- Create index on created_at for time-based queries
CREATE INDEX idx_webhook_anomalies_created_at ON webhook_anomalies(created_at);

-- Add comments for documentation
COMMENT ON TABLE webhook_anomalies IS 'Tracks anomalies detected in Stripe webhook processing for security monitoring';
COMMENT ON COLUMN webhook_anomalies.event_id IS 'Stripe event ID (evt_xxx) where anomaly was detected';
COMMENT ON COLUMN webhook_anomalies.anomaly_type IS 'Type of anomaly (e.g., price_mismatch, unknown_price_id)';
COMMENT ON COLUMN webhook_anomalies.expected_value IS 'Expected value (e.g., correct price in cents)';
COMMENT ON COLUMN webhook_anomalies.received_value IS 'Actual value received from Stripe';
COMMENT ON COLUMN webhook_anomalies.details IS 'Additional context (price_id, interval, session_id, etc.)';
COMMENT ON COLUMN webhook_anomalies.created_at IS 'Timestamp when anomaly was detected';

-- Enable RLS for defense in depth
ALTER TABLE webhook_anomalies ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/read
CREATE POLICY "Service role full access"
  ON webhook_anomalies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
