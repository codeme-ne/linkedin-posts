import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabase';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { toast } from 'sonner';
import config from '@/config/app.config';

interface UsageStatus {
  canGenerate: boolean;
  isPremium: boolean;
  used: number;
  limit: number;
  remaining: number;
  isLoading: boolean;
}

/**
 * Unified usage tracking hook that delegates to useSubscription
 * for localStorage tracking (usage_DATE pattern).
 * Provides backward-compatible interface for components using this hook.
 */
export function useUsageTracking() {
  const { userEmail } = useAuth();
  const { hasAccess, dailyUsage, hasUsageRemaining, decrementUsage, loading: subscriptionLoading } = useSubscription();

  const [usageStatus, setUsageStatus] = useState<UsageStatus>({
    canGenerate: true,
    isPremium: false,
    used: 0,
    limit: config.limits.freeGenerationsPerDay,
    remaining: config.limits.freeGenerationsPerDay,
    isLoading: true,
  });

  // One-time migration: clean up legacy freeGenerationsCount key
  useEffect(() => {
    const legacyKey = 'freeGenerationsCount';
    if (localStorage.getItem(legacyKey) !== null) {
      console.log('[useUsageTracking] Migrating from legacy freeGenerationsCount to usage_DATE pattern');
      localStorage.removeItem(legacyKey);
    }
  }, []); // Run once on mount

  // Sync state with useSubscription's daily usage tracking
  useEffect(() => {
    const limit = config.limits.freeGenerationsPerDay;
    const used = dailyUsage;
    const remaining = Math.max(0, limit - used);

    setUsageStatus({
      canGenerate: hasAccess || hasUsageRemaining(),
      isPremium: hasAccess,
      used,
      limit,
      remaining,
      isLoading: subscriptionLoading,
    });
  }, [hasAccess, dailyUsage, hasUsageRemaining, subscriptionLoading]);

  const loadUsageStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('get_usage_status');

      if (error) {
        console.error('Error loading usage status:', error);
        return;
      }

      if (data?.success) {
        setUsageStatus(prev => ({
          ...prev,
          canGenerate: data.can_generate || false,
          isPremium: data.is_premium || false,
          used: data.used || 0,
          limit: data.limit || 3,
          remaining: data.remaining ?? 3,
          isLoading: false,
        }));
      }
    } catch (err) {
      console.error('Failed to load usage status:', err);
    } finally {
      setUsageStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  const checkAndIncrementUsage = async (): Promise<boolean> => {
    // Delegate to useSubscription for usage tracking (daily reset pattern)
    if (hasAccess) {
      // Premium users have unlimited access
      return true;
    }

    // Check if free tier has remaining usage
    if (!hasUsageRemaining()) {
      toast.error(
        'Dein kostenloses Limit ist erreicht. Upgrade zu Premium für unlimitierte Generierungen.'
      );
      return false;
    }

    // If user is authenticated, also check backend usage tracking
    if (userEmail) {
      try {
        const { data, error } = await supabase.rpc('check_and_increment_usage');

        if (error) {
          console.error('Error checking backend usage:', error);
          // Don't block on backend error, continue with local tracking
        } else if (!data?.can_generate) {
          toast.error(
            'Dein kostenloses Limit ist erreicht. Upgrade zu Premium für unlimitierte Generierungen.'
          );
          return false;
        }
      } catch (err) {
        console.error('Failed to check backend usage:', err);
        // Continue with local tracking on error
      }
    }

    // Increment usage counter (using useSubscription's decrementUsage)
    // Note: "decrement" is a naming artifact - it actually increments usage
    decrementUsage();

    return true;
  };

  const resetLocalUsage = () => {
    // Clean up legacy localStorage key
    localStorage.removeItem('freeGenerationsCount');

    // Reset current day's usage (usage_DATE pattern from useSubscription)
    const today = new Date().toDateString();
    const todayKey = `usage_${today}`;
    localStorage.removeItem(todayKey);

    // Trigger state update
    const limit = config.limits.freeGenerationsPerDay;
    setUsageStatus({
      canGenerate: true,
      isPremium: hasAccess,
      used: 0,
      limit,
      remaining: limit,
      isLoading: false,
    });
  };

  return {
    ...usageStatus,
    checkAndIncrementUsage,
    resetLocalUsage,
    refreshStatus: loadUsageStatus,
  };
}