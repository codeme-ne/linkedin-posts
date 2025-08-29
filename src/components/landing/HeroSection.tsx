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
    { text: "Tweet", color: "text-black dark:text-white" },
    { text: "Instagram Beitrag", color: "text-[#e706ab]" }
  ]), []);

  const { displayText, currentIndex } = useTypewriter(phrases.map(p => p.text), { enabled: true });

  return (
    <div className={`space-y-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <Badge variant="outline" className="px-3 py-1 text-sm font-medium rounded-full border-primary/30 bg-primary/5 text-primary animate-pulse">
        Powered by Claude AI
      </Badge>
      <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
        <span className="text-foreground">Newsletter zu</span>
        <br />
        <span className={`${phrases[currentIndex].color} transition-colors duration-300`}>
          {displayText}
          <span className="animate-pulse">|</span>
        </span>
      </h1>
      <p className="text-xl leading-relaxed text-muted-foreground max-w-2xl">
        Ein KI-Tool, das deinen Newsletter intelligent in optimierte Beiträge für verschiedene Social-Media-Plattformen umwandelt.
      </p>
      <div className="flex gap-4 pt-8">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all duration-300" 
          onClick={onSignup}
        >
          Kostenlos starten
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="font-semibold hover:scale-105 transition-all duration-300" 
          onClick={onDemo}
        >
          Demo ansehen
        </Button>
      </div>
    </div>
  );
}
