-- Create a security definer function to handle complete user onboarding
-- This bypasses RLS since it runs with elevated privileges
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(
  p_user_id UUID,
  p_organization_name TEXT,
  p_organization_address TEXT DEFAULT NULL,
  p_organization_type TEXT DEFAULT NULL,
  p_organization_size TEXT DEFAULT NULL,
  p_organization_website TEXT DEFAULT NULL,
  p_organization_location TEXT DEFAULT NULL,
  p_plan TEXT DEFAULT 'basic'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_portal_slug TEXT;
  v_existing_membership RECORD;
BEGIN
  -- Check if user already has an organization
  SELECT om.organization_id INTO v_existing_membership
  FROM organization_members om
  WHERE om.user_id = p_user_id
    AND om.role = 'admin'
    AND om.status = 'active'
  LIMIT 1;

  IF v_existing_membership.organization_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', true,
      'message', 'User already has an organization',
      'organization_id', v_existing_membership.organization_id
    );
  END IF;

  -- Generate unique portal slug
  v_portal_slug := lower(regexp_replace(p_organization_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_portal_slug := trim(both '-' from v_portal_slug);
  
  -- Ensure it starts with a letter
  IF v_portal_slug !~ '^[a-z]' THEN
    v_portal_slug := 'org-' || v_portal_slug;
  END IF;
  
  -- Ensure minimum length
  IF length(v_portal_slug) < 3 THEN
    v_portal_slug := v_portal_slug || '-org';
  END IF;
  
  -- Make unique by appending counter if needed
  DECLARE
    v_counter INT := 1;
    v_base_slug TEXT := v_portal_slug;
  BEGIN
    WHILE EXISTS (SELECT 1 FROM organizations WHERE portal_slug = v_portal_slug) LOOP
      v_counter := v_counter + 1;
      v_portal_slug := v_base_slug || '-' || v_counter;
    END LOOP;
  END;

  -- Create organization
  INSERT INTO organizations (name, address, portal_slug)
  VALUES (p_organization_name, p_organization_address, v_portal_slug)
  RETURNING id INTO v_org_id;

  -- Add user as admin member
  INSERT INTO organization_members (organization_id, user_id, role, status)
  VALUES (v_org_id, p_user_id, 'admin', 'active');

  -- Initialize user statistics
  INSERT INTO user_statistics (user_id, organization_id, documents_created, documents_signed, pending_documents, portal_members, requested_documents, total_verifications)
  VALUES (p_user_id, v_org_id, 0, 0, 0, 0, 0, 0)
  ON CONFLICT (user_id, organization_id) DO NOTHING;

  -- Update user profile with organization info
  UPDATE user_profiles
  SET 
    organization_name = p_organization_name,
    organization_type = p_organization_type,
    organization_size = p_organization_size,
    organization_website = p_organization_website,
    organization_location = p_organization_location,
    plan = p_plan,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Organization created successfully',
    'organization_id', v_org_id,
    'portal_slug', v_portal_slug
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;