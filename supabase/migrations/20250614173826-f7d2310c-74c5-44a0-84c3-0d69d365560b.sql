
-- Create the user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone_number TEXT,
  organization_name TEXT,
  organization_type TEXT,
  organization_size TEXT,
  organization_website TEXT,
  organization_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles (safe to run multiple times)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts and recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into profiles table if it exists
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Insert into user_profiles table with organization data
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

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
