# LinkedIn API Security Migration

## Date: 2025-09-19

## ⚠️ BREAKING CHANGE: LinkedIn Credentials Moved to Server

### Security Issue Fixed
Previously, LinkedIn API credentials were exposed in the client bundle using `VITE_` prefixed environment variables. This was a **critical security vulnerability** identified by Gemini 2.5 Pro's code review.

### What Changed

#### Before (INSECURE):
```env
# Client-side variables (exposed in bundle)
VITE_LINKEDIN_ACCESS_TOKEN="your-token"
VITE_LINKEDIN_AUTHOR_URN="urn:li:person:123"
```

#### After (SECURE):
```env
# Server-side only variables
LINKEDIN_ACCESS_TOKEN="your-token"
LINKEDIN_AUTHOR_URN="urn:li:person:123"
```

### Migration Steps

1. **Remove old VITE_ variables from your .env file**
   ```bash
   # Remove these lines:
   VITE_LINKEDIN_ACCESS_TOKEN=...
   VITE_LINKEDIN_AUTHOR_URN=...
   ```

2. **Add new server-side variables to Vercel**
   ```bash
   vercel env add LINKEDIN_ACCESS_TOKEN production
   vercel env add LINKEDIN_AUTHOR_URN production
   ```

3. **Redeploy your application**
   ```bash
   vercel --prod
   ```

### How It Works Now

1. **Frontend** calls `/api/share/linkedin` with post content
2. **Backend** Edge Function uses server-side credentials
3. **LinkedIn API** is called from server, not client
4. **Response** returns success or falls back to share dialog

### Fallback Behavior

If LinkedIn credentials are not configured or the API fails:
- The app automatically falls back to the LinkedIn share dialog
- Users can still share posts manually
- No functionality is lost

### API Endpoint

```typescript
// POST /api/share/linkedin
{
  content: string  // The post content to share
}

// Response
{
  success?: boolean,
  draftId?: string,
  linkedinUrl?: string,
  fallback?: boolean,
  message?: string
}
```

### Benefits

- ✅ **No credentials exposed** in client bundle
- ✅ **Secure API calls** from server only
- ✅ **Graceful fallback** to share dialog
- ✅ **Better error handling** with user-friendly messages
- ✅ **Optional auth tracking** for analytics

### Testing

1. Open DevTools Network tab
2. Try sharing to LinkedIn
3. Verify no credentials visible in requests
4. Check that `/api/share/linkedin` is called instead

### Troubleshooting

**If sharing doesn't work:**
1. Check Vercel environment variables are set
2. Verify LinkedIn Access Token has `w_member_social` permission
3. Check Edge Function logs in Vercel dashboard
4. The app will automatically fall back to share dialog if any issues

### Note for Local Development

For local development, you can still test the share dialog fallback without setting up LinkedIn API credentials. The Edge Function will detect missing credentials and gracefully fall back.