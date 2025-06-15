
-- Fix storage bucket name mismatch and policies
-- First, let's ensure we're using the correct bucket name 'branding-assets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding-assets', 'branding-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Drop old policies that might conflict
DROP POLICY IF EXISTS "Organization members can view their organization's files" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can update their files" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can delete their files" ON storage.objects;

-- Create new storage policies for branding-assets bucket that work with organization structure
CREATE POLICY "Organization members can view branding files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'branding-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can upload branding files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'branding-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update branding files"
ON storage.objects FOR UPDATE
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
ON storage.objects FOR DELETE
USING (
  bucket_id = 'branding-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Fix branding_files table policies to ensure they work properly
DROP POLICY IF EXISTS "Organization members can upload files" ON branding_files;
DROP POLICY IF EXISTS "Organization members can view their organization's files" ON branding_files;
DROP POLICY IF EXISTS "Organization members can update their files" ON branding_files;
DROP POLICY IF EXISTS "Organization members can delete their files" ON branding_files;

-- Create proper policies for branding_files table
CREATE POLICY "Organization members can view branding files"
ON branding_files FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can insert branding files"
ON branding_files FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update branding files"
ON branding_files FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can delete branding files"
ON branding_files FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);
