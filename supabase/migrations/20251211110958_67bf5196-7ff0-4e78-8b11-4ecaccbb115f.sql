-- Drop the incorrectly scoped policy 
DROP POLICY IF EXISTS "Authenticated users can insert organizations" ON public.organizations;

-- Create a proper INSERT-only policy with explicit FOR INSERT
CREATE POLICY "Allow authenticated users to create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);