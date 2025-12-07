-- First, create a SECURITY DEFINER function to check if a user is an admin of an organization
-- This prevents infinite recursion in RLS policies on organization_members

CREATE OR REPLACE FUNCTION public.is_org_member_admin(check_user_id uuid, check_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id = check_user_id 
    AND organization_id = check_org_id 
    AND role = 'admin' 
    AND status = 'active'
  );
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Organization admins can manage members" ON public.organization_members;

-- Create new non-recursive policies for organization_members

-- Users can view their own memberships (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can view their own organization memberships" ON public.organization_members;

CREATE POLICY "Users can view their own memberships" 
ON public.organization_members 
FOR SELECT 
USING (user_id = auth.uid());

-- Admins can view all members in their organization
CREATE POLICY "Admins can view org members" 
ON public.organization_members 
FOR SELECT 
USING (
  public.is_org_member_admin(auth.uid(), organization_id)
);

-- Admins can insert new members to their organization  
CREATE POLICY "Admins can insert org members" 
ON public.organization_members 
FOR INSERT 
WITH CHECK (
  public.is_org_member_admin(auth.uid(), organization_id)
);

-- Admins can update members in their organization
CREATE POLICY "Admins can update org members" 
ON public.organization_members 
FOR UPDATE 
USING (
  public.is_org_member_admin(auth.uid(), organization_id)
);

-- Admins can delete members in their organization
CREATE POLICY "Admins can delete org members" 
ON public.organization_members 
FOR DELETE 
USING (
  public.is_org_member_admin(auth.uid(), organization_id)
);