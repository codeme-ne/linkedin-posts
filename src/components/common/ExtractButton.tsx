// Premium/Free Extraction Button mit automatischer Methodenwahl
import { useState } from 'react';
import { Download, Zap, AlertCircle } from 'lucide-react';
import { extractFromUrl } from '@/api/extract';
import { extractPremiumFromUrl, canUsePremiumExtraction } from '@/api/extract-premium';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface ExtractButtonProps {
  url: string;
  onExtracted: (content: string, title?: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ExtractButton({ 
  url, 
  onExtracted, 
  disabled = false,
  className = ''
}: ExtractButtonProps) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'auto' | 'free' | 'premium'>('auto');
  const { subscription } = useSubscription();

  const handleExtract = async () => {
    if (!url || disabled) return;

    setLoading(true);
    try {
      let content: string;
      let title: string | undefined;

      // Auto-Modus: Wähle beste verfügbare Methode
      if (method === 'auto' && subscription?.is_active) {
        const canUsePremium = await canUsePremiumExtraction();
        if (canUsePremium) {
          try {
            const premiumResult = await extractPremiumFromUrl(url);
            content = premiumResult.content;
            title = premiumResult.title;
            
            // Zeige verbleibende Nutzungen
            if (premiumResult.usage) {
              toast.success(
                `Premium-Extraktion erfolgreich! (${premiumResult.usage.remaining} von ${premiumResult.usage.limit} übrig)`,
                { duration: 4000 }
              );
            }
          } catch (error) {
            console.error('Premium-Extraktion fehlgeschlagen:', error);
            // Fallback auf kostenlose Version
            const freeResult = await extractFromUrl(url);
            content = freeResult.content;
            title = freeResult.title;
            toast.info('Premium-Extraktion fehlgeschlagen, nutze kostenlose Version');
          }
        } else {
          // Nutze kostenlose Version wenn Premium-Limit erreicht
          const freeResult = await extractFromUrl(url);
          content = freeResult.content;
          title = freeResult.title;
          toast.info('Premium-Limit erreicht, nutze kostenlose Extraktion');
        }
      }
      // Explizit Premium gewählt
      else if (method === 'premium' && subscription?.is_active) {
        const premiumResult = await extractPremiumFromUrl(url);
        content = premiumResult.content;
        title = premiumResult.title;
        
        if (premiumResult.usage) {
          toast.success(
            `Premium-Extraktion erfolgreich! (${premiumResult.usage.remaining} von ${premiumResult.usage.limit} übrig)`,
            { duration: 4000 }
          );
        }
      }
      // Kostenlose Version (Standard oder explizit gewählt)
      else {
        const freeResult = await extractFromUrl(url);
        content = freeResult.content;
        title = freeResult.title;
        
        if (method === 'premium' && !subscription?.is_active) {
          toast.error('Premium-Abo erforderlich für erweiterte Extraktion');
        } else {
          toast.success('Inhalt erfolgreich extrahiert');
        }
      }

      onExtracted(content, title);
    } catch (error) {
      console.error('Extraktionsfehler:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Fehler beim Extrahieren der Inhalte'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Methodenauswahl für Premium-Nutzer */}
      {subscription?.is_active && (
        <div className="flex gap-2 text-sm">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="extractMethod"
              value="auto"
              checked={method === 'auto'}
              onChange={(e) => setMethod(e.target.value as 'auto' | 'free' | 'premium')}
              className="text-blue-600"
            />
            <span>Auto</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="extractMethod"
              value="premium"
              checked={method === 'premium'}
              onChange={(e) => setMethod(e.target.value as 'auto' | 'free' | 'premium')}
              className="text-blue-600"
            />
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              Premium
            </span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="extractMethod"
              value="free"
              checked={method === 'free'}
              onChange={(e) => setMethod(e.target.value as 'auto' | 'free' | 'premium')}
              className="text-blue-600"
            />
            <span>Kostenlos</span>
          </label>
        </div>
      )}

      {/* Extraktions-Button */}
      <button
        onClick={handleExtract}
        disabled={disabled || loading || !url}
        className={`
          flex items-center justify-center gap-2 px-4 py-2 
          bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
          text-white font-medium rounded-lg transition-colors
          disabled:cursor-not-allowed
          ${className}
        `}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Extrahiere...</span>
          </>
        ) : (
          <>
            {method === 'premium' && subscription?.is_active ? (
              <Zap className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>
              {method === 'premium' && subscription?.is_active 
                ? 'Premium-Extraktion' 
                : 'Inhalt extrahieren'}
            </span>
          </>
        )}
      </button>

      {/* Info für Nicht-Premium-Nutzer */}
      {!subscription?.is_active && (
        <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p>Mit Premium erhalten Sie bessere Extraktion für:</p>
            <ul className="list-disc list-inside mt-1">
              <li>JavaScript-basierte Seiten</li>
              <li>PDF-Dokumente</li>
              <li>Komplexe Layouts</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}