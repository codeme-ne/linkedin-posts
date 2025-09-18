// Edge Function: Premium Content-Extraktion mit Firecrawl
// Unbegrenzter Zugang für Premium-Nutzer (ShipFast-Pattern)

import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
  regions: ['fra1'], // Frankfurt für niedrige Latenz in Europa
};

type ExtractPremiumRequest = {
  url: string;
  userId?: string; // Wird aus Auth-Header extrahiert
};

type ExtractPremiumResponse = {
  title?: string;
  content: string;
  markdown?: string;
  html?: string;
  screenshot?: string;
  metadata?: {
    sourceUrl: string;
    extractedAt: string;
    extractionType: 'firecrawl';
  };
};

// Initialisiere Supabase Client mit Service Role für RLS-Bypass
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase-Konfiguration fehlt');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // WICHTIG: Keine Authorization-Header hier, damit Service Role aktiv bleibt
  });
}

// Extrahiere User ID aus JWT Token
async function getUserFromAuth(authHeader: string, supabase: ReturnType<typeof getSupabaseClient>) {
  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth-Fehler:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Token-Parsing-Fehler:', error);
    return null;
  }
}

// ShipFast Pattern: Simple Premium Access Check
async function checkPremiumAccess(
  supabase: ReturnType<typeof getSupabaseClient>, 
  userId: string
): Promise<{ hasAccess: boolean; error?: string }> {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('is_active')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found - user is not premium
        return { hasAccess: false };
      }
      console.error('Subscription check error:', error);
      return { hasAccess: false, error: 'Subscription check failed' };
    }

    return { hasAccess: subscription?.is_active === true };
  } catch (error) {
    console.error('Premium access check error:', error);
    return { hasAccess: false, error: 'Internal error during access check' };
  }
}

// CORS Origin validation
function getAllowedOrigins(): string[] {
  const prod = ['https://linkedin-posts-one.vercel.app'];
  const dev = ['http://localhost:5173', 'http://localhost:5174'];
  return process.env.NODE_ENV === 'production' ? prod : [...prod, ...dev];
}

function validateOrigin(origin: string | null): string | null {
  if (!origin) return null;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin) ? origin : null;
}

// Hauptfunktion
export default async function handler(req: Request) {
  // Validate origin for CORS
  const origin = req.headers.get('origin');
  const allowedOrigin = validateOrigin(origin);
  
  const cors: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Only add CORS header if origin is allowed
  if (allowedOrigin) {
    cors['Access-Control-Allow-Origin'] = allowedOrigin;
  }


  // Handle Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Methode nicht erlaubt' }), 
      { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 1. Authentifizierung prüfen
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentifizierung erforderlich' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseClient();
    const user = await getUserFromAuth(authHeader, supabase);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Ungültiger Authentifizierungs-Token' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Subscription prüfen
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || subscription?.status !== 'active') {
      return new Response(
        JSON.stringify({ 
          error: 'Premium-Abo erforderlich',
          details: 'Diese Funktion ist nur für Nutzer mit aktivem Premium-Abo verfügbar.'
        }),
        { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Request-Body parsen
    const { url } = (await req.json()) as ExtractPremiumRequest;
    
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL-Parameter fehlt' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // URL validieren
    try {
      const urlObj = new URL(url);
      if (!/^https?:$/.test(urlObj.protocol)) {
        throw new Error('Ungültiges Protokoll');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Ungültiges URL-Format' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Premium-Zugang prüfen
    const { hasAccess, error: accessError } = await checkPremiumAccess(supabase, user.id);
    
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          error: accessError || 'Premium-Zugang erforderlich. Upgrade zu Premium für unbegrenzte Extraktionen.',
        }),
        { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Firecrawl API aufrufen
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY nicht konfiguriert');
      return new Response(
        JSON.stringify({ error: 'Premium-Extraktion nicht konfiguriert' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Rufe Firecrawl Scrape API auf für:', url);
    
    // Nutze Scrape API für synchrone Inhaltsextraktion
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        waitFor: 2000, // Warte auf JavaScript-Rendering
        removeBase64Images: true // Entferne Base64-Bilder für kleinere Payloads
      }),
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error('Firecrawl API Fehler:', firecrawlResponse.status, errorText);
      
      // Log error for debugging
      console.error(`Firecrawl API error for user ${user.id}:`, firecrawlResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Premium-Extraktion fehlgeschlagen',
          details: 'Die Webseite konnte nicht extrahiert werden. Bitte versuchen Sie es später erneut.'
        }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlData = await firecrawlResponse.json();

    // Scrape API Response Format:
    // {
    //   success: true,
    //   data: {
    //     markdown: "...",
    //     content: "...",
    //     html: "...",
    //     metadata: {
    //       title: "...",
    //       description: "...",
    //       ...
    //     }
    //   }
    // }

    console.log('Firecrawl Scrape API Response:', {
      success: firecrawlData?.success,
      hasData: !!firecrawlData?.data,
      hasMarkdown: !!firecrawlData?.data?.markdown,
      hasContent: !!firecrawlData?.data?.content,
      hasTitle: !!firecrawlData?.data?.metadata?.title
    });

    // Extrahiere die relevanten Daten aus der Scrape API Response
    const extractedData = {
      title: firecrawlData?.data?.metadata?.title || 
             firecrawlData?.data?.metadata?.ogTitle || 
             firecrawlData?.data?.metadata?.description ||
             'Kein Titel gefunden',
      content: firecrawlData?.data?.content || '',
      markdown: firecrawlData?.data?.markdown || '',
      metadata: firecrawlData?.data?.metadata || {}
    };
    
    // 6. Response formatieren
    const response: ExtractPremiumResponse = {
      title: extractedData.title,
      content: extractedData.content || extractedData.markdown || '',
      markdown: extractedData.markdown || extractedData.content,
      metadata: {
        sourceUrl: url,
        extractedAt: new Date().toISOString(),
        extractionType: 'firecrawl',
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Premium-Extraction-Fehler:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Interner Server-Fehler',
        details: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
}