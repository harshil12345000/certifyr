-- Drop the incorrectly scoped policy (it was created as ALL instead of INSERT)
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

-- Create a proper INSERT-only policy
CREATE POLICY "Authenticated users can insert organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);