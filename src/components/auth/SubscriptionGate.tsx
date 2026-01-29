import { ReactNode, useEffect, useRef } from 'react';
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
 * Uses a session flag to only redirect to checkout once (prevents loops).
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const hasCheckedSubscription = useRef(false);

  const isLoading = authLoading || subLoading;

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated -> redirect to auth
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Check subscription only once per session to prevent redirect loops
    // If already checked in this component mount, don't redirect again
    if (hasCheckedSubscription.current) return;
    
    // Mark as checked
    hasCheckedSubscription.current = true;

    // Check sessionStorage flag to prevent loops across page loads
    const subscriptionChecked = sessionStorage.getItem('subscriptionCheckedOnce');
    
    // Authenticated but no active subscription -> redirect to checkout (only once)
    if (!hasActiveSubscription && subscriptionChecked !== 'true') {
      sessionStorage.setItem('subscriptionCheckedOnce', 'true');
      navigate('/checkout', { replace: true });
      return;
    }
  }, [isLoading, user, hasActiveSubscription, navigate]);

  // Clear the subscription check flag when subscription becomes active
  useEffect(() => {
    if (hasActiveSubscription) {
      sessionStorage.removeItem('subscriptionCheckedOnce');
    }
  }, [hasActiveSubscription]);

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

  // Allow access if user is authenticated (subscription check already done)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
