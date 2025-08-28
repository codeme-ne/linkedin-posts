import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession, onAuthStateChange } from "@/api/supabase";

export default function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Animated headline states
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const phrases = [
    { text: "LinkedIn Post", color: "text-[#0a66c2]" },
    { text: "Tweet", color: "text-black dark:text-white" },
    { text: "Instagram Beitrag", color: "text-[#e706ab]" }
  ];

  useEffect(() => {
    // Auto-redirect if already logged in
    getSession().then(({ data }) => {
      if (data.session) navigate("/app", { replace: true });
      else setChecking(false);
    });
    const { data: sub } = onAuthStateChange((_event, session) => {
      if (session) navigate("/app", { replace: true });
    });

    // Animation timing for elements to appear
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => {
      sub?.subscription?.unsubscribe?.();
      clearTimeout(timer);
    };
  }, [navigate]);

  useEffect(() => {
    // Auto-play video when it's loaded
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log("Video autoplay prevented:", err));
    }
  }, [checking]);

  // Typewriter effect for animated headline
  useEffect(() => {
    if (checking) return;
    
    const currentPhrase = phrases[currentPhraseIndex].text;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;

    if (!isDeleting && displayText.length < currentPhrase.length) {
      const timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && displayText.length === currentPhrase.length) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(timeout);
    } else if (isDeleting && displayText.length > 0) {
      const timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }
  }, [displayText, isDeleting, currentPhraseIndex, checking]);

  if (checking) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
      {/* Enhanced decorative elements with animation */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDuration: '15s' }} />
        <div className="absolute right-0 top-1/4 w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDuration: '20s', animationDelay: '2s' }} />
        <div className="absolute left-1/3 bottom-0 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDuration: '18s', animationDelay: '1s' }} />
        <div className="absolute right-1/4 bottom-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDuration: '25s', animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Header with subtle entrance animation */}
        <header className={`flex justify-between items-center py-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-primary to-accent text-white p-2 rounded-lg shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 7L9 19l-5.5-5.5" />
              </svg>
            </div>
            <h2 className="font-bold text-2xl tracking-tight">Social Transformer</h2>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => navigate("/app")}>Demo</Button>
            <Button 
              variant="outline" 
              className="border-primary/30 hover:border-primary/60 transition-all duration-300"
              onClick={() => navigate("/signup")}
            >
              Anmelden
            </Button>
          </div>
        </header>

        {/* Main content with staggered animations */}
        <main className="flex-grow flex flex-col items-center justify-center py-12">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16">
            {/* Left column: Marketing content with entrance animations */}
            <div className="space-y-8 flex flex-col justify-center">
              <div className={`space-y-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <Badge variant="outline" className="px-3 py-1 text-sm rounded-full border-primary/30 bg-primary/5 text-primary animate-pulse">
                  Powered by Claude AI
                </Badge>
                
                <h1 className="text-5xl font-bold leading-tight tracking-tight">
                  <span className="text-foreground">Newsletter zu</span>
                  <br />
                  <span className={`${phrases[currentPhraseIndex].color} transition-colors duration-300`}>
                    {displayText}
                    <span className="animate-pulse">|</span>
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Ein KI-Tool, das deinen Newsletter intelligent in optimierte Beiträge für verschiedene Social-Media-Plattformen umwandelt.
                </p>

                {/* CTAs direkt nach der Subheadline in der Hero Section */}
                <div className="flex gap-4 pt-6">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all duration-300" 
                    onClick={() => navigate("/signup")}
                  >
                    Kostenlos starten
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="hover:scale-105 transition-all duration-300" 
                    onClick={() => navigate("/app")}
                  >
                    Demo ansehen
                  </Button>
                </div>
              </div>

              <div className={`grid md:grid-cols-2 gap-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
            </div>

            {/* Right column: Video showcase & process */}
            <div className="flex flex-col justify-center space-y-10">
              {/* Video showcase with placeholder */}
              <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-0 shadow-xl overflow-hidden relative rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 z-0" />
                  <div className="aspect-video relative z-10 rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster="https://placehold.co/1280x720/5f56e8/ffffff?text=Social+Transformer+Demo"
                    >
                      {/* Placeholder - Replace with actual video */}
                      <source src="https://placehold.co/1280x720.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/50 p-4 backdrop-blur-sm">
                        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-xl p-6 border border-slate-200 dark:border-slate-700 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h3 className="font-medium mb-4 flex items-center gap-2 text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
                    <path d="M8 14l2-2 4 4" />
                    <path d="M14 10l2-2" />
                  </svg>
                  So einfach geht's
                </h3>
                <div className="space-y-4 text-base">
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

        {/* Footer with testimonial */}
        <footer className="py-6 text-center border-t border-slate-200 dark:border-slate-800 mt-12">
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 mb-6">
              <p className="text-lg italic text-muted-foreground mb-2">
                "Social Transformer hat unsere Content-Strategie revolutioniert. Wir sparen täglich Stunden und erreichen mehr Engagement."
              </p>
              <p className="font-medium">Lisa Müller, Social Media Managerin</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 Social Transformer • Newsletter zu Social Media Posts</p>
        </footer>
      </div>
    </div>
  );
}