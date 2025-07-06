
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getOrganizationIdForUser } from "./useUserStats";

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
      }
    } catch (error) {
      console.error("Error tracking document creation:", error);
    }
  };

  return { trackDocumentCreation };
}
