import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, onAuthStateChange } from "@/api/supabase";
import ContentFlowGraphic from "@/components/ContentFlowGraphic";
import HowItWorks from "@/components/HowItWorks";
import { DecorativeBackground } from "@/components/landing/DecorativeBackground";
import { HeaderBar } from "@/components/landing/HeaderBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { PricingSection } from "@/components/landing/PricingSection";
import { FooterBar } from "@/components/landing/FooterBar";

export default function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Auto-redirect if already logged in
    getSession().then(({ data }) => {
      if (data.session) navigate("/app", { replace: true });
      else setChecking(false);
    });
    const { data: sub } = onAuthStateChange((_event, session) => {
      if (session) navigate("/app", { replace: true });
    });

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => {
      sub?.subscription?.unsubscribe?.();
      clearTimeout(timer);
    };
  }, [navigate]);


  if (checking) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
  <DecorativeBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
    <HeaderBar isVisible={isVisible} onSignup={() => navigate("/signup")} />

        {/* Main content with staggered animations */}
        <main className="flex flex-col items-stretch py-8 lg:py-16">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 items-start gap-10 lg:gap-16 mx-auto">
            {/* Left column: Marketing content with entrance animations */}
            <div className="space-y-8 flex flex-col justify-start">
      <HeroSection isVisible={isVisible} onSignup={() => navigate("/signup")} onDemo={() => navigate("/app")} />
            </div>

            {/* Right column: Content flow graphic & process */}
            <div className="flex flex-col justify-start">
              {/* Content flow graphic next to hero on desktop; above features on mobile */}
              <div className={`self-start mt-6 lg:mt-0 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} order-first lg:order-none`}>
                <div className="lg:scale-110 transform-gpu">
                  <ContentFlowGraphic />
                </div>
              </div>
            </div>
          </div>
          {/* Features grid below the hero+graphic section */}
          <div className="max-w-6xl w-full mx-auto mt-10 lg:mt-14">
            <div className="lg:hidden">
              <FeaturesGrid isVisible={isVisible} variant="mobile" />
            </div>
            <div className="hidden lg:block">
              <FeaturesGrid isVisible={isVisible} variant="desktop" />
            </div>
          </div>
        </main>
      </div>

      {/* How It Works Section - außerhalb des Containers für vollen Hintergrund */}
      <HowItWorks />

      {/* Pricing Section - außerhalb des Containers für vollen Hintergrund */}
      <PricingSection onSignup={() => navigate("/signup")} />

      {/* Footer Section - außerhalb des Containers für vollen Hintergrund */}
      <FooterBar />
    </div>
  );
}