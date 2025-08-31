import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/components/common/UpgradeButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Check, Loader2, Sparkles } from "lucide-react";

interface PaywallGuardProps {
  children: ReactNode;
  feature?: string;
}

export function PaywallGuard({ children, feature = 'This feature' }: PaywallGuardProps) {
  const { subscription, loading } = useSubscription();
  const navigate = useNavigate();
  const subscriptionStatus = subscription?.status;

  const handleUpgrade = () => {
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    } else {
      console.error('Stripe payment link not configured');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (subscriptionStatus !== 'active') {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>Beta Lifetime Deal - Einmalig 99€</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {feature} ist ein Pro-Feature. Upgraden Sie jetzt und erhalten Sie lebenslangen Zugang!
          </p>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Unbegrenzte Posts</span>
            </li>
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Posts speichern & verwalten</span>
            </li>
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Direct-Posting</span>
            </li>
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Premium URL-Extraktion</span>
            </li>
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Alle zukünftigen Features</span>
            </li>
          </ul>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/app')} className="flex-1">
              Zurück
            </Button>
            <Button onClick={handleUpgrade} className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Jetzt upgraden
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}