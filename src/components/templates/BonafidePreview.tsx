import React from "react";
import { BonafideData } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface BonafidePreviewProps {
  data: BonafideData;
}

export function BonafidePreview({ data }: BonafidePreviewProps) {
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [organizationSeal, setOrganizationSeal] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [brandingInfo, setBrandingInfo] = useState<any>(null);

  useEffect(() => {
    // Load branding settings from localStorage
    const loadBrandingSettings = async () => {
      try {
        // Try to get branding info from Supabase first
        const { data: brandingData, error } = await supabase
          .from('branding_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (brandingData && !error) {
          console.log("Loaded branding info from Supabase:", brandingData);
          setBrandingInfo(brandingData);
          
          // If we have file references, fetch from storage
          if (brandingData.logo) {
            try {
              const { data: logoData, error: logoError } = await supabase.storage
                .from('branding')
                .download(`logos/${brandingData.logo}`);
              
              if (logoData && !logoError) {
                setOrganizationLogo(URL.createObjectURL(logoData));
              }
            } catch (err) {
              console.error("Error loading logo:", err);
            }
          }
          
          if (brandingData.seal) {
            try {
              const { data: sealData, error: sealError } = await supabase.storage
                .from('branding')
                .download(`seals/${brandingData.seal}`);
              
              if (sealData && !sealError) {
                setOrganizationSeal(URL.createObjectURL(sealData));
              }
            } catch (err) {
              console.error("Error loading seal:", err);
            }
          }

          if (brandingData.signature) {
            try {
              const { data: sigData, error: sigError } = await supabase.storage
                .from('branding')
                .download(`signatures/${brandingData.signature}`);
              
              if (sigData && !sigError) {
                setSignatureImage(URL.createObjectURL(sigData));
              }
            } catch (err) {
              console.error("Error loading signature:", err);
            }
          }
        } else {
          // Fall back to localStorage if no data in Supabase
          const brandingInfoStr = localStorage.getItem('brandingInfo');
          if (brandingInfoStr) {
            const branding = JSON.parse(brandingInfoStr);
            setBrandingInfo(branding);
            
            // If we have file references, fetch from storage
            if (branding.logo) {
              try {
                const { data: logoData, error: logoError } = await supabase.storage
                  .from('branding')
                  .download(`logos/${branding.logo}`);
                
                if (logoData && !logoError) {
                  setOrganizationLogo(URL.createObjectURL(logoData));
                }
              } catch (err) {
                console.error("Error loading logo:", err);
              }
            }
            
            if (branding.seal) {
              try {
                const { data: sealData, error: sealError } = await supabase.storage
                  .from('branding')
                  .download(`seals/${branding.seal}`);
                
                if (sealData && !sealError) {
                  setOrganizationSeal(URL.createObjectURL(sealData));
                }
              } catch (err) {
                console.error("Error loading seal:", err);
              }
            }

            if (branding.signature) {
              try {
                const { data: sigData, error: sigError } = await supabase.storage
                  .from('branding')
                  .download(`signatures/${branding.signature}`);
                
                if (sigData && !sigError) {
                  setSignatureImage(URL.createObjectURL(sigData));
                }
              } catch (err) {
                console.error("Error loading signature:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading branding settings:", err);
      }
    };

    loadBrandingSettings();
  }, []);

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

  const getPersonType = () => {
    return data.type === "student" ? "studying" : "working";
  };

  const getPosition = () => {
    return data.type === "student" ? "enrolled" : "employed";
  };

  // Get organization details from Supabase or localStorage
  const [orgDetails, setOrgDetails] = useState<any>(null);
  
  useEffect(() => {
    const loadOrgDetails = async () => {
      try {
        // Try to get organization details from Supabase first
        const { data: orgData, error } = await supabase
          .from('organization_details')
          .select('*')
          .limit(1)
          .single();
        
        if (orgData && !error) {
          console.log("Loaded org details from Supabase:", orgData);
          setOrgDetails(orgData);
        } else {
          // Fall back to localStorage
          const orgDetailsStr = localStorage.getItem('organizationDetails');
          if (orgDetailsStr) {
            setOrgDetails(JSON.parse(orgDetailsStr));
          }
        }
      } catch (err) {
        console.error("Error loading organization details:", err);
        // Fall back to localStorage
        try {
          const orgDetailsStr = localStorage.getItem('organizationDetails');
          if (orgDetailsStr) {
            setOrgDetails(JSON.parse(orgDetailsStr));
          }
        } catch (error) {
          console.error("Error parsing organization details from localStorage:", error);
        }
      }
    };
    
    loadOrgDetails();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0 a4-document">
      <div className="p-8 min-h-[297mm] w-full max-w-[210mm] mx-auto bg-white relative">
        {/* Letterhead */}
        <div className="text-center border-b pb-4 mb-8">
          {organizationLogo && (
            <div className="flex justify-center mb-2">
              <img 
                src={organizationLogo} 
                alt="Organization Logo" 
                className="h-16 object-contain"
              />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary">
            {data.institutionName || (orgDetails ? orgDetails.name : "[Institution Name]")}
          </h1>
          <p className="text-muted-foreground">
            {orgDetails ? orgDetails.address : "123 Education Street, Knowledge City, 400001"} • 
            {orgDetails ? orgDetails.phone : "+91 2222 333333"} • 
            {orgDetails ? orgDetails.email : "info@institution.edu"}
          </p>
          {brandingInfo && brandingInfo.tagline && (
            <p className="text-sm italic mt-1">{brandingInfo.tagline}</p>
          )}
        </div>

        {/* Certificate title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold border-2 border-gray-300 inline-block px-4 py-2">
            BONAFIDE CERTIFICATE
          </h2>
        </div>

        {/* Certificate content - Matching the template format */}
        <div className="space-y-6 text-base md:text-lg leading-relaxed">
          <p>
            This is to certify that <strong>{data.fullName || "[Full Name]"}</strong>, {getRelation()} of <strong>{data.parentName || "[Parent's Name]"}</strong>, is a bonafide {data.type || "student/employee"} of <strong>{data.institutionName || (orgDetails ? orgDetails.name : "[Institution Name]")}</strong>.
          </p>

          <p>
            {getPronoun()} has been {getPersonType()} in this institution since <strong>{data.startDate ? formatDate(new Date(data.startDate)) : "[Start Date]"}</strong> and is currently {getPosition()} as a <strong>{data.courseOrDesignation || "[Course/Designation]"}</strong> in the <strong>{data.department || "[Department]"}</strong>.
          </p>

          <p>
            This certificate is issued upon the request of the individual for the purpose of <strong>{data.purpose || "[Purpose]"}</strong>.
          </p>

          <p>
            We confirm that the above information is true and correct to the best of our knowledge and records.
          </p>
        </div>

        {/* Date and signature - Updated to match the requested template layout */}
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
            <p>{data.institutionName || (orgDetails ? orgDetails.name : "[Institution Name]")}</p>
            <div className="mt-2 border border-dashed inline-block p-2">
              {organizationSeal ? (
                <img 
                  src={organizationSeal} 
                  alt="Official Seal" 
                  className="h-12 w-12 object-contain"
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
