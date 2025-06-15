-- Update the handle_new_user function to properly handle organization data
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
  
  -- Also create a more comprehensive user_profiles table with proper organization data handling
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
    COALESCE(NULLIF(SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 2), ''), ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'organization_name',
    CASE 
      WHEN NEW.raw_user_meta_data->>'organization_type' = 'Other' 
      THEN NEW.raw_user_meta_data->>'organization_type_other'
      ELSE NEW.raw_user_meta_data->>'organization_type'
    END,
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
    organization_location = EXCLUDED.organization_location,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;
