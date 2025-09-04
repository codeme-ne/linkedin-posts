import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingSection() {


  const handleMonthlySubscription = () => {
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK_MONTHLY;
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
  };

  const handleBuyLifetimeDeal = () => {
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK_LIFETIME || import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
  };

  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
          Professioneller Content in Sekunden, nicht Stunden
        </h2>
        <p className="text-base sm:text-lg text-muted max-w-3xl mx-auto px-4">
          Verwandle jeden Artikel in ansprechende Social Media Posts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {/* Monthly Subscription */}
        <div className="bg-background rounded-xl p-6 sm:p-8 border-2 border-gray-200 hover:border-gray-300 transition-all">
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Monthly</h3>
            <p className="text-sm sm:text-base text-muted">Flexibles Monatsabo</p>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">29€</span>
              <span className="text-muted ml-2">pro Monat</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 text-foreground">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span>Unbegrenzte Posts</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span>Alle Plattformen (LinkedIn, X, Instagram)</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span>Premium URL-Extraktion (JavaScript-Support)</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span>Posts speichern & verwalten</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span>Direct-Posting zu Social Media</span>
            </li>
          </ul>
          <Button 
            onClick={handleMonthlySubscription}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold"
          >
            Monatsabo starten
          </Button>
        </div>

        {/* Lifetime Deal */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 sm:p-8 border-2 border-primary hover:border-accent transition-all relative">
          <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-primary to-accent text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              BETA LIFETIME DEAL
            </span>
          </div>
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Pro - Lifetime</h3>
            <p className="text-sm sm:text-base text-foreground">Einmalig zahlen, für immer nutzen</p>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">99€</span>
              <span className="text-foreground ml-2">einmalig</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 text-foreground">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="font-semibold">Unbegrenzte Posts</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span>Alle Plattformen (LinkedIn, X, Instagram)</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span>Premium URL-Extraktion (JavaScript-Support)</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span>Posts speichern & verwalten</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span>Direct-Posting zu Social Media</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="font-semibold">Alle zukünftigen Features inklusive</span>
            </li>
          </ul>
          <Button 
            onClick={handleBuyLifetimeDeal}
            variant="outline"
            className="w-full border-primary/30 hover:border-primary/60 transition-all duration-300 font-semibold"
          >
            Lifetime Deal sichern
          </Button>
        </div>
      </div>
    </section>
  );
}
