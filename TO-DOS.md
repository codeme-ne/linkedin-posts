# TO-DOS

## Resolved - 2025-11-26

All critical and medium priority items from code review have been resolved.

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

### Database (All Applied via Supabase CLI)
- ✅ **Database indexes** - Already present from migration 007
- ✅ **get_user_id_by_email function** - Applied via `20251126_add_get_user_id_by_email_function.sql`
- ✅ **processed_webhooks table** - Applied via `20250126_create_processed_webhooks.sql`

## Commits
- `672be42` - fix: resolve critical security, performance, and code quality issues
- `88c8d05` - docs: update TO-DOS.md with resolved items

## Code Review Round 2 - 2025-11-26 06:18

### Critical

- **Remove dangerouslyAllowBrowser from Anthropic SDK** - SDK initialized with browser flag that could be exploited. **Problem:** `dangerouslyAllowBrowser: true` enables direct API calls from browser context even with proxy setup. **Files:** `src/api/claude.ts:5-8`. **Solution:** Remove flag, use plain fetch to `/api/claude` proxy instead of Anthropic SDK client-side.

- **Move localStorage cleanup out of useState initializer** - Cleanup logic blocks UI thread on every component mount. **Problem:** O(n) iteration over localStorage.length runs synchronously during render, blocking UI on mobile. **Files:** `src/hooks/useSubscription.ts:124-131`. **Solution:** Move cleanup to useEffect with debounce, or use single marker key.

### High Priority

- **Add Firecrawl rate limiting** - No per-user rate limit before expensive API calls. **Problem:** Active subscription allows unlimited extraction calls, enabling cost-based DoS. **Files:** `api/extract-premium.ts:185-210`. **Solution:** Implement RPC `get_monthly_extraction_usage()` with budget limits per user.

- **Move hardcoded production URL to env var** - Fallback URL hardcoded in auth redirect logic. **Problem:** Domain coupling - if domain changes, auth redirects break silently. **Files:** `src/api/supabase.ts:79`. **Solution:** Use `VITE_FALLBACK_SITE_URL` env var.

- **Fix auth subscription cleanup** - Optional chaining masks unsubscribe failures. **Problem:** `sub?.subscription?.unsubscribe?.()` silently fails if subscription object malformed. **Files:** `src/hooks/useAuth.ts:19-21`. **Solution:** Explicitly check and log if unsubscribe fails.

- **Consolidate usage tracking systems** - Two independent systems track same data. **Problem:** `useSubscription.ts` uses `usage_DATE` keys while `useUsageTracking.ts` uses `freeGenerationsCount` - causes confusion and redundant reads. **Files:** `src/hooks/useSubscription.ts:140-154`, `src/hooks/useUsageTracking.ts:31-43`. **Solution:** Consolidate to single hook with caching.

- **Replace error: any with error: unknown** - Unsafe error type casting in 5+ locations. **Problem:** `catch (error: any)` allows unsafe property access without validation. **Files:** `src/hooks/useContentGeneration.ts:207`, `src/hooks/useEnhancedContentGeneration.ts:99`, `api/stripe-webhook-simplified.ts:57,315`, `api/extract-premium.ts:281`. **Solution:** Use `error: unknown` with `instanceof Error` narrowing.

- **Add type guard for Claude response** - Unsafe type assertion on API response. **Problem:** `(response.content[0] as { text: string }).text` fails silently if response shape differs. **Files:** `src/hooks/useContentGeneration.ts:185`. **Solution:** Add explicit type check before accessing `.text`.

### Medium Priority

- **Extract SavedPosts card to memoized component** - 180 lines of duplicate JSX for mobile/desktop. **Problem:** Identical rendering logic duplicated, increases bundle size and maintenance burden. **Files:** `src/components/common/SavedPosts.tsx:85-368`. **Solution:** Extract PostCard component, use CSS media queries for layout.

- **Wrap generateSinglePost in useCallback** - Function recreated every render. **Problem:** Breaks referential equality, causes unnecessary re-renders in consumers. **Files:** `src/hooks/useContentGeneration.ts:144`. **Solution:** Wrap in useCallback with appropriate deps.

- **Restrict dev CORS to explicit origins** - Dev mode allows any origin if present. **Problem:** Line 42 in cors.ts allows any origin in dev if origin header present, could leak credentials. **Files:** `api/utils/cors.ts:42`. **Solution:** Check against explicit `ALLOWED_ORIGINS_DEV` list only.

- **Add monitoring for Stripe price mismatches** - Mismatch only logs to console. **Problem:** Price validation warns but processes anyway, no alerting. **Files:** `api/stripe-webhook-simplified.ts:140-175`. **Solution:** Send to monitoring system (Sentry/DataDog), consider pausing subscription activation.
