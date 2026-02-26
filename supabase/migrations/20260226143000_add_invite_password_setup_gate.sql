-- Track whether invited admins must set a password on first app access.
CREATE TABLE IF NOT EXISTS public.user_password_setup_requirements (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  must_set_password boolean NOT NULL DEFAULT false,
  password_set boolean NOT NULL DEFAULT false,
  password_set_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_password_setup_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own password setup requirement" ON public.user_password_setup_requirements;
CREATE POLICY "Users can view own password setup requirement"
ON public.user_password_setup_requirements
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own password setup requirement" ON public.user_password_setup_requirements;
CREATE POLICY "Users can update own password setup requirement"
ON public.user_password_setup_requirements
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own password setup requirement" ON public.user_password_setup_requirements;
CREATE POLICY "Users can insert own password setup requirement"
ON public.user_password_setup_requirements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pending_invite RECORD;
BEGIN
  SELECT * INTO pending_invite
  FROM public.organization_invites
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  ORDER BY invited_at DESC
  LIMIT 1;

  IF pending_invite.id IS NOT NULL THEN
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

    UPDATE public.organization_invites
    SET status = 'accepted'
    WHERE id = pending_invite.id;

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

    IF lower(COALESCE(pending_invite.role, '')) = 'admin' THEN
      INSERT INTO public.user_password_setup_requirements (
        user_id,
        must_set_password,
        password_set,
        updated_at
      ) VALUES (
        NEW.id,
        true,
        false,
        now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        must_set_password = true,
        password_set = false,
        password_set_at = NULL,
        updated_at = now();
    END IF;
  ELSE
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
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;
