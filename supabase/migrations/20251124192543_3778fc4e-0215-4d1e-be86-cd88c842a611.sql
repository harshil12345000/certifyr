-- Clean up duplicate organizations and add unique constraint
-- This handles ALL tables that reference organizations

DO $$
DECLARE
  affected_user RECORD;
  legitimate_org_id UUID;
  duplicate_org_ids UUID[];
BEGIN
  -- Find all users with multiple active admin memberships
  FOR affected_user IN
    SELECT user_id, COUNT(*) as membership_count
    FROM organization_members
    WHERE role = 'admin' AND status = 'active'
    GROUP BY user_id
    HAVING COUNT(*) > 1
  LOOP
    RAISE NOTICE 'Processing user % with % memberships', affected_user.user_id, affected_user.membership_count;
    
    -- Get the legitimate organization (oldest membership)
    SELECT organization_id INTO legitimate_org_id
    FROM organization_members
    WHERE user_id = affected_user.user_id
      AND role = 'admin'
      AND status = 'active'
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Get list of duplicate organization IDs
    SELECT ARRAY_AGG(organization_id) INTO duplicate_org_ids
    FROM organization_members
    WHERE user_id = affected_user.user_id
      AND role = 'admin'
      AND status = 'active'
      AND organization_id != legitimate_org_id;
    
    RAISE NOTICE 'Keeping organization %, removing duplicates: %', legitimate_org_id, duplicate_org_ids;
    
    -- Update ALL references to point to legitimate organization
    UPDATE preview_generations
    SET organization_id = legitimate_org_id
    WHERE organization_id = ANY(duplicate_org_ids);
    
    UPDATE document_requests
    SET organization_id = legitimate_org_id
    WHERE organization_id = ANY(duplicate_org_ids);
    
    UPDATE request_portal_employees
    SET organization_id = legitimate_org_id
    WHERE organization_id = ANY(duplicate_org_ids);
    
    UPDATE request_portal_settings
    SET organization_id = legitimate_org_id
    WHERE organization_id = ANY(duplicate_org_ids);
    
    UPDATE qr_verification_logs
    SET organization_id = legitimate_org_id
    WHERE organization_id = ANY(duplicate_org_ids);
    
    UPDATE document_history
    SET organization_id = legitimate_org_id
    WHERE organization_id = ANY(duplicate_org_ids);
    
    UPDATE user_statistics
    SET organization_id = legitimate_org_id
    WHERE organization_id = ANY(duplicate_org_ids);
    
    -- CRITICAL: Update verified_documents (was missing)
    UPDATE verified_documents
    SET organization_id = legitimate_org_id
    WHERE organization_id = ANY(duplicate_org_ids);
    
    -- Update announcements table
    UPDATE announcements
    SET organization_id = legitimate_org_id
    WHERE organization_id = ANY(duplicate_org_ids);
    
    -- Delete duplicate memberships
    DELETE FROM organization_members
    WHERE user_id = affected_user.user_id
      AND organization_id = ANY(duplicate_org_ids);
    
    -- Delete duplicate organizations
    DELETE FROM organizations
    WHERE id = ANY(duplicate_org_ids);
    
    RAISE NOTICE 'Cleanup complete for user %', affected_user.user_id;
  END LOOP;
END $$;

-- Create unique partial index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_admin_org_per_user 
ON organization_members (user_id) 
WHERE role = 'admin' AND status = 'active';