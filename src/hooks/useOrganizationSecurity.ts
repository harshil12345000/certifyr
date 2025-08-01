
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface OrganizationMembership {
  organization_id: string;
  role: string;
  status: string;
}

export function useOrganizationSecurity() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }

    const fetchMembership = async () => {
      try {
        const { data, error } = await supabase
          .from("organization_members")
          .select("organization_id, role, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching organization membership:", error);
        }

        setMembership(data || null);
      } catch (err) {
        console.error("Unexpected error fetching membership:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [user]);

  const isAdmin = membership?.role === "admin";
  const organizationId = membership?.organization_id;

  const checkAdminAccess = (requiredOrgId?: string) => {
    if (!isAdmin) return false;
    if (requiredOrgId && organizationId !== requiredOrgId) return false;
    return true;
  };

  const checkOrganizationAccess = (requiredOrgId?: string) => {
    if (!membership) return false;
    if (requiredOrgId && organizationId !== requiredOrgId) return false;
    return true;
  };

  return {
    membership,
    loading,
    isAdmin,
    organizationId,
    checkAdminAccess,
    checkOrganizationAccess,
  };
}
