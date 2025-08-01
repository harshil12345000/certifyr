
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getOrganizationIdForUser, incrementUserStat } from "./useUserStats";

export function useDocumentTracking() {
  const { user } = useAuth();

  const trackDocumentCreation = async () => {
    if (!user) return;
    
    try {
      const orgId = await getOrganizationIdForUser(user.id);
      
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
        
        // Increment user_statistics for documentsCreated if organization exists
        if (orgId) {
          try {
            await incrementUserStat({
              userId: user.id,
              organizationId: orgId,
              statField: "documents_created",
            });
          } catch (statError) {
            console.error("Error incrementing user statistics:", statError);
          }
        } else {
          // If no organization, try to increment without organization_id (backward compatibility)
          try {
            const { error: legacyError } = await supabase.rpc("increment_user_stat", {
              p_user_id: user.id,
              p_organization_id: null,
              p_stat_field: "documents_created",
            });
            if (legacyError) {
              console.error("Error incrementing legacy user statistics:", legacyError);
            }
          } catch (legacyStatError) {
            console.error("Error with legacy stat increment:", legacyStatError);
          }
        }
      }
    } catch (error) {
      console.error("Error tracking document creation:", error);
    }
  };

  return { trackDocumentCreation };
}
