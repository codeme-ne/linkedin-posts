# Project Structure

## Root Directory
```
linkedin-posts/
├── api/                    # Vercel Edge Functions
│   ├── claude/            # Claude API proxy endpoints
│   ├── extract.ts         # Jina Reader extraction (free)
│   ├── extract-premium.ts # Firecrawl extraction (Pro)
│   └── stripe-webhook.ts  # Stripe payment webhook
├── src/
│   ├── api/               # API integration modules
│   │   ├── claude.ts      # Claude AI integration
│   │   ├── supabase.ts    # Supabase client & auth
│   │   └── linkedin.ts    # LinkedIn API (optional)
│   ├── components/        # React components
│   │   ├── landing/       # Landing page components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Auth.tsx      # Authentication forms
│   │   ├── Generator.tsx  # Main content generator
│   │   └── ...
│   ├── design-system/     # Custom design system
│   │   └── components/    
│   │       └── ActionButtons/
│   ├── pages/            # Route pages
│   │   ├── Landing.tsx   # Public landing page
│   │   ├── SignUp.tsx    # Auth page
│   │   └── Settings.tsx  # User settings
│   ├── config/           # Configuration
│   │   └── platforms.ts  # Platform definitions
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
├── public/               # Static assets
├── .env.example         # Environment template
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite build config
├── tailwind.config.js   # TailwindCSS config
├── vercel.json          # Vercel deployment config
└── CLAUDE.md           # Project documentation
```

## Key Component Hierarchy
- App.tsx (Router)
  - Landing.tsx
    - HeaderBar
    - HeroSection
    - FeaturesGrid
    - ContentFlowGraphic
    - HowItWorks
    - PricingSection
    - CTASection
    - FooterBar
  - Generator.tsx (Protected)
    - PaywallGuard
    - Platform selector
    - Input textarea
    - Generated posts display
  - Settings.tsx (Protected)
    - Subscription status
    - User management

## Database Tables
- `saved_posts` - User's saved social media posts
- `subscriptions` - Stripe subscription data
- `extraction_usage` - Premium extraction tracking