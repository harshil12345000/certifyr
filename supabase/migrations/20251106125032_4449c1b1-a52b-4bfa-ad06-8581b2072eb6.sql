-- Allow public (unauthenticated) users to read enabled portal settings
-- This is necessary for employees/students to access the portal
CREATE POLICY "Public can view enabled portal settings"
ON public.request_portal_settings
FOR SELECT
TO anon
USING (enabled = true);