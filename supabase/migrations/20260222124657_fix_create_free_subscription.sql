-- Fix: Create or update create_free_subscription function to match old working version
-- Uses current month start (not next month) like the original

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
  v_current_month TIMESTAMPTZ;
BEGIN
  v_current_month := DATE_TRUNC('month', NOW());
  
  INSERT INTO subscriptions (
    user_id,
    active_plan,
    selected_plan,
    subscription_status,
    current_period_start,
    current_period_end,
    documents_used_this_month,
    monthly_usage_reset_date
  ) VALUES (
    p_user_id,
    p_plan,
    p_plan,
    'active',
    NOW(),
    NULL,
    0,
    v_current_month
  )
  ON CONFLICT (user_id) DO UPDATE SET
    active_plan = EXCLUDED.active_plan,
    selected_plan = EXCLUDED.selected_plan,
    subscription_status = EXCLUDED.subscription_status,
    current_period_start = EXCLUDED.current_period_start,
    documents_used_this_month = 0,
    monthly_usage_reset_date = v_current_month,
    updated_at = now();
    
  RETURN json_build_object('success', true, 'plan', p_plan);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_free_subscription(uuid, text) TO authenticated;
