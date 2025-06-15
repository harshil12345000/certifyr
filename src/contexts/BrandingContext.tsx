
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const { user, loading: authLoading } = useAuth();

  console.log('BrandingProvider state:', { 
    user: !!user, 
    authLoading, 
    isLoading, 
    hasInitialized,
    userEmail: user?.email 
  });

  const clearBrandingData = useCallback(() => {
    console.log('Clearing branding data');
    setLogoUrl(null);
    setSealUrl(null);
    setSignatureUrl(null);
    setOrganizationDetails(null);
  }, []);

  const loadBrandingData = useCallback(async () => {
    if (!user?.id || isLoading) {
      console.log('Skipping branding load:', { hasUser: !!user?.id, isLoading });
      return;
    }

    console.log('Loading branding data for user:', user.id);
    setIsLoading(true);
    
    try {
      // Get user's organization_id with better error handling
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching organization membership:', memberError.message);
        clearBrandingData();
        return;
      }

      if (!memberData?.organization_id) {
        console.log('No organization found for user');
        clearBrandingData();
        return;
      }
      
      const organizationId = memberData.organization_id;
      console.log('Found organization:', organizationId);

      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name, address, phone, email')
        .eq('id', organizationId)
        .maybeSingle();

      if (orgError) {
        console.error('Error fetching organization details:', orgError.message);
        setOrganizationDetails(null);
      } else if (orgData) {
        console.log('Organization details loaded:', orgData);
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

      if (filesError) {
        console.error("Error fetching branding files:", filesError.message);
        setLogoUrl(null);
        setSealUrl(null);
        setSignatureUrl(null);
      } else if (filesData && filesData.length > 0) {
        console.log('Branding files loaded:', filesData);
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
      clearBrandingData();
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isLoading, clearBrandingData]);

  // Initialize when auth is ready
  useEffect(() => {
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    if (hasInitialized) {
      console.log('Already initialized, skipping');
      return;
    }

    console.log('Initializing branding context');
    setHasInitialized(true);

    if (!user?.id) {
      console.log('No user found, clearing branding data');
      clearBrandingData();
      setIsLoading(false);
      return;
    }

    // Load branding data
    loadBrandingData();
  }, [authLoading, user?.id, hasInitialized, loadBrandingData, clearBrandingData]);

  const refreshBranding = useCallback(async () => {
    if (!user?.id) return;
    console.log('Refreshing branding data');
    await loadBrandingData();
  }, [user?.id, loadBrandingData]);

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
