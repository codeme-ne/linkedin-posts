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
          <h3 className="text-lg font-semibold leading-snug mb-3">Paste & Go</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            URL oder Text einfügen. Fertig.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 w-10 h-10 flex items-center justify-center mb-4">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Premium-Scraping</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Unbegrenzt. Sicher und zuverlässig.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">3 Plattformen</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            LinkedIn, X, Instagram. Ein Klick.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <Save className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Posts speichern</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Editieren. Später verwenden.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
            <Edit3 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Post-Editor</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Manuell anpassen. Perfektionieren.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6 pb-6">
          <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 w-10 h-10 flex items-center justify-center mb-4">
            <Send className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold leading-snug mb-3">Direct-Posting</h3>
          <p className="text-sm leading-normal text-muted-foreground">
            Direkt auf LinkedIn, X & Co. posten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
