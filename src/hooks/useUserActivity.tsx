
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizationIdForUser } from "./useUserStats";

interface ActivityData {
  name: string;
  documents: number;
}

export function useUserActivity(refreshIndex?: number) {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's organization
        const orgId = await getOrganizationIdForUser(user.id);
        if (!orgId) {
          // Set empty data if no organization
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
          setActivityData(months.map((month) => ({ name: month, documents: 0 })));
          setLoading(false);
          return;
        }

        // Generate the last 7 months
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        
        const activityByMonth: { [key: string]: number } = {};
        const currentDate = new Date();
        
        // Initialize last 7 months with 0
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = monthNames[date.getMonth()];
          activityByMonth[monthKey] = 0;
        }

        // Try to fetch monthly activity data from the new table
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);

        // Use a raw query to avoid TypeScript issues with the new table
        const { data: monthlyData } = await supabase
          .rpc('get_monthly_activity_data', {
            p_organization_id: orgId,
            p_user_id: user.id,
            p_start_date: sevenMonthsAgo.toISOString()
          })
          .select();

        // If the function doesn't exist, fall back to empty data
        if (monthlyData && Array.isArray(monthlyData)) {
          monthlyData.forEach((record: any) => {
            if (record.month && record.documents_created) {
              const monthKey = monthNames[record.month - 1]; // month is 1-indexed
              if (activityByMonth.hasOwnProperty(monthKey)) {
                activityByMonth[monthKey] += record.documents_created;
              }
            }
          });
        }

        // Convert to array format for chart
        const chartData: ActivityData[] = Object.entries(activityByMonth).map(
          ([name, documents]) => ({
            name,
            documents,
          }),
        );

        setActivityData(chartData);
      } catch (err) {
        console.error("Error fetching activity data:", err);
        setError("Failed to fetch activity data");
        // Set empty data on error
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
        setActivityData(months.map((month) => ({ name: month, documents: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();

    // Set up real-time subscription for live activity updates
    const channel = supabase
      .channel("activity-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_statistics",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch activity data when user statistics change
          fetchActivityData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshIndex]);

  return { activityData, loading, error };
}
