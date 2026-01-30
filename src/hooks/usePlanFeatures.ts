import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import {
  PlanType,
  PlanLimits,
  PlanFeatureSet,
  PLAN_FEATURES,
  PLAN_LIMITS,
  PLAN_HIERARCHY,
  canAccessFeature,
  getPlanLimits,
  canUpgradeTo,
  getRequiredPlanForFeature,
} from '@/config/planFeatures';

export interface UsePlanFeaturesReturn {
  // Current plan info
  activePlan: PlanType | null;
  loading: boolean;
  hasActiveSubscription: boolean;
  
  // Feature access
  hasFeature: (feature: keyof PlanFeatureSet) => boolean;
  features: PlanFeatureSet | null;
  
  // Limits
  limits: PlanLimits;
  
  // Upgrade info
  canUpgrade: boolean;
  canUpgradeTo: (targetPlan: PlanType) => boolean;
  getRequiredPlan: (feature: keyof PlanFeatureSet) => PlanType;
}

export function usePlanFeatures(): UsePlanFeaturesReturn {
  const { activePlan: rawActivePlan, loading, hasActiveSubscription } = useSubscription();
  
  // Normalize plan to valid type
  const activePlan = useMemo((): PlanType | null => {
    if (!rawActivePlan) return null;
    const plan = rawActivePlan.toLowerCase() as PlanType;
    if (plan === 'basic' || plan === 'pro' || plan === 'ultra') {
      return plan;
    }
    return null;
  }, [rawActivePlan]);
  
  // Get features for current plan
  const features = useMemo((): PlanFeatureSet | null => {
    if (!activePlan) return null;
    return PLAN_FEATURES[activePlan] ?? null;
  }, [activePlan]);
  
  // Get limits for current plan
  const limits = useMemo((): PlanLimits => {
    return getPlanLimits(activePlan);
  }, [activePlan]);
  
  // Check if user can upgrade (not on ultra)
  const canUpgradeFlag = useMemo((): boolean => {
    if (!activePlan) return true;
    return activePlan !== 'ultra';
  }, [activePlan]);
  
  // Feature access check
  const hasFeature = (feature: keyof PlanFeatureSet): boolean => {
    return canAccessFeature(activePlan, feature);
  };
  
  // Can upgrade to specific plan
  const checkCanUpgradeTo = (targetPlan: PlanType): boolean => {
    return canUpgradeTo(activePlan, targetPlan);
  };
  
  return {
    activePlan,
    loading,
    hasActiveSubscription,
    hasFeature,
    features,
    limits,
    canUpgrade: canUpgradeFlag,
    canUpgradeTo: checkCanUpgradeTo,
    getRequiredPlan: getRequiredPlanForFeature,
  };
}
