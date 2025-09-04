import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef, useCallback, ButtonHTMLAttributes, ReactNode } from "react";
import { getSession } from "@/api/supabase";
import { supabase, getSupabaseClient } from "@/api/supabase";
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

  const handleClick = async () => {
    const baseLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    if (!baseLink) {
      toast.error('Zahlungslink nicht konfiguriert');
      return;
    }

    // Enrich payment link with user context (helps webhook link user quickly)
    const url = new URL(baseLink);
    try {
      const sb = getSupabaseClient();
      const { data: { user } } = await sb.auth.getUser();
      if (user?.id) url.searchParams.set('client_reference_id', user.id);
      if (user?.email) url.searchParams.set('prefilled_email', user.email);
    } catch {
      // Non-blocking if auth is not available here
    }

    window.open(url.toString(), '_blank');
    // Re-check subscription after a delay
    setTimeout(() => {
      checkSubscription();
    }, 5000);

    if (onClick) {
      const syntheticEvent = {} as React.MouseEvent<HTMLButtonElement>;
      onClick(syntheticEvent);
    }
  };

  const checkSubscription = useCallback(() => {
    // Invalidate cache to force refresh
    subscriptionCache = null;
    // Re-fetch subscription status instead of page reload
    checkStatus();
  }, [checkStatus]);

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

    // Set timeout fallback
    timeoutRef.current = setTimeout(() => {
      setSubscription({ status: 'free', is_active: false });
      setLoading(false);
    }, 10000);

    checkStatus();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const { data: { session } } = await getSession();
      
      if (!session?.user) {
        const freeStatus = { status: 'free' as const, is_active: false };
        setSubscription(freeStatus);
        subscriptionCache = { data: freeStatus, timestamp: Date.now() };
        setLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        return;
      }
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        const freeStatus = { status: 'free' as const, is_active: false };
        setSubscription(freeStatus);
        subscriptionCache = { data: freeStatus, timestamp: Date.now() };
      } else if (data && data.status === 'active') {
        const activeStatus = { status: 'active' as const, is_active: true };
        setSubscription(activeStatus);
        subscriptionCache = { data: activeStatus, timestamp: Date.now() };
      } else {
        const freeStatus = { status: 'free' as const, is_active: false };
        setSubscription(freeStatus);
        subscriptionCache = { data: freeStatus, timestamp: Date.now() };
      }
    } catch (error) {
      const freeStatus = { status: 'free' as const, is_active: false };
      setSubscription(freeStatus);
      subscriptionCache = { data: freeStatus, timestamp: Date.now() };
    } finally {
      setLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, []);

  return { subscription, loading };
}
