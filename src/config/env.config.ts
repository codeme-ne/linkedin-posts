/**
 * Environment Configuration Utilities
 * Ship Fast pattern for type-safe environment handling
 */

export interface EnvironmentVariables {
  // Supabase (required)
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  
  // Claude AI (client-side fallback, server-side required)
  VITE_CLAUDE_API_KEY?: string;
  CLAUDE_API_KEY?: string;
  
  // Stripe (payment links)
  VITE_STRIPE_PAYMENT_LINK?: string;
  VITE_STRIPE_PAYMENT_LINK_LIFETIME?: string;
  VITE_STRIPE_PAYMENT_LINK_MONTHLY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  
  // LinkedIn (optional)
  VITE_LINKEDIN_ACCESS_TOKEN?: string;
  VITE_LINKEDIN_AUTHOR_URN?: string;
  
  // Firecrawl (optional)
  FIRECRAWL_API_KEY?: string;
  
  // App configuration
  VITE_DOMAIN_NAME?: string;
  VITE_BASE_URL?: string;
  
  // Tracking (optional)
  VITE_OPIK_API_KEY?: string;
}

export interface EnvironmentValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Required environment variables for basic functionality
 */
const REQUIRED_CLIENT_VARS: (keyof EnvironmentVariables)[] = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

/**
 * Required environment variables for server-side functionality
 */
const REQUIRED_SERVER_VARS: (keyof EnvironmentVariables)[] = [
  'CLAUDE_API_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY'
];

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_VARS: (keyof EnvironmentVariables)[] = [
  'VITE_STRIPE_PAYMENT_LINK_LIFETIME',
  'VITE_STRIPE_PAYMENT_LINK_MONTHLY',
  'FIRECRAWL_API_KEY'
];

/**
 * Validate client-side environment variables
 */
export function validateClientEnvironment(): EnvironmentValidationResult {
  const missing = REQUIRED_CLIENT_VARS.filter(varName => !getEnvVar(varName));
  const warnings = RECOMMENDED_VARS.filter(varName => !getEnvVar(varName));
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Validate server-side environment variables (Node.js)
 */
export function validateServerEnvironment(): EnvironmentValidationResult {
  if (typeof process === 'undefined') {
    return { isValid: false, missing: ['Node.js environment required'], warnings: [] };
  }
  
  const missing = REQUIRED_SERVER_VARS.filter(varName => !process.env[varName]);
  const warnings: string[] = [];
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Get environment variable (works in both client and server)
 */
export function getEnvVar(varName: keyof EnvironmentVariables): string | undefined {
  // Client-side (Vite)
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env[varName];
  }
  
  // Server-side (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[varName];
  }
  
  return undefined;
}

/**
 * Get environment variable with fallback
 */
export function getEnvVarWithFallback(
  varName: keyof EnvironmentVariables, 
  fallback: string
): string {
  return getEnvVar(varName) || fallback;
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return (
    getEnvVar('NODE_ENV' as keyof EnvironmentVariables) === 'development' ||
    (import.meta && import.meta.env && import.meta.env.DEV)
  );
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return (
    getEnvVar('NODE_ENV' as keyof EnvironmentVariables) === 'production' ||
    (import.meta && import.meta.env && import.meta.env.PROD)
  );
}

/**
 * Get all Stripe payment links
 */
export function getStripePaymentLinks() {
  return {
    lifetime: getEnvVar('VITE_STRIPE_PAYMENT_LINK_LIFETIME'),
    monthly: getEnvVar('VITE_STRIPE_PAYMENT_LINK_MONTHLY'),
    legacy: getEnvVar('VITE_STRIPE_PAYMENT_LINK') // fallback
  };
}

/**
 * Get Supabase configuration
 */
export function getSupabaseConfig() {
  return {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY') // server-side only
  };
}

/**
 * Get LinkedIn configuration
 */
export function getLinkedInConfig() {
  return {
    accessToken: getEnvVar('VITE_LINKEDIN_ACCESS_TOKEN'),
    authorUrn: getEnvVar('VITE_LINKEDIN_AUTHOR_URN'),
    isEnabled: !!(getEnvVar('VITE_LINKEDIN_ACCESS_TOKEN') && getEnvVar('VITE_LINKEDIN_AUTHOR_URN'))
  };
}

/**
 * Get Claude AI configuration
 */
export function getClaudeConfig() {
  return {
    clientApiKey: getEnvVar('VITE_CLAUDE_API_KEY'), // Not recommended for production
    serverApiKey: getEnvVar('CLAUDE_API_KEY'), // Recommended for production
    isConfigured: !!(getEnvVar('VITE_CLAUDE_API_KEY') || getEnvVar('CLAUDE_API_KEY'))
  };
}

/**
 * Get application URLs based on environment
 */
export function getAppUrls() {
  const baseUrl = getEnvVarWithFallback('VITE_BASE_URL', 
    isDevelopment() ? 'http://localhost:5173' : 'https://transformer.social'
  );
  
  return {
    base: baseUrl,
    app: `${baseUrl}/app`,
    landing: baseUrl,
    signup: `${baseUrl}/signup`,
    settings: `${baseUrl}/settings`
  };
}

/**
 * Initialize and validate environment on startup
 */
export function initializeEnvironment(): void {
  const validation = validateClientEnvironment();
  
  if (!validation.isValid) {
    const errorMessage = `Missing required environment variables: ${validation.missing.join(', ')}`;
    
    if (isDevelopment()) {
      console.error('❌ Environment Validation Failed:', errorMessage);
      console.error('Please check your .env file and ensure all required variables are set.');
    }
    
    throw new Error(errorMessage);
  }
  
  if (validation.warnings.length > 0 && isDevelopment()) {
    console.warn('⚠️ Missing recommended environment variables:', validation.warnings.join(', '));
  }
  
  if (isDevelopment()) {
    console.log('✅ Environment validation passed');
  }
}

/**
 * Export a typed interface for all environment access
 */
export const env = {
  // Getters
  get: getEnvVar,
  getWithFallback: getEnvVarWithFallback,
  
  // Configuration objects
  supabase: getSupabaseConfig(),
  claude: getClaudeConfig(),
  linkedin: getLinkedInConfig(),
  stripe: getStripePaymentLinks(),
  urls: getAppUrls(),
  
  // Environment checks
  isDev: isDevelopment(),
  isProd: isProduction(),
  
  // Validation
  validate: validateClientEnvironment,
  validateServer: validateServerEnvironment,
  init: initializeEnvironment
} as const;