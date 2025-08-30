// Serverless function: Extract main article content from a URL using Mozilla Readability
// Runs on Node runtime (not Edge) because it uses JSDOM.

// Use dynamic imports inside the handler to reduce cold-start/import-time issues on some platforms

export const config = {
  // Ensure a Node runtime for JSDOM support
  runtime: 'nodejs',
  regions: ['fra1'],
};

type ExtractResponse = {
  title?: string;
  byline?: string | null;
  excerpt?: string | null;
  content: string; // plain text
  length?: number;
  siteName?: string | null;
};

export default async function handler(req: Request) {
  // Dynamically import heavy libs (helps with certain serverless runtimes)
  const { JSDOM } = await import('jsdom');
  const { Readability } = await import('@mozilla/readability');
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

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
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Basic validation
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol)) throw new Error('Invalid protocol');
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Helper: fetch HTML directly
    const fetchDirect = async () => {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
        },
      });
      if (!resp.ok) throw new Error(`Direct fetch failed: ${resp.status}`);
      return resp.text();
    };

    // Helper: fetch HTML via Browserless or ScrapingBee (JS-rendering)
    const fetchRendered = async () => {
      const browserlessUrl = process.env.BROWSERLESS_URL; // e.g., https://chrome.browserless.io/content?token=XXXX
      const scrapingbeeKey = process.env.SCRAPINGBEE_API_KEY; // optional alternative
      if (browserlessUrl) {
        const r = await fetch(browserlessUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, options: { waitUntil: 'networkidle0', timeout: 60000 } }),
        });
        if (!r.ok) throw new Error(`Browserless fetch failed: ${r.status}`);
        return r.text();
      }
      if (scrapingbeeKey) {
        const r = await fetch(`https://app.scrapingbee.com/api/v1?api_key=${scrapingbeeKey}&render_js=true&url=${encodeURIComponent(url)}`, {
          headers: { 'Accept': 'text/html' },
        });
        if (!r.ok) throw new Error(`ScrapingBee fetch failed: ${r.status}`);
        return r.text();
      }
      throw new Error('No JS-rendering provider configured');
    };

    // Helper: free fallback via Jina Reader (best-effort, markdown-ish text)
    const fetchJinaReadable = async () => {
      const target = url.replace(/^https?:\/\//, '');
      const jinaUrl = `https://r.jina.ai/http://${target}`;
      const r = await fetch(jinaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
          'Accept': 'text/plain, text/markdown, */*',
        },
      });
      if (!r.ok) throw new Error(`Jina fetch failed: ${r.status}`);
      return r.text();
    };

    // Step 1: Direct fetch + parse
    type ReadabilityArticle = {
      title: string;
      byline: string | null;
      content: string;
      textContent: string;
      length: number;
      excerpt: string | null;
    };
    let html: string | null = null;
    let article: ReadabilityArticle | null = null;
    let siteName: string | null = null;

    try {
      html = await fetchDirect();
  const dom = new JSDOM(html, { url, contentType: 'text/html' });
      const doc = dom.window.document;
  const reader = new Readability(doc, { keepClasses: true });
      article = reader.parse();
      siteName = (doc.querySelector('meta[property="og:site_name"]') as HTMLMetaElement | null)?.content ?? null;
  } catch {
      // direct fetch failed; fall through to rendered
    }

    const tooShort = !article || !article.textContent || (article.textContent.trim().length < 400);

    // Step 2: If parsing failed or content too short, try rendered provider
    if (tooShort) {
      try {
  html = await fetchRendered();
  const dom = new JSDOM(html, { url, contentType: 'text/html' });
  const doc = dom.window.document;
  const reader = new Readability(doc, { keepClasses: true });
        article = reader.parse();
        siteName = (doc.querySelector('meta[property="og:site_name"]') as HTMLMetaElement | null)?.content ?? siteName ?? null;
      } catch {
        // Try free fallback (Jina Reader)
        try {
          const text = await fetchJinaReadable();
          if (text && text.trim().length > 200) {
            // Heuristic: extract a title from first markdown heading
            const lines = text.split('\n');
            const firstHeading = lines.find((l) => /^\s*#\s+/.test(l));
            const title = firstHeading ? firstHeading.replace(/^\s*#\s+/, '').trim() : undefined;
            const payload: ExtractResponse = {
              title,
              byline: null,
              excerpt: null,
              content: text.trim(),
              length: text.trim().length,
              siteName,
            };
            return new Response(JSON.stringify(payload), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
          }
        } catch {
          // ignore and continue
        }
        // If all attempts failed and nothing parsed, return error
        if (!article) {
          return new Response(JSON.stringify({ error: 'Could not fetch or parse article', details: 'Tried direct, rendered, and free fallback' }), {
            status: 502,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    if (!article) {
      return new Response(
        JSON.stringify({ error: 'Could not parse article content' }),
        { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

  const payload: ExtractResponse = {
      title: article.title || undefined,
      byline: article.byline ?? null,
      excerpt: article.excerpt ?? null,
      content: (article.textContent || '').replace(/\n{3,}/g, '\n\n').trim(),
      length: article.length,
      siteName,
    };

    return new Response(JSON.stringify(payload), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('extract error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
}
