import { z } from 'zod';

// Schema for client-side environment variables (VITE_ prefixed)
const clientSchema = z.object({
  VITE_SUPABASE_URL: z.string().url({ message: 'VITE_SUPABASE_URL must be a valid URL' }),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, { message: 'VITE_SUPABASE_ANON_KEY is required' }),
  VITE_BASE_URL: z.string().url().optional(),
  VITE_DOMAIN_NAME: z.string().optional(),
  // Stripe payment links - make them optional for development
  VITE_STRIPE_PAYMENT_LINK: z.string().url().optional(),
  VITE_STRIPE_PAYMENT_LINK_YEARLY: z.string().url().optional(),
  VITE_STRIPE_PAYMENT_LINK_MONTHLY: z.string().url().optional(),
  // LinkedIn optional
  VITE_LINKEDIN_ACCESS_TOKEN: z.string().optional(),
  VITE_LINKEDIN_AUTHOR_URN: z.string().optional(),
});

// Schema for server-side environment variables (for Edge functions)
const serverSchema = z.object({
  // Required for core functionality
  CLAUDE_API_KEY: z.string().min(1, { message: 'CLAUDE_API_KEY is required for content generation' }),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', { message: 'STRIPE_SECRET_KEY must start with sk_' }),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', { message: 'STRIPE_WEBHOOK_SECRET must start with whsec_' }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, { message: 'SUPABASE_SERVICE_ROLE_KEY is required' }),

  // Optional services
  FIRECRAWL_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  // Supabase URL fallback for server-side (can use VITE_ version)
  SUPABASE_URL: z.string().url().optional(),
});

// Validate client environment (called in client-side code)
export function validateClientEnvironment() {
  try {
    const env = clientSchema.parse(import.meta.env);
    return { success: true, env };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      console.error('❌ Environment validation failed (client):\n', errors);
      return {
        success: false,
        error: `Client environment validation failed:\n${errors}`,
        env: null
      };
    }
    throw error;
  }
}

// Validate server environment (called in Edge functions)
export function validateServerEnvironment() {
  try {
    const env = serverSchema.parse(process.env);
    return { success: true, env };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      console.error('❌ Environment validation failed (server):\n', errors);
      return {
        success: false,
        error: `Server environment validation failed:\n${errors}`,
        env: null
      };
    }
    throw error;
  }
}

// Get validated client environment (throws on validation failure)
export function getClientEnv() {
  const result = validateClientEnvironment();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.env!;
}

// Get validated server environment (throws on validation failure)
export function getServerEnv() {
  const result = validateServerEnvironment();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.env!;
}

// Type exports for TypeScript
export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;