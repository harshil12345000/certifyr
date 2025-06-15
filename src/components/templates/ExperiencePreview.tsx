import React, { useEffect, useState, useCallback } from "react";
import { ExperienceData, ExperiencePreviewProps } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature as SignatureIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "./Letterhead";

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
}

export function ExperiencePreview({ data }: ExperiencePreviewProps) {
  const [brandingAssets, setBrandingAssets] = useState<BrandingAssets>({ logoUrl: null, sealUrl: null, signatureUrl: null });
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>({
    name: data.institutionName || "[Institution Name]",
    address: null,
    phone: null,
    email: null,
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
        // 1. Fetch Organization Details
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
              address: orgData.address,
              phone: orgData.phone,
              email: orgData.email,
            });
          } else {
            console.warn(`Organization named "${data.institutionName}" not found.`);
            setOrganizationInfo({
              name: data.institutionName || "[Institution Name]",
              address: null,
              phone: null,
              email: null,
            });
          }
        } else if (user?.id) {
          const { data: memberData, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .single();
          
          if (memberError || !memberData?.organization_id) {
            console.warn("ExperiencePreview: Could not determine organization ID from user.");
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
                address: orgData.address,
                phone: orgData.phone,
                email: orgData.email,
              });
            } else {
              console.warn("ExperiencePreview: Organization details not found for user's org ID.");
            }
          }
        } else {
          console.warn("ExperiencePreview: institutionName not provided and no user context. Cannot fetch specific org details.");
        }

        // 2. Fetch Branding Assets
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
            console.warn("ExperiencePreview: No organization ID determined, cannot fetch branding assets.");
          }
        }
        setOrganizationInfo(prev => ({...prev, name: fetchedOrgName || prev.name || "[Institution Name]" }));
      } catch (err) {
        console.error("Unexpected error loading assets for ExperiencePreview:", err);
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
    address: organizationInfo.address || "[Institution Address]",
    phone: organizationInfo.phone || "[Phone Number]",
    email: organizationInfo.email || "[Email Address]"
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
        {/* Letterhead */}
        <Letterhead />

        {/* Certificate title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold border-2 border-gray-300 inline-block px-4 py-2">
            EXPERIENCE CERTIFICATE
          </h2>
        </div>

        {/* Certificate content */}
        <div className="space-y-6 text-base md:text-lg leading-relaxed">
          <p className="text-justify">
            This is to certify that <strong>{data.fullName || "[Full Name]"}</strong> (Employee ID: <strong>{data.employeeId || "[Employee ID]"}</strong>) was employed with <strong>{institutionNameToDisplay}</strong> as a <strong>{data.designation || "[Designation]"}</strong> in the <strong>{data.department || "[Department]"}</strong> department.
          </p>

          <p className="text-justify">
            {data.fullName ? "His/Her" : "[His/Her]"} period of employment was from <strong>{data.joinDate ? formatDate(new Date(data.joinDate)) : "[Join Date]"}</strong> to <strong>{data.resignationDate ? formatDate(new Date(data.resignationDate)) : "[Resignation Date]"}</strong>.
          </p>

          <p className="text-justify">
            During the tenure, {data.fullName ? "he/she" : "[he/she]"} was responsible for <strong>{data.workDescription || "[Work Description]"}</strong>. {data.fullName ? "His/Her" : "[His/Her]"} last drawn salary was <strong>{data.salary || "[Salary]"}</strong> per month.
          </p>

          <p className="text-justify">
            We found {data.fullName ? "him/her" : "[him/her]"} to be hardworking, sincere, and dedicated to duties. We wish {data.fullName ? "him/her" : "[him/her]"} all the best for future endeavors.
          </p>
        </div>

        {/* Date and signature */}
        <div className="flex flex-col md:flex-row justify-between pt-8 mt-16">
          <div>
            <p>
              <strong>Date:</strong> {data.date ? formatDate(new Date(data.date)) : "[Date]"}
            </p>
            <p>
              <strong>Place:</strong> {data.place || "[Place]"}
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
