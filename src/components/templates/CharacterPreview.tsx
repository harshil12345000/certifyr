import React, { useEffect, useState, useCallback } from "react";
import { CharacterData, CharacterPreviewProps } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature as SignatureIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface BrandingAssets {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
}

interface OrganizationInfo {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  // tagline: string | null; // If tagline is needed, it should be part of organizations table
}

export function CharacterPreview({ data }: CharacterPreviewProps) {
  const [brandingAssets, setBrandingAssets] = useState<BrandingAssets>({ logoUrl: null, sealUrl: null, signatureUrl: null });
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>({
    name: data.institutionName || "[Institution Name]",
    address: "123 Education Street, Knowledge City, 400001",
    phone: "+91 2222 333333",
    email: "info@institution.edu",
    // tagline: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const getAssetUrlWithCacheBust = useCallback((bucket: string, path: string | null) => {
    if (!path) return null;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      let orgIdToQuery: string | null = null;
      let fetchedOrgName: string | null = data.institutionName;

      try {
        // 1. Fetch Organization Details (including ID)
        if (data.institutionName) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, address, phone, email')
            .eq('name', data.institutionName)
            .maybeSingle();

          if (orgError && orgError.code !== 'PGRST116') {
            console.error("Error fetching organization by name:", orgError.message);
            toast({ title: "Error", description: `Could not fetch details for ${data.institutionName}.`, variant: "destructive" });
          } else if (orgData) {
            orgIdToQuery = orgData.id;
            fetchedOrgName = orgData.name;
            setOrganizationInfo({
              name: orgData.name || data.institutionName || "[Institution Name]",
              address: orgData.address || "123 Default Address",
              phone: orgData.phone || "Default Phone",
              email: orgData.email || "default@example.com",
            });
          } else {
             console.warn(`Organization named "${data.institutionName}" not found. Using fallback details.`);
             setOrganizationInfo({
                name: data.institutionName || "[Institution Name]",
                address: "123 Education Street, Knowledge City, 400001",
                phone: "+91 2222 333333",
                email: "info@institution.edu",
             });
          }
        } else if (user?.id) {
          // Try to get org_id from user if institutionName is not in data
           const { data: memberData, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .single();
          
          if (memberError || !memberData?.organization_id) {
            console.warn("CharacterPreview: Could not determine organization ID from user or data.");
          } else {
            orgIdToQuery = memberData.organization_id;
             const { data: orgData, error: orgError } = await supabase
              .from('organizations')
              .select('id, name, address, phone, email')
              .eq('id', orgIdToQuery)
              .single();
            if (orgData) {
                fetchedOrgName = orgData.name;
                setOrganizationInfo({
                    name: orgData.name || "[Institution Name]",
                    address: orgData.address || "123 Default Address",
                    phone: orgData.phone || "Default Phone",
                    email: orgData.email || "default@example.com",
                });
            } else {
                console.warn("CharacterPreview: Organization details not found for user's org ID.");
            }
          }
        } else {
          console.warn("CharacterPreview: institutionName not provided and no user context. Cannot fetch specific org details.");
        }

        // 2. Fetch Branding Assets if Organization ID is known
        if (orgIdToQuery) {
          const { data: filesData, error: filesError } = await supabase
            .from('branding_files')
            .select('name, path')
            .eq('organization_id', orgIdToQuery);

          if (filesError) {
            console.error("Error fetching branding files:", filesError.message);
            toast({ title: "Branding Error", description: "Could not load branding assets.", variant: "destructive" });
            setBrandingAssets({ logoUrl: null, sealUrl: null, signatureUrl: null });
          } else if (filesData && filesData.length > 0) {
            let newLogoUrl: string | null = null;
            let newSealUrl: string | null = null;
            let newSignatureUrl: string | null = null;

            filesData.forEach(file => {
              const publicUrl = getAssetUrlWithCacheBust('branding-assets', file.path);
              if (publicUrl) {
                if (file.name === 'logo') newLogoUrl = publicUrl;
                if (file.name === 'seal') newSealUrl = publicUrl;
                if (file.name === 'signature') newSignatureUrl = publicUrl;
              }
            });
            setBrandingAssets({ logoUrl: newLogoUrl, sealUrl: newSealUrl, signatureUrl: newSignatureUrl });
          } else {
             setBrandingAssets({ logoUrl: null, sealUrl: null, signatureUrl: null }); 
          }
        } else {
          setBrandingAssets({ logoUrl: null, sealUrl: null, signatureUrl: null });
           if(data.institutionName || user?.id) { 
             console.warn("CharacterPreview: No organization ID determined, cannot fetch branding assets.");
           }
        }
        setOrganizationInfo(prev => ({...prev, name: fetchedOrgName || prev.name || "[Institution Name]" }));

      } catch (err) {
        console.error("Unexpected error loading assets for CharacterPreview:", err);
        toast({
          title: "Error loading assets",
          description: "There was a problem loading your branding assets. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [data.institutionName, user, getAssetUrlWithCacheBust]);

  const institutionNameToDisplay = organizationInfo.name;
  const contactInfo = {
    address: organizationInfo.address || "123 Education Street, Knowledge City, 400001",
    phone: organizationInfo.phone || "+91 2222 333333",
    email: organizationInfo.email || "info@institution.edu"
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none'; 
    toast({
      title: `Error loading ${type}`,
      description: "The image could not be loaded. Try re-uploading it or check the path.",
      variant: "destructive"
    });
  };

  return (
    <div className="bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0 a4-document">
      <div className="p-8 min-h-[297mm] w-full max-w-[210mm] mx-auto bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading assets...</p>
            </div>
          </div>
        )}
        
        {/* Letterhead */}
        <div className="text-center border-b pb-4 mb-8">
          {brandingAssets.logoUrl && (
            <div className="flex justify-center mb-2">
              <img 
                src={brandingAssets.logoUrl}
                alt="Organization Logo" 
                className="h-16 object-contain"
                onError={(e) => handleImageError(e, "logo")}
              />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary">
            {institutionNameToDisplay}
          </h1>
          <p className="text-muted-foreground">
            {contactInfo.address} • {contactInfo.phone} • {contactInfo.email}
          </p>
        </div>

        {/* Certificate title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold border-2 border-gray-300 inline-block px-4 py-2">
            CHARACTER CERTIFICATE
          </h2>
        </div>

        {/* Certificate content */}
        <div className="space-y-6 text-base md:text-lg leading-relaxed">
          <p className="text-justify">
            This is to certify that <strong>{data.fullName || "[Full Name]"}</strong>, {data.parentName ? `son/daughter of ${data.parentName}` : "son/daughter of [Parent's Name]"}, residing at <strong>{data.address || "[Address]"}</strong>, has been known to us for a period of <strong>{data.duration || "[Duration]"}</strong>.
          </p>

          <p className="text-justify">
            During this period, we have observed {data.fullName ? "his/her" : "[his/her]"} conduct and character, and we are pleased to certify that {data.fullName ? "he/she" : "[he/she]"} is of <strong>{data.conduct || "[Conduct]"}</strong> character and moral standing.
          </p>

          <p className="text-justify">
            {data.fullName ? "He/She" : "[He/She]"} has always conducted {data.fullName ? "himself/herself" : "[himself/herself]"} in a responsible and dignified manner. We have found {data.fullName ? "him/her" : "[him/her]"} to be honest, trustworthy, and of good character.
          </p>

          <p className="text-justify">
            This certificate is issued upon {data.fullName ? "his/her" : "[his/her]"} request for official purposes.
          </p>
        </div>

        {/* Date and signature */}
        <div className="flex flex-col md:flex-row justify-between pt-8 mt-16">
          <div>
            <p>
              <strong>Date:</strong> {data.date ? formatDate(new Date(data.date)) : "[Date]"}
            </p>
            <p>
              <strong>Place:</strong> {data.place || (contactInfo.address?.split(',').slice(-2).join(', ').trim() || "[City, State]")}
            </p>
          </div>
          
          <div className="text-right mt-8 md:mt-0">
            {data.includeDigitalSignature ? (
              <div className="h-16 mb-4 flex justify-end">
                {brandingAssets.signatureUrl ? (
                  <div className="border-b border-gray-800 px-6">
                    <img 
                      src={brandingAssets.signatureUrl}
                      alt="Digital Signature" 
                      className="h-12 object-contain"
                      onError={(e) => handleImageError(e, "signature")}
                    />
                  </div>
                ) : (
                  <div className="border-b border-gray-800 px-6 py-3">
                    <SignatureIcon className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-16 mb-4">
                {/* Space for manual signature */}
              </div>
            )}
            <p className="font-bold">{data.signatoryName || "[Authorized Signatory Name]"}</p>
            <p>{data.signatoryDesignation || "[Designation]"}</p>
            <p>{institutionNameToDisplay}</p>
          </div>
        </div>
         {brandingAssets.sealUrl && (
            <div className="absolute bottom-8 left-8">
                 <img 
                    src={brandingAssets.sealUrl}
                    alt="Organization Seal" 
                    className="h-20 w-20 object-contain opacity-75"
                    onError={(e) => handleImageError(e, "seal")}
                />
            </div>
        )}
      </div>
    </div>
  );
}
