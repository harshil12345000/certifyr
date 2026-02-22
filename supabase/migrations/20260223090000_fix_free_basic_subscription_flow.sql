-- Ensure Basic checkout reliably activates the free plan and updates reset date semantics.
CREATE OR REPLACE FUNCTION public.create_free_subscription(
  p_user_id UUID,
  p_plan TEXT DEFAULT 'basic'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_next_month_start TIMESTAMPTZ;
BEGIN
  IF p_plan IS NULL OR p_plan NOT IN ('basic', 'pro', 'ultra') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid plan');
  END IF;

  v_next_month_start := date_trunc('month', now()) + interval '1 month';

  INSERT INTO subscriptions (
    user_id,
    active_plan,
    selected_plan,
    subscription_status,
    current_period_start,
    current_period_end,
    documents_used_this_month,
    monthly_usage_reset_date,
    updated_at
  ) VALUES (
    p_user_id,
    p_plan,
    p_plan,
    'active',
    now(),
    null,
    0,
    v_next_month_start,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    active_plan = EXCLUDED.active_plan,
    selected_plan = EXCLUDED.selected_plan,
    subscription_status = EXCLUDED.subscription_status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    documents_used_this_month = 0,
    monthly_usage_reset_date = EXCLUDED.monthly_usage_reset_date,
    updated_at = now();

  UPDATE user_profiles
  SET plan = p_plan,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'plan', p_plan,
    'documents_used_this_month', 0,
    'monthly_usage_reset_date', v_next_month_start
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_free_subscription(uuid, text) TO authenticated;
