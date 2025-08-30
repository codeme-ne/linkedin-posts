import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTypewriter } from "@/hooks/useTypewriter";

type HeroSectionProps = {
  isVisible: boolean;
  onSignup: () => void;
  onDemo: () => void;
};

export function HeroSection({ isVisible, onSignup, onDemo }: HeroSectionProps) {
  const phrases = useMemo(() => ([
    { text: "LinkedIn Post", color: "text-[#0a66c2]" },
    { text: "Twitter Thread", color: "text-black dark:text-white" },
    { text: "Instagram Story", color: "text-[#e706ab]" }
  ]), []);

  const { displayText, currentIndex } = useTypewriter(phrases.map(p => p.text), { enabled: true });

  return (
    <div className={`space-y-6 md:space-y-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <Badge variant="outline" className="px-3 py-1 text-sm font-medium rounded-full border-primary/30 bg-primary/5 text-primary animate-pulse">
        Powered by Claude AI
      </Badge>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
        <span className="text-foreground">Mach aus jedem Newsletter einen</span>
        <br />
        <span className={`${phrases[currentIndex].color} transition-colors duration-300`}>
          {displayText}
          <span className="animate-pulse">|</span>
        </span>
      </h1>
      <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl">
        <span className="font-semibold">15 Minuten sparen pro Post.</span> Kopiere deinen Newsletter rein, 
        erhalte perfekt formatierte Social-Media-Beiträge raus. 
        <span className="text-primary font-medium"> KI-optimiert für maximales Engagement.</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-8">
        <Button 
          size="lg" 
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 md:px-8 py-5 md:py-6 text-sm md:text-base" 
          onClick={onSignup}
        >
          Kostenlos testen →
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="w-full sm:w-auto font-semibold hover:scale-105 transition-all duration-300 px-6 md:px-8 py-5 md:py-6 text-sm md:text-base" 
          onClick={onDemo}
        >
          Live-Demo ansehen
        </Button>
      </div>
    </div>
  );
}
