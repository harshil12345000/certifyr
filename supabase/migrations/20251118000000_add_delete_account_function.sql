-- Create a function to delete user account
-- This function can be called via RPC from the client
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Delete user data from related tables (adjust based on your schema)
  -- The CASCADE should handle most of this, but being explicit
  DELETE FROM user_profiles WHERE user_id = current_user_id;
  DELETE FROM notifications WHERE user_id = current_user_id;
  DELETE FROM certificates WHERE user_id = current_user_id;
  DELETE FROM certificate_requests WHERE user_id = current_user_id;
  DELETE FROM organizations WHERE owner_id = current_user_id;
  
  -- Delete the user from auth.users
  -- Note: This requires the function to have SECURITY DEFINER
  DELETE FROM auth.users WHERE id = current_user_id;
  
  RETURN json_build_object('success', true, 'message', 'Account deleted successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
