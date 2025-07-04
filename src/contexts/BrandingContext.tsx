
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface BrandingContextType {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
  qrCodeUrl: string | null;
  organizationDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
  } | null;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [organizationDetails, setOrganizationDetails] = useState<{
    name: string;
    address: string;
    phone: string;
    email: string;
  } | null>(null);
  const { user } = useAuth();

  const refreshBranding = async (): Promise<void> => {
    if (!user?.id) {
      console.warn("Branding Context: User not available, cannot fetch branding.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, address, phone, email')
        .eq('owner_id', user.id)
        .single();

      if (orgError) {
        console.error("Error fetching organization:", orgError.message);
        return;
      }

      if (!orgData) {
        console.warn("No organization found for the current user.");
        return;
      }

      setOrganizationDetails({
        name: orgData.name,
        address: orgData.address,
        phone: orgData.phone,
        email: orgData.email,
      });

      const { data: filesData, error: filesError } = await supabase
        .from('branding_files')
        .select('name, path')
        .eq('organization_id', orgData.id);

      if (filesError) {
        console.error("Error fetching branding files:", filesError);
        return;
      }

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

    } catch (error) {
      console.error("Unexpected error fetching branding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userId = user?.id;
    if (userId) {
      refreshBranding();
    }
  }, [user?.id]);

  const value: BrandingContextType = {
    logoUrl,
    sealUrl,
    signatureUrl,
    qrCodeUrl,
    organizationDetails,
    isLoading,
    refreshBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};
