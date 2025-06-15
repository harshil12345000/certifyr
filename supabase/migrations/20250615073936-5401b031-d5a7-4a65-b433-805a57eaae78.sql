-- Add unique constraint on organization_id and name to support upsert operations
ALTER TABLE branding_files 
ADD CONSTRAINT unique_org_branding_name 
UNIQUE (organization_id, name);
