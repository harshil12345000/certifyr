-- Drop the old function
DROP FUNCTION IF EXISTS delete_user_account();

-- Create a comprehensive function that deletes ALL user references
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  table_record RECORD;
  deletion_count integer := 0;
  total_deleted integer := 0;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  RAISE NOTICE 'Starting deletion for user: %', current_user_id;
  
  -- Find and delete from all tables that have a user_id column
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'user_id'
  LOOP
    BEGIN
      EXECUTE format('DELETE FROM %I WHERE user_id = $1', table_record.table_name) 
      USING current_user_id;
      GET DIAGNOSTICS deletion_count = ROW_COUNT;
      total_deleted := total_deleted + deletion_count;
      RAISE NOTICE 'Deleted % rows from %', deletion_count, table_record.table_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting from %: %', table_record.table_name, SQLERRM;
    END;
  END LOOP;
  
  -- Also check for tables with 'id' column that might reference the user
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'id'
    AND table_name IN ('profiles', 'user_profiles')
  LOOP
    BEGIN
      EXECUTE format('DELETE FROM %I WHERE id = $1', table_record.table_name) 
      USING current_user_id;
      GET DIAGNOSTICS deletion_count = ROW_COUNT;
      total_deleted := total_deleted + deletion_count;
      RAISE NOTICE 'Deleted % rows from %', deletion_count, table_record.table_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting from %: %', table_record.table_name, SQLERRM;
    END;
  END LOOP;
  
  -- Check for tables with owner_id column
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'owner_id'
  LOOP
    BEGIN
      EXECUTE format('DELETE FROM %I WHERE owner_id = $1', table_record.table_name) 
      USING current_user_id;
      GET DIAGNOSTICS deletion_count = ROW_COUNT;
      total_deleted := total_deleted + deletion_count;
      RAISE NOTICE 'Deleted % rows from %', deletion_count, table_record.table_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting from %: %', table_record.table_name, SQLERRM;
    END;
  END LOOP;
  
  -- Check for tables with created_by column
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'created_by'
  LOOP
    BEGIN
      EXECUTE format('DELETE FROM %I WHERE created_by = $1', table_record.table_name) 
      USING current_user_id;
      GET DIAGNOSTICS deletion_count = ROW_COUNT;
      total_deleted := total_deleted + deletion_count;
      RAISE NOTICE 'Deleted % rows from %', deletion_count, table_record.table_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting from %: %', table_record.table_name, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Total rows deleted from all tables: %', total_deleted;
  
  -- Finally, delete the user from auth.users
  BEGIN
    DELETE FROM auth.users WHERE id = current_user_id;
    RAISE NOTICE 'Successfully deleted user from auth.users';
  EXCEPTION
    WHEN OTHERS THEN
      RETURN json_build_object(
        'success', false, 
        'error', 'Failed to delete user from auth.users: ' || SQLERRM,
        'rows_deleted', total_deleted
      );
  END;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Account deleted successfully',
    'rows_deleted', total_deleted
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
