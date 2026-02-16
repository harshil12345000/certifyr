
-- Hash owner password
CREATE OR REPLACE FUNCTION public.hash_owner_password(p_password text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT crypt(p_password, gen_salt('bf'));
$$;

-- Verify owner password
CREATE OR REPLACE FUNCTION public.verify_owner_password(p_email text, p_password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM owner_credentials
    WHERE email = p_email
    AND password_hash = crypt(p_password, password_hash)
  );
$$;
