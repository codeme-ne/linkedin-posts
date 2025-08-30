import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getSession } from "@/api/supabase";
import { supabase } from "@/api/supabase";

interface SubscriptionStatus {
  status: 'free' | 'active' | 'cancelled';
  is_active: boolean;
}

export function UpgradeButton() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session } } = await getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      
      setUser(session.user);

      // Get subscription status from Supabase
      const { data } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.status === 'active') {
        setSubscription({
          status: 'active',
          is_active: true
        });
      } else {
        // No subscription or status !== 'active' = free user
        setSubscription({
          status: 'free',
          is_active: false
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (!user) return;
    
    // Stripe Payment Link for Beta Lifetime Deal
    const stripePaymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK || 
      'https://buy.stripe.com/9B628qejY6rtfPi8Fl0x200';
    
    // Add user ID and email as metadata for webhook processing
    const url = `${stripePaymentLink}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;
    
    window.open(url, '_blank');
  };

  if (loading) {
    return <Button disabled>Lade...</Button>;
  }

  // Show different UI based on subscription status
  if (subscription?.is_active) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default">Pro</Badge>
      </div>
    );
  }

  // Free user - show upgrade button
  return (
    <Button 
      onClick={handleUpgrade}
      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
    >
      Beta Lifetime Deal - nur 49€
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

  useEffect(() => {
    // Check cache first
    if (subscriptionCache && Date.now() - subscriptionCache.timestamp < CACHE_DURATION) {
      setSubscription(subscriptionCache.data);
      setLoading(false);
      return;
    }

    checkStatus();

    // Set timeout fallback - increased to 10 seconds
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Subscription check timed out after 10s, defaulting to free');
        setSubscription({ status: 'free', is_active: false });
        setLoading(false);
      }
    }, 10000); // 10 second timeout (increased from 3)

    return () => clearTimeout(timeout);
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
    }
  };

  return { subscription, loading };
}