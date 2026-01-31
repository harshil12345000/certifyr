

# Certifyr Implementation To-Do List - Comprehensive Plan

## Executive Summary

This plan addresses 8 key implementation tasks for the Certifyr application, covering onboarding optimization, payment integration, access control, user management, template fixes, document approval logic, and admin features. The tasks are organized by priority and dependency.

---

## Current State Analysis

### Key Findings from Codebase Exploration

**Onboarding Flow (4 stages)**
- PersonalInfoStage → OrganizationInfoStage → PasswordStage → PricingStage
- Total 4 screens before account creation - can be optimized

**Payment Infrastructure**
- Polar.sh webhook exists at `supabase/functions/polar-webhook/index.ts`
- Handles `subscription.created`, `subscription.updated`, `subscription.active`, `subscription.canceled`, `subscription.revoked`
- Current issue: `mapProductToPlan()` function only maps to `basic` or `pro`, missing `ultra`
- Product IDs are placeholders (`POLAR_BASIC_MONTHLY_PRODUCT_ID`, etc.)

**Request Portal Access Control**
- Sidebar shows Request Portal with "Pro" badge but doesn't fully block access
- `FeatureGate` component exists but not used at page level for RequestPortal
- Basic users can still navigate to `/request-portal` directly

**QR Code & Signature Logic**
- `shouldBlur` variable already exists in all 24 template preview components
- Logic: `const shouldBlur = isEmployeePreview && requestStatus !== "approved"`
- QR codes are generated even when status is pending (only blurred, not hidden)

**Template Spacing**
- `DynamicForm` has `space-y-3` and `gap-4` for form fields
- No excessive spacing visible in code - may need visual inspection

**Member Counter**
- `RequestPortalMembers` displays member list but no counter showing limits
- Plan limits defined in `planFeatures.ts`: Pro = 100, Ultra = unlimited

**Admin Features**
- Current roles: Only `admin` role exists in `organization_members` table
- No `owner` or `member` roles implemented
- `UserPermissionsPanel` is fully blurred/locked with a 🔒 overlay


---

### Task 2: Setup Payments - Polar.sh (Priority: 5)

**Current State**: 
- Webhook function exists but incomplete
- `mapProductToPlan()` missing `ultra` mapping
- Product IDs are placeholders

**Changes Required**:

| File | Action |
|------|--------|
| `supabase/functions/polar-webhook/index.ts` | Fix `mapProductToPlan()` to include `ultra` |
| `src/pages/Checkout.tsx` | Replace placeholder product IDs with real Polar IDs |
| `supabase/functions/polar-webhook/index.ts` | Add `checkout.completed` event handling |

**Webhook Events to Handle**:

```text
checkout.completed → Create subscription record with selected_plan
subscription.created/active → Set active_plan, subscription_status = 'active'
subscription.updated → Update plan tier if changed
subscription.canceled → Set subscription_status = 'canceled', clear active_plan
```

**mapProductToPlan Fix**:
```text
Current:
- pro → "pro"
- basic → "basic"
- default → "basic"

Fixed:
- ultra → "ultra"  (ADD THIS)
- pro → "pro"
- basic → "basic"
- default → "basic"
```

**Failed Payment Handling**:
- On `subscription.canceled` or `subscription.revoked`:
  - Set `subscription_status = 'canceled'`
  - Set `active_plan = null`
  - User will be redirected to checkout on next dashboard visit

**Acceptance Criteria**:
- Plan changes reflect immediately via webhook
- Failed payments downgrade access gracefully

---

### Task 3: Request Portal Access Control (Priority: 2)

**Current State**:
- Sidebar shows Request Portal with "Pro" badge
- Page loads for all users (no server-side protection)
- `FeatureGate` component exists but not applied at page level

**Changes Required**:

| File | Action |
|------|--------|
| `src/pages/RequestPortal.tsx` | Wrap entire page content with `FeatureGate` |
| `src/components/dashboard/Sidebar.tsx` | Hide Request Portal completely for basic users |
| `src/App.tsx` | Keep route but let FeatureGate handle access |

**Implementation**:

RequestPortal.tsx:
```text
1. Import FeatureGate and UpgradePrompt
2. Wrap page content with <FeatureGate feature="requestPortal">
3. Show UpgradePrompt for basic users
```

Sidebar.tsx:
```text
Change from: Show with "Pro" badge and locked state
Change to: Completely hide for basic users (filter out from navItems)
```

**Acceptance Criteria**:
- Basic users cannot see Request Portal in sidebar
- Direct URL access shows UpgradePrompt, not page content

---

### Task 4: Make harshilsav1@gmail.com an Ultra User (Priority: 5)

**Current State**: 
- User email not found in `user_profiles` table (user may not exist yet)
- Subscriptions table has `selected_plan` but no `active_plan` set

**Actions Required**:

**If user exists**:
1. Find user_id from user_profiles table
2. Insert/update subscription with:
   - `active_plan = 'ultra'`
   - `subscription_status = 'active'`
   - `current_period_end = NULL` (never expires)

**If user doesn't exist**:
1. Wait for user to sign up
2. Use SQL migration to automatically grant ultra access after signup

**SQL to Execute**:
```sql
-- Grant ultra access to harshilsav1@gmail.com
INSERT INTO subscriptions (
  user_id,
  active_plan,
  selected_plan,
  subscription_status,
  current_period_end
)
SELECT 
  user_id,
  'ultra',
  'ultra',
  'active',
  '2099-12-31T23:59:59Z'  -- Far future date
FROM user_profiles
WHERE email = 'harshilsav1@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  active_plan = 'ultra',
  selected_plan = 'ultra',
  subscription_status = 'active',
  current_period_end = '2099-12-31T23:59:59Z';
```

**Acceptance Criteria**:
- Full Ultra access without payment
- Access persists across sessions

---

### Task 5: Fix Request Portal Templates (Priority: 4)

**Current State**:
- `DynamicForm` uses `space-y-3` and `gap-4`
- Excessive spacing reported
- REDO THE WHOLE REQUEST PORTAL SIDE 'DOCUMENTS' UI, when clicking a document specific

**Changes Required**:

| File | Action |
|------|--------|
| `src/components/templates/DynamicForm.tsx` | Reduce spacing between sections |
| Template preview components | Normalize vertical spacing |

**Spacing Fixes**:
```text
DynamicForm.tsx:
- Change `space-y-3` to `space-y-2` for form
- Change `space-y-2` to `space-y-1` for sections
- Keep `gap-4` for grid items (needed for touch targets)
```

**Section Grouping**:
- Add visual dividers between logical sections
- Use consistent padding/margins across all templates

**Acceptance Criteria**:
- Templates render compact, readable, and production-ready
- No excessive vertical gaps between fields

---

### Task 6: QR Code & Signature Approval Logic (Priority: 3)

**Current State**:
- `shouldBlur` logic exists in all 24 template components
- QR codes are GENERATED even for pending status (only blurred)
- Signature shows with blur overlay

**Problem**:
- QR verification entry is created in `verified_documents` table before approval
- QR code can be scanned (link works) even when blurred

**Changes Required**:

| File | Action |
|------|--------|
| All template preview layouts | Gate QR generation, not just display |
| `src/lib/qr-utils.ts` | Return null/empty for non-approved documents |

**Fix Pattern for Each Layout**:

```text
Before:
useEffect(() => {
  const generateQR = async () => {
    const url = await generateDocumentQRCode(...);
    setQrCodeUrl(url);
  };
  generateQR();
}, []);

After:
useEffect(() => {
  // Only generate QR for approved documents
  if (isEmployeePreview && requestStatus !== "approved") {
    setQrCodeUrl(null);
    return;
  }
  const generateQR = async () => {
    const url = await generateDocumentQRCode(...);
    setQrCodeUrl(url);
  };
  generateQR();
}, [isEmployeePreview, requestStatus]);
```

**Affected Files** (all 24):
- `CertificateLayout.tsx`
- `LetterLayout.tsx`
- `AgreementLayout.tsx`
- `TranscriptLayout.tsx`
- All individual preview components

**Signature Fix**:
```text
Before: Render signature with blur if not approved
After: Don't render signature at all if not approved (show placeholder)
```

**Acceptance Criteria**:
- No QR code generated for pending/rejected requests
- No signature rendered for pending/rejected requests
- No `verified_documents` entry created until approval

---

### Task 7: Admin Portal Member Counter (Priority: 6)

**Current State**:
- `RequestPortalMembers` shows list but no limit indicator
- Limits defined in `planFeatures.ts`: Pro = 100, Ultra = unlimited
- Add a rounded rectangle on top right of the Request Portal page (admin Side) with counter like (X / 100) for pro or (X / ∞) for ultra.

**Changes Required**:

| File | Action |
|------|--------|
| `src/pages/RequestPortal.tsx` | Add member counter header |
| `src/components/request-portal/RequestPortalMembers.tsx` | Display limit info |

**Counter Display**:
```text
Pro users: "Portal Members (45 / 100)"
Ultra users: "Portal Members (45 / Unlimited)"
Basic users: Should not see this page (blocked by FeatureGate)
```

**Implementation**:
1. Use `usePlanFeatures()` to get current plan limits
2. Pass `maxMembers` limit to `RequestPortalMembers` component
3. Display counter in card header
4. Add warning when approaching limit (90%)
5. Block adding new members when at limit (Pro only)

**Acceptance Criteria**:
- Counter updates in real time when members added/removed
- Hard cap of 100 enforced for Pro users
- Clear visual indication of limit status

---

### Task 8: Admins Feature - Role System (Priority: 6)

**Current State**:
- Only `admin` role exists in `organization_members.role`
- `UserPermissionsPanel` is completely locked with blur overlay
- No differentiation between owner and invited admins

**Proposed Role Hierarchy**:

| Role | Permissions |
|------|-------------|
| `owner` | Full access, can remove admins, delete org, billing |
| `admin` | View portal members, approve/reject requests, manage templates |
| `member` | View only (future implementation) |

**Database Changes Required**:

```sql
-- Add owner role support
-- No schema change needed - role column already TEXT

-- Migration: Set first admin of each org as owner
UPDATE organization_members om
SET role = 'owner'
WHERE om.role = 'admin'
AND om.created_at = (
  SELECT MIN(created_at) 
  FROM organization_members 
  WHERE organization_id = om.organization_id 
  AND role = 'admin'
);
```

**Code Changes**:

| File | Action |
|------|--------|
| `src/components/admin/UserPermissionsPanel.tsx` | Remove blur overlay, implement role-based UI |
| `src/hooks/useOrganizationSecurity.ts` | Add `isOwner` check |
| `src/config/planFeatures.ts` | Add admin limit enforcement |
| `supabase/functions/invite-collaborator/index.ts` | Check admin limit before invite |

**UserPermissionsPanel Changes**:
1. Remove the blur overlay (lines 259-418)
2. Show admin count: "Admins (3 / 5)" for Pro
3. Disable invite button when at limit
4. Only owner can remove other admins

**Acceptance Criteria**:
- Role-based access enforced frontend and backend
- Owner can add or remove admins
- Admin limits enforced per plan (Basic: 1, Pro: 5, Ultra: unlimited)

---

## Suggested Execution Order

Based on dependencies and impact:

| Order | Task | Reason |
|-------|------|--------|
| 1 | Task 3: Gate request portal access | Security - blocks unauthorized access |
| 2 | Task 6: Fix QR/signature approval logic | Security - prevents premature verification |
| 3 | Task 5: Fix request templates | User experience improvement |
| 4 | Task 2: Integrate Polar payments | Monetization - enables subscriptions |
| 5 | Task 4: Grant Ultra access | Testing - enables full feature testing |
| 6 | Task 8: Add admin features and counters | Feature completeness |
| 7 | Task 7: Add member counter | Feature completeness |

---

## Technical Dependencies

```text
Task 2 (Payments) 
  └── Task 4 (Ultra access) - Can be done via SQL without payments

Task 3 (Request Portal gate)
  └── Task 8 (Admin features) - Both need plan limits

Task 6 (QR approval logic)
  └── Independent - Can be done first

Task 7 (Member counter)
  └── Task 8 (Roles) - Needs plan feature hook
```

---

## Files Summary

### Files to Create
- `src/components/onboarding/AccountInfoStage.tsx` (combined personal + org)

### Files to Modify

| File | Tasks |
|------|-------|
| `supabase/functions/polar-webhook/index.ts` | 2 |
| `src/pages/Checkout.tsx` | 2 |
| `src/pages/RequestPortal.tsx` | 3, 7 |
| `src/components/dashboard/Sidebar.tsx` | 3 |
| `src/components/templates/layouts/CertificateLayout.tsx` | 6 |
| `src/components/templates/layouts/LetterLayout.tsx` | 6 |
| `src/components/templates/layouts/AgreementLayout.tsx` | 6 |
| `src/components/templates/layouts/TranscriptLayout.tsx` | 6 |
| `src/components/templates/DynamicForm.tsx` | 5 |
| `src/components/request-portal/RequestPortalMembers.tsx` | 7 |
| `src/components/admin/UserPermissionsPanel.tsx` | 8 |
| `src/pages/Onboarding.tsx` | 1 |
| `src/components/onboarding/OnboardingProgress.tsx` | 1 |

### Database Migrations
1. Grant ultra access to harshilsav1@gmail.com
2. Set first admin as owner for existing orgs
