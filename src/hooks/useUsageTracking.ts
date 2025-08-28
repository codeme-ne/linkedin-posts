import { useCallback } from 'react';
import { useSubscription } from '@/components/UpgradeButton';

const STORAGE_KEY = 'usage';
const DAILY_LIMIT = 2;

export function useUsageTracking() {
  const { subscription } = useSubscription();
  
  const getTodayUsage = (): number => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;
    
    const { date, count } = JSON.parse(stored);
    const today = new Date().toDateString();
    
    return date === today ? count : 0;
  };

  const canTransform = useCallback(() => {
    if (subscription?.is_active) return true;
    return getTodayUsage() < DAILY_LIMIT;
  }, [subscription]);

  const incrementUsage = useCallback(() => {
    if (subscription?.is_active) return;
    
    const today = new Date().toDateString();
    const currentCount = getTodayUsage();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: today,
      count: currentCount + 1
    }));
  }, [subscription]);

  const getRemainingCount = useCallback(() => {
    if (subscription?.is_active) return -1;
    return DAILY_LIMIT - getTodayUsage();
  }, [subscription]);

  return {
    canTransform,
    incrementUsage,
    getRemainingCount,
    isPro: subscription?.is_active || false
  };
}