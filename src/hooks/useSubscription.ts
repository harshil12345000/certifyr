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

  const ensureBasicSubscription = useCallback(async () => {
    if (!user?.id) return false;

    const { data, error: createError } = await supabase.rpc('create_free_subscription', {
      p_user_id: user.id,
      p_plan: 'basic',
    });

    if (createError) {
      throw createError;
    }

    const result = data as { success?: boolean; error?: string } | null;
    if (result?.success === false) {
      throw new Error(result.error || 'Failed to auto-create Basic subscription');
    }

    return true;
  }, [user?.id]);

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
        const hasNoPlan = !data || (!data.active_plan && !data.selected_plan);

        if (hasNoPlan) {
          try {
            await ensureBasicSubscription();

            const { data: refreshedData, error: refreshedError } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();

            if (refreshedError) {
              throw refreshedError;
            }

            setSubscription((refreshedData ?? null) as unknown as Subscription | null);
          } catch (basicErr: any) {
            console.error('Error ensuring basic subscription:', basicErr);
            setError(basicErr.message || 'Failed to auto-assign Basic plan');
            setSubscription((data ?? null) as unknown as Subscription | null);
          }
        } else {
          setSubscription(data as unknown as Subscription);
        }
      }
    } catch (err: any) {
      console.error('Error in fetchSubscription:', err);
      setError(err.message);
    } finally {
      hasFetchedOnce.current = true;
      setLoading(false);
    }
  }, [ensureBasicSubscription, user?.id]);

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

  const hasActiveSubscription = subscription?.active_plan != null && (
    subscription?.subscription_status === 'active' || isTrialing || isBasicFree
  );

  const trialDaysRemaining = isTrialing && subscription?.current_period_end
    ? Math.max(0, Math.ceil(
        (new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : 0;

  const activePlan = subscription?.active_plan ?? null;
  const selectedPlan = subscription?.selected_plan ?? null;

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    isTrialing,
    trialDaysRemaining,
    activePlan,
    selectedPlan,
    updateSelectedPlan,
    refetch: fetchSubscription,
  };
}
