
import React from "react";
import { CharacterData } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature } from "lucide-react";
import { supabase, getLatestBrandingSettings } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";

interface CharacterPreviewProps {
  data: CharacterData;
}

export function CharacterPreview({ data }: CharacterPreviewProps) {
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [organizationSeal, setOrganizationSeal] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [brandingInfo, setBrandingInfo] = useState<any>(null);
  const [orgDetails, setOrgDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getAssetUrl = useCallback((bucket: string, path: string | null) => {
    if (!path) return null;
    const timestamp = Date.now();
    const { data } = supabase.storage.from(bucket).getPublicUrl(`${path}?t=${timestamp}`);
    return data.publicUrl;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const brandingSettings = await getLatestBrandingSettings();
        
        if (brandingSettings) {
          setBrandingInfo(brandingSettings);
          
          if (brandingSettings.logo) {
            const logoUrl = getAssetUrl('branding', `logos/${brandingSettings.logo}`);
            setOrganizationLogo(logoUrl);
          }
          
          if (brandingSettings.seal) {
            const sealUrl = getAssetUrl('branding', `seals/${brandingSettings.seal}`);
            setOrganizationSeal(sealUrl);
          }

          if (brandingSettings.signature) {
            const signatureUrl = getAssetUrl('branding', `signatures/${brandingSettings.signature}`);
            setSignatureImage(signatureUrl);
          }
        }

        const { data: orgData, error: orgError } = await supabase
          .from('organization_details')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (orgData && orgData.length > 0 && !orgError) {
          setOrgDetails(orgData[0]);
        }
      } catch (err) {
        console.error("Error loading assets:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [getAssetUrl, data]);

  const getRelation = () => {
    switch (data.gender) {
      case "male":
        return "son";
      case "female":
        return "daughter";
      default:
        return "child";
    }
  };

  const getPronoun = () => {
    switch (data.gender) {
      case "male":
        return "He";
      case "female":
        return "She";
      default:
        return "They";
    }
  };

  const institutionName = orgDetails?.name || "[Organization Name]";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
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
          {organizationLogo && (
            <div className="flex justify-center mb-2">
              <img 
                src={organizationLogo}
                alt="Organization Logo" 
                className="h-16 object-contain"
                onError={(e) => handleImageError(e, "logo")}
              />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary">
            {institutionName}
          </h1>
          <p className="text-muted-foreground">
            {orgDetails ? orgDetails.address : "123 Authority Street, Government City, 400001"} • 
            {orgDetails ? orgDetails.phone : "+91 2222 333333"} • 
            {orgDetails ? orgDetails.email : "info@authority.gov.in"}
          </p>
          {brandingInfo && brandingInfo.tagline && (
            <p className="text-sm italic mt-1">{brandingInfo.tagline}</p>
          )}
        </div>

        {/* Certificate title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold border-2 border-gray-300 inline-block px-4 py-2">
            CHARACTER CERTIFICATE
          </h2>
        </div>

        {/* Certificate content */}
        <div className="space-y-6 text-base md:text-lg leading-relaxed">
          <p>
            This is to certify that <strong>{data.fullName || "[Full Name]"}</strong>, {getRelation()} of <strong>{data.parentName || "[Parent's Name]"}</strong>, residing at <strong>{data.address || "[Address]"}</strong>, is known to me for the past <strong>{data.period || "[Period]"}</strong>.
          </p>

          <p>
            {getPronoun()} is a person of <strong>{data.character || "good"}</strong> character and <strong>{data.conduct || "satisfactory"}</strong> conduct. {getPronoun()} has not been involved in any criminal activities or anti-social behavior during the period of my acquaintance.
          </p>

          <p>
            This certificate is issued upon the request of the individual for the purpose of <strong>{data.purpose || "[Purpose]"}</strong>.
          </p>

          <p>
            I recommend {data.fullName || "[Full Name]"} as a person of good moral character and conduct.
          </p>
        </div>

        {/* Date and signature */}
        <div className="flex flex-col md:flex-row justify-between pt-8 mt-16">
          <div>
            <p>
              <strong>Date:</strong> {data.date ? formatDate(new Date(data.date)) : "[Date]"}
            </p>
            <p>
              <strong>Place:</strong> {data.place || (orgDetails ? orgDetails.address?.split(',').slice(-2).join(', ').trim() : "[City, State]")}
            </p>
          </div>
          
          <div className="text-right mt-8 md:mt-0">
            {data.includeDigitalSignature ? (
              <div className="h-16 mb-4 flex justify-end">
                {signatureImage ? (
                  <div className="border-b border-gray-800 px-6">
                    <img 
                      src={signatureImage}
                      alt="Digital Signature" 
                      className="h-12 object-contain"
                      onError={(e) => handleImageError(e, "signature")}
                    />
                  </div>
                ) : (
                  <div className="border-b border-gray-800 px-6">
                    <Signature className="h-12 w-12 text-primary" />
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
            <p>{institutionName}</p>
            <div className="mt-2 border border-dashed inline-block p-2">
              {organizationSeal ? (
                <img 
                  src={organizationSeal}
                  alt="Official Seal" 
                  className="h-12 w-12 object-contain" 
                  onError={(e) => handleImageError(e, "seal")}
                />
              ) : (
                <p className="text-xs text-center text-muted-foreground">SEAL/STAMP</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
