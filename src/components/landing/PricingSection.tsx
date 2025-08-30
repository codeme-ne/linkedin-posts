import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium rounded-full border-primary/30 bg-primary/5 text-primary mb-4 md:mb-6">
            Lifetime Deal
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight mb-4 md:mb-6">
            Einmalzahlung statt{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              monatliche Kosten
            </span>
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Keine versteckten Gebühren, keine Abo-Fallen.<br className="hidden md:block" />
            <span className="font-semibold">Zahle einmal, nutze für immer.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <div className="relative opacity-60">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
              <Badge variant="secondary" className="mb-4">
                Bald verfügbar
              </Badge>
                <h3 className="text-lg md:text-xl font-semibold leading-snug mb-4 text-slate-500 dark:text-slate-400">Standard Abo</h3>
                <div className="mb-6 md:mb-8">
                  <span className="text-2xl md:text-3xl font-bold text-slate-400 dark:text-slate-500 line-through">19€</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-2 text-sm md:text-base">/Monat</span>
                </div>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal text-slate-500 dark:text-slate-400">Newsletter zu Social Media</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal text-slate-500 dark:text-slate-400">Monatliche Kosten</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal text-slate-500 dark:text-slate-400">Standard Support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal text-slate-500 dark:text-slate-400">Jederzeit kündbar</span>
                  </li>
                </ul>
                <button disabled className="w-full border rounded-md py-2 md:py-3 text-sm font-medium opacity-70">Demnächst verfügbar</button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 px-3 py-1 mb-4">
                BELIEBTESTE WAHL
              </Badge>
              <h3 className="text-lg md:text-xl font-semibold leading-snug mb-4">Lifetime Deal</h3>
                <div className="mb-6 md:mb-8">
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">49€</span>
                  <span className="text-muted-foreground ml-2 text-sm md:text-base">einmalig</span>
                  <div className="flex items-center gap-1 text-xs md:text-sm text-green-600 dark:text-green-400 mt-2 md:mt-3 bg-green-500/10 px-2 md:px-3 py-1 rounded-full font-medium">
                    <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Zahle einmal, nutze für immer</span>
                  </div>
                </div>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal font-medium">KI-gestützte Content-Transformation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">LinkedIn, X & Instagram optimiert</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">Premium URL-Extraktion (20/Monat)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">Alle zukünftigen Features inklusive</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">Priority Support & Updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">14 Tage Geld-zurück-Garantie</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 py-3 md:py-6 text-sm md:text-base" 
                  size="lg"
                  onClick={() => {
                    window.open('https://buy.stripe.com/9B628qejY6rtfPi8Fl0x200', '_blank');
                  }}
                >
                  Lifetime-Zugang sichern →
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3 md:mt-4 flex items-center justify-center gap-1">
                  <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sichere Zahlung über Stripe
                </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
