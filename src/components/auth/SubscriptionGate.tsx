import { ReactNode, useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { activateBasicPlan } from "@/lib/subscription-activation";

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * SubscriptionGate - automatically creates Basic subscription for users without one
 * The 25 preview limit is enforced at the document level
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, refetch } = useSubscription();
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

  // Auto-create Basic subscription for users without one
  useEffect(() => {
    const createBasicSubscription = async () => {
      if (!user || subscription || subLoading) return;

      // Only create if user is authenticated and has no subscription
      setIsCreatingSubscription(true);
      try {
        const result = await activateBasicPlan(user.id);
        if (!result.success) {
          throw new Error(
            result.error || "Failed to create Basic subscription",
          );
        }

        await refetch();
      } catch (err) {
        console.error("Error creating basic subscription:", err);
      } finally {
        setIsCreatingSubscription(false);
      }
    };

    createBasicSubscription();
  }, [user, subscription, subLoading, refetch]);

  const isLoading = authLoading || subLoading || isCreatingSubscription;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - return null (ProtectedRoute handles redirect)
  if (!user) {
    return null;
  }

  // Authenticated user - allow through
  return <>{children}</>;
}
