# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Social Transformer - A React-based SaaS application that transforms newsletters and blog posts into platform-optimized social media content for LinkedIn, X (Twitter), and Instagram using Claude AI. Features a Stripe-powered Beta Lifetime Deal (49€) with subscription management.

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Development server (http://localhost:5173)
npm run build      # TypeScript check + production build
npm run lint       # ESLint code quality check
npm run preview    # Preview production build
```

## Environment Setup

Create `.env` from `.env.example` with:
- `VITE_CLAUDE_API_KEY` - Anthropic Claude API key (not actually used client-side, kept for compatibility)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_STRIPE_PAYMENT_LINK` - Stripe payment link URL
- `VITE_LINKEDIN_ACCESS_TOKEN` (optional) - LinkedIn API token with w_member_social
- `VITE_LINKEDIN_AUTHOR_URN` (optional) - LinkedIn author URN
- `VITE_OPIK_API_KEY` (optional) - Opik tracking API key

**Production (Vercel) requires additional:**
- `CLAUDE_API_KEY` - Server-side Claude API key (without VITE_ prefix)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret for payment processing  
- `SUPABASE_SERVICE_ROLE_KEY` - Required for webhook to bypass RLS and save payment data
- `FIRECRAWL_API_KEY` - Firecrawl API key for premium content extraction (Pro users only)

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom design system
- **Database**: Supabase (PostgreSQL with RLS)
- **AI**: Anthropic Claude API via Edge Function proxy
- **Payments**: Stripe (webhooks + payment links)
- **Deployment**: Vercel with Edge Functions

### Key Routes
- `/` - Landing page (public)
- `/signup` - Authentication
- `/app` - Post generator (protected via ProtectedRoute)
- `/settings` - User settings (protected)

### API Endpoints (Edge Functions)
- `/api/claude/v1/messages` - Claude AI proxy (keeps API key server-side)
- `/api/extract` - Standard content extraction (Jina Reader, free)
- `/api/extract-premium` - Premium extraction (Firecrawl, Pro only, 20/month limit)
- `/api/stripe-webhook` - Payment processing

### Database Schema

**`saved_posts` table:**
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `content` (text)
- `platform` (text: 'linkedin', 'x', 'instagram')
- `created_at` (timestamptz)

**`subscriptions` table:**
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `stripe_customer_id` (text)
- `stripe_subscription_id` (text)
- `stripe_payment_intent_id` (text)
- `status` (text: 'trial', 'active', 'canceled', 'past_due')
- `is_active` (boolean, generated)
- `amount` (integer)
- `currency` (text)
- `interval` (text)
- `current_period_start/end` (timestamptz)
- `trial_starts_at/ends_at` (timestamptz)
- `created_at/updated_at` (timestamptz)
- `extraction_limit` (integer, default: 20) - Monthly limit for premium extractions
- `extraction_reset_at` (timestamptz) - When the monthly limit resets

**`extraction_usage` table:**
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `extraction_type` (text: 'jina' or 'firecrawl')
- `url` (text)
- `extracted_at` (timestamptz)
- `success` (boolean)
- `error_message` (text)
- `metadata` (jsonb)
- `created_at` (timestamptz)

### Project Structure
- `/api/` - Vercel Edge Functions (Claude proxy, webhooks, extraction)
- `/src/api/` - Client-side API integrations  
- `/src/components/` - React components
- `/src/design-system/` - Custom design tokens and action buttons
- `/src/pages/` - Route components (Landing, Generator, SignUp)
- `/src/config/` - **Central configuration system (Ship Fast pattern)**
  - `app.config.ts` - Main app configuration with Stripe plans, features, and settings
  - `env.config.ts` - Type-safe environment variable management
  - `platforms.ts` - Platform definitions (LinkedIn, X, Instagram)
  - `index.ts` - Centralized exports for all configuration
- `/src/libs/` - **Infrastructure libraries (Ship Fast pattern)**
  - `stripe.ts` - Server-side Stripe utilities with error handling
  - `api-client.ts` - Enhanced API client with German UI and auth integration
- **Path Alias**: `@/` → `/src/`

## Content Generation Flow

1. User inputs text in Generator component
2. Platform-specific function called (e.g., `linkedInPostsFromNewsletter`, `xTweetsFromBlog`)
3. Request sent to Edge Function proxy at `/api/claude/v1/messages`
4. Edge Function adds API key and forwards to Anthropic
5. Response parsed for platform-specific format
6. Posts displayed and can be saved to Supabase

### Platform-specific Generation
- **LinkedIn**: Uses custom German prompt with specific formatting rules (short sentences, line breaks, no hashtags/emojis)
- **X (Twitter)**: Complex German prompt with blog analysis, tweet extraction, and sanitization (280 char limit, no emojis/hashtags)
- **Instagram**: Adapts LinkedIn posts with hashtags, max 2200 characters

## Important Conventions

1. **German UI Text**: Interface text is in German (e.g., "Speichern", "Bearbeiten", "Löschen")
2. **Central Configuration**: Always use functions from `/src/config/app.config.ts` for:
   - Stripe plans: `getStripePlan()`, `getDefaultStripePlan()`
   - Feature flags: `isFeatureEnabled()`
   - Environment: `validateEnvironment()`, `getEnvironmentConfig()`
   - Pricing: `formatPrice()`, `getPaymentLink()`
3. **Platform Types**: Use the `Platform` type from `/src/config/platforms.ts`
4. **Button Components**: Always use design system buttons from `/src/design-system/components/ActionButtons/`
5. **Error Handling**: Use toast notifications for user feedback
6. **Auth Flow**: All `/app` routes require authentication via ProtectedRoute component
7. **API Security**: Never expose API keys client-side; use Edge Function proxy pattern
8. **Post Format Parsing**: 
   - LinkedIn: Posts prefixed with `LINKEDIN:` 
   - X: Tweets extracted from XML tags `<tweet1>` through `<tweet5>`
   - Instagram: Adapted from LinkedIn posts with hashtags

## Subscription & Payment Flow

1. **Paywall Protection**: Use `PaywallGuard` component to protect premium features
2. **Subscription Check**: `useSubscription` hook fetches user's subscription status
3. **Payment Processing**: 
   - Stripe Payment Link configured in env vars
   - Webhook handler at `/api/stripe-webhook` processes payments
   - Creates/updates subscription records in Supabase
4. **Beta Lifetime Deal**: 49€ one-time payment, no expiration date

## Stripe Testing

Use test mode credentials during development:
- Test card: `4242 4242 4242 4242`
- Payment link already configured in env vars
- Webhook endpoint: `/api/stripe-webhook`
- Local testing: Use Stripe CLI with `stripe listen --forward-to localhost:3000/api/stripe-webhook`

## URL Content Extraction

### Standard Extraction (Free)
- **Endpoint**: `/api/extract` - Uses Jina Reader API
- Unlimited usage for all users

### Premium Extraction (Pro only)
- **Endpoint**: `/api/extract-premium` - Uses Firecrawl Scrape API  
- JavaScript rendering support for dynamic content
- Limited to 20 extractions/month per user
- Tracks usage in `extraction_usage` table

## Code Quality Checks

Before committing or deploying:
- **TypeScript**: Run `npm run build` to catch type errors (uses project references)
- **Linting**: Run `npm run lint` to check code style
- **Unused code**: Remove or prefix unused parameters with underscore (`_param`)
- **Development server**: Runs on port 5173 (http://localhost:5173)

**Note**: No testing framework is currently configured. Consider adding Vitest or Jest for unit tests.


## Database Notes

- All migrations have been applied and `/supabase/migrations/` was removed
- RLS policies are enabled for all tables
- `get_monthly_extraction_usage` RPC function tracks premium usage

**PostgreSQL Tip**: When adding multiple columns, each needs its own `ADD COLUMN`:
```sql
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS column1 text,
  ADD COLUMN IF NOT EXISTS column2 text;
```

## Common Debugging Scenarios

### Subscription Not Recognized
- Verify Stripe webhook is processing payments correctly
- Check `subscriptions` table for user's subscription status
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for webhook RLS bypass
- Check browser console for subscription fetch errors

### Content Not Extracting
- For standard extraction: Check if Jina API is accessible
- For premium: Verify Firecrawl API key is set in environment variables
- Check CORS headers in Edge Function responses
- Verify authentication token is being passed correctly