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
              <path d="M12 16V12M12 8h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">KI-Transformation</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Plattformspezifische Inhalte mit Claude AI, optimiert für jedes Format und Publikum.
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
          <h3 className="text-lg font-semibold leading-snug mb-3">Multi-Plattform</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Generiere Posts für LinkedIn, X und Instagram aus dem gleichen Quellmaterial.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04m-.023 7.032A11.955 11.955 0 0112 21.056a11.955 11.955 0 019.618-5.04m-9.618-8.072a3 3 0 00-2.4 4.5M6.8 21h10.4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Workflow-Integration</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Bearbeiten, Speichern und Teilen – alles in einer nahtlosen Oberfläche.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Markenidentität</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Bewahre deinen einzigartigen Ton und Stil über alle Plattformen hinweg.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
