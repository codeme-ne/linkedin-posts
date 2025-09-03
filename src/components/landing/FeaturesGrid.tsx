import { Card, CardContent } from "@/components/ui/card";
import { 
  Link2, 
  Share2, 
  Save, 
  Edit3, 
  Send,
  Zap
} from "lucide-react";

type FeaturesGridProps = {
  isVisible: boolean;
  variant?: "desktop" | "mobile";
};

export function FeaturesGrid({ isVisible, variant = "desktop" }: FeaturesGridProps) {
  const containerClass = variant === "desktop"
    ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
    : `grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  return (
    <div className={containerClass}>
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <Link2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Blitzschnell starten</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Einfach einfügen und sofort loslegen. Keine Einrichtung nötig.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 w-10 h-10 flex items-center justify-center mb-4">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Unbegrenzte Power</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Keine Limits. Extrahiere so viel Content wie du willst.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Maximale Reichweite</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Erreiche alle deine Zielgruppen auf einmal. Dreifache Sichtbarkeit.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <Save className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Content-Bibliothek</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Baue dir einen Vorrat auf. Nie wieder ohne Content.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <Edit3 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Perfekte Kontrolle</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Deine Marke, dein Stil. Jeder Post passt zu dir.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 w-10 h-10 flex items-center justify-center mb-4">
            <Send className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Sofort live</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Ein Klick und dein Content ist überall online.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
