# Premium Extraction Rate Limiting

## Overview

To prevent cost-based DoS attacks and control API costs, premium Firecrawl extractions are rate-limited on a per-user, monthly basis.

## Limits

- **Premium Users**: 100 extractions per month
- **Reset Period**: Monthly (resets on the 1st of each month)

## Implementation

### Database Schema

The `profiles` table tracks extraction usage with the following fields:

```sql
premium_extractions_used      INTEGER   -- Current month's usage count
premium_extractions_limit     INTEGER   -- Monthly limit (default: 100)
premium_extractions_reset_at  TIMESTAMPTZ -- Next reset timestamp
```

### Server-Side Enforcement

Rate limiting is enforced server-side in `/api/extract-premium.ts` before making Firecrawl API calls:

1. **Authentication Check**: User must be authenticated
2. **Rate Limit Check**: Calls `check_and_increment_premium_extraction()` RPC function
3. **Atomic Operation**: The RPC function atomically:
   - Verifies active subscription
   - Checks if user has remaining quota
   - Increments usage counter (using `FOR UPDATE` lock)
   - Auto-resets counter if new month started
4. **Firecrawl Call**: Only proceeds if rate limit not exceeded

### Database Functions

#### `check_and_increment_premium_extraction()`

Atomically checks and increments extraction usage. Returns:

```json
{
  "success": true,
  "can_extract": true,
  "is_premium": true,
  "used": 42,
  "limit": 100,
  "remaining": 58,
  "reset_at": "2025-12-01T00:00:00Z"
}
```

#### `get_premium_extraction_status()`

Read-only function to check current usage without incrementing. Same return format as above.

### Error Responses

When rate limit is exceeded, the API returns `429 Too Many Requests`:

```json
{
  "error": "Monatliches Extraktionslimit erreicht",
  "details": "Sie haben Ihr monatliches Limit von 100 Extraktionen erreicht. Zurücksetzung am 01.12.2025.",
  "usage": {
    "used": 100,
    "limit": 100,
    "remaining": 0,
    "resetAt": "2025-12-01T00:00:00Z"
  }
}
```

## Security Features

1. **Atomic Operations**: Uses PostgreSQL row-level locks (`FOR UPDATE`) to prevent race conditions
2. **Server-Side Only**: All checks happen server-side; client cannot bypass limits
3. **Subscription Verification**: Requires active premium subscription
4. **Auto-Reset**: Counter automatically resets monthly without manual intervention

## Monitoring

To check a user's current usage in Supabase:

```sql
SELECT
  email,
  premium_extractions_used,
  premium_extractions_limit,
  premium_extractions_reset_at,
  (premium_extractions_limit - premium_extractions_used) as remaining
FROM profiles
WHERE id = '<user_id>';
```

## Migration

Run the migration to add rate limiting:

```bash
# Apply migration
psql $DATABASE_URL -f supabase/migrations/20251126_add_premium_extraction_limits.sql
```

The migration adds new columns and functions without disrupting existing data.

## Adjusting Limits

To adjust the monthly limit for all users:

```sql
-- Update default limit for all users
UPDATE profiles SET premium_extractions_limit = 200;
```

To adjust for a specific user:

```sql
-- Update limit for specific user
UPDATE profiles
SET premium_extractions_limit = 500
WHERE id = '<user_id>';
```

## Future Enhancements

Possible improvements:

- Tiered limits (e.g., Pro: 100, Enterprise: 500)
- Admin dashboard for usage monitoring
- Email notifications at 80% usage
- Grace period after limit (e.g., 10% overage)
- Usage analytics and reporting
