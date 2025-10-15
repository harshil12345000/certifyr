-- Update the handle_new_user function to handle organization invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  pending_invite RECORD;
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
  
  -- Check for pending organization invitation
  SELECT * INTO pending_invite
  FROM public.organization_invites
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  ORDER BY invited_at DESC
  LIMIT 1;

  -- If there's a pending invitation, add user to organization
  IF pending_invite.id IS NOT NULL THEN
    -- Add user to organization members
    INSERT INTO public.organization_members (
      user_id,
      organization_id,
      role,
      status,
      invited_email
    ) VALUES (
      NEW.id,
      pending_invite.organization_id,
      pending_invite.role,
      'active',
      NEW.email
    )
    ON CONFLICT (user_id, organization_id) DO UPDATE SET
      role = EXCLUDED.role,
      status = 'active',
      invited_email = EXCLUDED.invited_email;

    -- Mark invitation as accepted
    UPDATE public.organization_invites
    SET status = 'accepted'
    WHERE id = pending_invite.id;

    -- Initialize user statistics for this organization
    INSERT INTO public.user_statistics (
      user_id,
      organization_id,
      documents_created,
      documents_signed,
      pending_documents,
      portal_members,
      requested_documents,
      total_verifications
    ) VALUES (
      NEW.id,
      pending_invite.organization_id,
      0, 0, 0, 0, 0, 0
    )
    ON CONFLICT (user_id, organization_id) DO NOTHING;

  ELSE
    -- No invitation found, create user profile with their own organization
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
      organization_location,
      plan
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
      NEW.raw_user_meta_data->>'organization_location',
      COALESCE(NEW.raw_user_meta_data->>'selectedPlan', 'basic')
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      phone_number = EXCLUDED.phone_number,
      organization_name = EXCLUDED.organization_name,
      organization_type = EXCLUDED.organization_type,
      organization_size = EXCLUDED.organization_size,
      organization_website = EXCLUDED.organization_website,
      organization_location = EXCLUDED.organization_location,
      plan = COALESCE(EXCLUDED.plan, user_profiles.plan),
      updated_at = now();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;