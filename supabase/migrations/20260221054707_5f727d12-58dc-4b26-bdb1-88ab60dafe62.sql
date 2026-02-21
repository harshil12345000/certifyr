
-- Add signature_path column to user_profiles for admin-specific signatures
ALTER TABLE public.user_profiles 
ADD COLUMN signature_path text NULL;

-- Add a comment for clarity
COMMENT ON COLUMN public.user_profiles.signature_path IS 'Path to admin-specific digital signature in branding-assets storage bucket';
