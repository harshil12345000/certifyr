
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
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const loadBrandingData = async () => {
    // Prevent multiple simultaneous loads
    if (isLoading || hasAttemptedLoad) {
      return;
    }

    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    if (!user?.id) {
      console.log('No user available, clearing branding data');
      setLogoUrl(null);
      setSealUrl(null);
      setSignatureUrl(null);
      setOrganizationDetails(null);
      setHasAttemptedLoad(true);
      return;
    }

    console.log('Loading branding data for user:', user.id);
    setIsLoading(true);
    setHasAttemptedLoad(true);
    
    try {
      // Step 1: Get user's organization_id
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching organization membership:', memberError.message);
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
        setOrganizationDetails(null);
        return;
      }

      if (!memberData?.organization_id) {
        console.log('No organization found for user, clearing branding data');
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
        setOrganizationDetails(null);
        return;
      }
      
      const organizationId = memberData.organization_id;
      console.log('Found organization:', organizationId);

      // Step 2: Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name, address, phone, email')
        .eq('id', organizationId)
        .maybeSingle();

      if (orgError) {
        console.error('Error fetching organization details:', orgError.message);
        setOrganizationDetails(null);
      } else if (orgData) {
        setOrganizationDetails({
          name: orgData.name,
          address: orgData.address,
          phone: orgData.phone,
          email: orgData.email,
        });
      }

      // Step 3: Fetch branding files
      const { data: filesData, error: filesError } = await supabase
        .from('branding_files')
        .select('name, path')
        .eq('organization_id', organizationId);

      if (filesError) {
        console.error("Error fetching branding files:", filesError.message);
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
      } else if (filesData && filesData.length > 0) {
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
      } else {
        console.log('No branding files found');
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
      }

    } catch (error) {
      console.error('Error loading branding data:', error);
      setLogoUrl(null);
      setSealUrl(null);
      setSignatureUrl(null);
      setOrganizationDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset attempt flag when user changes
    setHasAttemptedLoad(false);
  }, [user?.id]);

  useEffect(() => {
    // Only load if auth is not loading and we haven't attempted yet
    if (!authLoading && !hasAttemptedLoad) {
      loadBrandingData();
    }
  }, [authLoading, hasAttemptedLoad, user?.id]);

  const refreshBranding = async () => {
    setHasAttemptedLoad(false);
    await loadBrandingData();
  };

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
