# Social Transformer Libraries

Ship Fast-inspired infrastructure libraries for Social Transformer, providing robust backend functionality with German UI support.

## Files Overview

### `stripe.ts`
Structured Stripe utility functions for server-side operations:
- `createCustomerPortal()` - Create billing portal sessions
- `createCheckoutSession()` - Create checkout sessions with proper configuration  
- `findCheckoutSession()` - Retrieve sessions with expanded line items
- `validateStripeConfig()` - Environment variable validation
- `formatPrice()` - Currency formatting utilities

**Usage:**
```typescript
import { createCustomerPortal } from './libs/stripe';

const portalUrl = await createCustomerPortal({
  customerId: 'cus_123',
  returnUrl: 'https://app.example.com/settings'
});
```

### `api-client.ts` 
Enhanced API client with comprehensive error handling:
- Automatic Supabase auth token injection
- Response/error interceptors with German UI messages
- 401 handling (redirect to login)
- 403 handling (upgrade prompts)
- Network error handling with user-friendly toasts
- Request timeout management

**Usage:**
```typescript
import { post, createCustomerPortal } from './libs/api-client';

// Generic API calls
const data = await post('/api/some-endpoint', { param: 'value' });

// Specific function for customer portal
const { url } = await createCustomerPortal('https://app.example.com/settings');
```

## Integration Points

### API Endpoints
- `/api/stripe/create-portal.ts` - Customer portal creation with Supabase auth
- Enhanced `/api/stripe-webhook.ts` with better error handling and logging

### React Hooks
- `useSubscription()` - Complete subscription management hook
- Automatic auth state synchronization
- Customer portal integration

### React Components
- `CustomerPortalButton` - One-click portal access
- `SubscriptionStatus` - Complete subscription overview

## Security Features

1. **Auth Token Management**: Automatic injection of Supabase JWT tokens
2. **Error Boundary**: Comprehensive error handling without exposing internals  
3. **Input Validation**: All API inputs are validated before processing
4. **Rate Limiting**: Built-in request timeout and retry logic

## German UI Support

All user-facing messages are in German:
- "Anmeldung erforderlich" (Login required)
- "Upgrade erforderlich" (Upgrade required)  
- "Serverfehler" (Server error)
- "Netzwerkfehler" (Network error)

## Configuration Integration

Works seamlessly with the new central configuration system:
- `/src/config/app.config.ts` - Central app configuration
- `/src/config/env.config.ts` - Environment variable management
- Automatic validation and type-safe access to all settings

## Environment Variables

See `/src/config/env.config.ts` for complete environment variable documentation. Key requirements:
- `STRIPE_SECRET_KEY` - Server-side Stripe operations  
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Client-side Supabase key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin operations in API routes

## Error Handling Strategy

1. **Client-side**: Toast notifications with actionable messages
2. **Server-side**: Structured logging for monitoring
3. **Network**: Automatic retry and fallback handling  
4. **Auth**: Seamless redirect to signup/login flows

## Best Practices Implemented

✅ TypeScript interfaces for all parameters
✅ Comprehensive error boundaries
✅ Automatic retry mechanisms
✅ User-friendly error messages
✅ Security-first approach
✅ Separation of concerns
✅ Environment variable validation
✅ Request/response logging for debugging