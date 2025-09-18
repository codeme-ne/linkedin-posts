# Social Transformer

Transform newsletters and blog posts into platform-optimized social media content using AI.

## Features


### Neu: Single-Post-Generierung pro Plattform

Zusätzlich zur bestehenden Batch-Generierung gibt es nun eine Single-Post-Generierung:

- Hook: `useContentGeneration` enthält `generateSinglePost`, `regeneratePost`, `isGenerating` und `generatedPosts`
- UI: `PlatformGenerators` rendert pro Plattform eine eigene Kachel mit Generieren/Regenerieren und Inline-Editor
- Prompting: `src/libs/promptBuilder.ts` kapselt plattformspezifische Prompts und `validatePost`

Einbindung auf der Seite `src/pages/Generator.tsx` unterhalb des Haupt-Formulars.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Backend**: Vercel Edge Functions
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Payments**: Stripe (webhooks + payment links)
- **Auth**: Supabase Auth

## Setup

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account (for payments)
- Anthropic API key (for Claude)

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/your-username/linkedin-posts.git
cd linkedin-posts
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

3. **Configure `.env` file:**

#### Client-side variables (VITE_ prefix):
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key (public)
- `VITE_STRIPE_PAYMENT_LINK` — Stripe payment link URL

#### Server-side variables (for Vercel deployment):
- `CLAUDE_API_KEY` — Anthropic Claude API key
- `SUPABASE_URL` — Same as VITE_SUPABASE_URL (without prefix)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (secret)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret

#### Optional:
- `VITE_LINKEDIN_ACCESS_TOKEN` — LinkedIn API token with `w_member_social` scope
- `VITE_LINKEDIN_AUTHOR_URN` — LinkedIn author URN (e.g., `urn:li:person:XXX`)

4. **Set up Supabase database:**

Run the migrations in `/supabase/migrations/` in your Supabase SQL editor.

5. **Start development server:**
```bash
npm run dev
```

## Stripe Setup

### Test Mode (Development)

1. **Create Test Payment Link:**
   - Go to Stripe Dashboard → Switch to TEST mode
   - Create product: "Beta Lifetime Deal" - €49 one-time
   - Create payment link with email collection enabled
   - Add to `.env`: `VITE_STRIPE_PAYMENT_LINK`

2. **Configure Webhook:**
   - Go to Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.vercel.app/api/stripe-webhook`
   - Events: `payment_intent.succeeded`, `checkout.session.completed`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

3. **Test with card:** `4242 4242 4242 4242`

### Production Mode

Replace test credentials with live ones when ready to accept real payments.

## Deployment

### Vercel Deployment

1. **Push to GitHub**

2. **Import to Vercel:**
   - Connect GitHub repository
   - Configure environment variables (all from `.env` plus server-side ones)

3. **Environment Variables in Vercel:**
   - All `VITE_*` variables from `.env`
   - `CLAUDE_API_KEY` (server-side)
   - `SUPABASE_URL` (without VITE_ prefix)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`

## Usage

### For Users

1. **Free Tier:** 2 transformations per day
2. **Pro Tier:** €29/month or €299/year, unlimited transformations
3. **Workflow:**
   - Paste newsletter/blog content
   - Select target platforms (LinkedIn, X, Instagram)
   - Click "Transform"
   - Edit, save, or share generated posts

### API Routes

- `/api/claude/v1/messages` - Claude AI proxy endpoint
- `/api/stripe-webhook` - Stripe payment webhook handler

## Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## License

Private repository - All rights reserved
