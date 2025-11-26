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
