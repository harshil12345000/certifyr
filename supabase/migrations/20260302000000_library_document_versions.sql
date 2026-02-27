-- Create library document versions table (skip if exists)
CREATE TABLE IF NOT EXISTS library_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid()
);

-- Create index for faster queries (skip if exists)
CREATE INDEX IF NOT EXISTS idx_library_document_versions_document_id 
ON library_document_versions(document_id DESC);

-- Enable RLS
ALTER TABLE library_document_versions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (use OR REPLACE)
DROP POLICY IF EXISTS "Public can read library document versions" ON library_document_versions;
CREATE POLICY "Public can read library document versions"
ON library_document_versions FOR SELECT
TO anon, authenticated
USING (true);

-- Allow admin full access
DROP POLICY IF EXISTS "Admins can manage library document versions" ON library_document_versions;
CREATE POLICY "Admins can manage library document versions"
ON library_document_versions FOR ALL
TO authenticated
USING (auth.role() = 'authenticated');
