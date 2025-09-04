import { useCallback, useState, useEffect } from 'react';
import { useSubscription } from '@/components/common/UpgradeButton';
import { supabase } from '@/api/supabase';

const TOTAL_LIMIT = 7;

export function useUsageTracking() {
  const { subscription } = useSubscription();
  const [currentUsage, setCurrentUsage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const getUserUsage = useCallback(async (): Promise<number> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return 0;

      const { count, error } = await supabase
        .from('generation_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id);

      if (error) {
        return 0;
      }

      return count || 0;
    } catch (error) {
      return 0;
    }
  }, []);

  const canTransform = useCallback(() => {
    if (subscription?.is_active) return true;
    return currentUsage < TOTAL_LIMIT;
  }, [subscription, currentUsage]);

  const canExtract = useCallback(() => {
    if (subscription?.is_active) return true;
    return currentUsage < TOTAL_LIMIT;
  }, [subscription, currentUsage]);

  const incrementUsage = useCallback(async () => {
    if (subscription?.is_active) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return;

      const { error } = await supabase
        .from('generation_usage')
        .insert([{ 
          user_id: session.session.user.id,
          generated_at: new Date().toISOString()
        }]);

      if (error) {
        return;
      }

      // Update local state
      setCurrentUsage(prev => prev + 1);
    } catch (error) {
      // Silent failure for usage tracking
    }
  }, [subscription]);

  // Load initial usage on mount and when subscription changes
  useEffect(() => {
    const loadUsage = async () => {
      setLoading(true);
      const usage = await getUserUsage();
      setCurrentUsage(usage);
      setLoading(false);
    };

    loadUsage();
  }, [getUserUsage, subscription]);

  return {
    canTransform,
    canExtract,
    incrementUsage,
    // Keep incrementExtractionUsage as alias for backward compatibility
    incrementExtractionUsage: incrementUsage,
    isPro: subscription?.is_active || false,
    loading
  };
}