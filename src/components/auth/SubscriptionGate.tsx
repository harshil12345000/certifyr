import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription, Subscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * Strict SubscriptionGate — blocks ALL access unless user has an active subscription.
 * No sessionStorage bypass, no close button, no escape.
 * Checks on every render. Children are never rendered without active plan.
 * 
 * BASIC USERS: Always allowed through (regardless of subscription_status)
 * PRO/ULTRA USERS: Must have active subscription_status
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { subscription, hasActiveSubscription, isTrialing, loading: subLoading } = useSubscription();

  const isLoading = authLoading || subLoading;

  // Loading state - wait for auth to load
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying subscription...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect handled by ProtectedRoute, but guard anyway
  if (!user) {
    return null;
  }

  // Get the active plan
  const activePlan = subscription?.active_plan;
  const subscriptionStatus = subscription?.subscription_status;

  // Check if Basic plan - ALLOW ALWAYS
  const isBasicPlan = activePlan === 'basic';
  
  // Check if Pro or Ultra with active status
  const isProOrUltra = activePlan === 'pro' || activePlan === 'ultra';
  const isProUltraActive = isProOrUltra && (subscriptionStatus === 'active' || subscriptionStatus === 'trialing');

  // BASIC USERS: Allow through always (this is the freemium tier)
  // Also allow if no subscription exists yet (treat as Basic)
  if (isBasicPlan || !subscription) {
    return <>{children}</>;
  }

  // PRO/ULTRA: Must have active subscription
  if (!hasActiveSubscription || !isProUltraActive) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 rounded-xl border bg-card p-8 shadow-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Subscription Required
          </h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            {subscriptionStatus === 'trialing' || subscriptionStatus === 'canceled'
              ? 'Your free trial has ended. Choose a plan to continue using Certifyr.'
              : !activePlan
                ? 'You need a subscription to access Certifyr. Start with our free Basic plan or choose Pro/Ultra for more features.'
                : 'You need an active subscription to access Certifyr. Choose a plan to unlock all features and start creating documents.'}
          </p>
          <Button
            onClick={() => navigate('/checkout', { replace: true })}
            className="w-full h-11 font-semibold"
            size="lg"
          >
            Choose a Plan
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Plans start at $0/month with Basic. Cancel anytime.
          </p>
        </div>
      </div>
    );
  }

  // Active subscription — render protected content
  return <>{children}</>;
}
