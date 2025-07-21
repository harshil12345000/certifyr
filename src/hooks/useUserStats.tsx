import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserStats {
  documentsCreated: number;
  portalMembers: number;
  requestedDocuments: number;
  totalVerifications: number;
}

// Add helper to get organization_id for the current user
export async function getOrganizationIdForUser(userId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .single();
  if (error || !data?.organization_id) return null;
  return data.organization_id;
}

// Add helper to increment a stat in user_statistics
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
      p_organization_id: organizationId,
      p_stat_field: statField,
    });
    if (error) {
      console.error(`Error incrementing ${statField}:`, error);
    }
  } catch (error) {
    console.error(`Error incrementing ${statField}:`, error);
  }
}

export function useUserStats(refreshIndex?: number) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    documentsCreated: 0,
    portalMembers: 0,
    requestedDocuments: 0,
    totalVerifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user's organization
        const orgId = await getOrganizationIdForUser(user.id);
        
        // Get user statistics from user_statistics table
        let userStats = null;
        if (orgId) {
          // Try to get stats with organization_id first
          const { data: orgStats, error: orgStatsError } = await supabase
            .from("user_statistics")
            .select("documents_created, total_verifications, requested_documents, portal_members")
            .eq("user_id", user.id)
            .eq("organization_id", orgId)
            .single();
          
          if (!orgStatsError && orgStats) {
            userStats = orgStats;
          }
        }
        
        // If no stats found with organization_id, try without it (backward compatibility)
        if (!userStats) {
          const { data: legacyStats, error: legacyStatsError } = await supabase
            .from("user_statistics")
            .select("documents_created, total_verifications, requested_documents, portal_members")
            .eq("user_id", user.id)
            .is("organization_id", null)
            .single();
          
          if (!legacyStatsError && legacyStats) {
            userStats = legacyStats;
          }
        }

        // Get actual preview generations count (this is what "Documents Created" should show)
        const { count: previewGenerationsCount } = await supabase
          .from("preview_generations")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Use the preview generations count for documents created
        const documentsCreated = previewGenerationsCount || 0;

        // Get other stats from user_statistics table
        const totalVerifications = userStats?.total_verifications || 0;
        const requestedDocuments = userStats?.requested_documents || 0;
        const portalMembers = userStats?.portal_members || 0;

        setStats({
          documentsCreated,
          portalMembers,
          requestedDocuments,
          totalVerifications,
        });
      } catch (err) {
        console.error("Error fetching user stats:", err);
        setError("Failed to fetch user statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, refreshIndex]);

  return { stats, loading, error };
}
