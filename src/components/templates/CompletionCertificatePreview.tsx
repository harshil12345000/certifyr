
import React, { useState, useEffect } from 'react';
import { CompletionCertificatePreviewProps } from '@/types/templates';
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

export const CompletionCertificatePreview: React.FC<CompletionCertificatePreviewProps> = ({ data }) => {
  const {
    fullName,
    fatherName,
    registrationNumber,
    courseTitle,
    courseDuration,
    completionDate,
    grade,
    percentage,
    programType,
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
        console.warn("Completion Certificate Preview: Institution name or user context not available for fetching branding.");
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

  const formattedCompletionDate = completionDate ? new Date(completionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Completion Date]';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center mb-8 pb-4 border-b-2 border-blue-200">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={`${institutionName || 'Institution'} Logo`} className="h-20 mx-auto mb-4 object-contain" />
        )}
        <h1 className="text-3xl font-bold text-blue-600 uppercase tracking-wide">[{institutionName || 'INSTITUTION NAME'}]</h1>
        {branding.organizationAddress && <p className="text-sm mt-2">{branding.organizationAddress}</p>}
        {(branding.organizationPhone || branding.organizationEmail) && (
          <p className="text-sm">
            {branding.organizationPhone && `Tel: ${branding.organizationPhone}`}
            {branding.organizationPhone && branding.organizationEmail && ' | '}
            {branding.organizationEmail && `Email: ${branding.organizationEmail}`}
          </p>
        )}
      </div>

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border-2 border-gold-400 bg-gold-50 inline-block px-12 py-4 mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-gold-700">CERTIFICATE OF COMPLETION</h2>
        </div>
        <p className="text-lg italic text-gray-600">This is to certify that</p>
      </div>

      {/* Student Details */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-blue-700 mb-4 underline decoration-2 underline-offset-4">
          {fullName || '[Student Name]'}
        </h3>
        <p className="text-lg mb-2">Son/Daughter of <strong>{fatherName || "[Father's Name]"}</strong></p>
        <p className="text-lg mb-6">Registration Number: <strong>{registrationNumber || '[Registration Number]'}</strong></p>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-6 text-lg leading-8">
        <p>
          has successfully completed the <strong>{programType || 'program'}</strong> titled
        </p>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="text-2xl font-bold text-blue-700">{courseTitle || '[Course/Program Title]'}</h4>
        </div>

        <p>
          conducted for a duration of <strong>{courseDuration || '[Duration]'}</strong>
        </p>

        <p>
          completed on <strong>{formattedCompletionDate}</strong>
        </p>

        <p>
          with a grade of <strong>{grade || '[Grade]'}</strong> and <strong>{percentage || '[Percentage]'}</strong>
        </p>

        <p className="italic text-gray-600">
          We wish {fullName || 'the student'} success in all future endeavors.
        </p>
      </div>

      {/* Date and Place */}
      <div className="mt-12 mb-16">
        <p><strong>Date:</strong> {formattedIssueDate}</p>
        <p><strong>Place:</strong> {place || '[Place]'}</p>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-end items-end">
        <div className="text-right">
          {includeDigitalSignature && branding.signatureUrl && (
            <img src={branding.signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain ml-auto" />
          )}
          {includeDigitalSignature && !branding.signatureUrl && (
            <div className="h-16 w-48 mb-2 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 italic ml-auto">
              [Digital Signature Placeholder]
            </div>
          )}
          {!includeDigitalSignature && <div className="h-16"></div>}
          <p className="font-semibold">{signatoryName || '[Authorized Signatory Name]'}</p>
          <p>{signatoryDesignation || '[Designation]'}</p>
          <p>{institutionName || '[Institution Name]'}</p>
        </div>
      </div>

      {/* Seal */}
      {branding.sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img src={branding.sealUrl} alt="Institution Seal" className="h-24 w-24 object-contain opacity-50" />
        </div>
      )}
    </div>
  );
};
