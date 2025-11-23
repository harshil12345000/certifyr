# ⚡ Deploy the Fix NOW

## The migration system is out of sync, so we need to run the SQL manually.

### This takes 2 minutes:

1. **Open this link** (it will open the SQL editor):
   https://supabase.com/dashboard/project/yjeeamhahyhfawwgebtd/sql/new

2. **Copy the SQL below** (or from `supabase/migrations/20251118000000_add_delete_account_function.sql`):

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

3. **Paste it** into the SQL editor

4. **Click "Run"** (bottom right corner)

5. **Wait for success message** - should say "Success. No rows returned"

6. **Done!** Now refresh your app and test the delete account button

---

## ✅ After Running the SQL:

1. Refresh your app (F5)
2. Go to Settings
3. Click "Delete Account"
4. Enter your password
5. Confirm deletion
6. Account will be deleted!

---

## Why Manual?

The Supabase CLI migration history is out of sync with the remote database. Rather than fixing that (which is complex), it's faster to just run the SQL directly in the dashboard.
