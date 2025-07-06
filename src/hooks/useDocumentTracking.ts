
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizationIdForUser, incrementUserStat } from "./useUserStats";

export function useDocumentTracking() {
  const { user } = useAuth();

  const trackDocumentCreation = async () => {
    if (!user) return;
    
    try {
      const orgId = await getOrganizationIdForUser(user.id);
      if (orgId) {
        await incrementUserStat({
          userId: user.id,
          organizationId: orgId,
          statField: "documents_created"
        });
        console.log("Document creation tracked successfully");
      }
    } catch (error) {
      console.error("Error tracking document creation:", error);
    }
  };

  return { trackDocumentCreation };
}
