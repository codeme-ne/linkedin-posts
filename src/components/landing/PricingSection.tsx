import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 md:w-96 h-64 md:h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium rounded-full border-primary/30 bg-primary/5 text-primary mb-4 md:mb-6 animate-pulse">
            Nur für kurze Zeit
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight mb-4 md:mb-6">Einmalzahlung statt Abo</h2>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Verwandle deine Newsletter automatisch in virale Social-Media-Posts.<br className="hidden md:block" />
            <span className="font-semibold text-primary">Spare über 70% im ersten Jahr.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          <div className="relative opacity-60 transform md:scale-95">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100/10 to-slate-50/10 dark:from-slate-700/10 dark:to-slate-800/10 rounded-2xl blur-xl" />
              <div className="relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="absolute top-4 right-4 bg-slate-500/10 backdrop-blur-sm text-slate-600 dark:text-slate-400 text-xs font-medium px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600">
                  Bald verfügbar
                </div>
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
          </div>

          <div className="relative transform md:scale-105">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl" />
              <div className="relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-[#D97757] to-[#C56649] text-white px-3 md:px-4 py-1 rounded-full shadow-lg text-xs md:text-sm font-semibold whitespace-nowrap">
                    SPARE 179€ IM ERSTEN JAHR
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold leading-snug mb-4 mt-2">Lifetime Deal</h3>
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
        
        <div className="mt-12 md:mt-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 backdrop-blur-sm text-primary px-3 md:px-4 py-2 rounded-full mb-8 md:mb-12 border border-primary/20">
            <svg className="w-4 md:w-5 h-4 md:h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-xs md:text-sm">Nur noch wenige Plätze verfügbar</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 md:mb-3">∅ 15 Min</div>
              <p className="text-xs md:text-sm leading-normal text-muted-foreground">Pro Newsletter-Transformation gespart</p>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 md:mb-3">3-5x</div>
              <p className="text-xs md:text-sm leading-normal text-muted-foreground">Mehr Engagement auf Social Media</p>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 md:mb-3">100%</div>
              <p className="text-xs md:text-sm leading-normal text-muted-foreground">Plattform-optimierte Formatierung</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
