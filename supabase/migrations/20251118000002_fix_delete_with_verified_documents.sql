-- Drop the old function
DROP FUNCTION IF EXISTS delete_user_account();

-- Create an improved function to delete user account
-- This function handles all tables including verified_documents
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  deletion_count integer := 0;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Delete from verified_documents FIRST (has foreign key to auth.users)
  BEGIN
    DELETE FROM verified_documents WHERE user_id = current_user_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % rows from verified_documents', deletion_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table verified_documents does not exist';
    WHEN undefined_column THEN
      RAISE NOTICE 'Column user_id does not exist in verified_documents';
  END;
  
  -- Delete from user_profiles
  BEGIN
    DELETE FROM user_profiles WHERE user_id = current_user_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % rows from user_profiles', deletion_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table user_profiles does not exist';
    WHEN undefined_column THEN
      RAISE NOTICE 'Column user_id does not exist in user_profiles';
  END;
  
  -- Delete from notifications
  BEGIN
    DELETE FROM notifications WHERE user_id = current_user_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % rows from notifications', deletion_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table notifications does not exist';
    WHEN undefined_column THEN
      RAISE NOTICE 'Column user_id does not exist in notifications';
  END;
  
  -- Delete from organization_members
  BEGIN
    DELETE FROM organization_members WHERE user_id = current_user_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % rows from organization_members', deletion_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table organization_members does not exist';
    WHEN undefined_column THEN
      RAISE NOTICE 'Column user_id does not exist in organization_members';
  END;
  
  -- Delete from profiles
  BEGIN
    DELETE FROM profiles WHERE id = current_user_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % rows from profiles', deletion_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table profiles does not exist';
    WHEN undefined_column THEN
      RAISE NOTICE 'Column id does not exist in profiles';
  END;
  
  -- Delete organizations owned by this user
  BEGIN
    DELETE FROM organizations WHERE owner_id = current_user_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % rows from organizations', deletion_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table organizations does not exist';
    WHEN undefined_column THEN
      RAISE NOTICE 'Column owner_id does not exist in organizations';
  END;
  
  -- Delete the user from auth.users (this is the critical part)
  BEGIN
    DELETE FROM auth.users WHERE id = current_user_id;
    RAISE NOTICE 'Deleted user from auth.users';
  EXCEPTION
    WHEN OTHERS THEN
      RETURN json_build_object('success', false, 'error', 'Failed to delete user from auth: ' || SQLERRM);
  END;
  
  RETURN json_build_object('success', true, 'message', 'Account deleted successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
