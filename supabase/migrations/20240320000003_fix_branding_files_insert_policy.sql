-- Drop the old insert policy if it exists
DROP POLICY IF EXISTS "Organization members can upload files" ON branding_files;

-- Create a new insert policy with explicit checks
CREATE POLICY "Organization members can upload files"
ON branding_files FOR INSERT
WITH CHECK (
    organization_id IS NOT NULL AND
    organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
    )
);

-- (Optional) Add a function to log failed inserts for debugging (remove after debugging)
-- CREATE OR REPLACE FUNCTION log_failed_branding_insert() RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO debug_failed_branding_inserts (row_data, user_id, attempted_at)
--   VALUES (row_to_json(NEW), auth.uid(), now());
--   RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- (Optional) Add a debug table (remove after debugging)
-- CREATE TABLE IF NOT EXISTS debug_failed_branding_inserts (
--   id serial primary key,
--   row_data jsonb,
--   user_id uuid,
--   attempted_at timestamptz
-- ); 