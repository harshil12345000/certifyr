-- Update get_user_organization_id function to filter for active admin memberships
-- Using CREATE OR REPLACE to avoid breaking dependent policies
CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = $1 
  AND role = 'admin'
  AND status = 'active'
  LIMIT 1;
$$;