import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  documentsCreated: number;
  documentsSigned: number;
  downloadedDocuments: number;
  totalVerifications: number;
}

// Add helper to get organization_id for the current user
export async function getOrganizationIdForUser(userId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .single();
  if (error || !data?.organization_id) return null;
  return data.organization_id;
}

// Add helper to increment a stat in user_statistics
export async function incrementUserStat({ userId, organizationId, statField }: { userId: string, organizationId: string, statField: string }) {
  // Upsert: increment the field by 1
  const { error } = await supabase.rpc('increment_user_stat', {
    p_user_id: userId,
    p_organization_id: organizationId,
    p_stat_field: statField
  });
  if (error) console.error('Error incrementing user stat:', error);
}

export function useUserStats(refreshIndex?: number) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    documentsCreated: 0,
    documentsSigned: 0,
    downloadedDocuments: 0,
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
        const organizationId = await getOrganizationIdForUser(user.id);
        if (!organizationId) {
          setStats({ documentsCreated: 0, documentsSigned: 0, downloadedDocuments: 0, totalVerifications: 0 });
          setLoading(false);
          return;
        }
        // Fetch stats from user_statistics table for this org
        const { data, error: statsError } = await supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', user.id)
          .eq('organization_id', organizationId)
          .single();
        if (data) {
          setStats({
            documentsCreated: data.documents_created || 0,
            documentsSigned: data.documents_signed || 0,
            downloadedDocuments: data.downloaded_documents || 0,
            totalVerifications: data.total_verifications || 0
          });
        } else {
          setStats({ documentsCreated: 0, documentsSigned: 0, downloadedDocuments: 0, totalVerifications: 0 });
        }
      } catch (err) {
        setError('Failed to fetch statistics');
        setStats({ documentsCreated: 0, documentsSigned: 0, downloadedDocuments: 0, totalVerifications: 0 });
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
