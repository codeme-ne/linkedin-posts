# 🚀 Social Transformer

<div align="center">

**Transform newsletters and blog posts into platform-optimized social media content using AI**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-linkedin--posts--one.vercel.app-blue?style=for-the-badge)](https://linkedin-posts-one.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

## 🎯 What is Social Transformer?

Social Transformer is an AI-powered SaaS platform that converts long-form content (newsletters, blog posts, articles) into engaging, platform-optimized social media posts for LinkedIn, X (Twitter), and Instagram.

### ✨ Key Features

- **🤖 AI-Powered Transformation**: Uses Claude API to intelligently adapt content tone and style
- **🎯 Platform Optimization**: Creates tailored posts for LinkedIn, X, and Instagram
- **⚡ Single & Batch Generation**: Generate one post at a time or multiple posts simultaneously
- **💾 Save & Organize**: Store and manage your transformed posts
- **📱 Mobile-First Design**: Fully responsive interface with PWA capabilities
- **💳 Flexible Pricing**: Free tier + Pro subscriptions (monthly/yearly)
- **🔒 Privacy-First**: Secure authentication with Supabase

### 🎬 Demo Video

https://github.com/user-attachments/assets/demo-video.mp4

> 📺 **[Watch the full demo on our live site](https://linkedin-posts-one.vercel.app/)**

### 🎬 How it Works

1. **Paste Content**: Add your newsletter or blog post content
2. **Select Platforms**: Choose LinkedIn, X, Instagram, or all three
3. **AI Magic**: Claude transforms your content with platform-specific optimization
4. **Edit & Polish**: Fine-tune the generated posts with built-in editor
5. **Save & Share**: Store posts for later or share directly

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|----------|
| **Frontend** | React 18 + TypeScript + Vite | Modern, fast development experience |
| **Styling** | TailwindCSS + shadcn/ui | Beautiful, accessible components |
| **Backend** | Vercel Edge Functions | Serverless API routes |
| **Database** | Supabase (PostgreSQL) | User management & data storage |
| **AI** | Anthropic Claude API | Content transformation |
| **Payments** | Stripe | Subscription management |
| **Auth** | Supabase Auth | Secure user authentication |
| **Deployment** | Vercel | Edge-optimized hosting |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/codeme-ne/linkedin-posts.git
cd linkedin-posts

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

**Fill in your `.env` file** with the required API keys:

```env
# Required: Supabase (Database & Auth)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Required: Claude AI
CLAUDE_API_KEY="sk-ant-api03-your-key"

# Required: Stripe (Payments)
VITE_STRIPE_PAYMENT_LINK_MONTHLY="https://buy.stripe.com/monthly"
VITE_STRIPE_PAYMENT_LINK_YEARLY="https://buy.stripe.com/yearly"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Optional: LinkedIn API
LINKEDIN_ACCESS_TOKEN="your-linkedin-token"
LINKEDIN_AUTHOR_URN="urn:li:person:your-id"
```

### 3. Database Setup

1. Create a [Supabase](https://supabase.com/) project
2. Run the SQL migrations in `/supabase/migrations/`
3. Configure authentication providers if needed

### 4. Payment Setup (Optional)

1. Create [Stripe](https://stripe.com/) account
2. Set up products and payment links
3. Configure webhook endpoint: `your-domain/api/stripe-webhook`
4. Add webhook events: `payment_intent.succeeded`, `checkout.session.completed`

### 5. Start Development

```bash
# Start the development server
npm run dev

# Visit your app
open http://localhost:5173
```

---

## 📁 Project Structure

```
linkedin-posts/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── forms/          # Form components
│   ├── pages/              # Route components
│   ├── hooks/              # Custom React hooks
│   ├── libs/               # Utility libraries
│   ├── types/              # TypeScript definitions
│   └── styles/             # Global styles
├── api/                    # Vercel serverless functions
│   ├── claude/            # Claude AI proxy
│   └── stripe-webhook/    # Payment webhooks
├── supabase/
│   └── migrations/        # Database schema
├── public/                # Static assets
└── docs/                  # Documentation
```

---

## 🎨 Key Features Deep Dive

### Single-Post Generation

New feature allowing platform-specific post generation:

- **Hook**: `useContentGeneration` with `generateSinglePost`, `regeneratePost`
- **UI**: `PlatformGenerators` renders individual platform cards
- **Prompting**: `src/libs/promptBuilder.ts` handles platform-specific prompts
- **Location**: Integrated in `src/pages/GeneratorV2.tsx`

### AI Content Transformation

- **Smart Context**: Analyzes content type and audience
- **Platform Adaptation**: Adjusts tone, length, and hashtags per platform
- **Quality Validation**: Built-in content validation with `validatePost`
- **Regeneration**: Easy one-click regeneration with different variations

### User Management

- **Free Tier**: 2 transformations per day
- **Pro Monthly**: €29/month - unlimited transformations
- **Pro Yearly**: €299/year - unlimited transformations + savings
- **Automatic Billing**: Stripe handles all payment processing

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import project to [Vercel](https://vercel.com/)
   - Connect your GitHub repository

2. **Environment Variables**
   - Add all variables from `.env.example`
   - Use Vercel dashboard: Settings → Environment Variables

3. **Domain Setup**
   - Configure custom domain
   - Update CORS origins in environment

### Manual Deployment

```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Deploy to your preferred hosting
# (Netlify, Railway, DigitalOcean, etc.)
```

---

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev                 # Start dev server (port 5173)
npm run dev:frontend        # Frontend only
npm run dev:api            # API only (port 3001)
npm run dev:full           # Both frontend + API

# Production
npm run build              # Build for production
npm run preview            # Preview production build

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # TypeScript checking
npm run test               # Run tests (when implemented)
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended React/TypeScript rules
- **Prettier**: Code formatting (configure in your editor)
- **Conventions**: Functional components, custom hooks, clean architecture

---

## 📊 API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/claude/v1/messages` | POST | Claude AI proxy | ✅ |
| `/api/stripe-webhook` | POST | Payment webhooks | ❌ |
| `/api/linkedin/post` | POST | LinkedIn posting | ✅ |

### Example API Usage

```typescript
// Transform content with Claude
const response = await fetch('/api/claude/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    content: 'Your newsletter content...',
    platform: 'linkedin',
    tone: 'professional'
  })
});
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Setup Development Environment

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the setup instructions above
4. Make your changes
5. Add tests if applicable
6. Commit with clear messages: `git commit -m "Add amazing feature"`
7. Push and create a Pull Request

### Contribution Guidelines

- **Code Quality**: Follow existing patterns and ESLint rules
- **Testing**: Add tests for new features
- **Documentation**: Update README and add inline comments
- **Performance**: Consider impact on bundle size and runtime
- **Accessibility**: Ensure components are accessible

---

## 🔧 Troubleshooting

### Common Issues

**Environment Variables Not Loading**
```bash
# Check file name and location
ls -la .env
# Restart dev server after changes
npm run dev
```

**Supabase Connection Issues**
```bash
# Verify URLs and keys in Supabase dashboard
# Check network connectivity
# Ensure anon key has correct permissions
```

**Claude API Errors**
```bash
# Verify API key format: sk-ant-api03-...
# Check API quota and billing
# Ensure CORS is configured properly
```

**Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

### Getting Help

- 📧 **Email**: [Your contact email]
- 🐛 **Issues**: [GitHub Issues](https://github.com/codeme-ne/linkedin-posts/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/codeme-ne/linkedin-posts/discussions)

---

## 📄 License

**Private Repository** - All rights reserved.

This is proprietary software. See license terms for usage rights.

---

## 🙏 Acknowledgments

- **[Anthropic](https://anthropic.com/)** - Claude AI API
- **[Supabase](https://supabase.com/)** - Backend infrastructure
- **[Vercel](https://vercel.com/)** - Deployment platform
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Stripe](https://stripe.com/)** - Payment processing

---

<div align="center">

**Made with ❤️ by [Lukas Zangerl](https://github.com/codeme-ne)**

[Live Demo](https://linkedin-posts-one.vercel.app/) • [Issues](https://github.com/codeme-ne/linkedin-posts/issues) • [Discussions](https://github.com/codeme-ne/linkedin-posts/discussions)

</div>
