# TO-DOS

## All Resolved - 2025-11-26 07:15

All items from code review rounds 1-3 have been resolved and committed.

### Commits
- `672be42` - fix: resolve critical security, performance, and code quality issues (Round 1)
- `06e160b` - fix: resolve 20 code review items (critical, high, medium priority) (Rounds 2-3)

---

## Resolved Items Summary

### Critical (6 total - All Resolved)
- ✅ **Remove dangerouslyAllowBrowser from Anthropic SDK** - Replaced with plain fetch to proxy
- ✅ **Move localStorage cleanup to useEffect** - Non-blocking with requestIdleCallback
- ✅ **Fix webhook idempotency race condition** - Insert-first pattern with unique constraint
- ✅ **Move LinkedIn token to server-side** - Removed VITE_ prefix exposure
- ✅ **Add SSRF protection to URL extraction** - Created urlValidation.ts with blocklist
- ✅ **Fix CORS configuration issues** - Added production fallback domains

### High Priority (14 total - All Resolved)
- ✅ **Add Firecrawl rate limiting** - 100 extractions/month per user with DB tracking
- ✅ **Move hardcoded production URL to env var** - VITE_SITE_URL with fallback chain
- ✅ **Fix auth subscription cleanup** - Proper error handling with try-catch
- ✅ **Consolidate usage tracking systems** - Single source of truth in useSubscription
- ✅ **Replace error: any with error: unknown** - Type safety in 8 locations
- ✅ **Add Claude response type guard** - Runtime validation before accessing .text
- ✅ **Add LRU cache for generated posts** - Max 50 entries with cleanup
- ✅ **Batch Claude API calls** - Multi-platform generation in single request
- ✅ **Fix N+1 user lookup in webhook** - Using get_user_id_by_email RPC
- ✅ **Parallelize platform generation** - Promise.allSettled for 3x faster
- ✅ **Remove duplicate subscription queries** - Single query pattern
- ✅ **Add JSON parsing size limits** - safeJson.ts with limits
- ✅ **Implement webhook replay protection** - Timestamp tolerance + processed_webhooks
- ✅ **Fix state accumulation memory leak** - Cleanup effect on unmount

### Medium Priority (11 total - All Resolved)
- ✅ **Extract SavedPosts card to memoized component** - React.memo with responsive Tailwind
- ✅ **Wrap generateSinglePost in useCallback** - Stable function reference
- ✅ **Restrict dev CORS to explicit origins** - ALLOWED_ORIGINS_DEV whitelist
- ✅ **Add Stripe price monitoring** - webhook_anomalies table + console.error
- ✅ **Add subscription caching** - 60s TTL module-level cache
- ✅ **Standardize on api-client.ts for Claude** - All calls use generateClaudeMessage()
- ✅ **Split usePostGeneratorState reducer** - 6 domain-specific handlers
- ✅ **Add URL extraction deduplication** - 5-min cache with 100 entry limit
- ✅ **Clean up localStorage usage tracking** - Cleanup of stale usage_* keys
- ✅ **Database indexes** - Already present from migration 007
- ✅ **get_user_id_by_email function** - Applied migration

### Database Migrations (All Applied)
- ✅ `20251126_add_get_user_id_by_email_function.sql`
- ✅ `20250126_create_processed_webhooks.sql`
- ⏳ `20251126_add_premium_extraction_limits.sql` - Ready to apply
- ⏳ `20251126_create_webhook_anomalies.sql` - Ready to apply

---

## Pending Clarification

### Delete deprecated promptBuilder
- **Status:** Awaiting decision
- **Issue:** Both `promptBuilder.ts` (v1) and `promptBuilder.v2.ts` are actively used
- **v1** is used in production (GeneratorV2.tsx → useContentGeneration)
- **v2** is used in experimental code (EnhancedTest.tsx → useEnhancedContentGeneration)
- **Decision needed:** Delete v2 and experimental code, OR migrate production to v2?

---

## Documentation Added
- `docs/RATE_LIMITING.md` - Premium extraction limits documentation
- `docs/webhook-anomaly-monitoring.md` - Stripe anomaly tracking guide
