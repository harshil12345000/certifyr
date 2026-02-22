
-- Add missing columns to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS polar_customer_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS polar_subscription_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS canceled_at timestamptz;

-- Create preview_generations table
CREATE TABLE IF NOT EXISTS public.preview_generations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.preview_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own previews" ON public.preview_generations FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert previews" ON public.preview_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add increment_user_stat function
CREATE OR REPLACE FUNCTION public.increment_user_stat(p_user_id uuid, p_stat_name text, p_increment int DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment document count in subscription
  IF p_stat_name = 'documents_created' THEN
    UPDATE subscriptions SET documents_used_this_month = COALESCE(documents_used_this_month, 0) + p_increment, updated_at = now() WHERE user_id = p_user_id;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_user_stat(uuid, text, int) TO authenticated;

-- Add type column to notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'info';
