import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Document } from '@/types/document';

export function useUserDocuments(limit = 10, refreshIndex?: number) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching documents:', error);
          setError('Failed to fetch documents');
          setDocuments([]);
          return;
        }

        // Transform the data to match our Document interface
        const transformedData: Document[] = (data || []).map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          status: doc.status as "Created" | "Sent" | "Signed",
          date: new Date(doc.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          recipient: doc.recipient
        }));

        setDocuments(transformedData);
      } catch (err) {
        console.error('Unexpected error fetching documents:', err);
        setError('Failed to fetch documents');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

    // Set up real-time subscription for live updates
    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch documents when changes occur
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, limit, refreshIndex]);

  return { documents, loading, error };
}
