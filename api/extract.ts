// Serverless function: Extract main article content from a URL using Jina Reader
// Simple, robust, and free content extraction

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

import { getCorsHeaders } from './utils/cors';

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