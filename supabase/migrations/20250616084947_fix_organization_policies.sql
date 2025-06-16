-- Ensure RLS is enabled
ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organization admins can update their organization" ON "public"."organizations";
DROP POLICY IF EXISTS "Organization members can view their organization" ON "public"."organizations";
DROP POLICY IF EXISTS "Organization admins can insert their organization" ON "public"."organizations";

-- Recreate policies with proper permissions
CREATE POLICY "Organization admins can update their organization" 
ON "public"."organizations"
FOR UPDATE TO authenticated
USING (
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
)
WITH CHECK (
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

CREATE POLICY "Organization members can view their organization" 
ON "public"."organizations"
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "Organization admins can insert their organization" 
ON "public"."organizations"
FOR INSERT TO authenticated
WITH CHECK (
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Grant necessary permissions
GRANT ALL ON TABLE "public"."organizations" TO authenticated;
GRANT ALL ON TABLE "public"."organization_members" TO authenticated;

-- Ensure the organization_members table has proper RLS
ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;

-- Add policy for organization members to view their own memberships
CREATE POLICY "Users can view their own organization memberships"
ON "public"."organization_members"
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Add policy for organization admins to manage members
CREATE POLICY "Organization admins can manage members"
ON "public"."organization_members"
FOR ALL TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
); 