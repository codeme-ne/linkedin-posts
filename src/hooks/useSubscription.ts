import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '../api/supabase';
import { createCustomerPortal } from '../libs/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/config/app.config';

const supabase = getSupabaseClient();

// Simple in-memory cache to prevent redundant queries (5 components = 1 query)
const subscriptionCache: {
  data: Subscription | null;
  timestamp: number;
  userId: string | null;
} = { data: null, timestamp: 0, userId: null };

const CACHE_TTL = 60000; // 60 seconds

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_intent_id?: string | null;
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  is_active: boolean; // Single Source of Truth for premium access
  interval: 'monthly' | 'yearly';
  amount: number | null;
  currency: string | null;
  current_period_start?: string | null;
  current_period_end: string | null;
  trial_starts_at?: string | null;
  trial_ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    // Skip if auth is still loading or no user
    if (authLoading || !user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const now = Date.now();

      // Return cached data if valid for this user
      if (
        subscriptionCache.data !== undefined && // Cache has been populated
        subscriptionCache.userId === user.id &&
        now - subscriptionCache.timestamp < CACHE_TTL
      ) {
        setSubscription(subscriptionCache.data);
        setLoading(false);
        return;
      }

      // Fetch fresh data from Supabase
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id, user_id, stripe_customer_id, stripe_subscription_id, status, is_active, interval, amount, currency, current_period_end')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No subscription found - user is not premium
          subscriptionCache.data = null;
          subscriptionCache.timestamp = now;
          subscriptionCache.userId = user.id;
          setSubscription(null);
        } else {
          throw fetchError;
        }
      } else {
        // Update cache with fresh data
        subscriptionCache.data = data;
        subscriptionCache.timestamp = now;
        subscriptionCache.userId = user.id;
        setSubscription(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Subscription';
      setError(errorMessage);
      console.error('Subscription fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const refreshSubscription = () => {
    // Invalidate cache to force fresh fetch
    subscriptionCache.timestamp = 0;
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

  // ShipFast pattern: Simple hasAccess computed from is_active
  const hasAccess = subscription?.is_active === true;
  const isActive = hasAccess; // Alias for compatibility
  const isPro = hasAccess; // Alias for compatibility
  const isYearly = subscription?.interval === 'yearly';
  
  // Simplified status checks
  const isTrial = subscription?.status === 'trial';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';

  // Billing period info (simplified)
  const currentPeriodEnd = subscription?.current_period_end 
    ? new Date(subscription.current_period_end)
    : null;

  useEffect(() => {
    // Fetch subscription whenever user changes
    // The AuthContext already handles auth state changes
    fetchSubscription();
  }, [fetchSubscription]);

  // === Single-Post usage helpers (free tier) ===
  const [usageCount, setUsageCount] = useState<number>(() => {
    const today = new Date().toDateString()
    const todayKey = `usage_${today}`
    try {
      return parseInt(localStorage.getItem(todayKey) || '0', 10)
    } catch {
      return 0
    }
  })

  // Cleanup old usage entries in background (non-blocking)
  useEffect(() => {
    const cleanup = () => {
      const today = new Date().toDateString()
      const todayKey = `usage_${today}`
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('usage_') && key !== todayKey) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (e) {
        console.warn('Failed to cleanup localStorage:', e)
      }
    }

    // Run cleanup in idle time to avoid blocking UI
    if ('requestIdleCallback' in window) {
      requestIdleCallback(cleanup)
    } else {
      setTimeout(cleanup, 1000)
    }
  }, [])

  const decrementUsage = useCallback(() => {
    if (hasAccess) return; // Pro users unlimited
    const today = new Date().toDateString();
    const currentUsage = parseInt(localStorage.getItem(`usage_${today}`) || '0', 10);
    const next = currentUsage + 1;
    localStorage.setItem(`usage_${today}`, String(next));
    setUsageCount(next);
  }, [hasAccess])

  const hasUsageRemaining = useCallback(() => {
    if (hasAccess) return true;
    const today = new Date().toDateString();
    const currentUsage = parseInt(localStorage.getItem(`usage_${today}`) || '0', 10);
    return currentUsage < config.limits.freeGenerationsPerDay;
  }, [hasAccess])

  // Combine loading states for better UX
  const isFullyLoaded = !authLoading && !loading;

  return {
    // Core data
    subscription,
    loading: authLoading || loading, // Combined loading state
    error,

    // ShipFast pattern: hasAccess as primary access control
    hasAccess,

    // Computed states (aliases for compatibility)
    isActive,
    isPro,
    isYearly,
    isTrial,
    isPastDue,
    isCanceled,

    // Billing info
    currentPeriodEnd,

    // Actions
    refreshSubscription,
    openCustomerPortal,
    // Free tier helpers
    decrementUsage,
    hasUsageRemaining,
    dailyUsage: usageCount,

    // Additional helpers
    isFullyLoaded,
  };
}