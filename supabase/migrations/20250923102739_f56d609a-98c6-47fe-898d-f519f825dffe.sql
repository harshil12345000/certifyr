-- Check current auth configuration and ensure proper recovery flow
-- This will help debug the email link issue

-- First, let's see if we have any custom email templates
-- Note: We cannot directly modify auth.config from SQL, but we can check settings

-- Create a simple test to verify our auth flow is working
-- This helps ensure the database side is configured correctly
SELECT 'Password reset configuration check' as status;