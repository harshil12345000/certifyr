-- Drop old check constraints and add updated ones that include 'ultra'
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_active_plan_check;
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_selected_plan_check;

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_active_plan_check 
  CHECK (active_plan = ANY (ARRAY['basic'::text, 'pro'::text, 'ultra'::text]));

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_selected_plan_check 
  CHECK (selected_plan = ANY (ARRAY['basic'::text, 'pro'::text, 'ultra'::text]));

-- Now grant Ultra access to harshilsav1@gmail.com
INSERT INTO subscriptions (
  user_id,
  active_plan,
  selected_plan,
  subscription_status,
  current_period_end
)
VALUES (
  '0fdce0d9-cf29-4e21-8f41-127b30c7faa9',
  'ultra',
  'ultra',
  'active',
  '2099-12-31T23:59:59Z'
)
ON CONFLICT (user_id) DO UPDATE SET
  active_plan = 'ultra',
  selected_plan = 'ultra',
  subscription_status = 'active',
  current_period_end = '2099-12-31T23:59:59Z';