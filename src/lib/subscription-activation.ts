import { supabase } from "@/integrations/supabase/client";

interface ActivationResult {
  success: boolean;
  error?: string;
}

export const activateBasicPlan = async (
  userId: string,
): Promise<ActivationResult> => {
  const { data, error } = await supabase.rpc("create_free_subscription", {
    p_user_id: userId,
    p_plan: "basic",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as { success?: boolean; error?: string } | null;
  if (result?.success === false) {
    return {
      success: false,
      error: result.error || "Failed to activate Basic plan",
    };
  }

  return { success: true };
};
