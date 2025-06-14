
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  documentsCreated: number;
  documentsSigned: number;
  pendingDocuments: number;
  totalTemplates: number;
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    documentsCreated: 0,
    documentsSigned: 0,
    pendingDocuments: 0,
    totalTemplates: 0
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

        // For now, we'll return 0 for all stats since we don't have document tables yet
        // This can be updated when document storage is implemented
        const userStats: UserStats = {
          documentsCreated: 0,
          documentsSigned: 0,
          pendingDocuments: 0,
          totalTemplates: 0
        };

        // If we had document tables, we would fetch like this:
        // const { data: documents } = await supabase
        //   .from('documents')
        //   .select('status')
        //   .eq('user_id', user.id);
        
        // const documentsCreated = documents?.length || 0;
        // const documentsSigned = documents?.filter(doc => doc.status === 'signed').length || 0;
        // const pendingDocuments = documents?.filter(doc => doc.status === 'pending').length || 0;

        setStats(userStats);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to fetch statistics');
        // Set to 0 on error
        setStats({
          documentsCreated: 0,
          documentsSigned: 0,
          pendingDocuments: 0,
          totalTemplates: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading, error };
}
