-- Fix RLS policy for organizations table - the current INSERT policy is circular
-- (can't insert org unless already a member, but can't be member until org exists)

-- Drop the broken insert policy
DROP POLICY IF EXISTS "Organization admins can insert their organization" ON public.organizations;

-- Create a new INSERT policy that allows authenticated users to create organizations
-- The organization will be secured by requiring user to add themselves as admin immediately after
CREATE POLICY "Authenticated users can create organizations" 
ON public.organizations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Also ensure the portal_slug has a valid starting character by using a function if needed
-- The validate_portal_slug trigger already handles this