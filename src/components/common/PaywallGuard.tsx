import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/components/common/UpgradeButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Check, Loader2, Sparkles, CreditCard } from "lucide-react";
import { getSupabaseClient } from "@/api/supabase";

interface PaywallGuardProps {
  children: ReactNode;
  feature?: string;
}

export function PaywallGuard({ children, feature = 'This feature' }: PaywallGuardProps) {
  const { subscription, loading } = useSubscription();
  const navigate = useNavigate();

  const handleUpgrade = async (type: 'lifetime' | 'monthly') => {
    const links = {
      lifetime: import.meta.env.VITE_STRIPE_PAYMENT_LINK_LIFETIME || import.meta.env.VITE_STRIPE_PAYMENT_LINK,
      monthly: import.meta.env.VITE_STRIPE_PAYMENT_LINK_MONTHLY
    };

    if (!links[type]) {
      console.error(`Stripe ${type} payment link not configured`);
      return;
    }

    // Get current user for client_reference_id
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Build payment URL with parameters
    const paymentUrl = new URL(links[type]);
    if (user?.id) {
      paymentUrl.searchParams.set('client_reference_id', user.id);
    }
    if (user?.email) {
      paymentUrl.searchParams.set('prefilled_email', user.email);
    }

    window.open(paymentUrl.toString(), '_blank');
  };

  if (loading) {
    return <div className="flex justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  if (subscription?.status !== 'active') {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>Wählen Sie Ihren Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {feature} ist ein Pro-Feature. Wählen Sie den Plan, der zu Ihnen passt:
          </p>

          {/* Features Liste */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Alle Pro-Features:</h4>
            <ul className="space-y-2">
              {[
                'Unbegrenzte Post-Generierung',
                'Posts speichern & verwalten',
                'Premium URL-Extraktion (20x/Monat)',
                'Standard URL-Extraktion (unbegrenzt)',
                'Alle zukünftigen Features',
                'Priority Support'
              ].map(item => (
                <li key={item} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Lifetime Deal */}
            <div className="border rounded-lg p-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  BESTE WAHL
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">Lifetime Deal</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">99€</span>
                <span className="text-muted-foreground ml-2">einmalig</span>
              </div>
              <ul className="space-y-1 mb-4 text-sm text-muted-foreground">
                <li>• Lebenslanger Zugang</li>
                <li>• Keine wiederkehrenden Kosten</li>
                <li>• Einmalige Investition</li>
              </ul>
              <Button 
                onClick={() => handleUpgrade('lifetime')}
                className="w-full"
                variant="default"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Lifetime sichern
              </Button>
            </div>

            {/* Monthly Plan */}
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Monthly Pro</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">29€</span>
                <span className="text-muted-foreground ml-2">/ Monat</span>
              </div>
              <ul className="space-y-1 mb-4 text-sm text-muted-foreground">
                <li>• Monatlich kündbar</li>
                <li>• Flexible Zahlung</li>
                <li>• Niedrige Einstiegshürde</li>
              </ul>
              <Button 
                onClick={() => handleUpgrade('monthly')}
                className="w-full"
                variant="outline"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Monthly starten
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app')}
              className="text-sm"
            >
              Zurück zur App
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex justify-center items-center gap-4 pt-4 border-t">
            <span className="text-xs text-muted-foreground">🔒 Sichere Zahlung via Stripe</span>
            <span className="text-xs text-muted-foreground">💳 Alle Kreditkarten</span>
            <span className="text-xs text-muted-foreground">🚀 Sofortiger Zugang</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}