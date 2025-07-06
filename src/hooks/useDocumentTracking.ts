
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizationIdForUser, trackMonthlyDocumentCreation } from "./useUserStats";

export function useDocumentTracking() {
  const { user } = useAuth();

  const trackDocumentCreation = async () => {
    if (!user) return;
    
    try {
      const orgId = await getOrganizationIdForUser(user.id);
      if (orgId) {
        await trackMonthlyDocumentCreation(user.id, orgId);
        console.log("Document creation tracked successfully");
      }
    } catch (error) {
      console.error("Error tracking document creation:", error);
    }
  };

  return { trackDocumentCreation };
}
