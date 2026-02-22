-- Add missing freemium functions
-- Function to check document limit for Basic users
CREATE OR REPLACE FUNCTION public.check_document_limit(p_user_id UUID)
 RETURNS JSON
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_active_plan TEXT;
  v_documents_used INT;
  v_reset_date TIMESTAMPTZ;
  v_current_month TIMESTAMPTZ;
BEGIN
  v_current_month := DATE_TRUNC('month', NOW());
  
  SELECT 
    COALESCE(active_plan, selected_plan),
    documents_used_this_month,
    monthly_usage_reset_date
  INTO v_active_plan, v_documents_used, v_reset_date
  FROM subscriptions
  WHERE user_id = p_user_id;
  
  IF v_active_plan IS NULL THEN
    RETURN json_build_object(
      'allowed', true, 
      'plan', 'basic', 
      'used', 0, 
      'limit', 25,
      'remaining', 25,
      'reason', 'no_subscription_treated_as_basic'
    );
  END IF;
  
  IF v_active_plan != 'basic' THEN
    RETURN json_build_object('allowed', true, 'plan', v_active_plan, 'reason', 'unlimited');
  END IF;
  
  IF v_reset_date IS NULL OR v_reset_date < v_current_month THEN
    v_documents_used := 0;
  END IF;
  
  IF v_documents_used >= 25 THEN
    RETURN json_build_object(
      'allowed', false, 
      'plan', 'basic',
      'reason', 'limit_reached', 
      'used', v_documents_used, 
      'limit', 25,
      'reset_date', (v_current_month + INTERVAL '1 month')::date
    );
  END IF;
  
  RETURN json_build_object(
    'allowed', true, 
    'plan', 'basic',
    'used', v_documents_used, 
    'limit', 25,
    'remaining', 25 - v_documents_used
  );
END;
$$;

-- Function to increment document count
CREATE OR REPLACE FUNCTION public.increment_document_count(p_user_id UUID)
 RETURNS VOID
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_current_month TIMESTAMPTZ;
  v_reset_date TIMESTAMPTZ;
BEGIN
  v_current_month := DATE_TRUNC('month', NOW());
  
  SELECT monthly_usage_reset_date INTO v_reset_date
  FROM subscriptions
  WHERE user_id = p_user_id;
  
  IF v_reset_date IS NULL OR v_reset_date < v_current_month THEN
    UPDATE subscriptions
    SET 
      documents_used_this_month = 1,
      monthly_usage_reset_date = v_current_month
    WHERE user_id = p_user_id;
  ELSE
    UPDATE subscriptions
    SET documents_used_this_month = documents_used_this_month + 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Function to create free Basic subscription
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
