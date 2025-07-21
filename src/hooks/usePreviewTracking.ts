import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function usePreviewTracking() {
  const { user } = useAuth();

  const trackPreviewGeneration = async (templateId: string, actionType: 'generate' | 'update') => {
    if (!user) return;
    
    try {
      // Get user's organization
      const { data: orgData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      const organizationId = orgData?.organization_id || null;

      // Insert preview generation record
      const { error } = await supabase
        .from("preview_generations")
        .insert({
          user_id: user.id,
          organization_id: organizationId,
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