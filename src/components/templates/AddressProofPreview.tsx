
import React, { useState, useEffect } from 'react';
import { AddressProofPreviewProps } from '@/types/templates';
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

export const AddressProofPreview: React.FC<AddressProofPreviewProps> = ({ data }) => {
  const {
    fullName,
    fatherName,
    currentAddress,
    permanentAddress,
    residenceDuration,
    relationshipWithApplicant,
    idProofType,
    idProofNumber,
    purpose,
    institutionName,
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
        console.warn("Address Proof Preview: Institution name or user context not available for fetching branding.");
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
        }

      } catch (error) {
        console.error("Unexpected error fetching branding:", error);
      }
    };
    fetchBranding();
  }, [institutionName, user]);

  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  const getIdProofText = (type: string) => {
    switch (type) {
      case 'aadhar': return 'Aadhar Card';
      case 'passport': return 'Passport';
      case 'voter_id': return 'Voter ID Card';
      case 'driving_license': return 'Driving License';
      default: return 'ID Proof';
    }
  };

  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case 'self': return 'the applicant';
      case 'father': return 'father of the applicant';
      case 'mother': return 'mother of the applicant';
      case 'guardian': return 'guardian of the applicant';
      case 'spouse': return 'spouse of the applicant';
      default: return 'relative of the applicant';
    }
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center mb-8">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={`${institutionName || 'Institution'} Logo`} className="h-16 mx-auto mb-4 object-contain" />
        )}
        <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-wide mb-2">
          {institutionName || '[INSTITUTION NAME]'}
        </h1>
        <p className="text-sm text-gray-600">
          {branding.organizationAddress && `${branding.organizationAddress} • `}
          {branding.organizationPhone && `${branding.organizationPhone} • `}
          {branding.organizationEmail && branding.organizationEmail}
        </p>
      </div>

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border-2 border-gray-600 inline-block px-6 py-2">
          <h2 className="text-lg font-bold uppercase tracking-widest">ADDRESS PROOF CERTIFICATE</h2>
        </div>
      </div>

      {/* Reference Number */}
      <div className="flex justify-between mb-6 text-sm">
        <p><strong>Reference No.:</strong> APC/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Letter Content */}
      <div className="space-y-6 text-base leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO WHOM IT MAY CONCERN
        </p>

        <p className="text-justify">
          This is to certify that <strong>{fullName || '[Full Name]'}</strong>, son/daughter of <strong>{fatherName || "[Father's Name]"}</strong>, 
          has been residing at the address mentioned below for a period of <strong>{residenceDuration || '[Duration]'}</strong>.
        </p>

        <div className="ml-8 space-y-2">
          <p><strong>Current Address:</strong></p>
          <p className="ml-4 whitespace-pre-line">{currentAddress || '[Current Address]'}</p>
          
          <p><strong>Permanent Address:</strong></p>
          <p className="ml-4 whitespace-pre-line">{permanentAddress || '[Permanent Address]'}</p>
        </div>

        <p className="text-justify">
          I am <strong>{getRelationshipText(relationshipWithApplicant)}</strong> and can verify the above address details based on 
          my personal knowledge and the records available with me.
        </p>

        <p className="text-justify">
          The verification is based on <strong>{getIdProofText(idProofType)}</strong> bearing number <strong>{idProofNumber || '[ID Number]'}</strong> 
          and other relevant documents.
        </p>

        <p className="text-justify">
          This certificate is being issued for <strong>{purpose || '[Purpose]'}</strong> and is valid as on the date of issue.
        </p>

        <p className="text-center font-medium">
          This certificate is issued upon request for official purposes only.
        </p>
      </div>

      {/* Date and Place */}
      <div className="mt-16 mb-8">
        <p><strong>Date:</strong> {formattedIssueDate}</p>
        <p><strong>Place:</strong> {place || '[Place]'}</p>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-end items-end mt-16">
        <div className="text-center">
          {includeDigitalSignature && branding.signatureUrl && (
            <img src={branding.signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" />
          )}
          {!includeDigitalSignature && <div className="h-16"></div>}
          <div className="border-t border-black pt-2 min-w-[200px]">
            <p className="font-semibold">{signatoryName || '[Authorized Signatory Name]'}</p>
            <p className="text-sm">{signatoryDesignation || '[Designation]'}</p>
            <p className="text-sm">{institutionName || '[Institution Name]'}</p>
          </div>
        </div>
      </div>

      {/* Seal */}
      {branding.sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img src={branding.sealUrl} alt="Institution Seal" className="h-20 w-20 object-contain opacity-50" />
        </div>
      )}
    </div>
  );
};
