import { Card, CardContent } from "@/components/ui/card";

type FeaturesGridProps = {
  isVisible: boolean;
  variant?: "desktop" | "mobile";
};

export function FeaturesGrid({ isVisible, variant = "desktop" }: FeaturesGridProps) {
  const containerClass = variant === "desktop"
    ? `hidden lg:grid md:grid-cols-2 gap-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
    : `grid md:grid-cols-2 gap-4 lg:hidden transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  return (
    <div className={containerClass}>
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v10l3-3M12 2L9 5M12 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5M21 12c0-4.97-4.03-9-9-9" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Kopieren → Fertig</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Newsletter reinkopieren, KI macht den Rest. Keine Templates, kein manuelles Formatieren.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">3 Plattformen gleichzeitig</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Ein Klick: LinkedIn-Post, X-Thread und Instagram-Story. Jedes Format perfekt optimiert.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">30 Sekunden statt 30 Minuten</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Was früher manuelles Umschreiben war, erledigt Claude AI in Sekunden. Zeit für Wichtigeres.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04m-.023 7.032A11.955 11.955 0 0112 21.056a11.955 11.955 0 019.618-5.04" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Engagement-optimiert</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            KI kennt die Tricks: Kurze Sätze, Zeilenumbrüche, Hook-Formeln. Mehr Likes garantiert.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
