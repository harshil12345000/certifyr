import React, { useState, useEffect } from 'react';
import { OfferLetterPreviewProps } from '@/types/templates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { Letterhead } from './Letterhead';

interface BrandingAssets {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
  organizationAddress: string | null;
  organizationPhone: string | null;
  organizationEmail: string | null;
}

export const OfferLetterPreview: React.FC<OfferLetterPreviewProps> = ({ data }) => {
  const {
    candidateName,
    candidateAddress,
    dateOfOffer,
    jobTitle,
    department,
    reportingManager,
    startDate,
    probationPeriod,
    salaryAmount,
    salaryCurrency,
    salaryFrequency,
    benefits,
    workHours,
    workLocation,
    acceptanceDeadline,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl, sealUrl } = useBranding();
  const { user } = useAuth();

  const [branding, setBranding] = useState<BrandingAssets>({
    logoUrl: null,
    sealUrl: null,
    signatureUrl: null,
    organizationAddress: null,
    organizationPhone: null,
    organizationEmail: null,
  });

  useEffect(() => {
    const fetchBranding = async () => {
      if (!institutionName && !user?.id) {
        console.warn("Offer Letter Preview: Institution name or user context not available for fetching branding.");
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '[Date]';
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount: string, currency: string) => {
    if (!amount) return '[Amount]';
    const num = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(num)) return amount;
    return `${currency || 'INR'} ${num.toLocaleString('en-IN')}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-serif text-sm leading-relaxed">
      {/* Letterhead */}
      <Letterhead />

      {/* Letter Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">OFFER LETTER</h2>
        </div>
      </div>

      {/* Reference Number and Date */}
      <div className="flex justify-between mb-6 text-sm">
        <p><strong>Reference No.:</strong> OL/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formatDate(dateOfOffer)}</p>
      </div>

      {/* Candidate Address */}
      <div className="mb-6">
        <p>To,</p>
        <p><strong>{candidateName || '[Candidate Name]'}</strong></p>
        <p className="whitespace-pre-line">{candidateAddress || '[Candidate Address]'}</p>
      </div>

      {/* Subject */}
      <div className="mb-6">
        <p><strong>Subject: Offer of Employment - {jobTitle || '[Job Title]'}</strong></p>
      </div>

      {/* Letter Content */}
      <div className="space-y-4 text-base leading-7">
        <p>Dear {candidateName ? candidateName.split(' ')[0] : '[Name]'},</p>

        <p className="text-justify">
          We are pleased to offer you the position of <strong>{jobTitle || '[Job Title]'}</strong> in the 
          <strong> {department || '[Department]'}</strong> department at <strong>{institutionName || '[Institution Name]'}</strong>. 
          You will be reporting to <strong>{reportingManager || '[Reporting Manager]'}</strong>.
        </p>

        <p className="text-justify">
          Your anticipated start date will be <strong>{formatDate(startDate)}</strong>. This offer is subject to 
          successful completion of pre-employment verification and a probation period of <strong>{probationPeriod || '[Probation Period]'}</strong>.
        </p>

        <div className="space-y-2">
          <p><strong>Compensation & Benefits:</strong></p>
          <div className="ml-4 space-y-1">
            <p>• {salaryFrequency === 'annually' ? 'Annual' : 'Monthly'} Salary: <strong>{formatCurrency(salaryAmount, salaryCurrency)}</strong></p>
            <p>• Work Hours: <strong>{workHours || '[Work Hours]'}</strong></p>
            <p>• Work Location: <strong>{workLocation || '[Work Location]'}</strong></p>
          </div>
        </div>

        {benefits && (
          <div className="space-y-2">
            <p><strong>Additional Benefits:</strong></p>
            <div className="ml-4 whitespace-pre-line text-sm bg-gray-50 p-3 border-l-2 border-blue-400">
              {benefits}
            </div>
          </div>
        )}

        <p className="text-justify">
          This offer is valid until <strong>{formatDate(acceptanceDeadline)}</strong>. Please confirm your acceptance 
          by signing and returning a copy of this letter by the specified date.
        </p>

        <p className="text-justify">
          We look forward to welcoming you to our team and are confident that your skills and experience will be 
          valuable additions to our organization.
        </p>

        <p>We await your positive response.</p>
      </div>

      {/* Date and Place */}
      <div className="mt-12 mb-8">
        <p><strong>Date:</strong> {formatDate(issueDate)}</p>
        <p><strong>Place:</strong> {place || '[Place]'}</p>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-end items-end mt-16">
        <div className="text-center">
          {includeDigitalSignature && signatureUrl && (
            <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" onError={(e) => handleImageError(e, 'signature')} />
          )}
          {!includeDigitalSignature && <div className="h-16"></div>}
          <div className="border-t border-black pt-2 min-w-[200px]">
            <p className="font-semibold">{signatoryName || '[Authorized Signatory Name]'}</p>
            <p className="text-sm">{signatoryDesignation || '[Designation]'}</p>
            <p className="text-sm">{institutionName || '[Institution Name]'}</p>
          </div>
        </div>
      </div>

      {/* Acceptance Section */}
      <div className="mt-16 pt-8 border-t border-gray-300">
        <div className="space-y-4">
          <p className="font-semibold">ACCEPTANCE:</p>
          <p>I hereby accept the terms and conditions of employment as outlined in this offer letter.</p>
          
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              <div className="border-t border-black pt-2 mt-16">
                <p className="text-sm">Candidate Signature</p>
              </div>
            </div>
            <div>
              <div className="border-t border-black pt-2 mt-16">
                <p className="text-sm">Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img src={sealUrl} alt="Institution Seal" className="h-20 w-20 object-contain opacity-50" onError={(e) => handleImageError(e, 'seal')} />
        </div>
      )}
    </div>
  );
};
