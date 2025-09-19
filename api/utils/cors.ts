// CORS utility for Edge Functions
// Centralized CORS configuration using environment variables

export function getAllowedOrigins(): string[] {
  // Get origins from environment variables
  const prodOrigins = process.env.ALLOWED_ORIGINS_PROD || 'https://linkedin-posts-one.vercel.app';
  const devOrigins = process.env.ALLOWED_ORIGINS_DEV || 'http://localhost:5173,http://localhost:5174';

  // In production, only use production origins
  if (process.env.NODE_ENV === 'production') {
    return prodOrigins.split(',').map(origin => origin.trim());
  }

  // In development, combine both
  return [
    ...prodOrigins.split(',').map(origin => origin.trim()),
    ...devOrigins.split(',').map(origin => origin.trim())
  ];
}

export function validateOrigin(origin: string | null): string | null {
  if (!origin) return null;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin) ? origin : null;
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access',
  };

  const allowedOrigin = validateOrigin(origin);
  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
  }

  return headers;
}