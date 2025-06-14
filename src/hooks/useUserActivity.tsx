
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityData {
  name: string;
  documents: number;
}

export function useUserActivity() {
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

        // For now, we'll return empty data since we don't have document tables yet
        // This will be updated when document storage is implemented
        
        // Generate the last 7 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        const emptyData: ActivityData[] = months.map(month => ({
          name: month,
          documents: 0
        }));

        // If we had document tables, we would fetch like this:
        // const { data: documents } = await supabase
        //   .from('documents')
        //   .select('created_at')
        //   .eq('user_id', user.id)
        //   .gte('created_at', new Date(Date.now() - 7 * 30 * 24 * 60 * 60 * 1000).toISOString());
        
        // Then aggregate by month and create the chart data

        setActivityData(emptyData);
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
  }, [user]);

  return { activityData, loading, error };
}
