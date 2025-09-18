import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import config, { formatPrice, getPaymentLink } from "@/config/app.config";

export function PricingSection() {
  const { plans } = config.stripe;

  const handlePlanPurchase = (planId: string) => {
    const paymentLink = getPaymentLink(planId);
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
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-xl p-6 sm:p-8 border-2 transition-all relative ${
              plan.popular 
                ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary hover:border-accent"
                : "bg-background border-gray-200 hover:border-gray-300"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-accent text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                  {plan.badge}
                </span>
              </div>
            )}
            
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className={`text-sm sm:text-base ${plan.popular ? 'text-foreground' : 'text-muted'}`}>
                {plan.description}
              </p>
              <div className="mt-4">
                <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
                  plan.popular 
                    ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    : "text-foreground"
                }`}>
                  {formatPrice(plan.price)}
                </span>
                <span className={`ml-2 ${plan.popular ? 'text-foreground' : 'text-muted'}`}>
                  {plan.interval === 'yearly' ? 'pro Jahr' : `pro ${plan.interval === 'monthly' ? 'Monat' : 'Jahr'}`}
                </span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 text-foreground">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className={index === 0 && plan.popular ? "font-semibold" : ""}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => handlePlanPurchase(plan.id)}
              className={plan.popular 
                ? "w-full border-primary/30 hover:border-primary/60 transition-all duration-300 font-semibold"
                : `w-full bg-gradient-to-r ${config.theme.brandColors.gradient} hover:${config.theme.brandColors.hover} text-white font-semibold`
              }
              variant={plan.popular ? "outline" : "default"}
            >
              {plan.interval === 'yearly' ? 'Jahresabo starten' : 'Monatsabo starten'}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
