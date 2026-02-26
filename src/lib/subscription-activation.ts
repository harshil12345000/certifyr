import { supabase } from '@/integrations/supabase/client';

interface ActivationResult {
  success: boolean;
  error?: string;
}

const MISSING_COLUMN_ERRORS = [
  'documents_used_this_month',
  'monthly_usage_reset_date',
];

const hasMissingFreemiumColumnError = (message?: string | null) => {
  if (!message) return false;
  const text = message.toLowerCase();
  return MISSING_COLUMN_ERRORS.some((column) => text.includes(column));
};

const fallbackActivatePlan = async (userId: string, plan: string = 'basic'): Promise<ActivationResult> => {
  const now = new Date().toISOString();

  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        active_plan: plan,
        selected_plan: plan,
        subscription_status: 'active',
        current_period_start: now,
        current_period_end: null,
        updated_at: now,
      } as any,
      { onConflict: 'user_id' }
    );

  if (upsertError) {
    return { success: false, error: upsertError.message };
  }

  await supabase
    .from('user_profiles')
    .update({ plan: plan, updated_at: now } as any)
    .eq('user_id', userId);

  return { success: true };
};

export const activateBasicPlan = async (userId: string, plan: string = 'basic'): Promise<ActivationResult> => {
  const { data, error } = await supabase.rpc('create_free_subscription', {
    p_user_id: userId,
    p_plan: plan,
  });

  if (!error) {
    const result = data as { success?: boolean; error?: string } | null;
    if (result?.success === false) {
      if (hasMissingFreemiumColumnError(result.error)) {
        return fallbackActivatePlan(userId, plan);
      }

      return { success: false, error: result.error || `Failed to activate ${plan} plan` };
    }

    return { success: true };
  }

  if (hasMissingFreemiumColumnError(error.message)) {
    return fallbackActivatePlan(userId, plan);
  }

  return { success: false, error: error.message };
};
