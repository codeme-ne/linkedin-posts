import { useState, useMemo } from "react";
import { useSubscription, Subscription } from "@/hooks/useSubscription";
import { UpgradeButton } from "@/components/common/UpgradeButton";
import { signOut } from "@/api/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { env } from "@/config/env.config";
import { getStripePlan } from "@/config/app.config";
import {
  User,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Mail,
  Shield,
  FileHeart,
  Crown,
  Sparkles
} from "lucide-react";

// Helper function for subscription status display
const getSubscriptionStatusDetails = (subscription: Subscription | null, isPro: boolean) => {
  if (!subscription || !isPro) {
    return {
      text: "Kostenloser Plan",
      description: "Begrenzte Funktionen verfügbar",
      color: "text-muted-foreground",
      bgColor: "bg-muted/30"
    };
  }

  if (subscription.status === 'active') {
    const intervalText = subscription.interval === 'yearly' ? 'Jährlich' : 'Monatlich';
    return {
      text: `Pro ${intervalText}`,
      description: "Alle Premium-Funktionen freigeschaltet",
      color: "text-green-600",
      bgColor: "bg-green-50"
    };
  }

  if (subscription.status === 'trial') {
    return {
      text: "Testversion",
      description: "Deine Testphase ist aktiv",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    };
  }

  if (subscription.status === 'past_due') {
    return {
      text: "Zahlungsrückstand",
      description: "Bitte aktualisiere deine Zahlungsmethode",
      color: "text-red-600",
      bgColor: "bg-red-50"
    };
  }

  if (subscription.status === 'canceled') {
    return {
      text: "Gekündigt",
      description: "Dein Abonnement läuft bald ab",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    };
  }

  return {
    text: subscription.status || "Unbekannt",
    description: "Status wird geladen...",
    color: "text-muted-foreground",
    bgColor: "bg-muted/30"
  };
};

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subscriptionLoading, openCustomerPortal } = useSubscription();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const navigate = useNavigate();

  // Get email from auth context
  const email = user?.email ?? null;
  const loading = authLoading || subscriptionLoading;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Du wurdest erfolgreich abgemeldet.");
      navigate("/");
    } catch {
      toast.error("Fehler beim Abmelden. Bitte versuche es erneut.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isPro = subscription?.is_active || false;

  // Memoize status details to avoid recalculation on every render
  const statusDetails = useMemo(() =>
    getSubscriptionStatusDetails(subscription, isPro),
    [subscription, isPro]
  );

  const planLabel = loading ? "Lädt…" : statusDetails.text;

  // billingPortalUrl removed - Customer Portal now handled via API

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b md:hidden">
        <div className="flex items-center justify-between p-4">
          <Link to="/app">
            <Button variant="ghost" size="icon" aria-label="Zurück zum Generator">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Einstellungen</h1>
          <div className="w-10" aria-hidden="true" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block border-b bg-background/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Einstellungen
              </h1>
              <p className="text-muted-foreground mt-1">Verwalte dein Konto und deine Präferenzen</p>
            </div>
            <Link to="/app">
              <Button variant="outline" className="gap-2" aria-label="Zurück zum Generator">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Zurück zum Generator
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Account Card */}
          <section aria-labelledby="account-heading" className="col-span-1">
            <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10" aria-hidden="true">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle id="account-heading" className="text-lg">Konto</CardTitle>
                    <CardDescription className="text-xs">Persönliche Informationen</CardDescription>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="space-y-4">
              {authLoading ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-muted-foreground">E-Mail:</span>
                    </div>
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-muted-foreground">E-Mail:</span>
                    </div>
                    <div className="font-medium truncate" role="text" aria-label={`E-Mail-Adresse: ${email ?? "Nicht eingeloggt"}`}>
                      {email ?? "Nicht eingeloggt"}
                    </div>
                  </div>

                  {email && (
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full gap-2"
                      aria-label={isLoggingOut ? "Abmeldung läuft..." : "Vom Konto abmelden"}
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      {isLoggingOut ? "Abmelden..." : "Abmelden"}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
            </Card>
          </section>

          {/* Subscription Card */}
          <section aria-labelledby="subscription-heading" className="col-span-1">
            <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10" aria-hidden="true">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle id="subscription-heading" className="text-lg">Abonnement-Status</CardTitle>
                    <CardDescription className="text-xs">Dein aktueller Plan</CardDescription>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </>
              ) : (
                <div className="space-y-3">
                  <div className={cn("p-3 rounded-lg border", statusDetails.bgColor)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Aktueller Plan:</span>
                      <div className="flex items-center gap-2">
                        {isPro && <Crown className="h-4 w-4 text-yellow-500" />}
                        <span className={cn("font-semibold", statusDetails.color)}>{planLabel}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{statusDetails.description}</p>
                  </div>

                {/* Show subscription details for Pro users */}
                {subscription && isPro && (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">
                        {subscription.interval === 'yearly' ? 'Pro Jährlich' : 'Pro Monatlich'}
                      </span>
                    </div>
                    {(() => {
                      // Use config prices as source of truth, database amount as fallback
                      const configPlan = subscription.interval ? getStripePlan(subscription.interval) : null;
                      const displayAmount = configPlan ? configPlan.price : (subscription.amount || 0) / 100;
                      const displayCurrency = configPlan ? configPlan.currency : (subscription.currency || 'EUR');

                      return (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Preis:</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: displayCurrency.toUpperCase()
                            }).format(displayAmount)}
                            {subscription.interval === 'monthly' ? ' / Monat' : ' / Jahr'}
                          </span>
                        </div>
                      );
                    })()}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={cn(
                        "font-medium",
                        subscription.status === 'active' && "text-green-600",
                        subscription.status === 'trial' && "text-blue-600",
                        subscription.status === 'past_due' && "text-red-600"
                      )}>
                        {subscription.status === 'active' && 'Aktiv'}
                        {subscription.status === 'trial' && 'Testversion'}
                        {subscription.status === 'past_due' && 'Überfällig'}
                        {subscription.status === 'canceled' && 'Gekündigt'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  {!isPro ? (
                    <UpgradeButton />
                  ) : (
                    <Badge className="w-full justify-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 py-2">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Pro Mitgliedschaft aktiv
                    </Badge>
                  )}
                </div>

                {/* Customer Portal Button - Enhanced with better UX */}
                {subscription && isPro && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (isOpeningPortal) return; // Prevent multiple clicks

                      setIsOpeningPortal(true);
                      const toastId = toast.loading('Öffne Customer Portal...');

                      try {
                        await openCustomerPortal();
                        // Success - dismiss loading toast since we'll redirect
                        toast.dismiss(toastId);
                      } catch {
                        // Error - dismiss loading and show error
                        toast.dismiss(toastId);
                        toast.error('Fehler beim Öffnen des Customer Portals');
                      } finally {
                        setIsOpeningPortal(false);
                      }
                    }}
                    disabled={isOpeningPortal}
                    className="w-full text-sm gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    {isOpeningPortal ? 'Portal wird geöffnet...' : 'Abonnement verwalten'}
                  </Button>
                )}
                </div>
              )}
            </CardContent>
          </Card>
          </section>

          {/* Quick Actions Card */}
          <section aria-labelledby="quick-actions-heading" className="col-span-1">
          <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <FileText className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle id="quick-actions-heading" className="text-lg">Schnellzugriff</CardTitle>
                  <CardDescription className="text-xs">Wichtige Funktionen</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/app?expand=saved" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileHeart className="h-4 w-4" />
                  Gespeicherte Posts
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground px-1">
                Mobile: Untere Leiste | Desktop: Rechte Seitenleiste
              </p>
            </CardContent>
          </Card>
          </section>

          {/* Support Card - Full Width */}
          <section aria-labelledby="support-heading" className="col-span-1 md:col-span-2 lg:col-span-3">
          <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle id="support-heading" className="text-lg">Support & Rechtliches</CardTitle>
                  <CardDescription className="text-xs">Hilfe und wichtige Dokumente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${env.app.supportEmail}`, "_blank", "noopener,noreferrer")}
                  className="gap-2 justify-start"
                >
                  <Mail className="h-4 w-4" />
                  E-Mail Support
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.open("/privacy", "_blank", "noopener,noreferrer")}
                  className="gap-2 justify-start"
                >
                  <Shield className="h-4 w-4" />
                  Datenschutz
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.open("/imprint", "_blank", "noopener,noreferrer")}
                  className="gap-2 justify-start"
                >
                  <FileText className="h-4 w-4" />
                  Impressum
                </Button>
              </div>
            </CardContent>
          </Card>
          </section>
        </div>

        {/* App Version Footer - Mobile Only */}
        <footer className="mt-8 text-center text-xs text-muted-foreground md:hidden">
          <p>{env.app.domainName} v{env.app.version}</p>
          <p className="mt-1">© 2024 Alle Rechte vorbehalten</p>
        </footer>
      </main>
    </div>
  );
}
