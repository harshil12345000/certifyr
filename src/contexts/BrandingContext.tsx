
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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadBrandingData = async () => {
    if (!user?.id) {
      console.log('[BrandingContext] No user found, clearing branding data');
      setLogoUrl(null);
      setSealUrl(null);
      setSignatureUrl(null);
      setOrganizationDetails(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('[BrandingContext] Loading branding data for user:', user.id);
      
      // Get user's organization_id
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      console.log('[BrandingContext] Member data:', memberData, 'Error:', memberError);

      if (memberError || !memberData?.organization_id) {
        console.log('[BrandingContext] No organization found for user');
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
        setOrganizationDetails(null);
        setIsLoading(false);
        return;
      }

      const organizationId = memberData.organization_id;
      console.log('[BrandingContext] Organization ID:', organizationId);

      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name, address, phone, email')
        .eq('id', organizationId)
        .single();

      console.log('[BrandingContext] Organization data:', orgData, 'Error:', orgError);

      if (!orgError && orgData) {
        const orgDetails = {
          name: orgData.name,
          address: orgData.address,
          phone: orgData.phone,
          email: orgData.email,
        };
        console.log('[BrandingContext] Setting organization details:', orgDetails);
        setOrganizationDetails(orgDetails);
      } else {
        console.error('[BrandingContext] Failed to fetch organization details:', orgError);
        setOrganizationDetails(null);
      }

      // Fetch branding files
      const { data: filesData, error: filesError } = await supabase
        .from('branding_files')
        .select('name, path')
        .eq('organization_id', organizationId);

      console.log('[BrandingContext] Branding files:', filesData, 'Error:', filesError);

      if (!filesError && filesData) {
        let newLogoUrl: string | null = null;
        let newSealUrl: string | null = null;
        let newSignatureUrl: string | null = null;

        filesData.forEach(file => {
          if (file.path) {
            const { data: urlData } = supabase.storage.from('branding-assets').getPublicUrl(file.path);
            const publicUrl = urlData.publicUrl;
            console.log(`[BrandingContext] File: ${file.name}, URL: ${publicUrl}`);
            
            if (file.name === 'logo') newLogoUrl = publicUrl;
            if (file.name === 'seal') newSealUrl = publicUrl;
            if (file.name === 'signature') newSignatureUrl = publicUrl;
          }
        });

        console.log('[BrandingContext] Setting URLs - Logo:', newLogoUrl, 'Seal:', newSealUrl, 'Signature:', newSignatureUrl);
        setLogoUrl(newLogoUrl);
        setSealUrl(newSealUrl);
        setSignatureUrl(newSignatureUrl);
      } else {
        console.error('[BrandingContext] Failed to fetch branding files:', filesError);
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
      }
    } catch (error) {
      console.error('[BrandingContext] Exception in loadBrandingData:', error);
      setLogoUrl(null);
      setSealUrl(null);
      setSignatureUrl(null);
      setOrganizationDetails(null);
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
