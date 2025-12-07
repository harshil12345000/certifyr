-- Fix the security definer view by making it a regular view with RLS
DROP VIEW IF EXISTS public.public_portal_info;

-- Instead, create a function that returns only safe portal data
CREATE OR REPLACE FUNCTION public.get_portal_info(p_slug text)
RETURNS TABLE (
  organization_id uuid,
  enabled boolean,
  portal_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    rps.organization_id,
    rps.enabled,
    rps.portal_url
  FROM request_portal_settings rps
  JOIN organizations o ON o.id = rps.organization_id
  WHERE o.portal_slug = p_slug AND rps.enabled = true;
$$;