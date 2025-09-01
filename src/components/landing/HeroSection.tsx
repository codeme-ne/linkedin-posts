import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useTypewriter } from "@/hooks/useTypewriter";
import { Link } from "react-router-dom";
import { Mail, Share2 } from "lucide-react";

type HeroSectionProps = {
  isVisible: boolean;
  onSignup: () => void;
};

export function HeroSection({ isVisible, onSignup }: HeroSectionProps) {
  const phrases = useMemo(() => ([
    { text: "LinkedIn Post", color: "text-[#0a66c2]" },
    { text: "Twitter Thread", color: "text-black dark:text-white" },
    { text: "Instagram Story", color: "text-[#e706ab]" }
  ]), []);

  const { displayText, currentIndex } = useTypewriter(phrases.map(p => p.text), { enabled: true });

  return (
    <div className={`space-y-6 md:space-y-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
        <span className="text-foreground">Mach aus jedem Newsletter einen</span>
        <br />
        <span className={`${phrases[currentIndex].color} transition-colors duration-300`}>
          {displayText}
          <span className="animate-pulse">|</span>
        </span>
      </h1>
      <p className="text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl">
        <span className="font-semibold">15 Minuten sparen pro Post.</span> Kopiere deinen Newsletter rein oder gib eine URL ein, 
        erhalte perfekt formatierte Social-Media-Beiträge raus. 
      </p>
      <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-8">
        <Button 
          size="lg" 
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 py-5 text-sm sm:text-base" 
          onClick={onSignup}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Social Posts generieren →
        </Button>
        <Link to="/newsletter">
          <Button 
            size="lg" 
            variant="outline"
            className="w-full sm:w-auto font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 py-5 text-sm sm:text-base border-2"
          >
            <Mail className="mr-2 h-4 w-4" />
            Newsletter schreiben
          </Button>
        </Link>
      </div>
    </div>
  );
}
