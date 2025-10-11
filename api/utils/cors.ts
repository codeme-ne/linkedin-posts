/**
 * Centralized CORS (Cross-Origin Resource Sharing) configuration
 * Handles origin validation and header generation for API routes
 */

const ALLOWED_ORIGINS_PROD = (process.env.ALLOWED_ORIGINS_PROD || '').split(',').filter(Boolean);
const ALLOWED_ORIGINS_DEV = (process.env.ALLOWED_ORIGINS_DEV || 'http://localhost:5173,http://localhost:5174,http://localhost:3000').split(',').filter(Boolean);

const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const allowedOrigins = isDevelopment ? ALLOWED_ORIGINS_DEV : ALLOWED_ORIGINS_PROD;

/**
 * Generate CORS headers based on request origin
 * @param origin - The origin header from the request
 * @returns Record of CORS headers
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, anthropic-version, x-api-key',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin', // Important for caching
  };

  // Allow all origins in development for easier local development
  if (isDevelopment) {
    headers['Access-Control-Allow-Origin'] = origin || '*';
    headers['Access-Control-Allow-Credentials'] = 'true';
    return headers;
  }

  // Production: strict origin checking
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    // Log unauthorized origin attempts in production
    if (origin) {
      console.warn(`CORS: Unauthorized origin blocked: ${origin}`);
      console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
    }
    // No CORS headers for disallowed origins (browser will block)
  }

  return headers;
}

/**
 * Check if an origin is allowed
 * @param origin - The origin to check
 * @returns boolean indicating if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  if (isDevelopment) {
    // In development, allow localhost origins with any port
    return ALLOWED_ORIGINS_DEV.some(allowed => 
      origin.startsWith(allowed) || origin.startsWith('http://localhost:')
    );
  }
  
  return ALLOWED_ORIGINS_PROD.includes(origin);
}

/**
 * Create a CORS-enabled response
 * @param body - Response body (JSON serializable)
 * @param options - Response options including status, origin
 * @returns Response with CORS headers
 */
export function createCorsResponse(
  body: unknown,
  options: {
    status?: number;
    origin?: string | null;
    headers?: Record<string, string>;
  } = {}
): Response {
  const { status = 200, origin = null, headers: additionalHeaders = {} } = options;
  
  const corsHeaders = getCorsHeaders(origin);
  const allHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    ...additionalHeaders
  };

  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: allHeaders
    }
  );
}

/**
 * Handle preflight OPTIONS request
 * @param origin - The origin header from the request
 * @returns Response for OPTIONS request
 */
export function handlePreflight(origin: string | null): Response {
  const headers = getCorsHeaders(origin);
  
  return new Response(null, {
    status: 200,
    headers
  });
}

/**
 * Validate CORS configuration on startup
 * Call this in development to ensure proper setup
 */
export function validateCorsConfig(): void {
  if (isDevelopment) {
    console.log('🔒 CORS Development Mode - All origins allowed');
    console.log('📝 Dev origins:', ALLOWED_ORIGINS_DEV.join(', '));
    return;
  }

  if (ALLOWED_ORIGINS_PROD.length === 0) {
    console.error('⚠️  CORS: No production origins configured!');
    console.error('💡 Set ALLOWED_ORIGINS_PROD environment variable');
    return;
  }

  console.log('🔒 CORS Production Mode');
  console.log('✅ Allowed origins:', ALLOWED_ORIGINS_PROD.join(', '));
}

// Auto-validate in development
if (isDevelopment && process.env.NODE_ENV !== 'test') {
  validateCorsConfig();
}