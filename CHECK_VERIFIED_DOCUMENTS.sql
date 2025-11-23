-- Run this in Supabase SQL Editor to see what's in verified_documents
-- This will help us understand the table structure

-- Check if the table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'verified_documents'
ORDER BY ordinal_position;

-- Check how many records exist for your user
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
SELECT COUNT(*) as record_count
FROM verified_documents 
WHERE user_id = auth.uid();

-- See the actual records
SELECT *
FROM verified_documents 
WHERE user_id = auth.uid()
LIMIT 5;
