import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Auth } from "@/components/Auth";
import { getSession, onAuthStateChange } from "@/api/supabase";
import { InstagramLogo } from "@/design-system/components/Icons/InstagramLogo";
import { XLogo } from "@/design-system/components/Icons/XLogo";

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
            <Button variant="ghost" onClick={() => navigate("/app")}>Demo</Button>
            <Button onClick={() => navigate("#signup")}>Anmelden</Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow flex flex-col items-center justify-center py-12">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16">
            {/* Left column: Marketing content */}
            <div className="space-y-8 flex flex-col justify-center">
              <div className="space-y-6">
                <Badge variant="outline" className="px-3 py-1 text-sm rounded-full border-primary/30 bg-primary/5 text-primary">
                  Powered by Claude AI
                </Badge>
                
                <h1 className="text-5xl font-bold leading-tight tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Newsletter zu Social Media
                  </span>
                  <br />
                  <span className="text-foreground">in Sekunden transformieren</span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Ein KI-Tool, das deinen Newsletter intelligent in optimierte Beiträge für verschiedene Social-Media-Plattformen umwandelt.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-[#0a66c2] text-white px-4 py-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                    </svg>
                    <span className="font-medium">LinkedIn</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full">
                    <XLogo size={16} />
                    <span className="font-medium">X (Twitter)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#e706ab] text-white px-4 py-2 rounded-full">
                    <InstagramLogo size={16} />
                    <span className="font-medium">Instagram</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 16V12M12 8h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">KI-Transformation</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Plattformspezifische Inhalte mit Claude AI, optimiert für jedes Format und Publikum.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Multi-Plattform</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Generiere Posts für LinkedIn, X und Instagram aus dem gleichen Quellmaterial.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04m-.023 7.032A11.955 11.955 0 0112 21.056a11.955 11.955 0 019.618-5.04m-9.618-8.072a3 3 0 00-2.4 4.5M6.8 21h10.4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Workflow-Integration</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Bearbeiten, Speichern und Teilen – alles in einer nahtlosen Oberfläche.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Markenidentität</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Bewahre deinen einzigartigen Ton und Stil über alle Plattformen hinweg.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg shadow-primary/20" onClick={() => navigate("#signup")}>
                  Kostenlos starten
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/app")}>
                  Demo ansehen
                </Button>
              </div>
            </div>

            {/* Right column: Auth form & process */}
            <div className="flex flex-col justify-center space-y-10">
              <Card id="signup" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-0 shadow-xl overflow-hidden relative">
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

              <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-xl p-6 border border-slate-200 dark:border-slate-700">
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