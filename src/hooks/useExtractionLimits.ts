import { useState, useEffect, useRef } from 'react';
import { supabase, getSession } from '@/api/supabase';
import { useSubscription } from './useSubscription';

export interface ExtractionLimits {
  isLoading: boolean;
  isPremium: boolean;
  freeUsed: number;
  freeLimit: number;
  freeRemaining: number;
  premiumUsed?: number;
  premiumLimit?: number;
  premiumRemaining?: number;
  canExtract: boolean;
  error: string | null;
}

export function useExtractionLimits() {
  const { subscription } = useSubscription();
  const [userId, setUserId] = useState<string | null>(null);
  const [limits, setLimits] = useState<ExtractionLimits>({
    isLoading: true,
    isPremium: false,
    freeUsed: 0,
    freeLimit: 3,
    freeRemaining: 3,
    canExtract: false,
    error: null
  });

  // Get user ID from session
  useEffect(() => {
    getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
  }, []);

  // Fetch extraction limits from database
  const fetchLimits = async () => {
    if (!userId) {
      setLimits(prev => ({
        ...prev,
        isLoading: false,
        canExtract: false,
        error: 'Not authenticated'
      }));
      return;
    }

    try {
      // Call RPC function to get limits
      const { data, error } = await supabase
        .rpc('get_extraction_limits', { p_user_id: userId });

      if (error) throw error;

      const isPremium = data.is_premium || subscription?.is_active || false;

      setLimits({
        isLoading: false,
        isPremium,
        freeUsed: data.free_used || 0,
        freeLimit: data.free_limit || 3,
        freeRemaining: data.free_remaining || (data.free_limit - data.free_used) || 0,
        premiumUsed: data.premium_used,
        premiumLimit: data.premium_limit,
        premiumRemaining: data.premium_remaining,
        canExtract: isPremium
          ? true // Premium users always have unlimited extractions
          : (data.free_remaining > 0),
        error: null
      });
    } catch (err) {
      console.error('Failed to fetch extraction limits:', err);
      setLimits(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load extraction limits'
      }));
    }
  };

  // Increment extraction usage after successful extraction
  const incrementUsage = async (): Promise<{ success: boolean; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .rpc('increment_extraction_usage', { p_user_id: userId });

      if (error) throw error;

      if (!data.success) {
        return { success: false, error: data.error || 'Limit reached' };
      }

      // Refresh limits after successful increment
      await fetchLimits();

      return { success: true };
    } catch (err) {
      console.error('Failed to increment extraction usage:', err);
      return { success: false, error: 'Failed to update usage' };
    }
  };

  // Check if user can extract (without incrementing)
  const canExtract = (): boolean => {
    return limits.canExtract;
  };

  // Get display text for limits
  const getLimitText = (): string => {
    if (limits.isPremium) {
      // Check for null to indicate unlimited
      if (limits.premiumLimit === null || limits.premiumLimit === undefined) {
        return 'Premium: Unbegrenzte Extraktionen';
      }
      // Fallback for any legacy numeric limits
      if (limits.premiumLimit && limits.premiumRemaining !== undefined) {
        return `Premium: ${limits.premiumRemaining}/${limits.premiumLimit} Extraktionen`;
      }
      return 'Premium: Unbegrenzte Extraktionen';
    }
    return `Free: ${limits.freeRemaining}/${limits.freeLimit} Extraktionen übrig`;
  };

  // Effect to fetch limits on mount and when user changes
  useEffect(() => {
    if (userId) {
      fetchLimits();
    }
  }, [userId, subscription?.is_active]);

  // Debounced refetch when window regains focus (user might have used extractions in another tab)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleFocus = () => {
      if (userId) {
        // Clear any existing timeout
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
        // Set new debounced fetch
        debounceTimeout.current = setTimeout(() => {
          fetchLimits();
        }, 300);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      // Clean up any pending timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [userId]);

  return {
    limits,
    canExtract,
    incrementUsage,
    getLimitText,
    refetchLimits: fetchLimits,
    isLoading: limits.isLoading,
    error: limits.error
  };
}