-- Enable RLS if not already enabled
ALTER TABLE branding_files ENABLE ROW LEVEL SECURITY;

-- Drop old insert policy if it exists
DROP POLICY IF EXISTS "Organization members can upload files" ON branding_files;

-- Allow INSERT for organization members (including admins)
CREATE POLICY "Organization members can upload files"
ON branding_files FOR INSERT
WITH CHECK (
  organization_id IS NOT NULL AND
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
); 