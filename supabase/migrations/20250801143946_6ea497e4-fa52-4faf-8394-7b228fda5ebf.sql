
-- Enable RLS on user_statistics table (currently missing)
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Add proper RLS policies for user_statistics
CREATE POLICY "Users can view their own statistics" ON public.user_statistics
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = user_statistics.organization_id 
      AND role = 'admin' 
      AND status = 'active'
    ))
  );

CREATE POLICY "Users can insert their own statistics" ON public.user_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update user statistics" ON public.user_statistics
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = user_statistics.organization_id 
      AND role = 'admin' 
      AND status = 'active'
    ))
  );

-- Add RLS policies for notifications table
CREATE POLICY "Organization members can view their org notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = notifications.org_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage notifications" ON public.notifications
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = notifications.org_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Create document_drafts table if it doesn't exist (referenced in imports)
CREATE TABLE IF NOT EXISTS public.document_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id TEXT NOT NULL,
  form_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on document_drafts
ALTER TABLE public.document_drafts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for document_drafts
CREATE POLICY "Users can view their own drafts" ON public.document_drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drafts" ON public.document_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts" ON public.document_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts" ON public.document_drafts
  FOR DELETE USING (auth.uid() = user_id);

-- Optimize existing policies by creating helper functions to avoid nested queries
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE user_id = user_uuid 
    AND organization_id = org_uuid 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_is_org_admin(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE user_id = user_uuid 
    AND organization_id = org_uuid 
    AND role = 'admin' 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update existing inefficient policies using the new helper functions
DROP POLICY IF EXISTS "Organization members can view branding files" ON public.branding_files;
CREATE POLICY "Organization members can view branding files" ON public.branding_files
  FOR SELECT USING (public.user_belongs_to_organization(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Organization members can insert branding files" ON public.branding_files;
CREATE POLICY "Organization members can insert branding files" ON public.branding_files
  FOR INSERT WITH CHECK (public.user_belongs_to_organization(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Organization members can update branding files" ON public.branding_files;
CREATE POLICY "Organization members can update branding files" ON public.branding_files
  FOR UPDATE USING (public.user_belongs_to_organization(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Organization members can delete branding files" ON public.branding_files;
CREATE POLICY "Organization members can delete branding files" ON public.branding_files
  FOR DELETE USING (public.user_belongs_to_organization(auth.uid(), organization_id));

-- Strengthen document_requests policies
DROP POLICY IF EXISTS "Organization admins can manage requests" ON public.document_requests;
CREATE POLICY "Organization admins can manage requests" ON public.document_requests
  FOR ALL USING (public.user_is_org_admin(auth.uid(), organization_id));

-- Add missing DELETE policy for organization_invites
CREATE POLICY "Users can delete expired invites" ON public.organization_invites
  FOR DELETE USING (
    expires_at < NOW() AND 
    public.user_is_org_admin(auth.uid(), organization_id)
  );
