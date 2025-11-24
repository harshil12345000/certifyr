import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationId } from "./useOrganizationId";

interface ActivityData {
  name: string;
  Documents: number;
}

/**
 * Hook to fetch organization-wide activity data with real-time updates
 * Shows activity across all organization members for the last 7 months
 */
export function useUserActivity(refreshIndex?: number) {
  const { user } = useAuth();
  const { orgId, loading: orgLoading } = useOrganizationId();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || orgLoading) {
      return;
    }

    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate the last 7 months
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const activityByMonth: { [key: string]: number } = {};

        // Initialize last 7 months with 0
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = monthNames[date.getMonth()];
          activityByMonth[monthKey] = 0;
        }

        // Fetch organization-wide preview generation data for the last 7 months
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);

        // Build query with proper null handling
        let query = supabase
          .from("preview_generations")
          .select("created_at")
          .gte("created_at", sevenMonthsAgo.toISOString());

        // Add organization filter correctly (no user_id filter - organization-wide)
        if (orgId) {
          query = query.eq("organization_id", orgId);
        } else {
          query = query.is("organization_id", null);
        }

        const { data: previewGenerations, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        // Count preview generations by month
        if (previewGenerations && previewGenerations.length > 0) {
          previewGenerations.forEach((generation) => {
            const generationDate = new Date(generation.created_at);
            const monthKey = monthNames[generationDate.getMonth()];
            if (activityByMonth.hasOwnProperty(monthKey)) {
              activityByMonth[monthKey]++;
            }
          });
        }

        // Convert to array format for chart
        const chartData: ActivityData[] = Object.entries(activityByMonth).map(
          ([name, Documents]) => ({
            name,
            Documents,
          })
        );

        setActivityData(chartData);
      } catch (err) {
        console.error("Error fetching activity data:", err);
        setError("Failed to fetch activity data");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
        setActivityData(
          months.map((month) => ({ name: month, Documents: 0 }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();

    // Set up real-time subscription for instant activity updates
    if (orgId) {
      const channel = supabase
        .channel("organization-activity")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "preview_generations",
            filter: `organization_id=eq.${orgId}`,
          },
          () => {
            fetchActivityData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, orgId, orgLoading, refreshIndex]);

  return { activityData, loading: loading || orgLoading, error };
}
