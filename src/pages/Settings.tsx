import { useEffect, useState } from "react";
import { useSubscription, UpgradeButton } from "@/components/UpgradeButton";
import { getSession, signOut } from "@/api/supabase";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function Settings() {
  const { subscription, loading } = useSubscription();
  const { getRemainingCount, isPro } = useUsageTracking();
  const [email, setEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Abgemeldet", description: "Du wurdest erfolgreich abgemeldet." });
  };

  const planLabel = loading
    ? "Lädt…"
    : subscription?.is_active
    ? "Pro (Lifetime)"
    : "Free";

  // Optional: Billing-Portal Link, falls in Env vorhanden (nur anzeigen, wenn gesetzt)
  const billingPortalUrl = import.meta.env.VITE_STRIPE_BILLING_PORTAL as string | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Einstellungen</h1>
            <p className="text-muted-foreground">Verwalte Abo, Konto und App-Einstellungen</p>
          </div>
          <Link to="/app">
            <Button variant="ghost">Zurück</Button>
          </Link>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow">
          <CardHeader>
            <CardTitle>Konto</CardTitle>
            <CardDescription>Deine Zugangsdaten und Status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">E-Mail</div>
                <div className="font-medium">{email ?? "Nicht eingeloggt"}</div>
              </div>
              {email && (
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              )}
            </div>

            <div className="h-px w-full bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Aktueller Plan</div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{planLabel}</span>
                  {isPro && <Badge>Pro</Badge>}
                </div>
              </div>
              {!isPro && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Freie Transformationen heute</div>
                  <div className="font-medium">{Math.max(0, getRemainingCount())}</div>
                </div>
              )}
            </div>

            {!isPro && (
              <div className="pt-2">
                <UpgradeButton />
              </div>
            )}

            {billingPortalUrl && (
              <div className="pt-2">
                <Button variant="secondary" onClick={() => window.open(billingPortalUrl!, "_blank")}>Rechnungen & Zahlung verwalten</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow">
          <CardHeader>
            <CardTitle>Gespeicherte Inhalte</CardTitle>
            <CardDescription>
              Am Handy in der unteren Leiste und am Desktop in der rechten Seitenleiste.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link to="/app">
              <Button variant="outline" className="mt-1">Zum Generator</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow">
          <CardHeader>
            <CardTitle>Support & Rechtliches</CardTitle>
            <CardDescription>Hilfreiche Links</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.open("mailto:support@example.com", "_blank")}>Support kontaktieren</Button>
            <Button variant="ghost" onClick={() => window.open("/privacy", "_blank")}>Datenschutz</Button>
            <Button variant="ghost" onClick={() => window.open("/imprint", "_blank")}>Impressum</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
