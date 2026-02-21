import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

export function useAIWidgetEligibility() {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  
  if (loading) return false;
  if (!user) return false;
  
  return subscription?.active_plan?.toLowerCase() === 'ultra';
}
