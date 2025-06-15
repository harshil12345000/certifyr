
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface OrganizationDetails {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

interface BrandingContextType {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
  organizationDetails: OrganizationDetails | null;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  logoUrl: null,
  sealUrl: null,
  signatureUrl: null,
  organizationDetails: null,
  isLoading: false,
  refreshBranding: async () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [organizationDetails, setOrganizationDetails] = useState<OrganizationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadBrandingData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user's organization_id
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData?.organization_id) {
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
        setOrganizationDetails(null);
        setIsLoading(false);
        return;
      }

      const organizationId = memberData.organization_id;

      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name, address, phone, email')
        .eq('id', organizationId)
        .single();

      if (!orgError && orgData) {
        setOrganizationDetails({
          name: orgData.name,
          address: orgData.address,
          phone: orgData.phone,
          email: orgData.email,
        });
      }

      // Fetch branding files
      const { data: filesData, error: filesError } = await supabase
        .from('branding_files')
        .select('name, path')
        .eq('organization_id', organizationId);

      if (!filesError && filesData) {
        let newLogoUrl: string | null = null;
        let newSealUrl: string | null = null;
        let newSignatureUrl: string | null = null;

        filesData.forEach(file => {
          if (file.path) {
            const { data: urlData } = supabase.storage.from('branding-assets').getPublicUrl(file.path);
            const publicUrl = urlData.publicUrl;
            
            if (file.name === 'logo') newLogoUrl = publicUrl;
            if (file.name === 'seal') newSealUrl = publicUrl;
            if (file.name === 'signature') newSignatureUrl = publicUrl;
          }
        });

        setLogoUrl(newLogoUrl);
        setSealUrl(newSealUrl);
        setSignatureUrl(newSignatureUrl);
      }
    } catch (error) {
      console.error('Error loading branding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrandingData();
  }, [user?.id]);

  const refreshBranding = async () => {
    await loadBrandingData();
  };

  return (
    <BrandingContext.Provider
      value={{
        logoUrl,
        sealUrl,
        signatureUrl,
        organizationDetails,
        isLoading,
        refreshBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
