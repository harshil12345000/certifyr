// Plan feature configuration and limits

export type PlanType = 'basic' | 'pro' | 'ultra';

export interface PlanLimits {
  maxAdmins: number | null; // null = unlimited
  maxPortalMembers: number | null; // null = unlimited
  maxDocumentsPerMonth: number | null; // null = unlimited, 25 for basic
}

export interface PlanFeatureSet {
  unlimitedDocuments: boolean;
  allTemplates: boolean;
  organizationBranding: boolean;
  basicSupport: boolean;
  qrVerification: boolean;
  requestPortal: boolean;
  prioritySupport: boolean;
  aiAssistant: boolean;
  customDocumentRequests: boolean;
}

// Plan hierarchy for upgrade checks (higher = better)
export const PLAN_HIERARCHY: Record<PlanType, number> = {
  basic: 1,
  pro: 2,
  ultra: 3,
};

// Plan limits
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  basic: {
    maxAdmins: 1,
    maxPortalMembers: 0, // No access
    maxDocumentsPerMonth: 25,
  },
  pro: {
    maxAdmins: 5,
    maxPortalMembers: 100,
    maxDocumentsPerMonth: null, // Unlimited
  },
  ultra: {
    maxAdmins: null, // Unlimited
    maxPortalMembers: null, // Unlimited
    maxDocumentsPerMonth: null, // Unlimited
  },
};

// Plan features
export const PLAN_FEATURES: Record<PlanType, PlanFeatureSet> = {
  basic: {
    unlimitedDocuments: true,
    allTemplates: true,
    organizationBranding: true,
    basicSupport: true,
    qrVerification: false,
    requestPortal: false,
    prioritySupport: false,
    aiAssistant: false,
    customDocumentRequests: false,
  },
  pro: {
    unlimitedDocuments: true,
    allTemplates: true,
    organizationBranding: true,
    basicSupport: true,
    qrVerification: true,
    requestPortal: true,
    prioritySupport: true,
    aiAssistant: false,
    customDocumentRequests: false,
  },
  ultra: {
    unlimitedDocuments: true,
    allTemplates: true,
    organizationBranding: true,
    basicSupport: true,
    qrVerification: true,
    requestPortal: true,
    prioritySupport: true,
    aiAssistant: true,
    customDocumentRequests: true,
  },
};

// Plan pricing
export const PLAN_PRICING: Record<string, { monthly: number; yearly: number; label: string }> = {
  basic: { monthly: 0, yearly: 0, label: 'Basic' },
  pro: { monthly: 49, yearly: 299, label: 'Pro' },
  ultra: { monthly: 99, yearly: 599, label: 'Ultra' },
};

// Plan metadata
export const PLAN_METADATA: Record<PlanType, { name: string; tagline: string; badge?: string }> = {
  basic: {
    name: 'Basic',
    tagline: 'Perfect for small teams and startups',
  },
  pro: {
    name: 'Pro',
    tagline: 'Ideal for medium teams and educational institutions',
    badge: 'Most Popular',
  },
  ultra: {
    name: 'Ultra',
    tagline: 'Suited for large organizations and corporates',
    badge: 'Enterprise',
  },
};

// Feature display names for UI
export const FEATURE_DISPLAY_NAMES: Record<keyof PlanFeatureSet, string> = {
  unlimitedDocuments: 'Unlimited Document Generations',
  allTemplates: 'All Templates Available',
  organizationBranding: 'Organization Branding',
  basicSupport: 'Basic Support',
  qrVerification: 'QR Verification',
  requestPortal: 'Request Portal',
  prioritySupport: 'Priority Email Support',
  aiAssistant: 'Agentic AI Assistant',
  customDocumentRequests: 'Custom Document Requests',
};

// Helper functions
export function canAccessFeature(plan: PlanType | null, feature: keyof PlanFeatureSet): boolean {
  if (!plan) return false;
  return PLAN_FEATURES[plan]?.[feature] ?? false;
}

export function getPlanLimits(plan: PlanType | null): PlanLimits {
  if (!plan) return PLAN_LIMITS.basic;
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.basic;
}

export function canUpgradeTo(currentPlan: PlanType | null, targetPlan: PlanType): boolean {
  if (!currentPlan) return true;
  return PLAN_HIERARCHY[targetPlan] > PLAN_HIERARCHY[currentPlan];
}

export function getRequiredPlanForFeature(feature: keyof PlanFeatureSet): PlanType {
  if (PLAN_FEATURES.basic[feature]) return 'basic';
  if (PLAN_FEATURES.pro[feature]) return 'pro';
  return 'ultra';
}
