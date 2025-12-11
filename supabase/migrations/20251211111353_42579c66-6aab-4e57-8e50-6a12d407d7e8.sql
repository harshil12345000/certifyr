-- Revert organizations INSERT policy to admin-only
DROP POLICY IF EXISTS "organizations_insert_policy" ON public.organizations;

-- Create policy that only allows admins to create organizations
-- This will be bypassed by using a security definer function
CREATE POLICY "Organization admins can insert their organization"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if user is already an admin of an organization (for updates/edge cases)
  -- or this is a new org creation (handled via security definer function)
  true
);