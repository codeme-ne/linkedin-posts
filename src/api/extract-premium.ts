// Frontend API Client für Premium Content-Extraktion mit Firecrawl
// Nutzt die /api/extract-premium Edge Function

import { supabase } from './supabase';

export type ExtractPremiumResult = {
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

export type ExtractUsageInfo = {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: Date;
  isAtLimit: boolean;
};

// Basis-URL für API-Aufrufe
function apiBase() {
  // Nutze gleiche Origin während lokaler Entwicklung/Preview
  return '';
}

/**
 * Extrahiert Premium-Content von einer URL mit Firecrawl
 * Limitiert auf 20 Extraktionen pro Monat für Premium-Nutzer
 */
export async function extractPremiumFromUrl(url: string): Promise<ExtractPremiumResult> {
  // Hole aktuellen Auth-Token
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Authentifizierung erforderlich für Premium-Extraktion');
  }

  const res = await fetch(`${apiBase()}/api/extract-premium`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }));
    
    // Spezielle Fehlerbehandlung für verschiedene Status-Codes
    if (res.status === 401) {
      throw new Error('Bitte melden Sie sich an, um Premium-Funktionen zu nutzen');
    } else if (res.status === 403) {
      throw new Error('Premium-Abo erforderlich. Upgrade auf Premium für erweiterte Extraktion.');
    } else if (res.status === 429) {
      const usage = errorData.usage;
      if (usage) {
        throw new Error(
          `Monatliches Limit erreicht (${usage.used}/${usage.limit}). ` +
          `Zurücksetzung am ${new Date(usage.resetsAt).toLocaleDateString('de-DE')}.`
        );
      }
      throw new Error(errorData.error || 'Nutzungslimit erreicht');
    }
    
    throw new Error(
      errorData.error || 
      `Premium-Extraktion fehlgeschlagen (${res.status}): ${res.statusText}`
    );
  }

  return res.json();
}

/**
 * Holt die aktuelle Nutzungsstatistik für Premium-Extraktionen
 */
export async function getExtractionUsage(): Promise<ExtractUsageInfo | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .rpc('get_monthly_extraction_usage', {
        p_user_id: user.id,
        p_extraction_type: 'firecrawl'
      })
      .single() as { 
        data: {
          used_count: number;
          limit_count: number;
          remaining_count: number;
          reset_at: string;
        } | null;
        error: Error | null;
      };

    if (error) {
      console.error('Fehler beim Abrufen der Nutzungsstatistik:', error);
      return null;
    }

    if (!data) return null;

    return {
      used: data.used_count,
      limit: data.limit_count,
      remaining: data.remaining_count,
      resetsAt: new Date(data.reset_at),
      isAtLimit: data.remaining_count <= 0
    };
  } catch (error) {
    console.error('Fehler beim Abrufen der Nutzungsstatistik:', error);
    return null;
  }
}

/**
 * Prüft ob der Nutzer Premium-Extraktionen nutzen kann
 */
export async function canUsePremiumExtraction(): Promise<boolean> {
  try {
    // Prüfe Subscription-Status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('is_active')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.is_active) return false;

    // Prüfe Nutzungslimit
    const usage = await getExtractionUsage();
    return usage ? !usage.isAtLimit : false;
  } catch (error) {
    console.error('Fehler bei Premium-Prüfung:', error);
    return false;
  }
}

/**
 * Wählt automatisch die beste Extraktionsmethode basierend auf Nutzer-Status
 */
export async function smartExtract(url: string): Promise<{
  content: string;
  title?: string;
  method: 'premium' | 'free';
  usage?: ExtractUsageInfo;
}> {
  const canUsePremium = await canUsePremiumExtraction();
  
  if (canUsePremium) {
    try {
      // Versuche Premium-Extraktion
      const result = await extractPremiumFromUrl(url);
      const usage = result.usage ? {
        used: result.usage.used,
        limit: result.usage.limit,
        remaining: result.usage.remaining,
        resetsAt: new Date(result.usage.resetsAt),
        isAtLimit: result.usage.remaining <= 0
      } : undefined;
      
      return {
        content: result.content,
        title: result.title,
        method: 'premium',
        usage
      };
    } catch (error) {
      console.error('Premium-Extraktion fehlgeschlagen, falle auf kostenlose Version zurück:', error);
      // Fallback auf kostenlose Version
    }
  }
  
  // Nutze kostenlose Jina-Extraktion als Fallback
  const { extractFromUrl } = await import('./extract');
  const freeResult = await extractFromUrl(url);
  
  return {
    content: freeResult.content,
    title: freeResult.title,
    method: 'free',
    usage: undefined
  };
}