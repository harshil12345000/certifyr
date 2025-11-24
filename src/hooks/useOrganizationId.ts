import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to safely get the organization ID for the current user
 * Handles multiple organization memberships by taking the first active admin membership
 * Returns null if no organization is found
 */
export function useOrganizationId() {
  const { user } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrgId(null);
      setLoading(false);
      return;
    }

    const fetchOrgId = async () => {
      try {
        const { data, error } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching organization ID:", error);
          setOrgId(null);
        } else {
          setOrgId(data?.organization_id || null);
        }
      } catch (err) {
        console.error("Unexpected error fetching organization ID:", err);
        setOrgId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgId();
  }, [user]);

  return { orgId, loading };
}
