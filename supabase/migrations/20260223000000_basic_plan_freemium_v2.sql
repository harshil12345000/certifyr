-- Phase 1: Basic Plan Database Functions
-- Safe migration: Creates NEW functions only, does NOT modify existing data
-- Uses 25 document limit per calendar month for Basic plan

-- 1. check_document_limit_v2 - Enhanced version with monthly reset and proper 25 limit
CREATE OR REPLACE FUNCTION public.check_document_limit_v2(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_used int;
  v_limit int := 25; -- Basic plan limit
  v_reset_date timestamptz;
  v_current_date date := CURRENT_DATE;
BEGIN
  -- Fetch subscription
  SELECT active_plan, COALESCE(documents_used_this_month, 0), monthly_usage_reset_date
  INTO v_plan, v_used, v_reset_date
  FROM subscriptions
  WHERE user_id = p_user_id;

  IF NOT FOUND OR v_plan IS NULL THEN
    RETURN json_build_object(
      'allowed', true,
      'used', 0,
      'limit', v_limit,
      'remaining', v_limit,
      'reset_date', NULL,
      'is_basic', false
    );
  END IF;

  -- Check if monthly reset is needed
  IF v_reset_date IS NOT NULL AND v_current_date >= v_reset_date::date THEN
    v_used := 0;
    v_reset_date := date_trunc('month', v_current_date) + interval '1 month';
    
    UPDATE subscriptions
    SET documents_used_this_month = 0,
        monthly_usage_reset_date = v_reset_date,
        updated_at = now()
    WHERE user_id = p_user_id
    AND active_plan = 'basic';
  END IF;

  -- Set limit based on plan
  IF v_plan = 'basic' THEN
    v_limit := 25;
  ELSIF v_plan = 'pro' THEN
    v_limit := NULL; -- Unlimited
  ELSIF v_plan = 'ultra' THEN
    v_limit := NULL; -- Unlimited
  ELSE
    v_limit := 0;
  END IF;

  RETURN json_build_object(
    'allowed', v_used < v_limit OR v_limit IS NULL,
    'used', v_used,
    'limit', v_limit,
    'remaining', CASE WHEN v_limit IS NULL THEN 999999 ELSE GREATEST(v_limit - v_used, 0) END,
    'reset_date', v_reset_date,
    'is_basic', v_plan = 'basic'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_document_limit_v2(uuid) TO authenticated;

-- 2. increment_preview_count_v2 - Atomic conditional increment for preview generation
-- Returns success=true only if increment was successful (limit not reached)
CREATE OR REPLACE FUNCTION public.increment_preview_count_v2(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_used int;
  v_limit int := 25;
  v_reset_date timestamptz;
  v_current_date date := CURRENT_DATE;
  v_updated bool := false;
BEGIN
  -- Fetch current state
  SELECT active_plan, COALESCE(documents_used_this_month, 0), monthly_usage_reset_date
  INTO v_plan, v_used, v_reset_date
  FROM subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE; -- Row lock to prevent race conditions

  IF NOT FOUND OR v_plan IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No subscription found', 'allowed', true);
  END IF;

  -- Only apply limit to Basic plan
  IF v_plan != 'basic' THEN
    RETURN json_build_object('success', true, 'allowed', true, 'message', 'Unlimited plan');
  END IF;

  -- Check if reset is needed
  IF v_reset_date IS NOT NULL AND v_current_date >= v_reset_date::date THEN
    v_used := 0;
    v_reset_date := date_trunc('month', v_current_date) + interval '1 month';
  END IF;

  -- Check if at limit
  IF v_used >= v_limit THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Document limit reached',
      'allowed', false,
      'used', v_used,
      'limit', v_limit,
      'reset_date', v_reset_date
    );
  END IF;

  -- Atomic conditional update - only increments if below limit
  UPDATE subscriptions
  SET documents_used_this_month = documents_used_this_month + 1,
      monthly_usage_reset_date = COALESCE(v_reset_date, monthly_usage_reset_date),
      updated_at = now()
  WHERE user_id = p_user_id
  AND active_plan = 'basic'
  AND (
    monthly_usage_reset_date IS NULL 
    OR monthly_usage_reset_date > now()
    OR documents_used_this_month < 25
  )
  AND documents_used_this_month < 25
  RETURNING documents_used_this_month INTO v_used;

  IF v_used IS NOT NULL THEN
    v_updated := true;
  END IF;

  IF v_updated THEN
    RETURN json_build_object(
      'success', true,
      'allowed', true,
      'used', v_used,
      'limit', v_limit,
      'remaining', v_limit - v_used
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Document limit reached',
      'allowed', false,
      'used', v_used,
      'limit', v_limit
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_preview_count_v2(uuid) TO authenticated;

-- 3. create_basic_subscription_v2 - Creates Basic subscription with proper reset date
CREATE OR REPLACE FUNCTION public.create_basic_subscription_v2(p_user_id uuid, p_plan text DEFAULT 'basic')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reset_date timestamptz;
BEGIN
  -- Calculate first day of next month
  v_reset_date := date_trunc('month', CURRENT_DATE) + interval '1 month';

  -- Insert or update subscription
  INSERT INTO subscriptions (
    user_id,
    selected_plan,
    active_plan,
    subscription_status,
    documents_used_this_month,
    monthly_usage_reset_date,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_plan,
    p_plan,
    'active',
    0,
    v_reset_date,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET selected_plan = p_plan,
      active_plan = p_plan,
      subscription_status = 'active',
      documents_used_this_month = 0,
      monthly_usage_reset_date = v_reset_date,
      updated_at = now()
  WHERE subscriptions.user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'plan', p_plan,
    'reset_date', v_reset_date,
    'documents_used_this_month', 0
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_basic_subscription_v2(uuid, text) TO authenticated;
