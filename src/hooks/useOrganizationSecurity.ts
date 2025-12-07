
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
        // Use maybeSingle() to handle cases with no results or multiple memberships
        const { data, error } = await supabase
          .from("organization_members")
          .select("organization_id, role, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching organization membership:", error);
          setMembership(null);
        } else {
          setMembership(data || null);
        }
      } catch (err) {
        console.error("Unexpected error fetching membership:", err);
        setMembership(null);
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
