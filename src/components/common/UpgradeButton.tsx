import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ButtonHTMLAttributes, ReactNode, useState } from "react";
import { getSupabaseClient } from "@/api/supabase";
import { cn } from "@/lib/utils";
import { Check, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { getDefaultStripePlan } from "@/config/app.config";

interface UpgradeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  feature?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showBadge?: boolean;
}

export function UpgradeButton({
  children,
  feature = 'Pro',
  className,
  variant = 'default',
  size = 'default',
  showBadge = true,
  onClick,
  ...props
}: UpgradeButtonProps) {
  const { loading, isActive, refreshSubscription } = useSubscription();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const defaultPlan = getDefaultStripePlan();
    const baseLink = defaultPlan?.paymentLink;
    if (!baseLink) {
      toast.error('Zahlungslink nicht konfiguriert');
      return;
    }

    setIsRedirecting(true);
    toast.loading('Zahlungsseite wird geöffnet...', { 
      id: 'payment-redirect',
      duration: 3000 
    });

    try {
      // Enrich payment link with user context (helps webhook link user quickly)
      const url = new URL(baseLink);
      const sb = getSupabaseClient();
      const { data: { user } } = await sb.auth.getUser();
      
      if (user?.id) url.searchParams.set('client_reference_id', user.id);
      if (user?.email) url.searchParams.set('prefilled_email', user.email);

      // Open payment page
      const paymentWindow = window.open(url.toString(), '_blank');
      
      if (!paymentWindow) {
        toast.error('Popup wurde blockiert. Bitte erlaube Popups und versuche es erneut.');
        setIsRedirecting(false);
        return;
      }

      toast.success('Zahlungsseite geöffnet! Schließe diese Registerkarte nach der Zahlung.', {
        id: 'payment-redirect',
        duration: 5000
      });

      // Focus the payment window
      paymentWindow.focus();

      // Start checking for completed payment after a delay
      setTimeout(() => {
        const checkPayment = () => {
          refreshSubscription();
          toast.loading('Prüfe Zahlungsstatus...', { 
            id: 'payment-check',
            duration: 2000 
          });
        };

        // Check after 5 seconds, then every 10 seconds for up to 2 minutes
        setTimeout(checkPayment, 5000);
        
        const intervalId = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(intervalId);
            checkPayment();
            toast.dismiss('payment-check');
          }
        }, 2000);

        // Clean up after 2 minutes
        setTimeout(() => {
          clearInterval(intervalId);
          toast.dismiss('payment-check');
        }, 120000);
      }, 1000);

    } catch (error) {
      console.error('Payment redirect error:', error);
      toast.error('Fehler beim Öffnen der Zahlungsseite', { id: 'payment-redirect' });
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => setIsRedirecting(false), 2000);
    }

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={cn('relative', className)}
        disabled
        {...props}
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Lade Abo-Status...
      </Button>
    );
  }

  // Show redirecting state
  if (isRedirecting) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={cn('relative bg-primary/80', className)}
        disabled
        {...props}
      >
        <ExternalLink className="w-4 h-4 mr-2 animate-pulse" />
        Öffne Zahlungsseite...
      </Button>
    );
  }

  // If user already has active subscription, show success state
  if (isActive) {
    return (
      <Button 
        variant="outline"
        size={size} 
        className={cn('relative border-green-200 bg-green-50 text-green-700 hover:bg-green-100', className)}
        disabled
        {...props}
      >
        <Check className="w-4 h-4 mr-2" />
        {children || 'Pro Aktiv'}
        {showBadge && (
          <Badge className="ml-2 bg-green-600 text-white">
            ✓
          </Badge>
        )}
      </Button>
    );
  }

  // Default upgrade button
  return (
    <Button 
      variant={variant}
      size={size} 
      className={cn('relative group overflow-hidden', className)}
      onClick={handleClick}
      disabled={isRedirecting}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span>{children || `Upgrade zu ${feature}`}</span>
        {showBadge && (
          <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-sm">
            {feature}
          </Badge>
        )}
      </div>
      
      {/* Enhanced hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Button>
  );
}