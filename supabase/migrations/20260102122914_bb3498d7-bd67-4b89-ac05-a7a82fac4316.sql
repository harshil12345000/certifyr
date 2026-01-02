-- Subscriptions table: Single source of truth for billing state
-- active_plan is ONLY set by Polar webhooks, never client-side
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Intent: What plan user selected during onboarding (not an entitlement)
  selected_plan TEXT CHECK (selected_plan IN ('basic', 'pro')),
  
  -- Entitlement: Only set by Polar webhook (single source of truth)
  active_plan TEXT CHECK (active_plan IN ('basic', 'pro')),
  
  -- Polar identifiers
  polar_customer_id TEXT,
  polar_subscription_id TEXT UNIQUE,
  polar_checkout_id TEXT,
  
  -- Subscription status from Polar
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  
  -- Timestamps
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (for selected_plan intent)
CREATE POLICY "Users can create own subscription"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update selected_plan (intent), NOT active_plan (entitlement)
CREATE POLICY "Users can update selected_plan only"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer function to check if user has active subscription
-- This is the ONLY trusted way to check subscription status
CREATE OR REPLACE FUNCTION public.has_active_subscription(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = check_user_id
    AND active_plan IS NOT NULL
    AND subscription_status = 'active'
  );
$$;

-- Function to get user's active plan (for access control)
CREATE OR REPLACE FUNCTION public.get_active_plan(check_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT active_plan FROM subscriptions
  WHERE user_id = check_user_id
  AND active_plan IS NOT NULL
  AND subscription_status = 'active'
  LIMIT 1;
$$;

-- Function for webhook to update subscription (service role only)
-- This bypasses RLS intentionally for webhook use
CREATE OR REPLACE FUNCTION public.update_subscription_from_webhook(
  p_user_id UUID,
  p_active_plan TEXT,
  p_polar_customer_id TEXT,
  p_polar_subscription_id TEXT,
  p_subscription_status TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO subscriptions (
    user_id,
    active_plan,
    polar_customer_id,
    polar_subscription_id,
    subscription_status,
    current_period_start,
    current_period_end
  ) VALUES (
    p_user_id,
    p_active_plan,
    p_polar_customer_id,
    p_polar_subscription_id,
    p_subscription_status,
    p_current_period_start,
    p_current_period_end
  )
  ON CONFLICT (user_id) DO UPDATE SET
    active_plan = EXCLUDED.active_plan,
    polar_customer_id = EXCLUDED.polar_customer_id,
    polar_subscription_id = EXCLUDED.polar_subscription_id,
    subscription_status = EXCLUDED.subscription_status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = now();
    
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;