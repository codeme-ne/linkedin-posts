# TO-DOS

## Code Review Critical Findings - 2025-11-26 05:47

- **Move LinkedIn token to server-side** - LinkedIn access token exposed to client bundle via VITE_ prefix. **Problem:** Token accessible in production JS bundles; anyone can extract from DevTools and post on behalf of account. **Files:** `src/config/app.config.ts:187,340`. **Solution:** Create server-side proxy endpoint `/api/linkedin/post`, remove VITE_LINKEDIN_ACCESS_TOKEN from client config, rotate current token immediately.

- **Fix N+1 user lookup in webhook** - Webhook loads ALL users on every checkout event. **Problem:** O(n) query that will timeout at scale (20s+ at 10k users), causing payment failures. **Files:** `api/stripe-webhook-simplified.ts:88-91`. **Solution:** Use email-filtered query `supabase.auth.admin.listUsers({ filter: { email: customer.email } })` or direct user lookup.

- **Parallelize platform generation** - Sequential AI generation loop causes 3x slower multi-platform generation. **Problem:** Current: 3 platforms x 5s = 15 seconds. Could be: max(5s) = 5 seconds. **Files:** `src/hooks/useContentGeneration.ts:57-93`. **Solution:** Replace `for...of` loop with `Promise.allSettled` for parallel execution with proper error isolation.

- **Add SSRF protection to URL extraction** - URL validation only checks protocol, no hostname blocklist. **Problem:** Vulnerable to SSRF attacks targeting private IPs, cloud metadata (169.254.169.254), internal services. **Files:** `api/extract.ts:139-149`, `api/extract-premium.ts:183-193`. **Solution:** Add blocklist for localhost, private IP ranges (10.x, 172.16-31.x, 192.168.x), and cloud metadata endpoints.

- **Fix CORS configuration issues** - Development mode allows ANY origin with credentials, production has no fallback. **Problem:** Invalid CORS spec combination in dev; production fails silently if env var unset. **Files:** `api/utils/cors.ts:6-10,26-29`. **Solution:** Validate localhost pattern in dev, add hardcoded production fallback domains.

- **Remove duplicate subscription queries** - Two database queries to same table per premium extraction request. **Problem:** 50-100ms wasted per request, 50% redundant DB load. **Files:** `api/extract-premium.ts:156-170,196`. **Solution:** Use single query result for both subscription status and premium access checks.

## Code Review Medium Priority - 2025-11-26 05:47

- **Add JSON parsing size limits** - Edge functions parse request bodies without size limits. **Problem:** Memory exhaustion via large JSON payloads, potential DoS vector. **Files:** `api/claude/v1/messages.ts:31`, `api/extract-premium.ts:173`, `api/stripe/create-checkout.ts:25`. **Solution:** Create safe JSON parsing utility with Content-Length check and streaming size limit.

- **Implement webhook replay protection** - No timestamp validation or idempotency tracking. **Problem:** Replayed webhooks can cause double-charging or state corruption. **Files:** `api/stripe-webhook-simplified.ts:54-59`. **Solution:** Add timestamp tolerance (5 min), create `processed_webhooks` table with event_id tracking.

- **Add database indexes** - Missing indexes on frequently queried columns. **Problem:** Query performance degrades at scale (500ms vs 2ms at 10k records). **Files:** Supabase schema. **Solution:** Add indexes on `subscriptions(user_id)`, `subscriptions(stripe_subscription_id)`, `subscriptions(is_active)`.

- **Fix state accumulation memory leak** - generatedPosts state grows unbounded across session. **Problem:** Memory leak in long-running sessions, especially on mobile. **Files:** `src/hooks/useContentGeneration.ts:26-27`. **Solution:** Add cleanup effect on unmount, implement session-based clearing.

- **Clean up localStorage usage tracking** - Old usage entries never cleaned. **Problem:** localStorage accumulates stale `usage_*` keys over time. **Files:** `src/hooks/useSubscription.ts:118-137`. **Solution:** Add cleanup on read to remove entries from previous days.
