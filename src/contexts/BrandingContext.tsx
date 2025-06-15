
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
  isLoading: true,
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
      console.log('BrandingContext: No user, setting loading to false');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('BrandingContext: Loading branding data for user:', user.id);
    
    try {
      // Step 1: Get user's organization_id
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData?.organization_id) {
        console.log('BrandingContext: No organization membership found or error:', memberError?.message);
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
        setOrganizationDetails(null);
        setIsLoading(false);
        return;
      }
      const organizationId = memberData.organization_id;
      console.log('BrandingContext: Found organization ID:', organizationId);

      // Step 2: Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name, address, phone, email')
        .eq('id', organizationId)
        .single();

      if (orgError) {
        console.error('BrandingContext: Error fetching organization details:', orgError.message);
        setOrganizationDetails(null);
      } else if (orgData) {
        setOrganizationDetails({
          name: orgData.name,
          address: orgData.address,
          phone: orgData.phone,
          email: orgData.email,
        });
        console.log('BrandingContext: Loaded organization details:', orgData);
      }

      // Step 3: Fetch branding files
      const { data: filesData, error: filesError } = await supabase
        .from('branding_files')
        .select('name, path')
        .eq('organization_id', organizationId);

      if (filesError) {
        console.error("BrandingContext: Error fetching branding files:", filesError.message);
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
      } else if (filesData) {
        console.log('BrandingContext: Found branding files:', filesData);
        let newLogoUrl: string | null = null;
        let newSealUrl: string | null = null;
        let newSignatureUrl: string | null = null;

        filesData.forEach(file => {
          const publicUrlRes = supabase.storage.from('branding-assets').getPublicUrl(file.path);
          const publicUrl = publicUrlRes.data?.publicUrl;
          if (publicUrl) {
            if (file.name === 'logo') newLogoUrl = publicUrl;
            if (file.name === 'seal') newSealUrl = publicUrl;
            if (file.name === 'signature') newSignatureUrl = publicUrl;
          }
        });
        setLogoUrl(newLogoUrl);
        setSealUrl(newSealUrl);
        setSignatureUrl(newSignatureUrl);
        console.log('BrandingContext: Set branding URLs:', { newLogoUrl, newSealUrl, newSignatureUrl });
      }

    } catch (error) {
      console.error('BrandingContext: Error loading branding data:', error);
      setLogoUrl(null);
      setSealUrl(null);
      setSignatureUrl(null);
      setOrganizationDetails(null);
    } finally {
      setIsLoading(false);
      console.log('BrandingContext: Finished loading, isLoading set to false');
    }
  };

  useEffect(() => {
    console.log('BrandingContext: useEffect triggered, user changed:', user?.email || 'No user');
    loadBrandingData();
  }, [user]);

  const refreshBranding = async () => {
    console.log('BrandingContext: Refreshing branding data');
    await loadBrandingData();
  };

  console.log('BrandingContext: Rendering with isLoading:', isLoading);

  return (
    <BrandingContext.Provider value={{ 
      logoUrl, 
      sealUrl, 
      signatureUrl, 
      organizationDetails, 
      isLoading,
      refreshBranding
    }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
