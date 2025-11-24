import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationId } from "./useOrganizationId";

export function usePreviewTracking() {
  const { user } = useAuth();
  const { orgId } = useOrganizationId();

  const trackPreviewGeneration = async (templateId: string, actionType: 'generate' | 'update') => {
    if (!user) return;
    
    try {

      // Insert preview generation record
      const { error } = await supabase
        .from("preview_generations")
        .insert({
          user_id: user.id,
          organization_id: orgId,
          template_id: templateId,
          action_type: actionType,
        });

      if (error) {
        console.error("Error tracking preview generation:", error);
      } else {
        console.log(`Preview ${actionType} tracked successfully for template: ${templateId}`);
      }
    } catch (error) {
      console.error("Error tracking preview generation:", error);
    }
  };

  return { trackPreviewGeneration };
} 