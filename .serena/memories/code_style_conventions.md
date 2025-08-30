# Code Style and Conventions

## Language & Localization
- **UI Text**: German language for all user-facing text
- **Code Comments**: English (minimal comments, self-documenting code preferred)
- **Variable Names**: English, camelCase for variables, PascalCase for components

## TypeScript Conventions
- Strict type checking enabled
- Use type inference where possible
- Explicit return types for functions
- Interface over type for object shapes
- Prefix unused parameters with underscore (_param)

## React Conventions
- Functional components only (no class components)
- Custom hooks for reusable logic (e.g., useSubscription, useTypewriter)
- Props interfaces defined with ComponentNameProps pattern
- Destructure props in function signature

## File Organization
- Components in /src/components/ with subfolders by feature
- Pages in /src/pages/
- API integrations in /src/api/
- Design system in /src/design-system/
- Config files in /src/config/

## Styling Conventions
- TailwindCSS utility classes preferred
- Responsive design with mobile-first approach (use md: breakpoints)
- Dark mode support with dark: variants
- Custom design tokens in design system

## Component Guidelines
- Always use design system buttons from /src/design-system/components/ActionButtons/
- Use toast notifications for user feedback
- Implement loading states for async operations
- Handle errors gracefully with user-friendly messages

## API Patterns
- Edge Function proxy for sensitive API calls
- Never expose API keys client-side
- Use VITE_ prefix for client environment variables
- Server-side keys without VITE_ prefix

## Platform-specific Rules
- LinkedIn: Short sentences, line breaks, no hashtags/emojis
- X (Twitter): 280 character limit, thread format
- Instagram: Include hashtags, max 2200 characters