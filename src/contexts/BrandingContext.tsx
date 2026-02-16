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

interface UserProfileData {
  firstName: string | null;
  lastName: string | null;
  organizationLocation: string | null;
  designation: string | null;
  organizationType: string | null;
}

interface BrandingContextType {
  logoUrl: string | null;
  signatureUrl: string | null;
  organizationDetails: OrganizationDetails | null;
  userProfile: UserProfileData | null;
  organizationId: string | null;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  logoUrl: null,
  signatureUrl: null,
  organizationDetails: null,
  userProfile: null,
  organizationId: null,
  isLoading: false,
  refreshBranding: async () => {},
});

export function BrandingProvider({ children, organizationId }: { children: ReactNode; organizationId?: string }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [organizationDetails, setOrganizationDetails] =
    useState<OrganizationDetails | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadBrandingData = async () => {
    // If organizationId is provided, use it directly (for employee portal)
    const orgIdToUse = organizationId || (user?.id ? await (async () => {
      // Use RPC function to get just one organization ID
      const { data: orgId, error: rpcError } = await supabase.rpc(
        'get_user_organization_id',
        { user_id: user.id }
      );
      
      if (rpcError) {
        console.error("Error fetching organization ID via RPC:", rpcError);
        return null;
      }
      
      console.log("Organization ID for user:", orgId);
      return orgId;
    })() : null);

    if (!orgIdToUse) {
      console.log("No organization ID found, skipping branding data load");
      setLogoUrl(null);
      setSignatureUrl(null);
      setOrganizationDetails(null);
      setUserProfile(null);
      setCurrentOrgId(null);
      setIsLoading(false);
      return;
    }

    setCurrentOrgId(orgIdToUse);
    setIsLoading(true);

    try {
      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("name, address, phone, email")
        .eq("id", orgIdToUse)
        .maybeSingle();

      if (orgError) {
        console.error("Error fetching organization details:", orgError);
      }

      if (orgData) {
        const orgDetails = {
          name: orgData.name,
          address: orgData.address ? orgData.address.replace(/\|\|/g, ", ") : null,
          phone: orgData.phone,
          email: orgData.email,
        };
        console.log("Loaded organization details:", orgDetails);
        setOrganizationDetails(orgDetails);
      } else {
        console.log("No organization details found");
        setOrganizationDetails(null);
      }

      // Fetch branding files
      const { data: filesData, error: filesError } = await supabase
        .from("branding_files")
        .select("name, path")
        .eq("organization_id", orgIdToUse);

      if (filesError) {
        console.error("Error fetching branding files:", filesError);
      }

      if (filesData && filesData.length > 0) {
        let newLogoUrl: string | null = null;
        let newSignatureUrl: string | null = null;

        filesData.forEach((file) => {
          if (file.path) {
            const { data: urlData } = supabase.storage
              .from("branding-assets")
              .getPublicUrl(file.path);
            const publicUrl = urlData.publicUrl;

            if (file.name === "logo") newLogoUrl = publicUrl;
            if (file.name === "signature") newSignatureUrl = publicUrl;
          }
        });

        console.log("Loaded branding assets - Logo:", newLogoUrl, "Signature:", newSignatureUrl);
        setLogoUrl(newLogoUrl);
        setSignatureUrl(newSignatureUrl);
      } else {
        console.log("No branding files found for organization");
        setLogoUrl(null);
        setSignatureUrl(null);
      }

      // Fetch user profile data if user is available
      if (user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("first_name, last_name, organization_location, designation, organization_type")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        }

        if (profileData) {
          setUserProfile({
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            organizationLocation: profileData.organization_location,
            designation: profileData.designation,
            organizationType: profileData.organization_type,
          });
        } else {
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error("Error loading branding data:", error);
      setLogoUrl(null);
      setSignatureUrl(null);
      setOrganizationDetails(null);
      setUserProfile(null);
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
        signatureUrl,
        organizationDetails,
        userProfile,
        organizationId: currentOrgId,
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
