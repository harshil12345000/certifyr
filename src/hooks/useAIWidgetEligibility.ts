import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

export function useAIWidgetEligibility() {
  const { user } = useAuth();
  const { activePlan, loading } = useSubscription();
  
  if (loading) return false;
  if (!user) return false;
  
  return activePlan?.toLowerCase() === 'ultra';
}
