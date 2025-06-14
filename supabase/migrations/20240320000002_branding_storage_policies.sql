-- Create the branding bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for branding bucket
CREATE POLICY "Organization members can view their organization's files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'branding' AND
    (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Organization members can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'branding' AND
    (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Organization members can update their files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'branding' AND
    (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM organization_members
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'branding' AND
    (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Organization members can delete their files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'branding' AND
    (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM organization_members
        WHERE user_id = auth.uid()
    )
); 