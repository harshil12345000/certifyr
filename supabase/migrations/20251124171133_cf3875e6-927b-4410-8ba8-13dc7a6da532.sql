-- Fix search_path for generate_unique_slug function
CREATE OR REPLACE FUNCTION generate_unique_slug(org_name TEXT, org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert name to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  -- Ensure it starts with a letter
  IF base_slug !~ '^[a-z]' THEN
    base_slug := 'org-' || base_slug;
  END IF;
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment counter if needed
  WHILE EXISTS (
    SELECT 1 FROM organizations 
    WHERE portal_slug = final_slug 
    AND id != org_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Fix search_path for validate_portal_slug function
CREATE OR REPLACE FUNCTION validate_portal_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Force lowercase
  NEW.portal_slug := lower(NEW.portal_slug);
  
  -- Validate format: must start with letter, only lowercase letters, numbers, hyphens, 3-50 chars
  IF NEW.portal_slug !~ '^[a-z][a-z0-9-]{2,49}$' THEN
    RAISE EXCEPTION 'Invalid portal slug format. Must start with a letter, contain only lowercase letters, numbers, and hyphens, and be 3-50 characters long.';
  END IF;
  
  RETURN NEW;
END;
$$;