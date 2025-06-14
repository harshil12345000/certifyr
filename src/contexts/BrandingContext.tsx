
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides user

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
}

const BrandingContext = createContext<BrandingContextType>({
  logoUrl: null,
  sealUrl: null,
  signatureUrl: null,
  organizationDetails: null,
  isLoading: true,
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [organizationDetails, setOrganizationDetails] = useState<OrganizationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadBrandingData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Step 1: Get user's organization_id
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (memberError || !memberData?.organization_id) {
          console.error('Error fetching organization membership or no organization ID found:', memberError?.message);
          setLogoUrl(null);
          setSealUrl(null);
          setSignatureUrl(null);
          setOrganizationDetails(null);
          setIsLoading(false);
          return;
        }
        const organizationId = memberData.organization_id;

        // Step 2: Fetch organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('name, address, phone, email')
          .eq('id', organizationId)
          .single();

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
        } else {
          setOrganizationDetails(null);
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
        } else if (filesData) {
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

    loadBrandingData();
  }, [user]);

  return (
    <BrandingContext.Provider value={{ logoUrl, sealUrl, signatureUrl, organizationDetails, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
