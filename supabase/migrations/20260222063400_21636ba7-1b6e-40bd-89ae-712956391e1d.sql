
-- =============================================
-- ADD ALL MISSING TABLES, COLUMNS, AND FUNCTIONS
-- =============================================

-- 1. Add portal_slug to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS portal_slug text UNIQUE;

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  read_by text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org notifications" ON public.notifications FOR SELECT
  USING (org_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT
  WITH CHECK (public.is_organization_admin(auth.uid(), org_id));
CREATE POLICY "Admins can update notifications" ON public.notifications FOR UPDATE
  USING (public.is_organization_admin(auth.uid(), org_id));
CREATE POLICY "Admins can delete notifications" ON public.notifications FOR DELETE
  USING (public.is_organization_admin(auth.uid(), org_id));

-- 3. Create document_requests table
CREATE TABLE IF NOT EXISTS public.document_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id text NOT NULL,
  template_id text NOT NULL,
  template_data jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view doc requests" ON public.document_requests FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can insert doc requests" ON public.document_requests FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can update doc requests" ON public.document_requests FOR UPDATE
  USING (public.is_organization_admin(auth.uid(), organization_id));

-- 4. Create request_portal_employees table
CREATE TABLE IF NOT EXISTS public.request_portal_employees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  employee_id text NOT NULL DEFAULT '',
  phone_number text,
  manager_name text,
  status text NOT NULL DEFAULT 'pending',
  registered_at timestamptz NOT NULL DEFAULT now(),
  password_hash text
);
ALTER TABLE public.request_portal_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org admins can view portal employees" ON public.request_portal_employees FOR SELECT
  USING (public.is_organization_admin(auth.uid(), organization_id));
CREATE POLICY "Anyone can register as portal employee" ON public.request_portal_employees FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can update portal employees" ON public.request_portal_employees FOR UPDATE
  USING (public.is_organization_admin(auth.uid(), organization_id));
CREATE POLICY "Admins can delete portal employees" ON public.request_portal_employees FOR DELETE
  USING (public.is_organization_admin(auth.uid(), organization_id));

-- 5. Create request_portal_settings table
CREATE TABLE IF NOT EXISTS public.request_portal_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  password_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.request_portal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org admins can view portal settings" ON public.request_portal_settings FOR SELECT
  USING (public.is_organization_admin(auth.uid(), organization_id));
CREATE POLICY "Org admins can insert portal settings" ON public.request_portal_settings FOR INSERT
  WITH CHECK (public.is_organization_admin(auth.uid(), organization_id));
CREATE POLICY "Org admins can update portal settings" ON public.request_portal_settings FOR UPDATE
  USING (public.is_organization_admin(auth.uid(), organization_id));

-- 6. Create document_drafts table
CREATE TABLE IF NOT EXISTS public.document_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  template_id text NOT NULL DEFAULT '',
  form_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.document_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own drafts" ON public.document_drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drafts" ON public.document_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drafts" ON public.document_drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own drafts" ON public.document_drafts FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- 7. generate_unique_slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(org_name text, org_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  base_slug := lower(regexp_replace(trim(org_name), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  IF length(base_slug) < 3 THEN base_slug := 'org-' || base_slug; END IF;
  final_slug := base_slug;
  LOOP
    IF NOT EXISTS (SELECT 1 FROM organizations WHERE portal_slug = final_slug AND id != org_id) THEN
      RETURN final_slug;
    END IF;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION public.generate_unique_slug(text, uuid) TO authenticated;

-- 8. complete_user_onboarding
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(
  p_user_id uuid,
  p_organization_name text,
  p_organization_address text DEFAULT NULL,
  p_organization_type text DEFAULT NULL,
  p_organization_size text DEFAULT NULL,
  p_organization_website text DEFAULT NULL,
  p_organization_location text DEFAULT NULL,
  p_plan text DEFAULT 'basic'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_slug text;
BEGIN
  -- Create organization
  INSERT INTO organizations (name, address, email)
  VALUES (p_organization_name, p_organization_address, NULL)
  RETURNING id INTO v_org_id;

  -- Generate slug
  v_slug := generate_unique_slug(p_organization_name, v_org_id);
  UPDATE organizations SET portal_slug = v_slug WHERE id = v_org_id;

  -- Add user as admin member
  INSERT INTO organization_members (user_id, organization_id, role, status)
  VALUES (p_user_id, v_org_id, 'admin', 'active')
  ON CONFLICT DO NOTHING;

  -- Update user profile
  UPDATE user_profiles SET
    organization_name = p_organization_name,
    organization_type = p_organization_type,
    organization_size = p_organization_size,
    organization_website = p_organization_website,
    organization_location = p_organization_location,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Create subscription
  PERFORM create_free_subscription(p_user_id, p_plan);

  RETURN json_build_object('success', true, 'organization_id', v_org_id);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION public.complete_user_onboarding(uuid, text, text, text, text, text, text, text) TO authenticated;

-- 9. delete_user_account
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Clean up user data
  DELETE FROM document_drafts WHERE user_id = current_user_id;
  DELETE FROM document_requests WHERE processed_by = current_user_id;
  DELETE FROM user_appearance_settings WHERE user_id = current_user_id;
  DELETE FROM user_announcement_reads WHERE user_id = current_user_id;
  DELETE FROM verified_documents WHERE user_id = current_user_id;
  DELETE FROM documents WHERE user_id = current_user_id;
  DELETE FROM subscriptions WHERE user_id = current_user_id;
  DELETE FROM user_profiles WHERE user_id = current_user_id;
  DELETE FROM profiles WHERE id = current_user_id;
  DELETE FROM organization_members WHERE user_id = current_user_id;

  -- Delete from auth
  DELETE FROM auth.users WHERE id = current_user_id;

  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- 10. get_active_plan
CREATE OR REPLACE FUNCTION public.get_active_plan(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(active_plan, 'basic') FROM subscriptions WHERE user_id = p_user_id LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_active_plan(uuid) TO authenticated;

-- 11. get_organization_statistics
CREATE OR REPLACE FUNCTION public.get_organization_statistics(org_id uuid)
RETURNS TABLE(documents_created bigint, portal_members bigint, requested_documents bigint, total_verifications bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT count(*) FROM documents d JOIN organization_members om ON d.user_id = om.user_id WHERE om.organization_id = org_id),
    (SELECT count(*) FROM request_portal_employees WHERE organization_id = org_id AND status = 'approved'),
    (SELECT count(*) FROM document_requests WHERE organization_id = org_id),
    (SELECT count(*) FROM qr_verification_logs WHERE organization_id = org_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_organization_statistics(uuid) TO authenticated;

-- 12. get_portal_info
CREATE OR REPLACE FUNCTION public.get_portal_info(p_slug text)
RETURNS TABLE(enabled boolean, organization_id uuid, portal_url text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(rps.enabled, false),
    o.id,
    o.portal_slug
  FROM organizations o
  LEFT JOIN request_portal_settings rps ON rps.organization_id = o.id
  WHERE o.portal_slug = p_slug;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_portal_info(text) TO anon, authenticated;
