-- Fix RLS policy for organization_members INSERT
-- Current policy requires user to already be admin to insert, which is circular for new orgs

-- Drop the broken insert policy
DROP POLICY IF EXISTS "Admins can insert org members" ON public.organization_members;

-- Create new policy that allows:
-- 1. Existing org admins to add new members to their org
-- 2. Users to add themselves as the first admin of a new org (org has no members yet)
CREATE POLICY "Users can add members to organizations" 
ON public.organization_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if user is already admin of this org
  is_org_member_admin(auth.uid(), organization_id)
  OR 
  -- Allow users to add themselves as admin if no members exist yet (new org)
  (user_id = auth.uid() AND role = 'admin' AND NOT EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = organization_members.organization_id
  ))
);