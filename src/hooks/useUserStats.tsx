import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationId } from "./useOrganizationId";

interface UserStats {
  documentsCreated: number;
  portalMembers: number;
  requestedDocuments: number;
  totalVerifications: number;
}

/**
 * Hook to fetch organization-wide statistics with real-time updates
 * Queries directly from source tables for 100% accuracy
 */
export function useUserStats(refreshIndex?: number) {
  const { user } = useAuth();
  const { orgId, loading: orgLoading } = useOrganizationId();
  const [stats, setStats] = useState<UserStats>({
    documentsCreated: 0,
    portalMembers: 0,
    requestedDocuments: 0,
    totalVerifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || orgLoading) {
      return;
    }

    if (!orgId) {
      // User has no organization, set stats to 0
      setStats({
        documentsCreated: 0,
        portalMembers: 0,
        requestedDocuments: 0,
        totalVerifications: 0,
      });
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call the database function for accurate, atomic statistics
        const { data, error: rpcError } = await supabase.rpc(
          "get_organization_statistics",
          { org_id: orgId }
        );

        if (rpcError) {
          throw rpcError;
        }

        if (data && data.length > 0) {
          const result = data[0];
          setStats({
            documentsCreated: Number(result.documents_created) || 0,
            portalMembers: Number(result.portal_members) || 0,
            requestedDocuments: Number(result.requested_documents) || 0,
            totalVerifications: Number(result.total_verifications) || 0,
          });
        } else {
          setStats({
            documentsCreated: 0,
            portalMembers: 0,
            requestedDocuments: 0,
            totalVerifications: 0,
          });
        }
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to fetch statistics");
        setStats({
          documentsCreated: 0,
          portalMembers: 0,
          requestedDocuments: 0,
          totalVerifications: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscriptions for instant updates
    const channel = supabase
      .channel("organization-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "preview_generations",
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          fetchStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "organization_members",
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          fetchStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_requests",
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          fetchStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verified_documents",
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, orgId, orgLoading, refreshIndex]);

  return { stats, loading: loading || orgLoading, error };
}

// Legacy helper function - kept for backward compatibility but no longer used internally
export async function getOrganizationIdForUser(userId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error || !data?.organization_id) return null;
  return data.organization_id;
}

// Legacy helper function - kept for backward compatibility
export async function incrementUserStat({
  userId,
  organizationId,
  statField,
}: {
  userId: string;
  organizationId: string | null;
  statField: string;
}) {
  try {
    const { error } = await supabase.rpc("increment_user_stat", {
      p_user_id: userId,
      p_stat_field: statField,
      p_organization_id: organizationId || "",
    });
    if (error) {
      console.error("Error incrementing stat:", error);
    }
  } catch (error) {
    console.error("Unexpected error incrementing stat:", error);
  }
}
