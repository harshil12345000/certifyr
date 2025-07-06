
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

        // Fetch monthly activity data from the new table
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);

        const { data: monthlyData } = await supabase
          .from("organization_monthly_activity")
          .select("year, month, documents_created")
          .eq("organization_id", orgId)
          .eq("user_id", user.id)
          .gte("created_at", sevenMonthsAgo.toISOString());

        // Aggregate data by month
        if (monthlyData && monthlyData.length > 0) {
          monthlyData.forEach((record) => {
            const monthKey = monthNames[record.month - 1]; // month is 1-indexed
            if (activityByMonth.hasOwnProperty(monthKey)) {
              activityByMonth[monthKey] += record.documents_created;
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
          table: "organization_monthly_activity",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch activity data when monthly activity changes
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
