
-- 1. Make employee-data bucket PRIVATE (no anonymous public access)
UPDATE storage.buckets
SET public = false
WHERE id = 'employee-data';

-- 2. Add file size limit (5MB) and MIME type restrictions to branding-assets
UPDATE storage.buckets
SET 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
WHERE id = 'branding-assets';

-- 3. Drop overly permissive branding-assets policies (blanket authenticated access)
DROP POLICY IF EXISTS "Allow authenticated deletes from branding-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to branding-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to branding-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to Branding Assets" ON storage.objects;

-- 4. Add a scoped public read policy for branding-assets (logos need public access for documents/PDFs)
CREATE POLICY "Public can view branding assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding-assets');

-- 5. Drop overly permissive employee-data policies
DROP POLICY IF EXISTS "Organization admins can delete employee data files" ON storage.objects;
DROP POLICY IF EXISTS "Organization admins can upload employee data files" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can view employee data files" ON storage.objects;

-- 6. Add properly scoped employee-data policies (org admin only)
CREATE POLICY "Org admins can upload employee data"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'employee-data'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM organization_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);

CREATE POLICY "Org admins can view employee data"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'employee-data'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM organization_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);

CREATE POLICY "Org admins can delete employee data"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'employee-data'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM organization_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);
