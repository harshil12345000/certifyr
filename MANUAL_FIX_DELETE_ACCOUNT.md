# Manual Fix for Delete Account (No CLI Required)

If you don't want to use the Supabase CLI, you can apply this fix manually through the Supabase Dashboard.

## Steps

### 1. Go to Supabase SQL Editor

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/yjeeamhahyhfawwgebtd
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### 2. Run This SQL

Copy and paste the following SQL into the editor and click "Run":

```sql
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
```

### 3. Test the Functionality

1. Refresh your app
2. Go to Settings
3. Click "Delete Account"
4. Enter your password
5. Confirm deletion

The account should now be deleted successfully!

## What This Does

- Creates a secure database function that can only be called by authenticated users
- Validates the user is logged in
- Deletes all user data from related tables
- Deletes the user from Supabase Auth
- Returns success/error status

## Troubleshooting

If you get an error about missing tables, that's okay - it means those tables don't exist in your database. The function will still work for the tables that do exist.

If the delete still doesn't work:
1. Check the browser console for errors (F12 → Console tab)
2. Make sure you're entering the correct password
3. Verify the SQL function was created successfully in the Supabase Dashboard
