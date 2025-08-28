# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Content Remixer - A React-based social media content generation tool that transforms text (newsletters, blogs) into platform-optimized posts for LinkedIn, X (Twitter), and Instagram using Claude AI.

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
- `VITE_CLAUDE_API_KEY` - Anthropic Claude API key  
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_LINKEDIN_ACCESS_TOKEN` (optional) - LinkedIn API token with w_member_social
- `VITE_LINKEDIN_AUTHOR_URN` (optional) - LinkedIn author URN
- `VITE_OPIK_API_KEY` (optional) - Opik tracking API key

**Note**: Only `VITE_` prefixed variables are exposed to the client. The Edge Function uses `CLAUDE_API_KEY` (without prefix) on Vercel.

## Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Anthropic Claude API via Edge Function proxy
- **Routing**: React Router v6
- **UI Components**: Radix UI primitives with custom shadcn/ui implementations
- **Deployment**: Vercel with Edge Functions

### API Architecture
The app uses an Edge Function proxy pattern for Claude API calls:
1. Client calls `/api/claude` (configured in `/src/api/claude.ts`)
2. Edge Function (`/api/claude.ts`) proxies to Anthropic API with server-side key
3. Keeps API key secure, never exposed to client

### Routing Structure
- `/` - Public landing page
- `/signup` - Authentication page  
- `/app` - Protected generator (requires auth via ProtectedRoute)
- All undefined routes redirect to landing

### Database Schema
Main table: `saved_posts`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `content` (text)
- `platform` (text: 'linkedin', 'x', 'instagram')
- `created_at` (timestamptz)

### Key Directories
- `/src/api/` - API integrations (Claude, Supabase, LinkedIn)
- `/src/components/` - React components (Auth, UI primitives)
- `/src/design-system/` - Custom design system with tokens and action buttons
- `/src/pages/` - Route pages (Landing, Generator, SignUp)
- `/src/config/` - Configuration files (platforms)
- `/api/` - Vercel Edge Functions
- `/supabase/migrations/` - Database migrations

### Path Aliases
- `@/` resolves to `/src/` directory
- Configured in both `vite.config.ts` and `tsconfig.json`

## Content Generation Flow

1. User inputs text in Generator component
2. Platform-specific function called (e.g., `linkedInPostsFromNewsletter`)
3. Request sent to Edge Function proxy at `/api/claude`
4. Edge Function adds API key and forwards to Anthropic
5. Response parsed for platform-specific format (LINKEDIN:, X:, INSTAGRAM: prefixes)
6. Posts displayed and can be saved to Supabase

## Important Conventions

1. **German UI Text**: Interface text is in German (e.g., "Speichern", "Bearbeiten", "Löschen")
2. **Platform Types**: Use the `Platform` type from `/src/config/platforms.ts`
3. **Button Components**: Always use design system buttons from `/src/design-system/components/ActionButtons/`
4. **Error Handling**: Use toast notifications for user feedback
5. **Auth Flow**: All `/app` routes require authentication via ProtectedRoute component
6. **API Security**: Never expose API keys client-side; use Edge Function proxy pattern
7. **Post Format Parsing**: Each platform uses specific prefixes (LINKEDIN:, X:, INSTAGRAM:) for multi-post parsing