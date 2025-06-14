
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

        // Fetch documents for this user
        const { data: documents } = await supabase
          .from('documents')
          .select('status')
          .eq('user_id', user.id);

        const documentsCreated = documents?.length || 0;
        const documentsSigned = documents?.filter(doc => doc.status === 'Signed').length || 0;
        const pendingDocuments = documents?.filter(doc => doc.status === 'Created' || doc.status === 'Sent').length || 0;

        const userStats: UserStats = {
          documentsCreated,
          documentsSigned,
          pendingDocuments,
          totalTemplates: 0 // Will be updated when templates feature is implemented
        };

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

    // Set up real-time subscription for live stats updates
    const channel = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch stats when documents change
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { stats, loading, error };
}
