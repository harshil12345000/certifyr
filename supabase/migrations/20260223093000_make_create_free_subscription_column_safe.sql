-- Make free subscription creation backward/forward compatible with environments
-- where freemium usage columns may not exist yet.
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
  v_has_documents_used_column BOOLEAN;
  v_has_reset_date_column BOOLEAN;
  v_sql TEXT;
BEGIN
  IF p_plan IS NULL OR p_plan NOT IN ('basic', 'pro', 'ultra') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid plan');
  END IF;

  v_next_month_start := date_trunc('month', now()) + interval '1 month';

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subscriptions'
      AND column_name = 'documents_used_this_month'
  ) INTO v_has_documents_used_column;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subscriptions'
      AND column_name = 'monthly_usage_reset_date'
  ) INTO v_has_reset_date_column;

  v_sql := '
    INSERT INTO public.subscriptions (
      user_id,
      active_plan,
      selected_plan,
      subscription_status,
      current_period_start,
      current_period_end,
      updated_at';

  IF v_has_documents_used_column THEN
    v_sql := v_sql || ', documents_used_this_month';
  END IF;

  IF v_has_reset_date_column THEN
    v_sql := v_sql || ', monthly_usage_reset_date';
  END IF;

  v_sql := v_sql || '
    )
    VALUES (
      $1,
      $2,
      $2,
      $3,
      now(),
      null,
      now()';

  IF v_has_documents_used_column THEN
    v_sql := v_sql || ', 0';
  END IF;

  IF v_has_reset_date_column THEN
    v_sql := v_sql || ', $4';
  END IF;

  v_sql := v_sql || '
    )
    ON CONFLICT (user_id) DO UPDATE
    SET active_plan = EXCLUDED.active_plan,
        selected_plan = EXCLUDED.selected_plan,
        subscription_status = EXCLUDED.subscription_status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = now()';

  IF v_has_documents_used_column THEN
    v_sql := v_sql || ', documents_used_this_month = 0';
  END IF;

  IF v_has_reset_date_column THEN
    v_sql := v_sql || ', monthly_usage_reset_date = EXCLUDED.monthly_usage_reset_date';
  END IF;

  EXECUTE v_sql USING p_user_id, p_plan, 'active', v_next_month_start;

  UPDATE public.user_profiles
  SET plan = p_plan,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'plan', p_plan,
    'documents_used_this_month', CASE WHEN v_has_documents_used_column THEN 0 ELSE NULL END,
    'monthly_usage_reset_date', CASE WHEN v_has_reset_date_column THEN v_next_month_start ELSE NULL END
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_free_subscription(uuid, text) TO authenticated;
