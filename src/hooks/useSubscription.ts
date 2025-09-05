import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../api/supabase';
import { createCustomerPortal } from '../libs/api-client';
import { toast } from 'sonner';

const supabase = getSupabaseClient();

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_intent_id?: string | null;
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  interval: 'lifetime' | 'monthly' | 'yearly';
  amount: number | null;
  currency: string | null;
  current_period_start?: string | null;
  current_period_end: string | null;
  trial_starts_at?: string | null;
  trial_ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
  extraction_limit: number;
  extraction_reset_at?: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        return;
      }

      // ShipFast pattern: Simple query focusing on active status
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id, user_id, stripe_customer_id, stripe_subscription_id, status, interval, amount, currency, current_period_end, extraction_limit')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No subscription found - user is not premium
          setSubscription(null);
        } else {
          throw fetchError;
        }
      } else {
        setSubscription(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Subscription';
      setError(errorMessage);
      console.error('Subscription fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = () => {
    fetchSubscription();
  };

  const openCustomerPortal = async () => {
    if (!subscription?.stripe_customer_id) {
      toast.error('Kein Customer Portal verfügbar. Du hast noch kein aktives Abo.');
      return;
    }

    try {
      const returnUrl = window.location.origin + '/settings';
      const { url } = await createCustomerPortal(returnUrl);
      
      // Open in same window to maintain session
      window.location.href = url;
    } catch (error) {
      console.error('Customer portal error:', error);
      toast.error('Customer Portal konnte nicht geöffnet werden. Versuche es später erneut.');
    }
  };

  // ShipFast pattern: Simple hasAccess-style computed properties
  const hasAccess = subscription?.status === 'active' || subscription?.status === 'trial';
  const isActive = hasAccess; // Alias for compatibility
  const isPro = hasAccess; // Alias for compatibility
  const isLifetime = subscription?.interval === 'lifetime';
  
  // Simplified status checks
  const isTrial = subscription?.status === 'trial';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';

  // Billing period info (simplified)
  const currentPeriodEnd = subscription?.current_period_end 
    ? new Date(subscription.current_period_end)
    : null;

  // Usage tracking (keep for premium features)
  const extractionLimit = subscription?.extraction_limit ?? 20;

  useEffect(() => {
    fetchSubscription();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, _session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchSubscription();
        } else if (event === 'SIGNED_OUT') {
          setSubscription(null);
          setLoading(false);
          setError(null);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  return {
    // Core data
    subscription,
    loading,
    error,
    
    // ShipFast pattern: hasAccess as primary access control
    hasAccess,
    
    // Computed states (aliases for compatibility)
    isActive,
    isPro,
    isLifetime,
    isTrial,
    isPastDue,
    isCanceled,
    
    // Billing info
    currentPeriodEnd,
    
    // Usage info
    extractionLimit,
    
    // Actions
    refreshSubscription,
    openCustomerPortal,
  };
}