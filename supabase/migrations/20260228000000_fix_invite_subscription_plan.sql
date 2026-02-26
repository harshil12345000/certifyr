-- Fix: Set subscription plan based on organization's plan when user joins from invite
-- Instead of defaulting to 'basic', use the organization's subscription plan

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pending_invite RECORD;
  org_owner_plan text := 'basic';
BEGIN
  SELECT * INTO pending_invite
  FROM public.organization_invites
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  ORDER BY invited_at DESC
  LIMIT 1;

  IF pending_invite.id IS NOT NULL THEN
    -- Get the organization's owner plan
    SELECT s.active_plan INTO org_owner_plan
    FROM subscriptions s
    JOIN organization_members om ON om.user_id = s.user_id
    WHERE om.organization_id = pending_invite.organization_id
      AND om.role = 'admin'
      AND om.status = 'active'
      AND s.active_plan IS NOT NULL
    ORDER BY om.created_at ASC
    LIMIT 1;

    -- Default to basic if no owner plan found
    IF org_owner_plan IS NULL OR org_owner_plan = '' THEN
      org_owner_plan := 'basic';
    END IF;

    -- Create subscription based on organization's plan
    INSERT INTO subscriptions (
      user_id,
      selected_plan,
      active_plan,
      subscription_status,
      documents_used_this_month,
      monthly_usage_reset_date,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      org_owner_plan,
      org_owner_plan,
      'active',
      0,
      date_trunc('month', CURRENT_DATE) + interval '1 month',
      now(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET selected_plan = org_owner_plan,
        active_plan = org_owner_plan,
        subscription_status = 'active',
        documents_used_this_month = 0,
        monthly_usage_reset_date = date_trunc('month', CURRENT_DATE) + interval '1 month',
        updated_at = now();

    -- Also update user_profiles with the organization's plan
    INSERT INTO user_profiles (user_id, plan, updated_at)
    VALUES (NEW.id, org_owner_plan, now())
    ON CONFLICT (user_id) DO UPDATE SET
      plan = org_owner_plan,
      updated_at = now();

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
