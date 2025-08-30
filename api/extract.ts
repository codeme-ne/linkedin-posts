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

export default async function handler(req: Request) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

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

    // Use Jina Reader with CSS exclusions for cleaner extraction
    // Exclude common navigation, footer, sidebar, and other non-content elements
    const excludeSelectors = [
      'nav', 'header', 'footer', '.header', '.footer', '.navigation',
      '.navbar', '.sidebar', '.menu', '.subscribe', '.newsletter',
      '.social', '.share', '.comments', '.related', '.advertisement',
      '.ads', '.popup', '.modal', '.cookie', '.banner',
      // Newsletter-specific exclusions
      '.past-issues', '.archive', '.archives', '.previous-issues',
      '.newsletter-list', '.issue-list', '.back-issues', '.all-issues',
      // Common sections to exclude
      '.author-bio', '.about-author', '.recommended', '.suggestions',
      '.trending', '.popular', '.latest', '.recent-posts'
    ].join(',');
    
    // Build Jina URL with exclusion parameters
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}?x-respond-with=markdown&x-css-exclude=${encodeURIComponent(excludeSelectors)}`;
    
    console.log('Fetching content from:', url);
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(jinaUrl, {
        headers: {
          'Accept': 'text/markdown, text/plain',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Jina Reader returned status: ${response.status}`);
        throw new Error(`Content extraction failed with status: ${response.status}`);
      }
      
      const content = await response.text();
      
      // Basic content validation
      if (!content || content.trim().length < 100) {
        return new Response(
          JSON.stringify({ error: 'Could not extract meaningful content from the URL' }),
          { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
      
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