-- Drop all existing policies for both tables
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users can read global or their org announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can create org announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage their org announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users can read their org announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users can mark announcements as read" ON public.user_announcement_reads;
DROP POLICY IF EXISTS "Users can view their own announcement reads" ON public.user_announcement_reads;

-- Create a security definer function to check if user is admin of an organization
CREATE OR REPLACE FUNCTION public.is_user_admin_of_org(user_id uuid, org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id = $1 
    AND organization_id = $2 
    AND role = 'admin'
  );
$$;

-- Create a security definer function to get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = $1 
  LIMIT 1;
$$;

-- Policy: Users can insert announcements for their own organization if they are admin
CREATE POLICY "Admins can create org announcements"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = public.get_user_organization_id(auth.uid())
  AND public.is_user_admin_of_org(auth.uid(), organization_id)
);

-- Policy: Users can update/delete announcements they created for their org
CREATE POLICY "Admins can manage their org announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (
  created_by = auth.uid()
  AND organization_id = public.get_user_organization_id(auth.uid())
  AND public.is_user_admin_of_org(auth.uid(), organization_id)
);

-- Policy: Users can read announcements from their organization
CREATE POLICY "Users can read their org announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND organization_id = public.get_user_organization_id(auth.uid())
);

-- Policy: Users can mark announcements as read for their own records
CREATE POLICY "Users can mark own announcement reads"
ON public.user_announcement_reads
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Users can view their own announcement reads
CREATE POLICY "Users can view own announcement reads"
ON public.user_announcement_reads
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
