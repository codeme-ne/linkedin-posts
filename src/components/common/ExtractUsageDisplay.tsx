// Komponente zur Anzeige der Premium-Extraktions-Nutzung
import { useEffect, useState } from 'react';
import { AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { getExtractionUsage, type ExtractUsageInfo } from '@/api/extract-premium';
import { useSubscription } from '@/components/common/UpgradeButton';

export function ExtractUsageDisplay() {
  const [usage, setUsage] = useState<ExtractUsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { subscription } = useSubscription();

  useEffect(() => {
    if (subscription?.is_active) {
      loadUsage();
    } else {
      setLoading(false);
    }
  }, [subscription]);

  const loadUsage = async () => {
    try {
      const usageData = await getExtractionUsage();
      setUsage(usageData);
    } catch (error) {
      console.error('Fehler beim Laden der Nutzungsstatistik:', error);
    } finally {
      setLoading(false);
    }
  };

  // Zeige nichts für Nicht-Premium-Nutzer
  if (!subscription?.is_active) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Lade Nutzungsstatistik...</span>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const percentageUsed = (usage.used / usage.limit) * 100;
  const isNearLimit = usage.remaining <= 5;
  const isAtLimit = usage.remaining <= 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Premium-Extraktionen</h3>
        </div>
        <button
          onClick={loadUsage}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Nutzung aktualisieren"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Fortschrittsbalken */}
        <div className="w-full">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{usage.used} von {usage.limit} genutzt</span>
            <span className={isNearLimit ? 'text-orange-600 font-semibold' : ''}>
              {usage.remaining} übrig
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                isAtLimit 
                  ? 'bg-red-500' 
                  : isNearLimit 
                  ? 'bg-orange-500' 
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Warnung wenn Limit nahe */}
        {isNearLimit && !isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-orange-800 font-medium">
                Nur noch {usage.remaining} Premium-Extraktion{usage.remaining === 1 ? '' : 'en'} übrig
              </p>
              <p className="text-orange-700 mt-1">
                Zurücksetzung am {usage.resetsAt.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Fehler wenn Limit erreicht */}
        {isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-red-800 font-medium">
                Monatliches Limit erreicht
              </p>
              <p className="text-red-700 mt-1">
                Neue Premium-Extraktionen sind ab dem {usage.resetsAt.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })} wieder verfügbar. Bis dahin nutzen Sie die kostenlose Basis-Extraktion.
              </p>
            </div>
          </div>
        )}

        {/* Info über Premium-Vorteile */}
        {!isAtLimit && (
          <div className="text-xs text-gray-500 mt-2">
            <p>Premium-Extraktion bietet:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>JavaScript-Rendering für moderne Webseiten</li>
              <li>Bessere Inhaltsextraktion</li>
              <li>PDF-Unterstützung</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}