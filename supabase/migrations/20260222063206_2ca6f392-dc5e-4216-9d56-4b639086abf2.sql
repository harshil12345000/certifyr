
-- Add missing functions that the codebase references

-- 1. check_document_limit
CREATE OR REPLACE FUNCTION public.check_document_limit(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_used int;
  v_limit int;
BEGIN
  SELECT active_plan, COALESCE(documents_used_this_month, 0)
  INTO v_plan, v_used
  FROM subscriptions
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('allowed', true, 'used', 0, 'limit', 5, 'remaining', 5);
  END IF;

  v_limit := CASE v_plan
    WHEN 'basic' THEN 10
    WHEN 'pro' THEN 50
    WHEN 'ultra' THEN 999999
    ELSE 5
  END;

  RETURN json_build_object(
    'allowed', v_used < v_limit,
    'used', v_used,
    'limit', v_limit,
    'remaining', GREATEST(v_limit - v_used, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_document_limit(uuid) TO authenticated;

-- 2. increment_document_count
CREATE OR REPLACE FUNCTION public.increment_document_count(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE subscriptions
  SET documents_used_this_month = COALESCE(documents_used_this_month, 0) + 1,
      updated_at = now()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No subscription found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_document_count(uuid) TO authenticated;
