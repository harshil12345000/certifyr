-- Enable RLS on tables that have policies but RLS is disabled
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop the policy that exposes password_hash to public
DROP POLICY IF EXISTS "Public can view enabled portal settings" ON public.request_portal_settings;

-- Create a restricted policy that only exposes non-sensitive columns
-- We'll use a security definer function to validate passwords instead
CREATE OR REPLACE FUNCTION public.validate_portal_password(p_organization_id uuid, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM request_portal_settings
  WHERE organization_id = p_organization_id AND enabled = true;
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check using pgcrypto crypt function for bcrypt comparison
  RETURN stored_hash = crypt(p_password, stored_hash);
END;
$$;

-- Create a view for public portal info that excludes sensitive data
CREATE OR REPLACE VIEW public.public_portal_info AS
SELECT 
  organization_id,
  enabled,
  portal_url
FROM public.request_portal_settings
WHERE enabled = true;

-- Grant access to the view
GRANT SELECT ON public.public_portal_info TO anon, authenticated;

-- Create new restricted policy - only admins can see full settings
CREATE POLICY "Organization admins can view portal settings"
ON public.request_portal_settings
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);