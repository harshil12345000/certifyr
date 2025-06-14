
-- Drop all triggers and functions that reference the non-existent organization_branding table
DROP TRIGGER IF EXISTS on_auth_user_branding ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_branding_setup ON auth.users;
DROP FUNCTION IF EXISTS public.setup_user_branding() CASCADE;

-- Update the handle_new_user function to remove the organization_branding reference
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into profiles table with better error handling
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Also create a more comprehensive user_profiles table
  INSERT INTO public.user_profiles (
    user_id,
    first_name,
    last_name,
    email,
    phone_number,
    organization_name,
    organization_type,
    organization_size,
    organization_website,
    organization_location
  ) VALUES (
    NEW.id,
    COALESCE(SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 1), 'User'),
    COALESCE(SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 2), ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'organization_name',
    NEW.raw_user_meta_data->>'organization_type',
    NEW.raw_user_meta_data->>'organization_size',
    NEW.raw_user_meta_data->>'organization_website',
    NEW.raw_user_meta_data->>'organization_location'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    phone_number = EXCLUDED.phone_number,
    organization_name = EXCLUDED.organization_name,
    organization_type = EXCLUDED.organization_type,
    organization_size = EXCLUDED.organization_size,
    organization_website = EXCLUDED.organization_website,
    organization_location = EXCLUDED.organization_location;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Recreate the trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
