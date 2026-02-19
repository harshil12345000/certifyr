
-- Add trial tracking columns
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS trial_start timestamptz,
  ADD COLUMN IF NOT EXISTS trial_end timestamptz;

-- Update has_active_subscription to recognize trialing
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
    )
  );
$$;

-- Update get_active_plan to recognize trialing
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
  )
  LIMIT 1;
$$;

-- Update update_subscription_from_webhook to accept trial fields
CREATE OR REPLACE FUNCTION public.update_subscription_from_webhook(
  p_user_id uuid,
  p_active_plan text,
  p_polar_customer_id text,
  p_polar_subscription_id text,
  p_subscription_status text,
  p_current_period_start timestamp with time zone,
  p_current_period_end timestamp with time zone,
  p_trial_start timestamp with time zone DEFAULT NULL,
  p_trial_end timestamp with time zone DEFAULT NULL
)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO subscriptions (
    user_id,
    active_plan,
    polar_customer_id,
    polar_subscription_id,
    subscription_status,
    current_period_start,
    current_period_end,
    trial_start,
    trial_end
  ) VALUES (
    p_user_id,
    p_active_plan,
    p_polar_customer_id,
    p_polar_subscription_id,
    p_subscription_status,
    p_current_period_start,
    p_current_period_end,
    p_trial_start,
    p_trial_end
  )
  ON CONFLICT (user_id) DO UPDATE SET
    active_plan = EXCLUDED.active_plan,
    polar_customer_id = EXCLUDED.polar_customer_id,
    polar_subscription_id = EXCLUDED.polar_subscription_id,
    subscription_status = EXCLUDED.subscription_status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    trial_start = COALESCE(EXCLUDED.trial_start, subscriptions.trial_start),
    trial_end = COALESCE(EXCLUDED.trial_end, subscriptions.trial_end),
    updated_at = now();
    
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
