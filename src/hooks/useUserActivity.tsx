import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

        // Fetch documents from the last 7 months
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);

        const { data: documents } = await supabase
          .from('documents')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', sevenMonthsAgo.toISOString());

        // Generate the last 7 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const activityByMonth: { [key: string]: number } = {};
        
        // Initialize last 7 months with 0
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = monthNames[date.getMonth()];
          activityByMonth[monthKey] = 0;
        }

        // Count documents by month
        if (documents && documents.length > 0) {
          documents.forEach(doc => {
            const docDate = new Date(doc.created_at);
            const monthKey = monthNames[docDate.getMonth()];
            if (activityByMonth.hasOwnProperty(monthKey)) {
              activityByMonth[monthKey]++;
            }
          });
        }

        // Convert to array format for chart
        const chartData: ActivityData[] = Object.entries(activityByMonth).map(([name, documents]) => ({
          name,
          documents
        }));

        setActivityData(chartData);
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError('Failed to fetch activity data');
        // Set empty data on error
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        setActivityData(months.map(month => ({ name: month, documents: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();

    // Set up real-time subscription for live activity updates
    const channel = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch activity data when documents change
          fetchActivityData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshIndex]);

  return { activityData, loading, error };
}
