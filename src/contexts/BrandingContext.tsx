import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { useOrganizationMembership } from "@/hooks/useOrganizationMembership";

interface OrganizationDetails {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  enableQr: boolean | null;
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
  enableQr: boolean | null;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  logoUrl: null,
  signatureUrl: null,
  organizationDetails: null,
  userProfile: null,
  organizationId: null,
  enableQr: null,
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
  const [enableQr, setEnableQr] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { membership, loading: membershipLoading } = useOrganizationMembership();
  const { activePlan, hasFeature } = usePlanFeatures();

  const loadBrandingData = async () => {
    // If organizationId is provided, use it directly (for employee portal)
    if (!organizationId && user?.id && membershipLoading) {
      return;
    }

    const orgIdToUse = organizationId || membership?.organization_id || null;

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
        .select("name, address, phone, email, enable_qr")
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
          enableQr: orgData.enable_qr ?? true,
        };
        console.log("Loaded organization details:", orgDetails);
        setOrganizationDetails(orgDetails);
        const qrEnabledByOrg = orgData.enable_qr ?? true;
        const qrEnabledByPlan = hasFeature('qrVerification');
        setEnableQr(qrEnabledByOrg && qrEnabledByPlan);
      } else {
        console.log("No organization details found");
        setOrganizationDetails(null);
        setEnableQr(hasFeature('qrVerification'));
      }

      // Fetch branding files (logo only - signature is now per-admin)
      const { data: filesData, error: filesError } = await supabase
        .from("branding_files")
        .select("name, path")
        .eq("organization_id", orgIdToUse);

      if (filesError) {
        console.error("Error fetching branding files:", filesError);
      }

      let newLogoUrl: string | null = null;

      if (filesData && filesData.length > 0) {
        filesData.forEach((file) => {
          if (file.path && file.name === "logo") {
            const { data: urlData } = supabase.storage
              .from("branding-assets")
              .getPublicUrl(file.path);
            newLogoUrl = urlData.publicUrl;
          }
        });
      }

      console.log("Loaded branding assets - Logo:", newLogoUrl);
      setLogoUrl(newLogoUrl);

      // Fetch signature from user's profile (admin-specific)
      if (user?.id) {
        const { data: sigProfile } = await supabase
          .from("user_profiles")
          .select("signature_path")
          .eq("user_id", user.id)
          .maybeSingle();

        if (sigProfile && (sigProfile as any).signature_path) {
          const { data: sigUrlData } = supabase.storage
            .from("branding-assets")
            .getPublicUrl((sigProfile as any).signature_path);
          setSignatureUrl(sigUrlData.publicUrl);
          console.log("Loaded admin signature:", sigUrlData.publicUrl);
        } else {
          setSignatureUrl(null);
        }
      } else {
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
  }, [user?.id, organizationId, activePlan, membership?.organization_id, membershipLoading]);

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
        enableQr,
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
