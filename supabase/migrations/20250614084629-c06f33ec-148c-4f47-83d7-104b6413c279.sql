-- Add address, phone, and email columns to the organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS address TEXT NULL,
ADD COLUMN IF NOT EXISTS phone TEXT NULL,
ADD COLUMN IF NOT EXISTS email TEXT NULL;

