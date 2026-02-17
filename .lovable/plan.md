

# Plan: Strict Subscription Paywall

## Problem
Currently, users can bypass the paywall in multiple ways:
1. Only `/dashboard` is wrapped with `SubscriptionGate` -- all other routes (`/documents`, `/settings`, `/history`, `/organization`, etc.) only use `ProtectedRoute` which checks auth but NOT subscription status.
2. `SubscriptionGate` uses a `sessionStorage` flag (`subscriptionCheckedOnce`) that, after one check, permanently lets the user through for the rest of the session -- even without a subscription.
3. The Checkout page has a "Back to login" button, giving users an escape route.

## Solution

### 1. Wrap ALL protected routes with `SubscriptionGate` (in `App.tsx`)
Every route that currently uses `<ProtectedRoute>` (except `/checkout` and `/checkout/success`) will also be wrapped with `<SubscriptionGate>`. This ensures no route is accessible without an active plan.

### 2. Rewrite `SubscriptionGate` to be strict and unbypassable
- Remove the `sessionStorage` flag hack entirely. Instead, the gate will **always** check subscription status on every render.
- If user has no active subscription, **do not render children at all**. Instead, render a full-screen, unskippable modal overlay with:
  - A message: "Subscription Required" / "Complete your subscription to access Certifyr"
  - A single "Subscribe Now" button that navigates to `/checkout`
  - No close button, no backdrop click dismiss, no escape key
- This modal approach means even if navigation somehow reaches a protected page, the content is never shown.

### 3. Remove "Back to login" from Checkout page
Remove the back-to-login link at the bottom of `src/pages/Checkout.tsx` so users cannot escape the checkout flow.

### 4. Harden the Auth page login flow
In `src/pages/Auth.tsx`, after successful login, check if the user has an active subscription. If not, redirect to `/checkout` instead of `/dashboard`. This prevents the gap between login and payment.

## Technical Details

### Files to Edit

**`src/components/auth/SubscriptionGate.tsx`** -- Complete rewrite:
- Remove `sessionStorage` flag logic
- Remove `useRef` workaround
- On every render: if `!hasActiveSubscription` and not loading, show a blocking full-screen overlay (not a dismissable dialog) with a "Subscribe Now" button
- The overlay uses a fixed full-screen div with high z-index, no close mechanism
- Children are never rendered if subscription is inactive

**`src/App.tsx`** -- Wrap all protected routes:
- Add `<SubscriptionGate>` inside every `<ProtectedRoute>` for routes: `/documents`, `/old-documents`, `/documents/:id`, `/document-builder/:id`, `/templates/:id`, `/templates/:id/edit`, `/request-portal`, `/ai-assistant`, `/organization`, `/organization/*`, `/admin/*`, `/settings`, `/history`, `/temp-doc/bonafide`, `/bookmarks`
- Leave `/checkout` and `/checkout/success` without `SubscriptionGate`

**`src/pages/Checkout.tsx`** -- Remove the "Back to login" button/link at the bottom of the page (lines ~280-288).

### No Database Changes Required
The subscription check already uses the existing `subscriptions` table and `useSubscription` hook which queries `active_plan` and `subscription_status`.

### Security Notes
- The paywall is client-side UI enforcement. Backend data is already protected by RLS policies on all tables.
- The `SubscriptionGate` ensures no app content is ever rendered without a valid subscription, even on refresh or direct URL navigation.
- `sessionStorage` bypass is fully eliminated.
