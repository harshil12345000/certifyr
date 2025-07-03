
-- Make the branding-assets bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'branding-assets';

-- Create a policy to allow public access to branding assets
CREATE POLICY "Public Access to Branding Assets" ON storage.objects
FOR SELECT USING (bucket_id = 'branding-assets');

-- Allow authenticated users to upload to branding-assets
CREATE POLICY "Allow authenticated uploads to branding-assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'branding-assets' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their organization's branding assets
CREATE POLICY "Allow authenticated updates to branding-assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'branding-assets' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their organization's branding assets
CREATE POLICY "Allow authenticated deletes from branding-assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'branding-assets' AND 
  auth.role() = 'authenticated'
);
