import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UsageStatus {
  canGenerate: boolean;
  isPremium: boolean;
  used: number;
  limit: number;
  remaining: number;
  isLoading: boolean;
}

export function useUsageTracking() {
  const { userEmail } = useAuth();
  const [usageStatus, setUsageStatus] = useState<UsageStatus>({
    canGenerate: true,
    isPremium: false,
    used: 0,
    limit: 3,
    remaining: 3,
    isLoading: true,
  });

  // Load usage status on mount and when user changes
  useEffect(() => {
    if (userEmail) {
      loadUsageStatus();
    } else {
      // For non-authenticated users, use localStorage as fallback
      // This is less secure but allows demo usage
      const localUsage = parseInt(localStorage.getItem('freeGenerationsCount') || '0', 10);
      setUsageStatus({
        canGenerate: localUsage < 3,
        isPremium: false,
        used: localUsage,
        limit: 3,
        remaining: Math.max(0, 3 - localUsage),
        isLoading: false,
      });
    }
  }, [userEmail]);

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
    // If user is authenticated, use secure backend tracking
    if (userEmail) {
      try {
        const { data, error } = await supabase.rpc('check_and_increment_usage');

        if (error) {
          console.error('Error checking usage:', error);
          toast.error('Fehler beim Überprüfen des Limits');
          return false;
        }

        if (!data?.can_generate) {
          toast.error(
            'Dein kostenloses Limit ist erreicht. Upgrade zu Premium für unlimitierte Generierungen.'
          );
          return false;
        }

        // Update local state using functional update
        setUsageStatus(prev => ({
          ...prev,
          canGenerate: data.can_generate,
          isPremium: data.is_premium || false,
          used: data.used || 0,
          limit: data.limit || 3,
          remaining: data.remaining ?? 0,
          isLoading: false,
        }));

        return true;
      } catch (err) {
        console.error('Failed to check usage:', err);
        toast.error('Fehler beim Überprüfen des Limits');
        return false;
      }
    } else {
      // Fallback to localStorage for non-authenticated users
      const localUsage = parseInt(localStorage.getItem('freeGenerationsCount') || '0', 10);

      if (localUsage >= 3) {
        toast.error(
          'Dein kostenloses Limit ist erreicht. Bitte logge dich ein für weitere Generierungen.'
        );
        return false;
      }

      // Increment local counter
      const newCount = localUsage + 1;
      localStorage.setItem('freeGenerationsCount', newCount.toString());

      setUsageStatus(prev => ({
        ...prev,
        canGenerate: newCount < 3,
        isPremium: false,
        used: newCount,
        limit: 3,
        remaining: Math.max(0, 3 - newCount),
        isLoading: false,
      }));

      return true;
    }
  };

  const resetLocalUsage = () => {
    // Admin function to reset local storage (for testing)
    localStorage.removeItem('freeGenerationsCount');
    if (!userEmail) {
      setUsageStatus({
        canGenerate: true,
        isPremium: false,
        used: 0,
        limit: 3,
        remaining: 3,
        isLoading: false,
      });
    }
  };

  return {
    ...usageStatus,
    checkAndIncrementUsage,
    resetLocalUsage,
    refreshStatus: loadUsageStatus,
  };
}