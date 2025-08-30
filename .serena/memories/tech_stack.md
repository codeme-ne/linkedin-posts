# Tech Stack

## Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui implementations
- **Routing**: React Router v6
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect, useRef)

## Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Anthropic Claude API via Edge Function proxy
- **Deployment**: Vercel with Edge Functions
- **Payment Processing**: Stripe (Payment Links + Webhooks)
- **Content Extraction**: 
  - Jina Reader API (standard)
  - Firecrawl API (premium)

## Development Tools
- **TypeScript**: Strict type checking
- **ESLint**: Code linting
- **Path Aliases**: @/ resolves to /src/
- **Environment Variables**: Vite's VITE_ prefix for client-side vars

## Architecture Patterns
- Edge Function proxy pattern for secure API key management
- Protected routes with authentication guards
- Component-based architecture with design system
- Server-side API key handling (never exposed to client)