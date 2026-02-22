
-- Add missing columns to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS enable_qr boolean NOT NULL DEFAULT true;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS ai_context_country text;

-- Add missing columns to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS designation text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS signature_path text;

-- Create ai_chat_sessions table
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chat sessions" ON public.ai_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON public.ai_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON public.ai_chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON public.ai_chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create document_history table
CREATE TABLE IF NOT EXISTS public.document_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_name text NOT NULL DEFAULT '',
  form_data jsonb DEFAULT '{}',
  template_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_editable boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'created'
);
ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own doc history" ON public.document_history FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own doc history" ON public.document_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own doc history" ON public.document_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own doc history" ON public.document_history FOR DELETE USING (auth.uid() = user_id);

-- Fix document_requests.employee_id to be uuid FK
ALTER TABLE public.document_requests ALTER COLUMN employee_id TYPE uuid USING employee_id::uuid;
ALTER TABLE public.document_requests ADD CONSTRAINT fk_document_requests_employee
  FOREIGN KEY (employee_id) REFERENCES public.request_portal_employees(id) ON DELETE CASCADE;

-- Create owner_credentials if not exists
CREATE TABLE IF NOT EXISTS public.owner_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_credentials ENABLE ROW LEVEL SECURITY;
-- No public access - only edge functions with service role
