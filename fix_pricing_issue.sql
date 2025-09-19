-- Fix incorrect subscription amounts in the database
-- This fixes the issue where monthly subscriptions show 99€ instead of 29€

-- First, let's check what we have
SELECT
    id,
    user_id,
    interval,
    amount,
    currency,
    is_active,
    status
FROM subscriptions
WHERE is_active = true
ORDER BY created_at DESC;

-- Update monthly subscriptions that have incorrect amount (9900 = 99€)
UPDATE subscriptions
SET
    amount = 2900,  -- 29€ for monthly
    currency = 'eur',
    updated_at = NOW()
WHERE
    interval = 'monthly'
    AND (amount = 9900 OR amount IS NULL OR amount != 2900);

-- Update yearly subscriptions to ensure correct amount
UPDATE subscriptions
SET
    amount = 29900,  -- 299€ for yearly
    currency = 'eur',
    updated_at = NOW()
WHERE
    interval = 'yearly'
    AND (amount != 29900 OR amount IS NULL);

-- Verify the updates
SELECT
    id,
    user_id,
    interval,
    amount,
    currency,
    is_active,
    status,
    updated_at
FROM subscriptions
WHERE is_active = true
ORDER BY updated_at DESC;