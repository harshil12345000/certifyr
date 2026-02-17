-- Fix incorrect plan for user who paid for Pro but was assigned Basic due to webhook bug
UPDATE subscriptions 
SET active_plan = 'pro', updated_at = now() 
WHERE user_id = 'd1d0d3c6-34fe-4dd3-b674-dfe2e24ddda5' 
AND polar_subscription_id = 'sub_0NYhfKSvfWDIrY4itO5Ux';