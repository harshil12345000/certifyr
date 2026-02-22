-- Fix: Create or update create_free_subscription function
-- Sets monthly_usage_reset_date to first day of next month
-- Safe: Only adds/updates function, no data changes

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
  -- Calculate first day of next month
  v_next_month_start := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
  
  INSERT INTO subscriptions (
    user_id,
    active_plan,
    selected_plan,
    subscription_status,
    current_period_start,
    current_period_end,
    documents_used_this_month,
    monthly_usage_reset_date,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_plan,
    p_plan,
    'active',
    NOW(),
    NULL,
    0,
    v_next_month_start,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    active_plan = EXCLUDED.active_plan,
    selected_plan = EXCLUDED.selected_plan,
    subscription_status = EXCLUDED.subscription_status,
    current_period_start = EXCLUDED.current_period_start,
    documents_used_this_month = 0,
    monthly_usage_reset_date = v_next_month_start,
    updated_at = now();
    
  RETURN json_build_object('success', true, 'plan', p_plan);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_free_subscription(uuid, text) TO authenticated;
