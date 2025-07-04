import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationDetails {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface BrandingContextType {
  logoUrl: string | null;
  signatureUrl: string | null;
  sealUrl: string | null;
  qrCodeUrl: string | null;
  organizationDetails: OrganizationDetails | null;
  isLoading: boolean;
  uploadLogo: (file: File) => Promise<void>;
  uploadSignature: (file: File) => Promise<void>;
  uploadSeal: (file: File) => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [organizationDetails, setOrganizationDetails] = useState<OrganizationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const uploadLogo = async (file: File) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('branding-assets')
        .upload(`logos/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading logo:', error);
      } else {
        const publicUrlResponse = supabase.storage
          .from('branding-assets')
          .getPublicUrl(data.path);
        setLogoUrl(publicUrlResponse.data.publicUrl);
      }
    } catch (error) {
      console.error('Unexpected error uploading logo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadSignature = async (file: File) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('branding-assets')
        .upload(`signatures/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading signature:', error);
      } else {
        const publicUrlResponse = supabase.storage
          .from('branding-assets')
          .getPublicUrl(data.path);
        setSignatureUrl(publicUrlResponse.data.publicUrl);
      }
    } catch (error) {
      console.error('Unexpected error uploading signature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadSeal = async (file: File) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('branding-assets')
        .upload(`seals/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading seal:', error);
      } else {
        const publicUrlResponse = supabase.storage
          .from('branding-assets')
          .getPublicUrl(data.path);
        setSealUrl(publicUrlResponse.data.publicUrl);
      }
    } catch (error) {
      console.error('Unexpected error uploading seal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: BrandingContextType = {
    logoUrl,
    signatureUrl,
    sealUrl,
    qrCodeUrl,
    organizationDetails,
    isLoading,
    uploadLogo,
    uploadSignature,
    uploadSeal,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};
