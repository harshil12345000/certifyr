
-- Add new columns to existing user_statistics table for organization-level tracking
ALTER TABLE public.user_statistics ADD COLUMN IF NOT EXISTS requested_documents INTEGER DEFAULT 0;
ALTER TABLE public.user_statistics ADD COLUMN IF NOT EXISTS portal_members INTEGER DEFAULT 0;

-- Update the increment_user_stat function to handle the new fields
CREATE OR REPLACE FUNCTION public.increment_user_stat(p_user_id uuid, p_organization_id uuid, p_stat_field text)
RETURNS void
LANGUAGE plpgsql
AS $$
begin
  execute format('insert into user_statistics (user_id, organization_id, %I) values ($1, $2, 1)
    on conflict (user_id, organization_id) do update set %I = user_statistics.%I + 1, updated_at = now()', p_stat_field, p_stat_field, p_stat_field)
  using p_user_id, p_organization_id;
end;
$$;

-- Create function to update organization-level statistics
CREATE OR REPLACE FUNCTION public.update_organization_statistics(p_organization_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
  req_count integer;
  member_count integer;
BEGIN
  -- Get the first admin user for this organization to store org-level stats
  SELECT user_id INTO admin_user_id 
  FROM organization_members 
  WHERE organization_id = p_organization_id AND role = 'admin' AND status = 'active'
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Count requested documents
    SELECT COUNT(*) INTO req_count
    FROM document_requests 
    WHERE organization_id = p_organization_id;
    
    -- Count portal members (approved employees)
    SELECT COUNT(*) INTO member_count
    FROM request_portal_employees 
    WHERE organization_id = p_organization_id AND status = 'approved';
    
    -- Upsert the statistics
    INSERT INTO user_statistics (
      user_id, 
      organization_id, 
      requested_documents, 
      portal_members,
      documents_created,
      documents_signed,
      pending_documents,
      total_verifications,
      updated_at
    )
    VALUES (
      admin_user_id,
      p_organization_id,
      req_count,
      member_count,
      COALESCE((SELECT documents_created FROM user_statistics WHERE organization_id = p_organization_id AND user_id = admin_user_id), 0),
      COALESCE((SELECT documents_signed FROM user_statistics WHERE organization_id = p_organization_id AND user_id = admin_user_id), 0),
      COALESCE((SELECT pending_documents FROM user_statistics WHERE organization_id = p_organization_id AND user_id = admin_user_id), 0),
      COALESCE((SELECT total_verifications FROM user_statistics WHERE organization_id = p_organization_id AND user_id = admin_user_id), 0)
    )
    ON CONFLICT (user_id, organization_id) 
    DO UPDATE SET
      requested_documents = EXCLUDED.requested_documents,
      portal_members = EXCLUDED.portal_members,
      updated_at = now();
  END IF;
END;
$$;

-- Create function to increment documents created when preview is generated
CREATE OR REPLACE FUNCTION public.increment_documents_created_for_org(p_user_id uuid, p_organization_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM increment_user_stat(p_user_id, p_organization_id, 'documents_created');
END;
$$;

-- Create triggers to update statistics in real-time
CREATE OR REPLACE FUNCTION public.trigger_update_organization_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM update_organization_statistics(NEW.organization_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM update_organization_statistics(NEW.organization_id);
    IF TG_TABLE_NAME = 'document_requests' AND OLD.organization_id != NEW.organization_id THEN
      PERFORM update_organization_statistics(OLD.organization_id);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_organization_statistics(OLD.organization_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_org_stats_on_document_requests ON public.document_requests;
DROP TRIGGER IF EXISTS update_org_stats_on_portal_employees ON public.request_portal_employees;

-- Create new triggers
CREATE TRIGGER update_org_stats_on_document_requests
AFTER INSERT OR UPDATE OR DELETE ON public.document_requests
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_organization_stats();

CREATE TRIGGER update_org_stats_on_portal_employees
AFTER INSERT OR UPDATE OR DELETE ON public.request_portal_employees
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_organization_stats();

-- Create monthly activity tracking table for the curved line graph
CREATE TABLE IF NOT EXISTS public.organization_monthly_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  documents_created INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id, year, month)
);

-- Enable RLS on monthly activity
ALTER TABLE public.organization_monthly_activity ENABLE ROW LEVEL SECURITY;

-- Create policy for organization members to view their monthly activity
CREATE POLICY "Organization members can view monthly activity" ON public.organization_monthly_activity
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Function to track monthly document creation activity
CREATE OR REPLACE FUNCTION public.track_monthly_document_creation(p_user_id uuid, p_organization_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM now());
  current_month INTEGER := EXTRACT(MONTH FROM now());
BEGIN
  INSERT INTO public.organization_monthly_activity (organization_id, user_id, year, month, documents_created)
  VALUES (p_organization_id, p_user_id, current_year, current_month, 1)
  ON CONFLICT (organization_id, user_id, year, month) 
  DO UPDATE SET
    documents_created = organization_monthly_activity.documents_created + 1,
    updated_at = now();
END;
$$;

-- Initialize statistics for all existing organizations
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN 
    SELECT DISTINCT o.id as org_id, om.user_id 
    FROM organizations o
    JOIN organization_members om ON o.id = om.organization_id 
    WHERE om.role = 'admin' AND om.status = 'active'
  LOOP
    PERFORM update_organization_statistics(org_record.org_id);
  END LOOP;
END $$;
