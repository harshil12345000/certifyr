-- Create organization_invites table to track pending invitations
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  UNIQUE(organization_id, email)
);

-- Add invited_email and status columns to organization_members if they don't exist
ALTER TABLE public.organization_members 
ADD COLUMN IF NOT EXISTS invited_email TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive'));

-- Enable RLS on organization_invites
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view invites for their organization
CREATE POLICY "Admins can view org invites"
ON public.organization_invites
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy: Admins can create invites for their organization
CREATE POLICY "Admins can create org invites"
ON public.organization_invites
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy: Admins can update invites for their organization
CREATE POLICY "Admins can update org invites"
ON public.organization_invites
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy: Admins can delete invites for their organization
CREATE POLICY "Admins can delete org invites"
ON public.organization_invites
FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Function to check if user is admin of any organization
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;
