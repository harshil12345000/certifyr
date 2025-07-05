import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

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

export function BrandingProvider({ children, organizationId }: { children: ReactNode; organizationId?: string }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [organizationDetails, setOrganizationDetails] =
    useState<OrganizationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadBrandingData = async () => {
    // If organizationId is provided, use it directly (for employee portal)
    const orgIdToUse = organizationId || (user?.id ? await (async () => {
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();
      return memberData?.organization_id;
    })() : null);

    if (!orgIdToUse) {
      setLogoUrl(null);
      setSealUrl(null);
      setSignatureUrl(null);
      setOrganizationDetails(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("name, address, phone, email")
        .eq("id", orgIdToUse)
        .single();

      if (!orgError && orgData) {
        const orgDetails = {
          name: orgData.name,
          address: orgData.address,
          phone: orgData.phone,
          email: orgData.email,
        };
        setOrganizationDetails(orgDetails);
      } else {
        setOrganizationDetails(null);
      }

      // Fetch branding files
      const { data: filesData, error: filesError } = await supabase
        .from("branding_files")
        .select("name, path")
        .eq("organization_id", orgIdToUse);

      if (!filesError && filesData) {
        let newLogoUrl: string | null = null;
        let newSealUrl: string | null = null;
        let newSignatureUrl: string | null = null;

        filesData.forEach((file) => {
          if (file.path) {
            const { data: urlData } = supabase.storage
              .from("branding-assets")
              .getPublicUrl(file.path);
            const publicUrl = urlData.publicUrl;

            if (file.name === "logo") newLogoUrl = publicUrl;
            if (file.name === "seal") newSealUrl = publicUrl;
            if (file.name === "signature") newSignatureUrl = publicUrl;
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
    // Only depend on user.id if orgId is not provided
  }, [user?.id, organizationId]);

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
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};
