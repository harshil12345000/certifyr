import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * SubscriptionGate wraps protected routes and ensures:
 * 1. User is authenticated
 * 2. User has an active_plan (set by Polar webhook)
 * 
 * If either condition fails, redirects appropriately.
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();

  const isLoading = authLoading || subLoading;

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated -> redirect to auth
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Authenticated but no active subscription -> redirect to checkout
    if (!hasActiveSubscription) {
      navigate('/checkout', { replace: true });
      return;
    }
  }, [isLoading, user, hasActiveSubscription, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if user has active subscription
  if (!user || !hasActiveSubscription) {
    return null;
  }

  return <>{children}</>;
}
