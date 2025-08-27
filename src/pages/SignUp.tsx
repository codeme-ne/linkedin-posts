import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Auth } from "@/components/Auth";
import { getSession, onAuthStateChange } from "@/api/supabase";

export default function SignUp() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-40 -top-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/90 text-white p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 7L9 19l-5.5-5.5" />
              </svg>
            </div>
            <h2 className="font-bold text-2xl tracking-tight">Social Transformer</h2>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => navigate("/")}>Zurück</Button>
            <Button variant="ghost" onClick={() => navigate("/app")}>Demo</Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow flex flex-col items-center justify-center py-12">
          <div className="max-w-md w-full mx-auto">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-0 shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl">Kostenlos testen</CardTitle>
                <CardDescription>
                  Melde dich an und verwandle deine Newsletter sofort in Social Media Content.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Auth />
                <p className="text-xs text-muted-foreground mt-4">
                  Mit der Registrierung stimmst du zu, dass wir deine E-Mail zur Anmeldung verwenden.
                </p>
              </CardContent>
            </Card>

            <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-xl p-6 border border-slate-200 dark:border-slate-700 mt-10">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
                  <path d="M8 14l2-2 4 4" />
                  <path d="M14 10l2-2" />
                </svg>
                So einfach geht's
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 w-6 h-6 text-xs font-medium text-primary mt-0.5">1</span>
                  <div>
                    <p className="font-medium">Newsletter einfügen</p>
                    <p className="text-sm text-muted-foreground">Kopiere deinen Inhalt in das Textfeld</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 w-6 h-6 text-xs font-medium text-primary mt-0.5">2</span>
                  <div>
                    <p className="font-medium">Plattformen auswählen</p>
                    <p className="text-sm text-muted-foreground">Wähle LinkedIn, X oder Instagram</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 w-6 h-6 text-xs font-medium text-primary mt-0.5">3</span>
                  <div>
                    <p className="font-medium">KI-Transformation starten</p>
                    <p className="text-sm text-muted-foreground">Claude AI erstellt optimierte Beiträge</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 w-6 h-6 text-xs font-medium text-primary mt-0.5">4</span>
                  <div>
                    <p className="font-medium">Beiträge teilen</p>
                    <p className="text-sm text-muted-foreground">Bearbeite, speichere und teile direkt auf den Plattformen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-slate-200 dark:border-slate-800 mt-12">
          <p>© 2025 Social Transformer • Newsletter zu Social Media Posts</p>
        </footer>
      </div>
    </div>
  );
}