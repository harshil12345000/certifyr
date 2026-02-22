import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscription {
  id: string;
  user_id: string;
  active_plan: string | null;
  selected_plan: string | null;
  polar_customer_id: string | null;
  polar_subscription_id: string | null;
  subscription_status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetchedOnce = useRef(false);

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      // Only show loading on initial fetch, not refetches
      if (!hasFetchedOnce.current) {
        setLoading(true);
      }
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching subscription:', fetchError);
        setError(fetchError.message);
      } else {
        setSubscription(data);
      }
    } catch (err: any) {
      console.error('Error in fetchSubscription:', err);
      setError(err.message);
    } finally {
      hasFetchedOnce.current = true;
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Set up realtime subscription updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Subscription updated:', payload);
          if (payload.eventType === 'DELETE') {
            setSubscription(null);
          } else {
            setSubscription(payload.new as Subscription);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const updateSelectedPlan = async (plan: 'basic' | 'pro' | 'ultra') => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const { error: updateError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          selected_plan: plan,
        },
        { onConflict: 'user_id' }
      );

    if (updateError) {
      return { error: updateError };
    }

    await fetchSubscription();
    return { error: null };
  };

  const isTrialing = subscription?.subscription_status === 'trialing' &&
    !!subscription?.current_period_end &&
    new Date(subscription.current_period_end) > new Date();

  const isBasicFree = subscription?.active_plan === 'basic' && 
    subscription?.subscription_status === 'active';

  // Allow users without subscription (treat as Basic free)
  const hasActiveSubscription = (subscription === null || subscription?.active_plan != null) && (
    subscription?.subscription_status === 'active' || isTrialing || isBasicFree || !subscription
  );

  const trialDaysRemaining = isTrialing && subscription?.current_period_end
    ? Math.max(0, Math.ceil(
        (new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : 0;

  const activePlan = subscription?.active_plan ?? null;
  const selectedPlan = subscription?.selected_plan ?? null;

  // Export isBasicFree for use in components - includes users without subscription
  const isBasicFreeExported = (subscription?.active_plan === 'basic' || !subscription?.active_plan) && 
    (subscription?.subscription_status === 'active' || !subscription?.subscription_status);

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    isTrialing,
    trialDaysRemaining,
    activePlan,
    selectedPlan,
    isBasicFree: isBasicFreeExported,
    updateSelectedPlan,
    refetch: fetchSubscription,
  };
}
