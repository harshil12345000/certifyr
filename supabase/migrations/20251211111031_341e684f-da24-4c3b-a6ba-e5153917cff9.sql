-- First, list all policies and drop them for organizations table
DROP POLICY IF EXISTS "Allow authenticated users to create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization admins can insert their organization" ON public.organizations;

-- Create explicit INSERT policy (not ALL)
CREATE POLICY "organizations_insert_policy"
ON public.organizations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');