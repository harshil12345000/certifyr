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
    .eq("role", "admin")
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
      // Silently fail
    }
    } catch (error) {
    // Silently fail
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

        // Fetch all stats in parallel for better performance
        const [userStatsResult, previewGenerationsCount] = await Promise.all([
          // Get user statistics from user_statistics table
          (async () => {
            let userStats = null;
            
            // Try to get stats with organization_id first
            if (orgId) {
              const { data: orgStats } = await supabase
                .from("user_statistics")
                .select("total_verifications, requested_documents, portal_members")
                .eq("user_id", user.id)
                .eq("organization_id", orgId)
                .maybeSingle();
              
              if (orgStats) {
                userStats = orgStats;
              }
            }
            
            // If no stats found with organization_id, try without it (backward compatibility)
            if (!userStats) {
              const { data: legacyStats } = await supabase
                .from("user_statistics")
                .select("total_verifications, requested_documents, portal_members")
                .eq("user_id", user.id)
                .is("organization_id", null)
                .maybeSingle();
              
              if (legacyStats) {
                userStats = legacyStats;
              }
            }

            // If still no stats, create a new entry
            if (!userStats) {
              const { data: newStats, error: createError } = await supabase
                .from("user_statistics")
                .insert({
                  user_id: user.id,
                  organization_id: orgId,
                  total_verifications: 0,
                  requested_documents: 0,
                  portal_members: 0,
                })
                .select()
                .single();

              if (!createError && newStats) {
                userStats = newStats;
              }
            }

            return userStats;
          })(),

          // Get preview generations count
          (async () => {
            const query = supabase
              .from("preview_generations")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);

            // Add organization filter if available
            if (orgId) {
              query.eq("organization_id", orgId);
            } else {
              query.is("organization_id", null);
            }

            const { count } = await query;

            return count || 0;
          })()
        ]);

        // Set the stats with proper fallbacks
        setStats({
          documentsCreated: previewGenerationsCount,
          portalMembers: userStatsResult?.portal_members || 0,
          requestedDocuments: userStatsResult?.requested_documents || 0,
          totalVerifications: userStatsResult?.total_verifications || 0,
        });
      } catch (err) {
        setError("Failed to fetch user statistics");
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
  }, [user, refreshIndex]);

  return { stats, loading, error };
}
