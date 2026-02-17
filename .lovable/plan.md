

# Plan: Subscription Management Tab in Organization Page

## Overview
Add a "Subscription" tab after "Announcements" in the Organization page that displays the current plan details, billing info, and provides options to upgrade, change, or cancel the subscription via Dodo Payments API.

## What You Will See

**New "Subscription" tab** with:
- Current plan name, status badge (active/canceled/on_hold), and billing period (monthly/yearly)
- Subscription start date and next billing date
- Current amount being paid
- A "savings" tooltip showing how much money has been saved by staying subscribed (psychological retention)
- **Upgrade/Change Plan** section: shows available plans with a button to switch. Uses Dodo's `POST /subscriptions/{id}/change-plan` API
- **Cancel Subscription** section: a destructive action with confirmation dialog. Uses Dodo's `PATCH /subscriptions/{id}` with `cancel_at_next_billing_date: true` so cancellation takes effect at the end of the current billing cycle

## Technical Details

### 1. New Edge Function: `manage-subscription`
**File:** `supabase/functions/manage-subscription/index.ts`

Handles two actions via POST:
- **`change-plan`**: Calls Dodo Payments `POST /subscriptions/{subscription_id}/change-plan` with the new `product_id`. Uses `on_payment_failure: "prevent_change"` for safety.
- **`cancel`**: Calls Dodo Payments `PATCH /subscriptions/{subscription_id}` with `cancel_at_next_billing_date: true`. Updates the local `subscriptions` table to reflect pending cancellation.
- **`get-details`**: Calls Dodo Payments `GET /subscriptions/{subscription_id}` to fetch live subscription status, billing dates, and amount.

Authentication: Validates JWT, fetches the user's `polar_subscription_id` from the `subscriptions` table, and uses the `DODO_PAYMENTS_API_KEY` secret (already configured).

### 2. New Component: `SubscriptionManagementPanel`
**File:** `src/components/admin/SubscriptionManagementPanel.tsx`

Displays:
- Plan badge with status indicator
- Billing period and price from `PLAN_PRICING` config
- `current_period_start` and `current_period_end` from the subscriptions table
- Savings tooltip: calculates `(monthly_price * months_subscribed) - total_paid` for yearly plans
- Upgrade cards (only shows plans higher than current, since downgrades are not supported per policy)
- Cancel button with two-step confirmation dialog warning that cancellation applies at end of billing cycle

Uses existing hooks: `useSubscription` for local data, calls `manage-subscription` edge function for Dodo API operations.

### 3. Update `Admin.tsx`
- Add a new `TabsTrigger` with value `"subscription"` after "Announcements"
- Add corresponding `TabsContent` rendering `SubscriptionManagementPanel`
- Pass `organizationId` to the panel component

### 4. Update Webhook Handler
- In `supabase/functions/dodo-webhook/index.ts`, the existing `subscription.updated` and `subscription.cancelled` handlers already update the local database correctly. No changes needed -- plan changes and cancellations from Dodo will automatically sync via webhooks.

### 5. Dodo Payments API Calls (in edge function)

**Change Plan:**
```text
POST https://live.dodopayments.com/subscriptions/{subscription_id}/change-plan
Body: { "product_id": "<new_product_id>", "on_payment_failure": "prevent_change" }
```

**Cancel Subscription:**
```text
PATCH https://live.dodopayments.com/subscriptions/{subscription_id}
Body: { "cancel_at_next_billing_date": true }
```

**Get Subscription:**
```text
GET https://live.dodopayments.com/subscriptions/{subscription_id}
```

### Files to Create
- `supabase/functions/manage-subscription/index.ts`
- `src/components/admin/SubscriptionManagementPanel.tsx`

### Files to Edit
- `src/pages/Admin.tsx` (add tab trigger + content)
- `supabase/config.toml` (add `[functions.manage-subscription]` with `verify_jwt = false`)

### No Database Changes Required
All needed columns (`active_plan`, `subscription_status`, `polar_subscription_id`, `current_period_start`, `current_period_end`, `canceled_at`) already exist in the `subscriptions` table.

