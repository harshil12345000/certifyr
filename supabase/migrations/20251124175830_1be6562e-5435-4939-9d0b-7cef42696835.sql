-- Create accurate organization statistics function
CREATE OR REPLACE FUNCTION get_organization_statistics(org_id UUID)
RETURNS TABLE (
  documents_created BIGINT,
  portal_members BIGINT,
  requested_documents BIGINT,
  total_verifications BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Documents Created: count all preview generations for this organization
    (SELECT COUNT(*) 
     FROM preview_generations 
     WHERE organization_id = org_id)::BIGINT,
    
    -- Portal Members: count distinct active users in organization
    (SELECT COUNT(DISTINCT user_id) 
     FROM organization_members 
     WHERE organization_id = org_id 
     AND status = 'active')::BIGINT,
    
    -- Requested Documents: count all document requests
    (SELECT COUNT(*) 
     FROM document_requests 
     WHERE organization_id = org_id)::BIGINT,
    
    -- Total Verifications: count all verified documents
    (SELECT COUNT(*) 
     FROM verified_documents 
     WHERE organization_id = org_id 
     AND is_active = true)::BIGINT;
END;
$$;