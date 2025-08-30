import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium rounded-full border-primary/30 bg-primary/5 text-primary mb-6 animate-pulse">
            Limited Time Offer
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">Beta Lifetime Deal</h2>
          <p className="text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">Sichere dir lebenslangen Zugriff zum Einführungspreis</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="relative opacity-60 transform scale-95">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100/10 to-slate-50/10 dark:from-slate-700/10 dark:to-slate-800/10 rounded-2xl blur-xl" />
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="absolute top-4 right-4 bg-slate-500/10 backdrop-blur-sm text-slate-600 dark:text-slate-400 text-xs font-medium px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600">
                  Bald verfügbar
                </div>
                <h3 className="text-xl font-semibold leading-snug mb-4 text-slate-500 dark:text-slate-400">Standard Plan</h3>
                <div className="mb-8">
                  <span className="text-3xl font-bold text-slate-400 dark:text-slate-500 line-through">19€</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-2 text-base">/Monat</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal text-slate-500 dark:text-slate-400">Unbegrenzte Posts generieren</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal text-slate-500 dark:text-slate-400">Alle Plattformen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal text-slate-500 dark:text-slate-400">Monatliche Zahlung</span>
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
                <button disabled className="w-full border rounded-md py-3 text-sm font-medium opacity-70">Demnächst verfügbar</button>
              </div>
            </div>
          </div>

          <div className="relative transform scale-105">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl" />
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-[#D97757] to-[#C56649] text-white px-4 py-1 rounded-full shadow-lg text-sm font-semibold">
                    BESTE WAHL
                  </div>
                </div>
                <h3 className="text-xl font-semibold leading-snug mb-4 mt-2">Beta Lifetime Deal</h3>
                <div className="mb-8">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">49€</span>
                  <span className="text-muted-foreground ml-2 text-base">einmalig</span>
                  <div className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-3 bg-green-500/10 px-3 py-1 rounded-full font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Spare 179€ im ersten Jahr!</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal font-medium">Lebenslanger Zugriff</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">Unbegrenzte Posts generieren</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">Alle aktuellen & zukünftigen Features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">Priority Support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">Keine monatlichen Kosten</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm leading-normal">Early-Adopter Bonus Features</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all duration-300" 
                  size="lg"
                  onClick={() => {
                    window.open('https://buy.stripe.com/9B628qejY6rtfPi8Fl0x200', '_blank');
                  }}
                >
                  Jetzt sichern - Nur begrenzt verfügbar
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sichere Zahlung über Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 backdrop-blur-sm text-primary px-4 py-2 rounded-full mb-12 border border-primary/20">
            <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-sm">Angebot endet bald</span>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">10+ Stunden</div>
              <p className="text-sm leading-normal text-muted-foreground">Zeitersparnis pro Monat</p>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">3x mehr</div>
              <p className="text-sm leading-normal text-muted-foreground">Social Media Reichweite</p>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">100%</div>
              <p className="text-sm leading-normal text-muted-foreground">Zufriedenheitsgarantie</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
