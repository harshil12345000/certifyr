-- Add document usage tracking for Basic plan limits
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS documents_used_this_month INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_usage_reset_date TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW());

-- Update has_active_subscription to recognize free Basic users
CREATE OR REPLACE FUNCTION public.has_active_subscription(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = check_user_id
    AND active_plan IS NOT NULL
    AND (
      subscription_status = 'active'
      OR (subscription_status = 'trialing' AND current_period_end > now())
      OR active_plan = 'basic'  -- Free Basic users are active
    )
  );
$$;

-- Update get_active_plan to return Basic for free users
CREATE OR REPLACE FUNCTION public.get_active_plan(check_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT active_plan FROM subscriptions
  WHERE user_id = check_user_id
  AND active_plan IS NOT NULL
  AND (
    subscription_status = 'active'
    OR (subscription_status = 'trialing' AND current_period_end > now())
    OR active_plan = 'basic'
  )
  LIMIT 1;
$$;

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
  
  -- Get subscription info
  SELECT 
    COALESCE(active_plan, selected_plan),
    documents_used_this_month,
    monthly_usage_reset_date
  INTO v_active_plan, v_documents_used, v_reset_date
  FROM subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription, treat as no limit
  IF v_active_plan IS NULL THEN
    RETURN json_build_object('allowed', true, 'plan', 'none', 'reason', 'no_subscription');
  END IF;
  
  -- If not Basic plan, unlimited
  IF v_active_plan != 'basic' THEN
    RETURN json_build_object('allowed', true, 'plan', v_active_plan, 'reason', 'unlimited');
  END IF;
  
  -- Check if we need to reset for new month
  IF v_reset_date IS NULL OR v_reset_date < v_current_month THEN
    v_documents_used := 0;
  END IF;
  
  -- Check limit (25 documents per month for Basic)
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
  
  -- Get current reset date
  SELECT monthly_usage_reset_date INTO v_reset_date
  FROM subscriptions
  WHERE user_id = p_user_id;
  
  -- If reset date is null or in the past, reset counter
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

-- Function to create free Basic subscription (no payment required)
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
