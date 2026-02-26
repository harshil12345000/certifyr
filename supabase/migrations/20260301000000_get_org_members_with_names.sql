-- Function to get organization members with their full names
-- Falls back to auth.users metadata if user_profiles doesn't have names
CREATE OR REPLACE FUNCTION public.get_org_members_with_names(p_org_id uuid)
RETURNS TABLE (
  member_id uuid,
  user_id uuid,
  role text,
  status text,
  invited_email text,
  created_at timestamptz,
  first_name text,
  last_name text,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    om.id AS member_id,
    om.user_id,
    om.role::text,
    om.status::text,
    om.invited_email,
    om.created_at,
    COALESCE(
      up.first_name,
      (au.raw_user_meta_data->>'full_name')::text,
      SPLIT_PART((au.raw_user_meta_data->>'full_name')::text, ' ', 1),
      NULL
    ) AS first_name,
    COALESCE(
      up.last_name,
      CASE 
        WHEN (au.raw_user_meta_data->>'full_name')::text LIKE '% %' 
        THEN SUBSTRING((au.raw_user_meta_data->>'full_name')::text FROM POSITION(' ' IN (au.raw_user_meta_data->>'full_name')::text) + 1 FOR LENGTH((au.raw_user_meta_data->>'full_name')::text))
        ELSE NULL
      END,
      ''
    ) AS last_name,
    COALESCE(up.email, om.invited_email, au.email)::text AS email
  FROM public.organization_members om
  LEFT JOIN public.user_profiles up ON om.user_id = up.user_id
  LEFT JOIN auth.users au ON om.user_id = au.id
  WHERE om.organization_id = p_org_id
  ORDER BY om.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_org_members_with_names(uuid) TO authenticated;
