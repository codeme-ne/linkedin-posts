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

# Type checking
npm run build  # Runs tsc -b && vite build

# Linting
npm run lint

# Production preview
npm run preview
```

## Environment Setup

Required environment variables in `.env`:
- `VITE_CLAUDE_API_KEY` - Anthropic Claude API key
- `VITE_SUPABASE_URL` - Supabase project URL  
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_LINKEDIN_ACCESS_TOKEN` (optional) - LinkedIn API token with w_member_social
- `VITE_LINKEDIN_AUTHOR_URN` (optional) - LinkedIn author URN
- `VITE_OPIK_API_KEY` (optional) - Opik tracking API key

## Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Routing**: React Router v6
- **UI Components**: Radix UI primitives with custom shadcn/ui implementations

### Project Structure
- `/src/api/` - API integrations (Claude, Supabase, LinkedIn)
- `/src/components/` - React components (Auth, UI primitives)
- `/src/design-system/` - Custom design system with tokens and action buttons
- `/src/pages/` - Route pages (Landing, Generator, SignUp)
- `/src/config/` - Configuration files (platforms)
- `/supabase/migrations/` - Database migrations

### Key Features
1. **Multi-platform support**: LinkedIn, X (Twitter), Instagram
2. **Authentication**: Supabase Auth with protected routes
3. **Post Management**: Save, edit, delete posts with platform-specific formatting
4. **Design System**: Consistent button variants and action components

### Database Schema
Main table: `saved_posts`
- `id` (uuid)
- `user_id` (references auth.users)
- `content` (text)
- `platform` (text: 'linkedin', 'x', 'instagram')
- `created_at` (timestamptz)

### API Patterns
- Claude API calls in `/src/api/claude.ts` for content generation
- Supabase client in `/src/api/supabase.ts` for auth and data persistence
- LinkedIn API integration for draft posts (optional)

### Design System Guidelines
- Use predefined ActionButtons from `/src/design-system/components/ActionButtons/`
- Follow button variant conventions (primary, secondary, linkedin, destructive)
- Maintain consistent German language for UI text
- Icons use Lucide React library

### Path Aliases
- `@/` resolves to `/src/` directory
- Configured in both Vite and TypeScript

### State Management
- Local React state for UI
- Supabase for persistent data
- No global state management library currently

### Testing Approach
No test framework currently configured. When adding tests, check package.json first for any test scripts.

## Important Conventions

1. **German UI Text**: Interface text is in German (e.g., "Speichern", "Bearbeiten", "Löschen")
2. **Platform Types**: Use the `Platform` type from `/src/config/platforms.ts`
3. **Button Components**: Always use design system buttons, never raw HTML buttons
4. **Error Handling**: Use toast notifications for user feedback
5. **Auth Flow**: All `/app` routes require authentication via ProtectedRoute component