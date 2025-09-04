import { useSubscription } from '../../hooks/useSubscription';
import { CustomerPortalButton } from './CustomerPortalButton';
import { UpgradeButton } from '../common/UpgradeButton';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, CreditCard, Clock, AlertTriangle, Crown, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SubscriptionStatus() {
  const {
    subscription,
    loading,
    error,
    isActive,
    isLifetime,
    isTrial,
    isPastDue,
    trialDaysLeft,
    daysUntilRenewal,
    currentPeriodEnd,
    extractionLimit,
  } = useSubscription();

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 animate-pulse" />
            <span className="animate-pulse">Abo-Status wird geladen...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Fehler beim Laden des Abo-Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => window.location.reload()}
            >
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Upgrade zu Pro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Du nutzt momentan die kostenlose Version. Upgrade zu Pro für erweiterte Features.
            </p>
            
            <div className="bg-background/50 border border-border/50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                Pro Features
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Premium Content-Extraktion (20/Monat)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  JavaScript-Rendering Support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Erweiterte Content-Analyse
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Prioritärer Support
                </li>
              </ul>
            </div>
          </div>
          
          <UpgradeButton className="w-full" />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (isPastDue) return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        Zahlung überfällig
      </Badge>
    );
    if (isTrial) return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="w-3 h-3" />
        Testversion
      </Badge>
    );
    if (isActive) return (
      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 gap-1">
        <CheckCircle className="w-3 h-3" />
        {isLifetime ? 'Lifetime' : 'Aktiv'}
      </Badge>
    );
    return <Badge variant="secondary">Inaktiv</Badge>;
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount || !currency) return 'N/A';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-lg">Abo-Status</span>
              <p className="text-xs text-muted-foreground font-normal">Dein aktueller Pro Plan</p>
            </div>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Plan Info */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Plan</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                {isLifetime && <Sparkles className="w-4 h-4 text-yellow-500" />}
                {isLifetime ? 'Lifetime Deal' : 
                 subscription.interval === 'monthly' ? 'Monatlich Pro' : 
                 subscription.interval === 'yearly' ? 'Jährlich Pro' : 
                 'Pro Plan'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Preis</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(subscription.amount, subscription.currency)}
                {!isLifetime && ` / ${subscription.interval === 'monthly' ? 'Monat' : 'Jahr'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Trial Info */}
        {isTrial && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Testversion aktiv</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Noch {trialDaysLeft} Tage kostenlos nutzen
            </p>
          </div>
        )}

        {/* Past Due Warning */}
        {isPastDue && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Zahlung überfällig</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Bitte aktualisiere deine Zahlungsmethode im Customer Portal.
            </p>
          </div>
        )}

        {/* Renewal Info for Subscriptions */}
        {!isLifetime && currentPeriodEnd && (
          <div>
            <div className="flex items-center gap-2 text-gray-700 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Nächste Verlängerung</span>
            </div>
            <p className="text-sm text-gray-600">
              {currentPeriodEnd.toLocaleDateString('de-DE')} 
              ({daysUntilRenewal} Tage)
            </p>
          </div>
        )}

        {/* Premium Extractions Limit */}
        {isActive && (
          <div className="bg-background/50 border border-border/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Premium Extractions</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {extractionLimit}/Monat
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              JavaScript-Rendering und erweiterte Content-Analyse verfügbar
            </p>
          </div>
        )}

        {/* Customer Portal Button */}
        <div className="pt-2 space-y-2">
          <CustomerPortalButton className="w-full" />
          {isLifetime && (
            <p className="text-xs text-center text-muted-foreground">
              🎉 Lifetime Deal - Keine wiederkehrenden Zahlungen
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}