import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  documentsCreated: number;
  documentsSigned: number;
  pendingDocuments: number;
  totalVerifications: number;
}

export function useUserStats(refreshIndex?: number) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    documentsCreated: 0,
    documentsSigned: 0,
    pendingDocuments: 0,
    totalVerifications: 0
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

        // Fetch stats from user_statistics table
        const { data, error: statsError } = await supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', user.id)
          .single();
        console.log('[useUserStats] user_statistics:', data, 'error:', statsError);

        if (data) {
          setStats({
            documentsCreated: data.documents_created || 0,
            documentsSigned: data.documents_signed || 0,
            pendingDocuments: data.pending_documents || 0,
            totalVerifications: data.total_verifications || 0
          });
        } else {
          setStats({
            documentsCreated: 0,
            documentsSigned: 0,
            pendingDocuments: 0,
            totalVerifications: 0
          });
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to fetch statistics');
        setStats({
          documentsCreated: 0,
          documentsSigned: 0,
          pendingDocuments: 0,
          totalVerifications: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscription for user_statistics changes
    const channel = supabase
      .channel('user-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_statistics',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshIndex]);

  return { stats, loading, error };
}
