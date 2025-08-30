# Task Completion Checklist

When completing any coding task, follow these steps:

## 1. Code Quality Checks
```bash
# Run TypeScript type checking
npm run build

# Run linting
npm run lint
```

## 2. Test Functionality
- Start dev server: `npm run dev`
- Test the feature manually in browser
- Check both desktop and mobile views
- Test with both authenticated and unauthenticated states (if applicable)

## 3. Review Changes
- Review all modified files
- Ensure no debug console.logs remain
- Verify no API keys are exposed
- Check that German UI text is correct

## 4. Commit Guidelines
- Stage changes: `git add .`
- Write descriptive commit message
- Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for code improvements
  - `docs:` for documentation
  - `style:` for formatting changes

## 5. Important Reminders
- NEVER modify .env file
- NEVER commit sensitive data
- ALWAYS use Edge Functions for API keys
- ALWAYS test mobile responsiveness
- ALWAYS handle errors gracefully

## 6. Common Issues to Check
- TypeScript errors resolved
- No duplicate code blocks
- Responsive classes applied (md: breakpoints)
- Loading states implemented
- Error messages user-friendly (in German)