-- Enable RLS on branding_files if not already enabled
ALTER TABLE branding_files ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Organization members can view their organization's files" ON branding_files;
DROP POLICY IF EXISTS "Organization members can update their files" ON branding_files;
DROP POLICY IF EXISTS "Organization members can delete their files" ON branding_files;

-- Allow SELECT for organization members (including admins)
CREATE POLICY "Organization members can view their organization's files"
ON branding_files FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- Allow UPDATE for organization members (including admins)
CREATE POLICY "Organization members can update their files"
ON branding_files FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- Allow DELETE for organization members (including admins)
CREATE POLICY "Organization members can delete their files"
ON branding_files FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- Storage RLS for branding bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organization members can view their organization's files" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can update their files" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can delete their files" ON storage.objects;

CREATE POLICY "Organization members can view their organization's files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'branding' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'branding' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update their files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'branding' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM organization_members WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'branding' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can delete their files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'branding' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM organization_members WHERE user_id = auth.uid()
  )
); 