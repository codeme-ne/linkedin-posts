// Serverless function: Extract main article content from a URL using Jina Reader
// Simple, robust, and free content extraction

import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge', // Now using Edge runtime since no Node dependencies needed
  regions: ['fra1'], // Frankfurt for low latency in Europe
};

type ExtractResponse = {
  title?: string;
  byline?: string | null;
  excerpt?: string | null;
  content: string; // plain text/markdown
  length?: number;
  siteName?: string | null;
};

// Simple function to truncate content at common footer markers
function truncateContent(content: string): string {
  // End markers that usually indicate footer/archive sections
  const endMarkers = [
    // English - Newsletter specific
    'read past issues',
    'newsletter archive',
    'browse our archive',
    'subscribe',
    'unsubscribe',
    'view in browser',
    'forward to a friend',
    'forward to friend',
    'update preferences',
    'manage preferences',
    'email preferences',
    'update your preferences',
    'update subscription',
    'manage subscription',
    'why am i getting this',
    'you are receiving this',
    'sent to you because',
    'mailing list',
    
    // English - Blog specific
    'related posts',
    'you might also like',
    'you may also like',
    'see also',
    'continue reading',
    'read more posts',
    'more articles',
    'similar articles',
    'related articles',
    'recommended for you',
    'more from',
    
    // German - Newsletter specific
    'abmelden',
    'abbestellen',
    'newsletter abbestellen',
    'im browser ansehen',
    'im browser anzeigen',
    'an einen freund weiterleiten',
    'weiterleiten',
    'einstellungen verwalten',
    'einstellungen ändern',
    'präferenzen verwalten',
    'e-mail-einstellungen',
    'mehr anzeigen',
    
    // German - Blog specific
    'weitere artikel',
    'ähnliche beiträge',
    'verwandte artikel',
    'mehr lesen',
    'weiterlesen',
    'das könnte sie auch interessieren',
    'das könnte dich auch interessieren',
    'siehe auch',
    'empfohlene artikel',
    'mehr aus',
    'verwandte beiträge',
    
    // Common footer markers (multilingual)
    '©',
    'copyright',
    'impressum',
    'datenschutz',
    'privacy policy',
    'terms of service',
    'contact us',
    'kontakt',
    'about us',
    'über uns',
  ];
  
  // Search from 20% of content (newsletter archives can appear early)
  const searchStart = Math.floor(content.length * 0.2);
  const lowerContent = content.toLowerCase();
  
  for (const marker of endMarkers) {
    const index = lowerContent.indexOf(marker, searchStart);
    if (index !== -1) {
      return content.slice(0, index).trim();
    }
  }
  
  return content;
}

import { validateOrigin, getCorsHeaders } from './utils/cors';

// Initialize Supabase Client with Service Role for RLS bypass
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // Return null if not configured - extraction can still work without auth
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Extract User ID from JWT Token (optional)
async function getUserFromAuth(authHeader: string | null, supabase: ReturnType<typeof getSupabaseClient>) {
  if (!authHeader || !supabase) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// Check if user can extract (free tier limits)
async function checkUsageLimits(supabase: ReturnType<typeof getSupabaseClient>, userId: string | null) {
  if (!supabase || !userId) {
    // No auth = allow extraction (backwards compatibility)
    return { canExtract: true, isPremium: false };
  }

  try {
    // Check limits first
    const { data: limits, error: limitsError } = await supabase
      .rpc('get_extraction_limits', { p_user_id: userId });

    if (limitsError) {
      console.error('Failed to check extraction limits:', limitsError);
      // DENY on error for security
      return {
        canExtract: false,
        isPremium: false,
        error: 'Failed to verify extraction limits. Please try again.'
      };
    }

    // Premium users have unlimited extractions
    if (limits.is_premium) {
      return { canExtract: true, isPremium: true };
    }

    // Check if free user has remaining credits
    if (limits.free_remaining <= 0) {
      return {
        canExtract: false,
        isPremium: false,
        error: `Extraction limit reached (${limits.free_used}/${limits.free_limit}). Upgrade to Premium for unlimited extractions.`
      };
    }

    // Free user with remaining credits
    return { canExtract: true, isPremium: false };
  } catch (error) {
    console.error('Extraction limit check failed:', error);
    // DENY on error for security
    return {
      canExtract: false,
      isPremium: false,
      error: 'Failed to verify extraction limits. Please try again.'
    };
  }
}

export default async function handler(req: Request) {
  // Get CORS headers
  const origin = req.headers.get('origin');
  const cors = getCorsHeaders(origin);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse and validate request body FIRST (before any credit operations)
    const { url } = (await req.json()) as { url?: string };

    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Basic URL validation
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase if configured
    const supabase = getSupabaseClient();
    const authHeader = req.headers.get('authorization');
    const user = await getUserFromAuth(authHeader, supabase);

    // Check extraction limits AFTER validation (if auth is available)
    const limitCheck = await checkUsageLimits(supabase, user?.id || null);

    if (!limitCheck.canExtract) {
      return new Response(JSON.stringify({ error: limitCheck.error }), {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // For free users, atomically increment BEFORE extraction
    if (supabase && user?.id && !limitCheck.isPremium) {
      const { data: incrementResult, error: incrementError } = await supabase
        .rpc('increment_extraction_usage', { p_user_id: user.id });

      if (incrementError || !incrementResult?.success) {
        console.error('Failed to increment extraction usage:', incrementError || incrementResult);
        return new Response(JSON.stringify({
          error: incrementResult?.error || 'Failed to reserve extraction credit. Please try again.'
        }), {
          status: 429,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    // Use Jina Reader for content extraction
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    
    console.log('Fetching content from:', url);
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(jinaUrl, {
        headers: {
          'Accept': 'text/markdown, text/plain',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          // Use Jina's x-remove-selector to remove common non-content elements
          'x-remove-selector': 'nav,header,footer,.newsletter,.subscribe,.archive,.sidebar,.social',
          'x-respond-with': 'markdown',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Jina Reader returned status: ${response.status}`);
        throw new Error(`Content extraction failed with status: ${response.status}`);
      }
      
      let content = await response.text();
      
      // Basic content validation
      if (!content || content.trim().length < 100) {
        return new Response(
          JSON.stringify({ error: 'Could not extract meaningful content from the URL' }),
          { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
      
      // Apply truncation to remove footer/archive sections
      content = truncateContent(content);
      
      // Extract title from first markdown heading if present
      const titleMatch = content.match(/^#\s+(.+?)$/m);
      const title = titleMatch ? titleMatch[1].trim() : undefined;
      
      // Extract site name from URL
      const urlObj = new URL(url);
      const siteName = urlObj.hostname.replace(/^www\./, '');
      
      // Clean up content - remove excessive line breaks
      const cleanContent = content.replace(/\n{3,}/g, '\n\n').trim();
      
      const payload: ExtractResponse = {
        title,
        byline: null, // Jina doesn't typically provide byline
        excerpt: null, // Could extract from first paragraph if needed
        content: cleanContent,
        length: cleanContent.length,
        siteName,
      };

      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
      
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timeout after 30 seconds');
        return new Response(
          JSON.stringify({ error: 'Request timed out. The page took too long to load.' }),
          { status: 504, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }
    
  } catch (error) {
    console.error('Extract error:', error);
    
    // Return user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract content';
    const statusCode = 500;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Unable to extract content from this URL. Please ensure the URL is accessible and contains readable content.'
      }),
      { 
        status: statusCode, 
        headers: { ...cors, 'Content-Type': 'application/json' } 
      }
    );
  }
}