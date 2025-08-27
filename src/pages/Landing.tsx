import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Auth } from "@/components/Auth";
import { getSession, onAuthStateChange } from "@/api/supabase";

export default function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Auto-redirect if already logged in
    getSession().then(({ data }) => {
      if (data.session) navigate("/app", { replace: true });
      else setChecking(false);
    });
    const { data: sub } = onAuthStateChange((_event, session) => {
      if (session) navigate("/app", { replace: true });
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, [navigate]);

  if (checking) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary p-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        <section className="space-y-4 text-center md:text-left">
          <Badge variant="secondary" className="text-sm">Early Access</Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            LinkedIn Beitrag Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Verwandle deinen Newsletter in ansprechende LinkedIn-Posts – schnell, konsistent und on-brand.
          </p>
          <ul className="text-muted-foreground space-y-2">
            <li>• KI-Remix aus Newsletter-Text</li>
            <li>• Bearbeiten, Speichern und als Draft zu LinkedIn</li>
            <li>• Einfache Anmeldung per Magic Link</li>
          </ul>
          <div className="flex gap-3 justify-center md:justify-start pt-2">
            <Button size="lg" onClick={() => navigate("#signup")}>Jetzt starten</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/app")}>Demo ansehen</Button>
          </div>
        </section>

        <Card id="signup" className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Kostenlos registrieren</CardTitle>
            <CardDescription>Nutze die App mit einem sicheren Magic Link.</CardDescription>
          </CardHeader>
          <CardContent>
            <Auth />
            <p className="text-xs text-muted-foreground mt-3">
              Mit der Registrierung stimmst du zu, dass wir deine E-Mail zur Anmeldung verwenden.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
