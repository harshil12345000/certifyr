import React from "react";
import { CharacterData } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature } from "lucide-react";
import { supabase, getLatestBrandingSettings } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

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
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());
  
  // Function to get a public URL for an asset with cache busting
  const getAssetUrl = useCallback((bucket: string, path: string | null) => {
    if (!path) return null;
    const timestamp = Date.now();
    const { data } = supabase.storage.from(bucket).getPublicUrl(`${path}?t=${timestamp}`);
    return data.publicUrl;
  }, []);

  // Load all branding assets and organization details
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Clear previous assets to prevent stale data
        setOrganizationLogo(null);
        setOrganizationSeal(null);
        setSignatureImage(null);
        
        // Get the latest branding settings
        const brandingSettings = await getLatestBrandingSettings();
        
        if (brandingSettings) {
          console.log("Loaded latest branding settings:", brandingSettings);
          setBrandingInfo(brandingSettings);
          
          // Use direct public URLs with cache busting
          if (brandingSettings.logo) {
            const logoUrl = getAssetUrl('branding', `logos/${brandingSettings.logo}`);
            setOrganizationLogo(logoUrl);
            console.log("Logo URL:", logoUrl);
          }
          
          if (brandingSettings.seal) {
            const sealUrl = getAssetUrl('branding', `seals/${brandingSettings.seal}`);
            setOrganizationSeal(sealUrl);
            console.log("Seal URL:", sealUrl);
          }

          if (brandingSettings.signature) {
            const signatureUrl = getAssetUrl('branding', `signatures/${brandingSettings.signature}`);
            setSignatureImage(signatureUrl);
            console.log("Signature URL:", signatureUrl);
          }
        } else {
          console.log("No branding settings found");
        }

        // Get organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organization_details')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (orgData && orgData.length > 0 && !orgError) {
          console.log("Loaded organization details:", orgData[0]);
          setOrgDetails(orgData[0]);
        } else {
          console.log("No organization details found, checking localStorage");
          // Fall back to localStorage
          const orgDetailsStr = localStorage.getItem('organizationDetails');
          if (orgDetailsStr) {
            setOrgDetails(JSON.parse(orgDetailsStr));
          }
        }
      } catch (err) {
        console.error("Error loading assets:", err);
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
    
    // Set up refresh interval (check every 10 seconds in case user updates branding)
    const refreshInterval = setInterval(() => {
      setRefreshKey(Date.now());
    }, 10000);
    
    return () => clearInterval(refreshInterval);
    
  }, [refreshKey, getAssetUrl, data]); // Re-fetch when data or refreshKey changes

  // Use organization name from orgDetails, fallback to data.institutionName only if orgDetails is empty
  const institutionName = (orgDetails?.name && orgDetails.name !== "Enter your organization name") 
    ? orgDetails.name 
    : (data.institutionName || "[Institution Name]");

  // Use organization contact details from orgDetails
  const getContactInfo = () => {
    if (orgDetails) {
      const address = (orgDetails.address && orgDetails.address !== "Enter your address") ? orgDetails.address : "123 Education Street, Knowledge City, 400001";
      const phone = (orgDetails.phone && orgDetails.phone !== "Enter your phone number") ? orgDetails.phone : "+91 2222 333333";
      const email = (orgDetails.email && orgDetails.email !== "Enter official email address") ? orgDetails.email : "info@institution.edu";
      return { address, phone, email };
    }
    return {
      address: "123 Education Street, Knowledge City, 400001",
      phone: "+91 2222 333333", 
      email: "info@institution.edu"
    };
  };

  const contactInfo = getContactInfo();

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
    toast({
      title: `Error loading ${type}`,
      description: "The image could not be loaded. Try uploading it again.",
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
            {contactInfo.address} • {contactInfo.phone} • {contactInfo.email}
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
          </div>
        </div>
      </div>
    </div>
  );
}
