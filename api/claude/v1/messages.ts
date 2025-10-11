import { getCorsHeaders, createCorsResponse, handlePreflight } from '../../utils/cors.js';

export const config = {
  runtime: 'edge',
  regions: ['fra1'], // Frankfurt für niedrige Latenz in Europa
};

export default async function handler(req: Request) {
  // Get CORS headers
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return handlePreflight(origin);
  }

  // Nur POST erlauben
  if (req.method !== 'POST') {
    return createCorsResponse({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are supported'
    }, { status: 405, origin });
  }

  try {
    // Validate and parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return createCorsResponse({
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      }, { status: 400, origin });
    }
    
    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      return createCorsResponse({
        error: 'Invalid request body - messages array required',
        code: 'INVALID_REQUEST',
        details: 'Request must include a "messages" array'
      }, { status: 400, origin });
    }

    if (body.messages.length === 0) {
      return createCorsResponse({
        error: 'Empty messages array',
        code: 'INVALID_REQUEST'
      }, { status: 400, origin });
    }
    
    // Claude API Key aus Environment Variable (OHNE VITE_ prefix!)
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      console.error('CLAUDE_API_KEY is not configured');
      return createCorsResponse({
        error: 'Service temporarily unavailable',
        code: 'CONFIGURATION_ERROR',
        message: 'AI service is not properly configured'
      }, { status: 503, origin });
    }

    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      // Transparenter Proxy zu Anthropic API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body), // Leitet den kompletten Body weiter
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle Claude API specific errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: { message: 'Unknown error' } 
        }));
        
        // Rate limiting
        if (response.status === 429) {
          return createCorsResponse({
            error: 'Too many requests. Please try again in 30 seconds.',
            code: 'RATE_LIMITED',
            retryAfter: 30
          }, { 
            status: 429, 
            origin,
            headers: { 'Retry-After': '30' }
          });
        }
        
        // Bad request (invalid prompt, etc.)
        if (response.status === 400) {
          return createCorsResponse({
            error: 'Invalid request to AI service',
            code: 'INVALID_AI_REQUEST',
            details: errorData.error?.message || 'Request validation failed',
            type: errorData.error?.type || 'validation_error'
          }, { status: 400, origin });
        }

        // Authentication/authorization errors
        if (response.status === 401 || response.status === 403) {
          console.error('Claude API authentication error:', response.status);
          return createCorsResponse({
            error: 'AI service authentication failed',
            code: 'AUTH_ERROR'
          }, { status: 503, origin });
        }

        // Server errors
        if (response.status >= 500) {
          console.error('Claude API server error:', response.status, errorData);
          return createCorsResponse({
            error: 'AI service temporarily unavailable',
            code: 'SERVICE_ERROR',
            message: 'Please try again in a few moments'
          }, { status: 503, origin });
        }

        // Other errors
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      // Parse successful response
      const data = await response.json();
      
      // Validate response structure
      if (!data.content || !Array.isArray(data.content)) {
        console.error('Invalid Claude API response structure:', data);
        return createCorsResponse({
          error: 'Invalid response from AI service',
          code: 'INVALID_RESPONSE'
        }, { status: 502, origin });
      }

      return createCorsResponse(data, { status: 200, origin });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return createCorsResponse({
          error: 'Request timeout. Please try again.',
          code: 'TIMEOUT',
          message: 'The request took too long to complete'
        }, { status: 408, origin });
      }
      
      // Network errors
      if (fetchError.message.includes('fetch')) {
        console.error('Network error calling Claude API:', fetchError);
        return createCorsResponse({
          error: 'Network error connecting to AI service',
          code: 'NETWORK_ERROR'
        }, { status: 502, origin });
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in claude edge function:', error);
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return createCorsResponse({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      ...(isDevelopment && { details: error.message })
    }, { status: 500, origin });
  }
}