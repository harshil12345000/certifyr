

# Complete Pricing Plans Implementation with AI Agent Feature

## Overview

This plan implements a complete pricing-based feature gating system for Certifyr with three tiers: **Basic ($19/mo)**, **Pro ($49/mo)**, and **Ultra ($199/mo)**. The implementation enforces plan-based restrictions on features, updates pricing across all components, adds new Ultra-exclusive features including the AI Agent with Country Context Selector.

---

## Pricing Tiers Summary

### Basic Plan - $19/month
**Tagline:** "Perfect for small teams and startups"

| Feature | Included |
|---------|----------|
| Unlimited Document Generations | Yes |
| All Templates Available | Yes |
| Organization Branding | Yes |
| Basic Support | Yes |
| Admin Access | 1 (self only) |
| Request Portal | No |
| QR Verification | No |

### Pro Plan - $49/month (Most Popular)
**Tagline:** "Ideal for medium teams and educational institutions"

| Feature | Included |
|---------|----------|
| Everything in Basic | Yes |
| QR Verification | Yes |
| Admin Access | Up to 5 |
| Request Portal | Up to 100 Members |
| Priority Email Support | Yes |

### Ultra Plan - $199/month
**Tagline:** "Suited for large organizations and corporates"

| Feature | Included |
|---------|----------|
| Everything in Pro | Yes |
| Admin Access | Unlimited |
| Request Portal | Unlimited Members |
| Agentic AI Assistant | Yes |
| Custom Document Requests | Yes |

---

## Implementation Phases

### Phase 1: Update Pricing Configuration

#### 1.1 Update PricingStage Component
**File:** `src/components/onboarding/PricingStage.tsx`

Changes:
- Update pricing object: Basic $19, Pro $49, Ultra $199
- Update feature lists to match specifications above
- Add taglines for each plan
- Update yearly savings calculations

#### 1.2 Update Checkout Page
**File:** `src/pages/Checkout.tsx`

Changes:
- Update pricing object to match new values
- Update feature lists and taglines
- Update Polar product ID placeholders

---

### Phase 2: Create Plan Feature Gating System

#### 2.1 Create Plan Configuration File
**New File:** `src/config/planFeatures.ts`

```text
Contents:
- PLAN_FEATURES object defining what each plan includes
- PLAN_LIMITS object with admin count and portal member limits
- canAccessFeature(plan, feature) helper function
- getPlanLimits(plan) helper function
- Plan hierarchy for upgrade checks
```

#### 2.2 Create usePlanFeatures Hook
**New File:** `src/hooks/usePlanFeatures.ts`

```text
Hook that combines useSubscription with planFeatures config:
- activePlan: current user's plan
- hasFeature(featureName): boolean check
- limits: { maxAdmins, maxPortalMembers }
- canUpgrade: boolean
```

#### 2.3 Create FeatureGate Component
**New File:** `src/components/auth/FeatureGate.tsx`

```text
Reusable wrapper component:
<FeatureGate feature="qrVerification" fallback={<UpgradePrompt />}>
  <ProtectedContent />
</FeatureGate>
```

#### 2.4 Create UpgradePrompt Component
**New File:** `src/components/shared/UpgradePrompt.tsx`

```text
Displays when user tries to access gated feature:
- Lock icon
- Feature name
- Required plan
- "Upgrade Now" button linking to checkout
```

---

### Phase 3: Implement Feature Gates

#### 3.1 Sidebar Navigation Updates
**File:** `src/components/dashboard/Sidebar.tsx`

Changes:
- Add Request Portal nav item (Pro/Ultra only)
- Add AI Assistant nav item (Ultra only)
- Add lock icons or plan badges for unavailable features
- Use usePlanFeatures hook for visibility checks

#### 3.2 Request Portal Access Control
**File:** `src/pages/RequestPortal.tsx`

Changes:
- Basic plan: Show UpgradePrompt, block access
- Pro plan: Enforce 100 member limit with counter
- Ultra plan: Unlimited access

#### 3.3 QR Verification Feature Gate
**Files:** Template preview components

Changes:
- Basic plan: Hide QR or show placeholder with upgrade prompt
- Pro/Ultra: Show full QR verification functionality

#### 3.4 Admin Collaborator Limits
**File:** `src/components/admin/UserPermissionsPanel.tsx`

Changes:
- Basic: 1 admin only, disable invite button
- Pro: Up to 5 admins, show count (e.g., "3/5 admins")
- Ultra: Unlimited, no restrictions
- Show upgrade prompt when limit reached

---

### Phase 4: AI Agent Feature (Ultra-Only)

#### 4.1 Database Schema Update
**Migration Required**

```text
ALTER TABLE organizations 
ADD COLUMN ai_context_country TEXT DEFAULT 'global';
```

Stores the country context for AI-generated documents.

#### 4.2 Create Country Context Selector
**New File:** `src/components/ai-assistant/CountryContextSelector.tsx`

Component features:
- Popover trigger showing current selection (flag + country name)
- Search input for filtering countries
- ScrollArea with all 205 countries from `src/lib/countries.ts`
- "Global" option at top with Globe icon
- Check icon for selected item
- Auto-saves on selection

Visual layout:
```text
+---------------------------------------+
| [Globe] Global                    [v] |  <- Trigger Button
+---------------------------------------+
         |
         v
+---------------------------------------+
| [Search icon] Search country...       |
+---------------------------------------+
| [Globe] Global                   [x]  |  <- First option
+---------------------------------------+
| [Flag] Afghanistan                    |
| [Flag] Albania                        |
| [Flag] Algeria                        |
| ...                                   |
| [Flag] United States             [x]  |  <- Selected
| ...                                   |
+---------------------------------------+
```

#### 4.3 Create AI Context Hook
**New File:** `src/hooks/useAIContext.ts`

```text
interface UseAIContextReturn {
  contextCountry: string;
  loading: boolean;
  error: string | null;
  updateContextCountry: (country: string) => Promise<void>;
}
```

Fetches and updates `organizations.ai_context_country` via Supabase.

#### 4.4 Create AI Assistant Page
**New File:** `src/pages/AIAssistant.tsx`

Page sections:
1. **Header**: Title "AI Assistant" with subtitle
2. **Country Context Card**: CountryContextSelector with explanation
3. **Chat Area**: Placeholder for future AI chat implementation
4. **Feature Highlights**: List of upcoming AI capabilities

#### 4.5 Extend Countries Data
**File:** `src/lib/countries.ts`

Add helpers:
```text
export const GLOBAL_CONTEXT = { code: 'GLOBAL', name: 'Global', flag: '🌐' };
export const getCountryByName = (name: string) => countries.find(c => c.name === name);
export const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
```

---

### Phase 5: Custom Document Requests (Ultra-Only)

#### 5.1 Create Custom Request Form
**New File:** `src/components/request-portal/CustomRequestForm.tsx`

Features:
- Free-text document type input
- Description/requirements field
- Urgency selector
- Submit to admin for review

#### 5.2 Update Request Portal
**File:** `src/pages/RequestPortal.tsx`

Add "Custom Requests" tab for Ultra users to manage custom document requests.

---

### Phase 6: Settings Page - Subscription Display

#### 6.1 Add Subscription Card
**File:** `src/pages/Settings.tsx`

New card showing:
- Current plan name and status badge
- Renewal/expiration date
- Feature summary for current plan
- "Manage Subscription" button (billing portal)
- "Upgrade Plan" button (for Basic/Pro users)

---

### Phase 7: Add Routes

**File:** `src/App.tsx`

Add new protected routes:
```text
/ai-assistant -> AIAssistant (Ultra-only, handled in component)
```

---

## Files Summary

### New Files to Create
| File | Purpose |
|------|---------|
| `src/config/planFeatures.ts` | Plan configuration and limits |
| `src/hooks/usePlanFeatures.ts` | Feature access hook |
| `src/hooks/useAIContext.ts` | AI context management hook |
| `src/components/auth/FeatureGate.tsx` | Reusable feature gate component |
| `src/components/shared/UpgradePrompt.tsx` | Upgrade CTA component |
| `src/components/ai-assistant/CountryContextSelector.tsx` | Country dropdown with search |
| `src/pages/AIAssistant.tsx` | AI Assistant page (Ultra-only) |
| `src/components/request-portal/CustomRequestForm.tsx` | Custom document request form |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/onboarding/PricingStage.tsx` | Update pricing to $19/$49/$199 |
| `src/pages/Checkout.tsx` | Update pricing and features |
| `src/components/dashboard/Sidebar.tsx` | Add plan-based nav visibility |
| `src/pages/RequestPortal.tsx` | Add access control and member limits |
| `src/components/admin/UserPermissionsPanel.tsx` | Add admin limit enforcement |
| `src/pages/Settings.tsx` | Add subscription display card |
| `src/App.tsx` | Add /ai-assistant route |
| `src/lib/countries.ts` | Add helper functions |
| `src/components/onboarding/UpgradeCTA.tsx` | Update messaging for tiers |

### Database Migration
```text
ALTER TABLE organizations 
ADD COLUMN ai_context_country TEXT DEFAULT 'global';
```

---

## Technical Flow Diagrams

### Feature Access Check Flow
```text
User Action
    |
    v
usePlanFeatures hook
    |
    v
Check activePlan from useSubscription
    |
    v
Compare against planFeatures config
    |
    +---> Feature allowed -> Render content
    |
    +---> Feature blocked -> Render UpgradePrompt
```

### AI Context Update Flow
```text
User opens AI Assistant
    |
    v
useAIContext fetches organizations.ai_context_country
    |
    v
Display in CountryContextSelector
    |
    v
User selects new country
    |
    v
updateContextCountry() -> Supabase UPDATE
    |
    v
Future AI prompts include country context
```

---

## Implementation Order

1. **Phase 1**: Update pricing values (quick win, visible change)
2. **Phase 2**: Create feature gating infrastructure
3. **Phase 3**: Apply feature gates to existing features
4. **Phase 4**: Build AI Agent feature with country selector
5. **Phase 5**: Add custom document requests
6. **Phase 6**: Update Settings with subscription display
7. **Phase 7**: Add new routes and navigation

