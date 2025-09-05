import { useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeButton } from "@/components/common/UpgradeButton";
import { getSession, signOut } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
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

export default function Settings() {
  const { subscription, loading, openCustomerPortal } = useSubscription();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Abgemeldet - Du wurdest erfolgreich abgemeldet.");
      navigate("/");
    } catch {
      toast.error("Fehler - Beim Abmelden ist ein Fehler aufgetreten.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isPro = subscription?.is_active || false;
  const planLabel = loading
    ? "Lädt…"
    : isPro
    ? "Pro (Lifetime)"
    : "Free";

  // billingPortalUrl removed - Customer Portal now handled via API

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b md:hidden">
        <div className="flex items-center justify-between p-4">
          <Link to="/app">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Einstellungen</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block border-b bg-background/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Einstellungen
              </h1>
              <p className="text-muted-foreground mt-1">Verwalte dein Konto und deine Präferenzen</p>
            </div>
            <Link to="/app">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Zurück zum Generator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Account Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Konto</CardTitle>
                  <CardDescription className="text-xs">Persönliche Informationen</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">E-Mail:</span>
                </div>
                <div className="font-medium truncate">{email ?? "Nicht eingeloggt"}</div>
              </div>
              
              {email && (
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Abmelden..." : "Abmelden"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Abo-Status</CardTitle>
                  <CardDescription className="text-xs">Dein aktueller Plan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan:</span>
                  <div className="flex items-center gap-2">
                    {isPro && <Crown className="h-4 w-4 text-yellow-500" />}
                    <span className="font-medium">{planLabel}</span>
                  </div>
                </div>

                {/* Show subscription details for Pro users */}
                {subscription && isPro && (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">
                        {subscription.interval === 'lifetime' ? 'Lifetime Deal' : `Pro ${subscription.interval}`}
                      </span>
                    </div>
                    {subscription.amount && subscription.currency && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Preis:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: subscription.currency.toUpperCase()
                          }).format(subscription.amount / 100)}
                          {subscription.interval !== 'lifetime' && ` / ${subscription.interval === 'monthly' ? 'Monat' : 'Jahr'}`}
                        </span>
                      </div>
                    )}
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
                      Pro Lifetime Zugang
                    </Badge>
                  )}
                </div>

                {/* Customer Portal Button - Enhanced with better UX */}
                {subscription && isPro && (
                  <Button 
                    variant="secondary" 
                    onClick={async () => {
                      toast.loading('Öffne Customer Portal...', { duration: 2000 });
                      try {
                        await openCustomerPortal();
                      } catch (error) {
                        toast.error('Fehler beim Öffnen des Customer Portals');
                      }
                    }}
                    className="w-full text-sm gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Abo & Rechnungen verwalten
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <FileText className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Schnellzugriff</CardTitle>
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

          {/* Support Card - Full Width on Mobile/Tablet, Normal on Desktop */}
          <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow col-span-full lg:col-span-3">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Support & Rechtliches</CardTitle>
                  <CardDescription className="text-xs">Hilfe und wichtige Dokumente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.open("mailto:support@example.com", "_blank")}
                  className="gap-2 justify-start"
                >
                  <Mail className="h-4 w-4" />
                  Support
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.open("/privacy", "_blank")}
                  className="gap-2 justify-start"
                >
                  <Shield className="h-4 w-4" />
                  Datenschutz
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.open("/imprint", "_blank")}
                  className="gap-2 justify-start"
                >
                  <FileText className="h-4 w-4" />
                  Impressum
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Version Footer - Mobile Only */}
        <div className="mt-8 text-center text-xs text-muted-foreground md:hidden">
          <p>Social Transformer v1.0.0</p>
          <p className="mt-1">© 2024 Alle Rechte vorbehalten</p>
        </div>
      </div>
    </div>
  );
}
