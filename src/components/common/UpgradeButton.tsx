import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef, ButtonHTMLAttributes, ReactNode } from "react";
import { getSession } from "@/api/supabase";
import { supabase } from "@/api/supabase";
import { cn } from "@/lib/utils";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionStatus {
  status: 'free' | 'active' | 'cancelled';
  is_active: boolean;
}

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
  const { subscription, loading } = useSubscription();
  const subscriptionStatus = subscription?.status;

  const handleClick = () => {
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    if (paymentLink) {
      window.open(paymentLink, '_blank');
      // Re-check subscription after a delay
      setTimeout(() => {
        checkSubscription();
      }, 5000);
    } else {
      console.error('Stripe payment link not configured');
      toast.error('Zahlungslink nicht konfiguriert');
    }
    if (onClick) {
      const syntheticEvent = {} as React.MouseEvent<HTMLButtonElement>;
      onClick(syntheticEvent);
    }
  };

  const checkSubscription = () => {
    // This will trigger a re-render when the subscription status changes
    window.location.reload();
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
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  // User has active subscription - show children or default content
  if (subscriptionStatus === 'active') {
    return children ? (
      <>{children}</>
    ) : (
      <Button 
        variant="outline" 
        size={size} 
        className={cn('relative', className)}
        disabled
        {...props}
      >
        <Check className="h-4 w-4 mr-2" />
        Pro aktiv
      </Button>
    );
  }

  // User needs to upgrade
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('relative', className)}
      onClick={handleClick}
      {...props}
    >
      {showBadge && (
        <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
          {feature}
        </Badge>
      )}
      <Sparkles className="h-4 w-4 mr-2" />
      Beta Lifetime Deal - nur 99€
    </Button>
  );
}

// Cache for subscription status to avoid redundant queries
let subscriptionCache: { data: SubscriptionStatus | null; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute cache

// Hook to use in other components
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check cache first
    if (subscriptionCache && Date.now() - subscriptionCache.timestamp < CACHE_DURATION) {
      setSubscription(subscriptionCache.data);
      setLoading(false);
      return;
    }

    // Set timeout fallback - increased to 10 seconds
    timeoutRef.current = setTimeout(() => {
      console.warn('Subscription check timed out after 10s, defaulting to free');
      setSubscription({ status: 'free', is_active: false });
      setLoading(false);
    }, 10000); // 10 second timeout

    checkStatus();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const checkStatus = async () => {
    try {
      console.log('[Subscription Check] Starting...');
      const startTime = Date.now();
      
      const { data: { session } } = await getSession();
      console.log('[Subscription Check] Session fetched in', Date.now() - startTime, 'ms');
      
      if (!session?.user) {
        console.log('[Subscription Check] No session found, defaulting to free');
        const freeStatus = { status: 'free' as const, is_active: false };
        setSubscription(freeStatus);
        subscriptionCache = { data: freeStatus, timestamp: Date.now() };
        setLoading(false);
        // Clear timeout since we're done
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        return;
      }

      console.log('[Subscription Check] User ID:', session.user.id);
      const queryStart = Date.now();
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('[Subscription Check] Query completed in', Date.now() - queryStart, 'ms');
      console.log('[Subscription Check] Result:', data, 'Error:', error);

      if (error) {
        console.error('[Subscription Check] Error fetching subscription:', error);
        // Default to free on error
        const freeStatus = { status: 'free' as const, is_active: false };
        setSubscription(freeStatus);
        subscriptionCache = { data: freeStatus, timestamp: Date.now() };
      } else if (data && data.status === 'active') {
        console.log('[Subscription Check] Active subscription found');
        const activeStatus = { status: 'active' as const, is_active: true };
        setSubscription(activeStatus);
        subscriptionCache = { data: activeStatus, timestamp: Date.now() };
      } else {
        console.log('[Subscription Check] No active subscription, defaulting to free');
        const freeStatus = { status: 'free' as const, is_active: false };
        setSubscription(freeStatus);
        subscriptionCache = { data: freeStatus, timestamp: Date.now() };
      }
      
      console.log('[Subscription Check] Total time:', Date.now() - startTime, 'ms');
    } catch (error) {
      console.error('[Subscription Check] Unexpected error:', error);
      const freeStatus = { status: 'free' as const, is_active: false };
      setSubscription(freeStatus);
      subscriptionCache = { data: freeStatus, timestamp: Date.now() };
    } finally {
      setLoading(false);
      // Clear timeout since we're done
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        console.log('[Subscription Check] Timeout cleared');
      }
    }
  };

  return { subscription, loading };
}