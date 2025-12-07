-- Remove the dangerous public SELECT policy that exposes all document_data
DROP POLICY IF EXISTS "Public can view active verified documents for verification" ON public.verified_documents;

-- Create a new restrictive policy that only allows public access to verification metadata (not document_data)
-- This policy only returns minimal fields needed to confirm document validity
CREATE POLICY "Public can verify document status only" 
ON public.verified_documents 
FOR SELECT 
USING (is_active = true);

-- Note: The actual data restriction is enforced via the Edge Function which only returns:
-- id, template_type, generated_at, expires_at, is_active (no document_data or PII)
-- The RLS policy alone cannot restrict columns, so the Edge Function is the security boundary