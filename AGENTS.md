# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript app (pages, components, hooks, api, design-system, config, lib).
- `api/`: Vercel Edge Functions (e.g., `claude/v1/messages.ts`, `stripe-webhook.ts`).
- `supabase/`: Local config and SQL seeds/migrations.
- `docs/`: Additional docs; see `docs/PROJECT_STRUCTURE.md`.
- Config at root: `vite.config.ts`, `tailwind.config.js`, `eslint.config.js`, `tsconfig*.json`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server.
- `npm run build`: Type-check then build for production.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Run ESLint on the project.

## Coding Style & Naming Conventions
- TypeScript strict mode; prefer explicit types at boundaries.
- ESLint configured for React hooks and refresh; fix lint issues before PRs.
- Indentation: 2 spaces; max line length by formatter/editor default.
- Components: PascalCase files (e.g., `HeroSection.tsx`); shadcn/ui primitives keep lowercase filenames (e.g., `ui/button.tsx`).
- Imports: use path alias `@/*` (see `vite.config.ts` and `tsconfig*`).
- Styling: TailwindCSS + shadcn/ui; avoid ad-hoc CSS when utilities suffice.

## Testing Guidelines
- No formal unit/e2e suite yet. For changes:
  - Add lightweight checks and guard clauses where logic branches.
  - Provide screenshots or screen recordings for UI changes.
  - Use ESLint (`npm run lint`) as a pre-PR gate.
  - Suggested future setup: Vitest for units, Playwright for e2e. Name tests `*.test.ts(x)` colocated with source.

## Commit & Pull Request Guidelines
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, etc. Keep subjects imperative and concise.
- PRs should include:
  - Summary, scope, and rationale; link issues.
  - Before/after screenshots for UI.
  - Notes on env vars, Supabase schema, or API routes touched.
  - Checklist: builds, lints, previewed locally.

## Security & Configuration Tips
- Never commit secrets. Client vars require `VITE_` prefix; server secrets (e.g., `CLAUDE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`) live in the hosting env.
- Keep `.env.example` updated. Validate required vars on boot when possible.
- Edge functions run in `api/`; ensure CORS and error handling are preserved when editing.

For AI/agent contributors: also review `CLAUDE.md` and `SERENA_SETUP.md` for tooling context.
