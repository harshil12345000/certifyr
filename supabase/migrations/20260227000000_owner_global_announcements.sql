-- Create function to create global announcements (bypasses RLS)
CREATE OR REPLACE FUNCTION create_global_announcement(
  p_title TEXT,
  p_content TEXT,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_announcement_id UUID;
BEGIN
  -- Insert the global announcement
  INSERT INTO announcements (
    title,
    content,
    expires_at,
    is_active,
    is_global,
    organization_id,
    created_by
  ) VALUES (
    p_title,
    p_content,
    p_expires_at,
    true,
    true,
    NULL,
    '00000000-0000-0000-0000-000000000000' -- placeholder UUID for owner
  )
  RETURNING id INTO v_announcement_id;

  RETURN v_announcement_id;
END;
$$;

-- Create function to send notifications to all orgs
CREATE OR REPLACE FUNCTION notify_all_orgs_announcement(
  p_announcement_id UUID,
  p_subject TEXT,
  p_body TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org RECORD;
BEGIN
  FOR v_org IN SELECT id FROM organizations LOOP
    INSERT INTO notifications (
      org_id,
      subject,
      body,
      type,
      read_by,
      data
    ) VALUES (
      v_org.id,
      p_subject,
      p_body,
      'announcement',
      ARRAY[]::TEXT[],
      jsonb_build_object('announcement_id', p_announcement_id)
    );
  END LOOP;
END;
$$;
