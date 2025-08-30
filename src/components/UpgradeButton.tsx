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
        .single();

      if (data) {
        setSubscription({
          status: data.status,
          is_active: data.status === 'active'
        });
      } else {
        // No subscription = free user
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

    // Set timeout fallback
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Subscription check timed out, defaulting to free');
        setSubscription({ status: 'free', is_active: false });
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, []);

  const checkStatus = async () => {
    try {
      const { data: { session } } = await getSession();
      if (!session?.user) {
        const freeStatus = { status: 'free' as const, is_active: false };
        setSubscription(freeStatus);
        subscriptionCache = { data: freeStatus, timestamp: Date.now() };
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

      if (error) {
        console.error('Subscription query error:', error);
        const freeStatus = { status: 'free' as const, is_active: false };
        setSubscription(freeStatus);
        subscriptionCache = { data: freeStatus, timestamp: Date.now() };
      } else if (data) {
        const subStatus = {
          status: data.status as 'free' | 'active' | 'cancelled',
          is_active: data.status === 'active'
        };
        setSubscription(subStatus);
        subscriptionCache = { data: subStatus, timestamp: Date.now() };
      } else {
        const freeStatus = { status: 'free' as const, is_active: false };
        setSubscription(freeStatus);
        subscriptionCache = { data: freeStatus, timestamp: Date.now() };
      }
    } catch (error) {
      console.error('Subscription check error:', error);
      const freeStatus = { status: 'free' as const, is_active: false };
      setSubscription(freeStatus);
      subscriptionCache = { data: freeStatus, timestamp: Date.now() };
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    subscriptionCache = null; // Clear cache
    setLoading(true);
    await checkStatus();
  };

  return { subscription, loading, refetch };
}