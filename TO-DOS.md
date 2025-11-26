# TO-DOS

## Resolved - 2025-11-26

All critical and medium priority items from code review have been resolved in commit `672be42`.

### Critical Fixes (All Resolved)
- ✅ **Move LinkedIn token to server-side** - Removed VITE_ prefix exposure, token now server-only
- ✅ **Fix N+1 user lookup in webhook** - Using `get_user_id_by_email` RPC for direct lookup
- ✅ **Parallelize platform generation** - Using `Promise.allSettled` for 3x faster generation
- ✅ **Add SSRF protection to URL extraction** - Created `api/utils/urlValidation.ts` with blocklist
- ✅ **Fix CORS configuration issues** - Added production fallback domains and proper localhost validation
- ✅ **Remove duplicate subscription queries** - Single query for both status and access checks

### Medium Priority Fixes (All Resolved)
- ✅ **Add JSON parsing size limits** - Created `api/utils/safeJson.ts` with size limits (100KB Claude, 10KB others)
- ✅ **Implement webhook replay protection** - Added timestamp tolerance + `processed_webhooks` table
- ✅ **Fix state accumulation memory leak** - Added cleanup effect on unmount
- ✅ **Clean up localStorage usage tracking** - Added cleanup of stale `usage_*` keys

## Manual Action Required

- ⚠️ **Add database indexes** - Run the following SQL in Supabase:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);
  ```

- ⚠️ **Run database migrations** - Apply migrations from `supabase/migrations/`:
  - `20251126_add_get_user_id_by_email_function.sql`
  - `20250126_create_processed_webhooks.sql`
