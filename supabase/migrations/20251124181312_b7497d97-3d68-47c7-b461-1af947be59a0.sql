-- Update get_organization_statistics function with accurate counting logic
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
    -- Documents Created: count all preview generations (Update Preview clicks)
    (SELECT COUNT(*) 
     FROM preview_generations 
     WHERE organization_id = org_id)::BIGINT,
    
    -- Portal Members: count approved employees in request portal
    (SELECT COUNT(*) 
     FROM request_portal_employees 
     WHERE organization_id = org_id 
     AND status = 'approved')::BIGINT,
    
    -- Requested Documents: count all document requests
    (SELECT COUNT(*) 
     FROM document_requests 
     WHERE organization_id = org_id)::BIGINT,
    
    -- Total Verifications: count all QR scans and verification page views
    (SELECT COUNT(*) 
     FROM qr_verification_logs 
     WHERE organization_id = org_id)::BIGINT;
END;
$$;