# 7-Day Free Trial (Model 1 -- Card Required, Auto-Converting)

## Overview

Dodo manages the entire trial lifecycle. Your app mirrors Dodo's state via webhooks. No manual trial logic in the database. Pro and Ultra get a 7-day trial; Basic has no trial (direct payment).

## Prerequisites (Dodo Dashboard -- Manual)

Before any code deploys, configure trial periods on your Dodo products:

- **Pro Monthly** (`pdt_0NYXEA30vMCJgSxp0pcRw`): Set `trial_period_days = 7`
- **Pro Yearly** (`pdt_0NYXIQ6Nqc7tDx0YXn8OY`): Set `trial_period_days = 7`
- **Ultra Monthly** (`pdt_0NYXI4SnmvbXxxUZAkDH0`): Set `trial_period_days = 7`
- **Ultra Yearly** (`pdt_0NYXIWHTsKjeI7gEcRLdR`): Set `trial_period_days = 7`
- **Basic products**: No trial

## Flow

```text
Signup (Personal + Org info)
       |
  PricingStage: Select Pro/Ultra (with "7-day free trial" CTA)
       |
  Redirect to Dodo Checkout (card required)
       |
  Dodo creates subscription with status=trialing, 7-day period
       |
  Webhook fires --> DB mirrors: active_plan=pro, status=trialing, current_period_end=trial_end
       |
  Dashboard (full Pro/Ultra features + trial banner)
       |
  Day 7: Dodo auto-charges --> webhook fires subscription.active --> status=active
       |
  OR: User cancels --> webhook fires subscription.cancelled
       --> Access continues until trial_end
       --> After trial_end: downgrade to Basic (free), lock Pro/Ultra features, show upgrade banner
```

## Technical Changes

### 1. Database Migration

Update `has_active_subscription` and `get_active_plan` to recognize `trialing` as a valid status (only when `current_period_end > now()`):

```sql
CREATE OR REPLACE FUNCTION public.has_active_subscription(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = check_user_id
    AND active_plan IS NOT NULL
    AND (
      subscription_status = 'active'
      OR (subscription_status = 'trialing' AND current_period_end > now())
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_active_plan(check_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT active_plan FROM subscriptions
  WHERE user_id = check_user_id
  AND active_plan IS NOT NULL
  AND (
    subscription_status = 'active'
    OR (subscription_status = 'trialing' AND current_period_end > now())
  )
  LIMIT 1;
$$;
```

Add `trial_start` and `trial_end` columns for explicit tracking:

```sql
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS trial_start timestamptz,
  ADD COLUMN IF NOT EXISTS trial_end timestamptz;
```

### 2. `src/hooks/useSubscription.ts`

Update `hasActiveSubscription` to include trialing:

```typescript
const isTrialing = subscription?.subscription_status === 'trialing' &&
  !!subscription?.current_period_end &&
  new Date(subscription.current_period_end) > new Date();

const hasActiveSubscription = subscription?.active_plan != null && (
  subscription?.subscription_status === 'active' || isTrialing
);

const trialDaysRemaining = isTrialing && subscription?.current_period_end
  ? Math.max(0, Math.ceil(
      (new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ))
  : 0;
```

Expose `isTrialing`, `trialDaysRemaining` from the hook.

### 3. `supabase/functions/dodo-webhook/index.ts`

Handle `trialing` status in both `subscription.active` and `subscription.updated` cases. When Dodo sends `status: 'trialing'`, mirror it to the DB instead of hardcoding `'active'`. Also store `trial_start` and `trial_end` if provided by Dodo.

For `subscription.cancelled`:

- If currently trialing, keep `active_plan` intact until `current_period_end` (access continues through trial end)
- Set `subscription_status = 'canceled'` and `canceled_at`
- After `current_period_end` passes, the client-side check (`current_period_end > now()`) auto-expires access

### 4. `src/components/onboarding/PricingStage.tsx`

Update CTA copy for Pro/Ultra cards:

- Button text: "Start 7-Day Free Trial" (instead of "Select Pro")
- After plan selection, the existing Dodo checkout redirect remains the same
- For Basic: keep "Select Basic" with no trial mention
- Header subtitle: "Try Pro or Ultra free for 7 days. Cancel anytime."

### 5. `src/pages/Checkout.tsx`

- Update CTA button text: for Pro/Ultra show "Start 7-Day Free Trial -- $X/mo after" instead of "Proceed to Payment"
- For Basic: keep "Proceed to Payment -- $19/mo"
- Allow trialing users to access this page (to upgrade/change plan during trial)
- Update redirect logic:

```typescript
// Allow trialing users to visit checkout (to upgrade)
if (!subLoading && hasActiveSubscription && !isTrialing) {
  navigate('/dashboard', { replace: true });
}
```

### 6. `src/components/auth/SubscriptionGate.tsx`

Two changes:

1. Trial works automatically via updated `hasActiveSubscription` (no code change needed for active trials)
2. Update expired-trial copy: "Your free trial has ended. Choose a plan to continue using Certifyr."
3. After cancellation + trial expiry: the paywall shows since `hasActiveSubscription` returns false

### 7. New: `src/components/dashboard/TrialBanner.tsx`

Persistent banner during active trial:

- "You're on a 7-day Pro trial -- X days remaining" for Pro plans and edit for Ultra plan
- "Subscribe Now" button linking to `/checkout`
- Uses `isTrialing` and `trialDaysRemaining` from `useSubscription()`
- Dismissible per session via `sessionStorage`

### 8. `src/components/dashboard/DashboardLayout.tsx`

Render `<TrialBanner />` above main content area.

### 9. `update_subscription_from_webhook` RPC

Update to also accept and store `trial_start`/`trial_end`:

```sql
-- Add p_trial_start and p_trial_end parameters
-- Store them in the upsert
```

## Files Modified


| File                                           | Change                                                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Migration SQL                                  | `has_active_subscription`, `get_active_plan` recognize `trialing`; add `trial_start`/`trial_end` columns |
| `src/hooks/useSubscription.ts`                 | Expose `isTrialing`, `trialDaysRemaining`                                                                |
| `supabase/functions/dodo-webhook/index.ts`     | Mirror `trialing` status from Dodo; handle trial cancellation gracefully                                 |
| `src/components/onboarding/PricingStage.tsx`   | "Start 7-Day Free Trial" CTA for Pro/Ultra                                                               |
| `src/pages/Checkout.tsx`                       | Trial-aware CTA text; allow trialing users to visit page                                                 |
| `src/components/auth/SubscriptionGate.tsx`     | Expired trial copy                                                                                       |
| `src/components/dashboard/TrialBanner.tsx`     | New -- trial countdown banner                                                                            |
| `src/components/dashboard/DashboardLayout.tsx` | Render TrialBanner                                                                                       |


## What You Do NOT Touch

- No manual trial creation in the DB before checkout
- No client-side trial countdown logic (Dodo is source of truth)
- No duplicate trial state -- webhook mirrors Dodo exactly
- No changes to `planFeatures.ts` -- during trial, `activePlan = 'pro'` so all Pro checks pass

## Prerequisite Reminder

You must configure 7-day trial periods on Pro and Ultra products in the Dodo Payments dashboard before this goes live. Without that, Dodo will charge immediately instead of creating a trialing subscription. I have already set this up but I think it is not visible because it is not configured in our code. Dont change other app functionality. Ensure functionality for this trialing feature and code efficiency. 