# Suggested Commands

## Development Commands
```bash
# Install dependencies
npm install

# Run development server (port 5173)
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Quality Checks (Run before committing)
```bash
# Check TypeScript types
npm run build

# Check code style
npm run lint
```

## Git Commands
```bash
# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "feat: your message"

# Push to remote
git push

# View recent commits
git log --oneline -10
```

## System Utilities (Linux)
```bash
# List files
ls -la

# Find files
find . -name "*.tsx"

# Search in files
grep -r "searchterm" .

# View file content
cat filename

# Navigate directories
cd directory

# Current directory
pwd
```

## Database (Supabase)
- Access via Supabase dashboard
- Migrations handled via Supabase CLI or dashboard
- RLS policies configured in dashboard

## Deployment
- Push to main branch triggers Vercel deployment
- Environment variables configured in Vercel dashboard
- Edge Functions automatically deployed with project

## Testing Stripe Payments
```bash
# For local webhook testing (optional)
stripe listen --forward-to localhost:3000/api/stripe-webhook
```
Test card: 4242 4242 4242 4242