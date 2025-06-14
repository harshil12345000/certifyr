
import React, { useState, useEffect } from 'react';
import { BonafidePreviewProps } from '@/types/templates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BrandingAssets {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
  organizationAddress: string | null;
  organizationPhone: string | null;
  organizationEmail: string | null;
}

export const BonafidePreview: React.FC<BonafidePreviewProps> = ({ data }) => {
  const {
    fullName,
    gender,
    parentName,
    type,
    institutionName,
    startDate,
    courseOrDesignation,
    department,
    purpose,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const [branding, setBranding] = useState<BrandingAssets>({ 
    logoUrl: null, 
    sealUrl: null, 
    signatureUrl: null,
    organizationAddress: null,
    organizationPhone: null,
    organizationEmail: null
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchBranding = async () => {
      if (!institutionName && !user?.id) {
        console.warn("Bonafide Preview: Institution name or user context not available for fetching branding.");
        return;
      }
      try {
        let orgIdToQuery: string | null = null;

        if (institutionName) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, address, phone, email')
            .eq('name', institutionName)
            .single();

          if (orgError && orgError.code !== 'PGRST116') {
            console.error("Error fetching organization by name:", orgError.message);
          } else if (orgError?.code === 'PGRST116') {
            console.warn(`Organization named "${institutionName}" not found.`);
          }
          
          if (orgData) {
            orgIdToQuery = orgData.id;
            setBranding(prev => ({
              ...prev,
              organizationAddress: orgData.address,
              organizationPhone: orgData.phone,
              organizationEmail: orgData.email,
            }));
          }
        }

        if (!orgIdToQuery) {
          console.warn("Bonafide Preview: Could not determine organization ID for branding assets.");
        }

        if (orgIdToQuery) {
          const { data: filesData, error: filesError } = await supabase
            .from('branding_files')
            .select('name, path')
            .eq('organization_id', orgIdToQuery);

          if (filesError) {
            console.error("Error fetching branding files:", filesError);
          } else if (filesData) {
            let newLogoUrl: string | null = null;
            let newSealUrl: string | null = null;
            let newSignatureUrl: string | null = null;

            filesData.forEach(file => {
              const publicUrlRes = supabase.storage.from('branding-assets').getPublicUrl(file.path);
              const publicUrl = publicUrlRes.data?.publicUrl;
              if (publicUrl) {
                if (file.name === 'logo') newLogoUrl = publicUrl;
                if (file.name === 'seal') newSealUrl = publicUrl;
                if (file.name === 'signature') newSignatureUrl = publicUrl;
              }
            });
            
            setBranding(prev => ({ ...prev, logoUrl: newLogoUrl, sealUrl: newSealUrl, signatureUrl: newSignatureUrl }));
          }
        } else {
          setBranding(prev => ({ 
            ...prev, 
            logoUrl: null,
            sealUrl: null,
            signatureUrl: null
          }));
        }

      } catch (error) {
        console.error("Unexpected error fetching branding:", error);
      }
    };
    fetchBranding();
  }, [institutionName, user]);

  const pronoun = gender === 'female' ? 'She' : 'He';
  const childPronoun = gender === 'female' ? 'daughter' : 'son';
  const title = type === 'student' ? 'BONAFIDE CERTIFICATE' : 'EMPLOYMENT CERTIFICATE';

  const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Start Date]';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-serif text-sm leading-relaxed">
      {/* Letterhead Section */}
      <div className="text-center mb-8 pb-4 border-b">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={`${institutionName || 'Institution'} Logo`} className="h-20 mx-auto mb-2 object-contain" />
        )}
        <h1 className="text-2xl font-bold text-blue-700">{institutionName || '[Institution Name]'}</h1>
        {branding.organizationAddress && <p className="text-xs">{branding.organizationAddress}</p>}
        {(branding.organizationPhone || branding.organizationEmail) && (
          <p className="text-xs">
            {branding.organizationPhone && `Phone: ${branding.organizationPhone}`}
            {branding.organizationPhone && branding.organizationEmail && ' | '}
            {branding.organizationEmail && `Email: ${branding.organizationEmail}`}
          </p>
        )}
      </div>

      <div className="flex justify-between mb-6">
        <div>
          {/* Ref No. can be added if needed */}
        </div>
        <div>
          <p>Date: {formattedIssueDate}</p>
          <p>Place: {place || '[Place of Issue]'}</p>
        </div>
      </div>

      <h2 className="text-center font-bold text-lg mb-6 underline uppercase">{title}</h2>

      <p className="mb-4 text-justify">
        This is to certify that Mr./Ms. <strong>{fullName || '[Full Name]'}</strong>, {childPronoun} of Mr./Mrs. <strong>{parentName || "[Parent's Name]"}</strong>, is a bonafide {type} of <strong>{institutionName || '[Institution Name]'}</strong>.
      </p>
      <p className="mb-4 text-justify">
        {pronoun} has been {type === 'student' ? 'studying in' : 'working with'} this institution since <strong>{formattedStartDate}</strong> and is currently {type === 'student' ? 'enrolled as a' : 'designated as'} <strong>{courseOrDesignation || '[Course/Designation]'}</strong> {type === 'student' ? 'student' : ''} in the <strong>{department || '[Department]'}</strong> department.
      </p>
      <p className="mb-6 text-justify">
        This certificate is issued upon the request of the individual for the purpose of <strong>{purpose || '[Purpose]'}</strong>. We confirm that the above information is true and correct to the best of our knowledge and records.
      </p>

      {/* Signatory Section */}
      <div className="mt-16 flex justify-between items-end">
        <div>
          {branding.sealUrl && (
            <img src={branding.sealUrl} alt="Institution Seal" className="h-20 w-20 object-contain opacity-75" />
          )}
        </div>
        <div className="text-center">
          {includeDigitalSignature && branding.signatureUrl && (
            <img src={branding.signatureUrl} alt="Signatory Signature" className="h-16 mx-auto mb-1 object-contain" />
          )}
          {includeDigitalSignature && !branding.signatureUrl && (
            <div className="h-16 w-48 my-2 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 italic mx-auto">
              [Digital Signature Placeholder]
            </div>
          )}
          {!includeDigitalSignature && <div className="h-16"></div>}
          <p className="font-semibold">{signatoryName || '[Signatory Name]'}</p>
          <p>{signatoryDesignation || '[Signatory Designation]'}</p>
          <p>{institutionName || '[Institution Name]'}</p>
        </div>
      </div>
    </div>
  );
};
