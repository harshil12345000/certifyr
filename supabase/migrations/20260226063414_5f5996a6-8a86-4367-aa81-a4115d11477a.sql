
CREATE OR REPLACE FUNCTION public.get_org_owner_plan(p_org_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.active_plan
  FROM subscriptions s
  JOIN organization_members om ON om.user_id = s.user_id
  WHERE om.organization_id = p_org_id
    AND om.role = 'admin'
    AND om.status = 'active'
    AND s.active_plan IS NOT NULL
  ORDER BY om.created_at ASC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.count_org_admins(p_org_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM organization_members
  WHERE organization_id = p_org_id
    AND role = 'admin'
    AND status = 'active';
$$;
