import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationId } from './useOrganizationId';
import { useToast } from './use-toast';

export interface UseAIContextReturn {
  contextCountry: string;
  loading: boolean;
  error: string | null;
  updateContextCountry: (country: string) => Promise<void>;
}

export function useAIContext(): UseAIContextReturn {
  const { orgId, loading: orgLoading } = useOrganizationId();
  const { toast } = useToast();
  const [contextCountry, setContextCountry] = useState<string>('global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current context country from organization
  const fetchContextCountry = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('ai_context_country')
        .eq('id', orgId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching AI context:', fetchError);
        setError(fetchError.message);
      } else if (data) {
        setContextCountry(data.ai_context_country || 'global');
      }
    } catch (err: any) {
      console.error('Error in fetchContextCountry:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgLoading) {
      fetchContextCountry();
    }
  }, [orgLoading, fetchContextCountry]);

  // Update context country
  const updateContextCountry = async (country: string) => {
    if (!orgId) {
      toast({
        title: 'Error',
        description: 'Organization not found',
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update
    const previousCountry = contextCountry;
    setContextCountry(country);

    try {
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ ai_context_country: country })
        .eq('id', orgId);

      if (updateError) {
        // Rollback on error
        setContextCountry(previousCountry);
        throw updateError;
      }

      toast({
        title: 'Context Updated',
        description: `AI will now follow ${country === 'global' ? 'global' : country} document standards.`,
      });
    } catch (err: any) {
      console.error('Error updating AI context:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to update AI context. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    contextCountry,
    loading: loading || orgLoading,
    error,
    updateContextCountry,
  };
}
