import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { createCustomerPortal } from '../libs/api-client';
import { toast } from 'sonner';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  is_active: boolean;
  interval: 'lifetime' | 'monthly' | 'yearly';
  amount: number | null;
  currency: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
  extraction_limit: number;
  extraction_reset_at: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubscription(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No subscription found
          setSubscription(null);
        } else {
          throw fetchError;
        }
      } else {
        setSubscription(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden des Abos';
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

  // Computed properties
  const isActive = subscription?.is_active ?? false;
  const isLifetime = subscription?.interval === 'lifetime';
  const isPro = isActive;
  const isTrial = subscription?.status === 'trial';
  const isPastDue = subscription?.status === 'past_due';

  // Trial status
  const trialDaysLeft = subscription?.trial_ends_at 
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const hasTrialEnded = subscription?.trial_ends_at 
    ? new Date(subscription.trial_ends_at) < new Date() 
    : false;

  // Billing period info for subscriptions
  const currentPeriodEnd = subscription?.current_period_end 
    ? new Date(subscription.current_period_end)
    : null;

  const daysUntilRenewal = currentPeriodEnd 
    ? Math.max(0, Math.ceil((currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Usage tracking
  const extractionLimit = subscription?.extraction_limit ?? 20;
  const extractionResetAt = subscription?.extraction_reset_at 
    ? new Date(subscription.extraction_reset_at)
    : null;

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
    
    // Computed states
    isActive,
    isPro,
    isLifetime,
    isTrial,
    isPastDue,
    
    // Trial info
    trialDaysLeft,
    hasTrialEnded,
    
    // Billing info
    currentPeriodEnd,
    daysUntilRenewal,
    
    // Usage info
    extractionLimit,
    extractionResetAt,
    
    // Actions
    refreshSubscription,
    openCustomerPortal,
  };
}