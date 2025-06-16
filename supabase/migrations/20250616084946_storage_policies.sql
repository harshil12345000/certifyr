-- Create storage policies for branding-assets bucket
CREATE POLICY "Organization members can upload branding files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'branding-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update branding files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'branding-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM organization_members
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'branding-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can delete branding files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'branding-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can view branding files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'branding-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM organization_members
    WHERE user_id = auth.uid()
  )
); 