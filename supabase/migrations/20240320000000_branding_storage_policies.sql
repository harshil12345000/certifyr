-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for branding bucket
CREATE POLICY "Give organization access to only their own folder SELECT"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'branding' AND
  auth.uid()::text = storage.foldername(name)[1]
);

CREATE POLICY "Give organization access to only their own folder INSERT"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'branding' AND
  auth.uid()::text = storage.foldername(name)[1]
);

CREATE POLICY "Give organization access to only their own folder UPDATE"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'branding' AND
  auth.uid()::text = storage.foldername(name)[1]
)
WITH CHECK (
  bucket_id = 'branding' AND
  auth.uid()::text = storage.foldername(name)[1]
);

CREATE POLICY "Give organization access to only their own folder DELETE"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'branding' AND
  auth.uid()::text = storage.foldername(name)[1]
); 