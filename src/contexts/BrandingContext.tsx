import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getLatestBrandingSettings } from '@/integrations/supabase/client';

interface BrandingContextType {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
  tagline: string | null;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
  logoUrl: null,
  sealUrl: null,
  signatureUrl: null,
  tagline: null,
  isLoading: true,
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [tagline, setTagline] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBrandingAssets = async () => {
      try {
        setIsLoading(true);
        const brandingSettings = await getLatestBrandingSettings();
        
        if (brandingSettings) {
          setTagline(brandingSettings.tagline);
          
          if (brandingSettings.logo) {
            const { data } = supabase.storage.from('branding').getPublicUrl(`logos/${brandingSettings.logo}`);
            setLogoUrl(data.publicUrl);
          }
          
          if (brandingSettings.seal) {
            const { data } = supabase.storage.from('branding').getPublicUrl(`seals/${brandingSettings.seal}`);
            setSealUrl(data.publicUrl);
          }
          
          if (brandingSettings.signature) {
            const { data } = supabase.storage.from('branding').getPublicUrl(`signatures/${brandingSettings.signature}`);
            setSignatureUrl(data.publicUrl);
          }
        }
      } catch (error) {
        console.error('Error loading branding assets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBrandingAssets();
  }, []);

  return (
    <BrandingContext.Provider value={{ logoUrl, sealUrl, signatureUrl, tagline, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext); 