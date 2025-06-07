
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OrganizationBranding {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: string;
  logo_url: string | null;
  seal_url: string | null;
  signature_url: string | null;
  email: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  header_color: string;
  footer_color: string;
  typography_font: string;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
}

export const useOrganizationBranding = () => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      if (!user) {
        setBranding(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('organization_branding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching organization branding:', error);
          setError(error.message);
        } else {
          setBranding(data);
        }
      } catch (err) {
        console.error('Error fetching organization branding:', err);
        setError('Failed to fetch organization branding');
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, [user]);

  const updateBranding = async (updates: Partial<OrganizationBranding>) => {
    if (!user || !branding) return;

    try {
      const { error } = await supabase
        .from('organization_branding')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating branding:', error);
        throw error;
      }

      setBranding({ ...branding, ...updates });
    } catch (err) {
      console.error('Error updating branding:', err);
      throw err;
    }
  };

  return { branding, loading, error, updateBranding };
};
