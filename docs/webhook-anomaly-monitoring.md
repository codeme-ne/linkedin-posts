# Webhook Anomaly Monitoring

Date: 2025-11-26
Status: Implemented

## Purpose

Monitor and track security anomalies in Stripe webhook processing, particularly:
- Price mismatches (received amount differs from expected config values)
- Unknown price IDs (price IDs not matching configured monthly/yearly plans)

## Implementation

### Database Table

Migration: `supabase/migrations/20251126_create_webhook_anomalies.sql`

```sql
CREATE TABLE webhook_anomalies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  anomaly_type TEXT NOT NULL,
  expected_value NUMERIC,
  received_value NUMERIC,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Anomaly Types

1. **price_mismatch**
   - Triggered when: `session.amount_total !== CORRECT_PRICES[interval]`
   - Expected value: Configured price in cents (2900 or 29900)
   - Received value: Actual amount from Stripe session
   - Details: interval, session_id, price_id, customer_id, difference_cents

2. **unknown_price_id**
   - Triggered when: price_id doesn't match monthly or yearly configured IDs
   - Expected value: null
   - Received value: null
   - Details: received_price_id, expected_monthly, expected_yearly, session_id, session_mode, amount

## Logging Strategy

### Console Logging (Immediate Visibility)

All anomalies are logged with `console.error()` using a clear security alert format:

```
🚨 SECURITY ALERT: Price mismatch detected in Stripe checkout!
   Event ID: evt_xxxxx
   Session ID: cs_xxxxx
   Price ID: price_xxxxx
   Interval: monthly
   Received: 2500 cents (25 EUR)
   Expected: 2900 cents (29 EUR)
   Difference: -400 cents
   Action: Using validated config price (2900) for database
```

This ensures:
- Anomalies are visible in Vercel logs immediately
- Clear context for debugging
- Easy to set up alerts based on error log patterns

### Database Logging (Historical Analysis)

All anomalies are recorded in `webhook_anomalies` table for:
- Historical analysis and trend detection
- Security auditing
- Dashboard/reporting capabilities
- Regulatory compliance if needed

### Error Handling

Database insertion failures are logged but don't break webhook processing:
```typescript
if (priceMismatchError) {
  console.error('Failed to log price mismatch anomaly:', priceMismatchError);
}
```

This ensures:
- Webhook processing continues even if anomaly logging fails
- We still get console visibility of the anomaly
- Table schema issues don't cause webhook failures

## Current Behavior

When price mismatch is detected:
1. Log detailed security alert to console (console.error)
2. Record anomaly in database
3. **Continue processing** using validated config price
4. User still gets access (fail-safe approach)

## Future Considerations

Questions to address:
1. Should we reject mismatched prices instead of accepting them?
2. Should we implement real-time alerting (email, Slack, etc.)?
3. What threshold of anomalies should trigger manual review?
4. Should we implement automatic Stripe price validation on app startup?

## Monitoring Queries

### Check for recent anomalies
```sql
SELECT * FROM webhook_anomalies
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Count anomalies by type
```sql
SELECT anomaly_type, COUNT(*) as count
FROM webhook_anomalies
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY anomaly_type;
```

### Find price mismatches with large differences
```sql
SELECT
  event_id,
  created_at,
  expected_value,
  received_value,
  (received_value - expected_value) as difference,
  details->>'session_id' as session_id,
  details->>'customer_id' as customer_id
FROM webhook_anomalies
WHERE anomaly_type = 'price_mismatch'
  AND ABS(received_value - expected_value) > 100
ORDER BY created_at DESC;
```

## Deployment Steps

1. Apply migration: `20251126_create_webhook_anomalies.sql`
2. Deploy updated webhook handler
3. Monitor Vercel logs for security alerts
4. Set up log-based alerts (optional)
5. Review anomaly table weekly

## Related Files

- `/api/stripe-webhook-simplified.ts` - Webhook handler with monitoring
- `/supabase/migrations/20251126_create_webhook_anomalies.sql` - Table schema
- `/src/config/app.config.ts` - Price configuration (CORRECT_PRICES source)
