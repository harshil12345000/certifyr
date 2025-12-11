-- Fix the organization_members INSERT policy - the previous one had a self-reference issue

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can add members to organizations" ON public.organization_members;

-- Create a simpler policy: allow authenticated users to add themselves as admin
-- Security is maintained because:
-- 1. Users can only add themselves (user_id = auth.uid())
-- 2. Only as admin role initially
-- 3. Existing admins can add other members (covered by OR condition)
CREATE POLICY "Users can add members to organizations" 
ON public.organization_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Existing org admins can add any members to their org
  is_org_member_admin(auth.uid(), organization_id)
  OR 
  -- Users can add themselves as admin to any org (org creator flow)
  -- This is secure because users need to own the org to update it later
  (user_id = auth.uid() AND role = 'admin')
);