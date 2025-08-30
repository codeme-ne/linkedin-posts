# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Social Transformer - A React-based SaaS application that transforms newsletters and blog posts into platform-optimized social media content for LinkedIn, X (Twitter), and Instagram using Claude AI. Features a Stripe-powered Beta Lifetime Deal (49€) with subscription management.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 5173)
npm run dev

# Build (TypeScript check + Vite build)
npm run build

# Linting
npm run lint

# Production preview
npm run preview
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
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Anthropic Claude API via Edge Function proxy
- **Routing**: React Router v6
- **UI Components**: Radix UI primitives with custom shadcn/ui implementations
- **Icons**: Lucide React for consistent iconography
- **Deployment**: Vercel with Edge Functions

### API Architecture
The app uses an Edge Function proxy pattern for Claude API calls:
1. Client calls `/api/claude/v1/messages` (configured in `/src/api/claude.ts`)
2. Edge Function (`/api/claude/v1/messages.ts`) proxies to Anthropic API with server-side key
3. Keeps API key secure, never exposed to client
4. Production URL: `https://linkedin-posts-ashen.vercel.app/api/claude`

### Routing Structure
- `/` - Public landing page
- `/signup` - Authentication page  
- `/app` - Protected generator (requires auth via ProtectedRoute)
- All undefined routes redirect to landing

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

### Key Directories
- `/src/api/` - API integrations (Claude, Supabase, LinkedIn)
- `/src/components/` - React components (Auth, UI primitives)
- `/src/design-system/` - Custom design system with tokens and action buttons
- `/src/pages/` - Route pages (Landing, Generator, SignUp)
- `/src/config/` - Configuration files (platforms)
- `/api/` - Vercel Edge Functions (Claude proxy, webhooks)
- `/supabase/` - Local Supabase config (`config.toml`)

### Path Aliases
- `@/` resolves to `/src/` directory
- Configured in both `vite.config.ts` and `tsconfig.json`

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
2. **Platform Types**: Use the `Platform` type from `/src/config/platforms.ts`
3. **Button Components**: Always use design system buttons from `/src/design-system/components/ActionButtons/`
4. **Error Handling**: Use toast notifications for user feedback
5. **Auth Flow**: All `/app` routes require authentication via ProtectedRoute component
6. **API Security**: Never expose API keys client-side; use Edge Function proxy pattern
7. **Post Format Parsing**: 
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

The app includes TWO extraction methods:

### 1. Standard Extraction (Free for all users)
**Endpoint**: `/api/extract` (Edge Function)
- Uses Jina Reader API (`https://r.jina.ai/`)
- Basic content extraction with footer truncation
- Unlimited usage for all users
- Returns markdown-formatted content with title and plain text

### 2. Premium Extraction (Pro users only)
**Endpoint**: `/api/extract-premium` (Edge Function)
- Uses Firecrawl API (requires `FIRECRAWL_API_KEY`)
- JavaScript rendering support for dynamic content
- Better quality extraction for complex websites
- Limited to 20 extractions per month per Pro user
- Tracks usage in `extraction_usage` table
- Uses RPC function: `get_monthly_extraction_usage(user_id, 'firecrawl')`

### UI Implementation (Generator.tsx)
- Checkbox for "Premium-Extraktion" visible to ALL users (good for conversion)
- Free users see "Pro" badge next to checkbox
- When free users try to check it, they get the paywall modal
- Pro users see usage count: "(X/20 übrig)" 
- State managed with:
  - `usePremiumExtraction` - boolean for checkbox state
  - `extractionUsage` - object with used/limit/remaining counts
- Located above the textarea input field

## Code Quality Checks

Before committing or deploying:
- **TypeScript**: Run `npm run build` to catch type errors (uses project references)
- **Linting**: Run `npm run lint` to check code style
- **Unused code**: Remove or prefix unused parameters with underscore (`_param`)
- **Development server**: Runs on port 5173 (http://localhost:5173)

**Note**: No testing framework is currently configured. Consider adding Vitest or Jest for unit tests.

## Recent Development Activity

The most recent commits focused on:

- **Premium Extraction Feature**: Added Firecrawl API integration for Pro users
- **Usage Tracking**: Implemented 20/month limit with database tracking
- **UI Enhancement**: Added premium extraction checkbox with paywall for free users
- **Database Setup**: Created `extraction_usage` table and tracking functions

## Database Setup Notes

**IMPORTANT**: All migrations have been applied. The `/supabase/migrations/` folder was removed after successful deployment.

The database schema is now live in Supabase with:

- `extraction_usage` table for tracking premium extraction usage
- `extraction_limit` and `extraction_reset_at` columns in subscriptions table
- `get_monthly_extraction_usage` RPC function for usage checks
- RLS policies enabled for security

When adding multiple columns to a PostgreSQL table, each column needs its own `ADD COLUMN` clause:

```sql
-- Correct syntax
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS column1 text,
  ADD COLUMN IF NOT EXISTS column2 text,
  ADD COLUMN IF NOT EXISTS column3 text DEFAULT 'value';

-- Incorrect syntax (will cause error)
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS
  column1 text,
  column2 text,
  column3 text DEFAULT 'value';
```
