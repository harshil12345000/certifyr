-- Allow authenticated users to upload/manage their own signatures in branding-assets
-- Path pattern: signatures/{user_id}/*

CREATE POLICY "Users can upload their own signatures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'branding-assets'
  AND (storage.foldername(name))[1] = 'signatures'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can update their own signatures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'branding-assets'
  AND (storage.foldername(name))[1] = 'signatures'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete their own signatures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'branding-assets'
  AND (storage.foldername(name))[1] = 'signatures'
  AND (storage.foldername(name))[2] = auth.uid()::text
);