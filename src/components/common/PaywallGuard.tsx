import { ReactNode } from "react";
import { useSubscription, UpgradeButton } from "@/components/common/UpgradeButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface PaywallGuardProps {
  children: ReactNode;
  feature?: string;
}

export function PaywallGuard({ children }: PaywallGuardProps) {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // User has active subscription
  if (subscription?.is_active) {
    // Paid user - just show the content
    return <>{children}</>;
  }

  // Free user - show upgrade prompt
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <Badge variant="secondary">Pro Feature</Badge>
        </div>
        <CardTitle>Beta Lifetime Deal - Einmalig 49€</CardTitle>
        <CardDescription>
          Sichere dir lebenslangen Zugang zur Social Transformer App und transformiere unbegrenzt viele Newsletter in perfekte Social Media Posts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Was du mit Pro bekommst:</p>
          <ul className="text-sm space-y-1 ml-4">
            <li>✓ Unbegrenzte Transformationen</li>
            <li>✓ Alle Plattformen (LinkedIn, X, Instagram)</li>
            <li>✓ Posts speichern und verwalten</li>
            <li>✓ Direkt auf Plattformen teilen</li>
          </ul>
        </div>
        <UpgradeButton />
        <p className="text-xs text-muted-foreground text-center">
          Einmalzahlung • Lifetime Access • Alle zukünftigen Updates inklusive
        </p>
      </CardContent>
    </Card>
  );
}