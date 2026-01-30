import React from 'react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { PlanFeatureSet } from '@/config/planFeatures';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';

interface FeatureGateProps {
  feature: keyof PlanFeatureSet;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  const { hasFeature, loading, getRequiredPlan } = usePlanFeatures();

  if (loading) {
    return null; // Or a loading skeleton
  }

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // User doesn't have access to this feature
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    const requiredPlan = getRequiredPlan(feature);
    return <UpgradePrompt requiredPlan={requiredPlan} feature={feature} />;
  }

  return null;
}
