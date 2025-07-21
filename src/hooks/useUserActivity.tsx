
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizationIdForUser } from "./useUserStats";

interface ActivityData {
  name: string;
  Documents: number;
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

        // Get user's organization (optional)
        const orgId = await getOrganizationIdForUser(user.id);

        // Generate the last 7 months
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        
        const activityByMonth: { [key: string]: number } = {};
        
        // Initialize last 7 months with 0
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = monthNames[date.getMonth()];
          activityByMonth[monthKey] = 0;
        }

        // Fetch actual preview generation data for the last 7 months
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);

        const { data: previewGenerations } = await supabase
          .from("preview_generations")
          .select("created_at")
          .eq("user_id", user.id)
          .eq("organization_id", orgId || null)
          .gte("created_at", sevenMonthsAgo.toISOString());

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
          }),
        );

        setActivityData(chartData);
      } catch (err) {
        console.error("Error fetching activity data:", err);
        setError("Failed to fetch activity data");
        // Set empty data on error
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
        setActivityData(months.map((month) => ({ name: month, Documents: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();

  }, [user, refreshIndex]);

  return { activityData, loading, error };
}
