-- Create library document versions table
CREATE TABLE IF NOT EXISTS library_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid()
);

CREATE INDEX IF NOT EXISTS idx_library_document_versions_document_id 
ON library_document_versions(document_id DESC);

ALTER TABLE library_document_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read library document versions" ON library_document_versions;
CREATE POLICY "Public can read library document versions"
ON library_document_versions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage library document versions" ON library_document_versions;
CREATE POLICY "Admins can manage library document versions"
ON library_document_versions FOR ALL TO authenticated
USING (auth.role() = 'authenticated');
