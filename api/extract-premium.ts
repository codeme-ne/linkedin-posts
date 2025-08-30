// Edge Function: Premium Content-Extraktion mit Firecrawl
// Limitiert auf 20 Extraktionen pro Monat für Premium-Nutzer

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
  usage?: {
    used: number;
    limit: number;
    remaining: number;
    resetsAt: string;
  };
};

type UsageInfo = {
  used_count: number;
  limit_count: number;
  remaining_count: number;
  reset_at: string;
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

// Prüfe und aktualisiere Nutzungslimit
async function checkAndUpdateUsage(
  supabase: ReturnType<typeof getSupabaseClient>, 
  userId: string, 
  url: string
): Promise<{ allowed: boolean; usage: UsageInfo | null; error?: string }> {
  try {
    // Hole aktuelle Nutzungsstatistik
    const { data: usageData, error: usageError } = await supabase
      .rpc('get_monthly_extraction_usage', {
        p_user_id: userId,
        p_extraction_type: 'firecrawl'
      })
      .single();

    if (usageError) {
      console.error('Usage-Abfrage-Fehler:', usageError);
      return { allowed: false, usage: null, error: 'Nutzungsabfrage fehlgeschlagen' };
    }

    const usage = usageData as UsageInfo;

    // Prüfe ob Limit erreicht
    if (usage.remaining_count <= 0) {
      return { 
        allowed: false, 
        usage,
        error: `Monatliches Limit von ${usage.limit_count} Premium-Extraktionen erreicht. Zurücksetzung am ${new Date(usage.reset_at).toLocaleDateString('de-DE')}.`
      };
    }

    // Logge die Nutzung
    const { error: insertError } = await supabase
      .from('extraction_usage')
      .insert({
        user_id: userId,
        extraction_type: 'firecrawl',
        url: url,
        success: true,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'extract-premium'
        }
      });

    if (insertError) {
      console.error('Usage-Logging-Fehler:', insertError);
      // Fahre trotzdem fort, da das Logging fehlschlagen könnte
    }

    return { 
      allowed: true, 
      usage: {
        ...usage,
        used_count: usage.used_count + 1,
        remaining_count: usage.remaining_count - 1
      }
    };
  } catch (error) {
    console.error('Usage-Check-Fehler:', error);
    return { allowed: false, usage: null, error: 'Interner Fehler bei Nutzungsprüfung' };
  }
}

// Hauptfunktion
export default async function handler(req: Request) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

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

    // 4. Nutzungslimit prüfen
    const { allowed, usage, error: usageError } = await checkAndUpdateUsage(supabase, user.id, url);
    
    if (!allowed) {
      return new Response(
        JSON.stringify({ 
          error: usageError || 'Nutzungslimit erreicht',
          usage: usage ? {
            used: usage.used_count,
            limit: usage.limit_count,
            remaining: usage.remaining_count,
            resetsAt: usage.reset_at
          } : undefined
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

    console.log('Rufe Firecrawl Extract API auf für:', url);
    
    // Nutze Extract API für verbesserte Textqualität
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/extract', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [url],
        prompt: `Extrahiere den Hauptinhalt dieser Webseite und verbessere dabei:
        1. Grammatik und Rechtschreibung
        2. Formatierung und Struktur
        3. Entferne überflüssige Elemente (Navigation, Footer, Werbung)
        4. Behalte die ursprüngliche Bedeutung bei
        5. Stelle sicher, dass der Text professionell und gut lesbar ist
        
        Gib den bereinigten Text zurück mit klarer Struktur.`,
        schema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Der Haupttitel des Artikels/Newsletters'
            },
            content: {
              type: 'string', 
              description: 'Der vollständige, bereinigte und verbesserte Haupttext'
            },
            summary: {
              type: 'string',
              description: 'Eine kurze Zusammenfassung in 2-3 Sätzen'
            }
          },
          required: ['title', 'content']
        }
      }),
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error('Firecrawl API Fehler:', firecrawlResponse.status, errorText);
      
      // Logge Fehler in Datenbank
      await supabase
        .from('extraction_usage')
        .update({ 
          success: false, 
          error_message: `Firecrawl API Fehler: ${firecrawlResponse.status}` 
        })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      return new Response(
        JSON.stringify({ 
          error: 'Premium-Extraktion fehlgeschlagen',
          details: 'Die Webseite konnte nicht extrahiert werden. Bitte versuchen Sie es später erneut.'
        }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlResponse2 = await firecrawlResponse.json();
    
    // Extract API Response: { success: true, data: { title, content, summary } }
    const extractedData = firecrawlResponse2.data || {};
    
    console.log('Firecrawl Extract Response:', {
      success: firecrawlResponse2.success,
      hasData: !!firecrawlResponse2.data,
      fields: Object.keys(extractedData)
    });
    
    // 6. Response formatieren
    const response: ExtractPremiumResponse = {
      title: extractedData.title || 'Kein Titel gefunden',
      content: extractedData.content || extractedData.summary || '',
      markdown: extractedData.content, // Der bereinigte Content ist bereits Markdown-ähnlich
      metadata: {
        sourceUrl: url,
        extractedAt: new Date().toISOString(),
        extractionType: 'firecrawl',
      },
      usage: usage ? {
        used: usage.used_count + 1,
        limit: usage.limit_count,
        remaining: usage.remaining_count - 1,
        resetsAt: usage.reset_at,
      } : undefined,
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