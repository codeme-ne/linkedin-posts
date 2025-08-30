-- Migration: Füge Extraction Usage Tracking für Premium-Nutzer hinzu
-- Datum: 2025-01-30
-- Zweck: Limitiere Firecrawl-Nutzung auf 20 Extraktionen pro Monat für Premium-Nutzer

-- Erstelle Tabelle für Extraction Usage Tracking
CREATE TABLE IF NOT EXISTS public.extraction_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  extraction_type TEXT NOT NULL CHECK (extraction_type IN ('jina', 'firecrawl')),
  url TEXT NOT NULL,
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Erstelle Index für schnelle Abfragen nach User und Monat
CREATE INDEX IF NOT EXISTS idx_extraction_usage_user_month 
ON public.extraction_usage(user_id, extracted_at DESC);

-- Erstelle Index für Extraction-Typ
CREATE INDEX IF NOT EXISTS idx_extraction_usage_type 
ON public.extraction_usage(extraction_type);

-- Füge Usage-Tracking-Felder zur Subscriptions-Tabelle hinzu
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS extraction_limit INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS extraction_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month');

-- Erstelle Funktion zum Abrufen der monatlichen Nutzung
CREATE OR REPLACE FUNCTION get_monthly_extraction_usage(
  p_user_id UUID,
  p_extraction_type TEXT DEFAULT 'firecrawl'
)
RETURNS TABLE (
  used_count INTEGER,
  limit_count INTEGER,
  remaining_count INTEGER,
  reset_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(eu.id)::INTEGER, 0) as used_count,
    COALESCE(s.extraction_limit, 20) as limit_count,
    GREATEST(0, COALESCE(s.extraction_limit, 20) - COALESCE(COUNT(eu.id)::INTEGER, 0)) as remaining_count,
    COALESCE(s.extraction_reset_at, DATE_TRUNC('month', NOW()) + INTERVAL '1 month') as reset_at
  FROM public.subscriptions s
  LEFT JOIN public.extraction_usage eu ON 
    eu.user_id = p_user_id 
    AND eu.extraction_type = p_extraction_type
    AND eu.extracted_at >= DATE_TRUNC('month', NOW())
    AND eu.success = true
  WHERE s.user_id = p_user_id
  GROUP BY s.extraction_limit, s.extraction_reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Erstelle Funktion zum Zurücksetzen der monatlichen Limits
CREATE OR REPLACE FUNCTION reset_monthly_extraction_limits()
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET extraction_reset_at = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  WHERE extraction_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) für extraction_usage
ALTER TABLE public.extraction_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Nutzer können nur ihre eigenen Usage-Daten sehen
CREATE POLICY "Nutzer können eigene Extraction Usage sehen"
  ON public.extraction_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Nur System kann neue Usage-Einträge erstellen (über Service Role)
CREATE POLICY "System kann Extraction Usage erstellen"
  ON public.extraction_usage
  FOR INSERT
  WITH CHECK (false); -- Wird nur über Service Role erstellt

-- Grant Permissions
GRANT SELECT ON public.extraction_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_extraction_usage TO authenticated;

-- Kommentar zur Tabelle
COMMENT ON TABLE public.extraction_usage IS 'Tracking-Tabelle für Premium-Extraktionen mit Firecrawl. Limitiert auf 20 Extraktionen pro Monat.';
COMMENT ON COLUMN public.extraction_usage.extraction_type IS 'Typ der Extraktion: jina (kostenlos) oder firecrawl (premium)';
COMMENT ON COLUMN public.extraction_usage.metadata IS 'Zusätzliche Metadaten wie Response-Zeit, Content-Länge, etc.';