import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getOrganizationIdForUser, incrementUserStat } from "./useUserStats";

export function useDocumentTracking() {
  const { user } = useAuth();

  const trackDocumentCreation = async () => {
    if (!user) return;
    
    try {
      const orgId = await getOrganizationIdForUser(user.id);
      if (!orgId) return;

      // Insert a new document record to track creation
      const { error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          name: "Document Preview Generated",
          type: "Preview",
          status: "Created",
        });

      if (error) {
        console.error("Error tracking document creation:", error);
      } else {
        console.log("Document creation tracked successfully");
        // Increment user_statistics for documentsCreated
        try {
          // Use the incrementUserStat helper
          await incrementUserStat({
            userId: user.id,
            organizationId: orgId,
            statField: "documents_created", // Make sure this matches your DB field
          });
        } catch (statError) {
          console.error("Error incrementing user statistics:", statError);
        }
      }
    } catch (error) {
      console.error("Error tracking document creation:", error);
    }
  };

  return { trackDocumentCreation };
}
