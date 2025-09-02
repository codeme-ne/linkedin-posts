import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
          Bereit, deine Social-Media-Reichweite zu{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            vervielfachen
          </span>
          ?
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto">
          Während andere noch kopieren und anpassen, transformierst du bereits deinen nächsten Newsletter in viralen Social-Media-Content.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 sm:mb-8">
          <Button 
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base md:text-lg"
            onClick={() => window.location.href = '/signup'}
          >
            Starte jetzt kostenlos →
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-primary/30 hover:border-primary/60 transition-all duration-300 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base md:text-lg"
            onClick={() => window.open('https://buy.stripe.com/9B628qejY6rtfPi8Fl0x200', '_blank')}
          >
            Direkt Lifetime sichern
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Keine Kreditkarte nötig</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Sofort startklar</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>14 Tage Geld-zurück</span>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-muted-foreground mb-4">
            Schon über <span className="font-semibold text-foreground">100+ Content Creator</span> nutzen Social Transformer
          </p>
          <div className="flex justify-center items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
            <span className="ml-2 text-sm font-medium">4.9/5 Bewertung</span>
          </div>
        </div>
      </div>
    </section>
  );
}
