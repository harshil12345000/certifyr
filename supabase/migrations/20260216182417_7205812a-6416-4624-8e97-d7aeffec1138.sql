
-- Owner credentials table - stores hashed password for the single owner account
CREATE TABLE public.owner_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.owner_credentials ENABLE ROW LEVEL SECURITY;

-- No public access at all - only edge functions with service role can read this
-- No RLS policies = no client access (which is what we want)
