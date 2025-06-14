
import React, { useState, useEffect } from 'react';
import { OfferLetterPreviewProps } from '@/types/templates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BrandingAssets {
  logoUrl: string | null;
  sealUrl: string | null; // May not be typical for offer letters, but included for consistency
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
    date: issueDate, // This is the general document issue date
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
    organizationEmail: null,
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchBranding = async () => {
      if (!institutionName && !user?.id) {
        console.warn("Offer Letter Preview: Institution name or user context not available for fetching branding.");
        return;
      }
      try {
        let orgIdToQuery: string | null = null;
        let fetchedOrgAddress: string | null = null;
        let fetchedOrgPhone: string | null = null;
        let fetchedOrgEmail: string | null = null;

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
            fetchedOrgAddress = orgData.address;
            fetchedOrgPhone = orgData.phone;
            fetchedOrgEmail = orgData.email;
          }
        }
        
        setBranding(prev => ({
          ...prev,
          organizationAddress: fetchedOrgAddress,
          organizationPhone: fetchedOrgPhone,
          organizationEmail: fetchedOrgEmail,
        }));

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
                if (file.name === 'seal') newSealUrl = publicUrl; // Optional for offer letters
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
    try {
      return num.toLocaleString('en-IN', { style: 'currency', currency: currency || 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (e) { // Fallback for unknown currency
      return `${currency} ${num.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
  };
  
  const orgAddressLine = branding.organizationAddress || '[Organization Address]';
  const orgContactLine = [branding.organizationPhone, branding.organizationEmail].filter(Boolean).join(' • ') || '[Organization Phone/Email]';


  return (
    <div className="a4-document p-8 bg-white text-gray-800 text-sm leading-relaxed font-serif">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {branding.logoUrl && (
            <img src={branding.logoUrl} alt={`${institutionName || 'Company'} Logo`} className="h-16 mb-2 object-contain" />
          )}
          <h1 className="text-xl font-bold text-gray-700 uppercase">
            {institutionName || '[COMPANY NAME]'}
          </h1>
          <p className="text-xs text-gray-500">{orgAddressLine}</p>
          <p className="text-xs text-gray-500">{orgContactLine}</p>
        </div>
        <div className="text-right text-xs">
          <p>Date: {formatDate(dateOfOffer)}</p>
        </div>
      </div>

      {/* Candidate Details */}
      <div className="mb-8 text-left">
        <p>To,</p>
        <p><strong>{candidateName || '[Candidate Name]'}</strong></p>
        <p className="whitespace-pre-line">{candidateAddress || '[Candidate Address]'}</p>
      </div>
      
      {/* Subject */}
      <div className="mb-6">
        <p className="font-bold">Subject: Offer of Employment - {jobTitle || '[Job Title]'}</p>
      </div>

      {/* Letter Body */}
      <div className="space-y-4 text-justify">
        <p>Dear {candidateName || '[Candidate Name]'},</p>
        <p>
          We are pleased to offer you the position of <strong>{jobTitle || '[Job Title]'}</strong> in the <strong>{department || '[Department]'}</strong> department at <strong>{institutionName || '[Company Name]'}</strong>. 
          In this role, you will be reporting to <strong>{reportingManager || '[Reporting Manager]'}</strong>.
        </p>
        <p>
          Your anticipated start date will be <strong>{formatDate(startDate)}</strong>. This offer is contingent upon successful completion of any pre-employment checks, if applicable.
        </p>
        <p>
          Your employment will be subject to a probation period of <strong>{probationPeriod || '[Probation Period]'}</strong>, during which your performance will be reviewed.
        </p>
        <p>
          Your {salaryFrequency === 'annually' ? 'annual' : 'monthly'} compensation will be <strong>{formatCurrency(salaryAmount, salaryCurrency)}</strong>. This will be paid {salaryFrequency === 'annually' ? 'annually, subject to standard payroll deductions' : 'on a monthly basis, subject to standard payroll deductions'}.
        </p>
        <p>
          You will be eligible for the following benefits:
        </p>
        <div className="ml-4 whitespace-pre-line bg-gray-50 p-2 border-l-2 border-gray-300">
          {benefits || '[Benefits Description]'}
        </div>
        <p>
          Your standard work hours will be <strong>{workHours || '[Work Hours]'}</strong>, and your primary work location will be <strong>{workLocation || '[Work Location]'}</strong>.
        </p>
        <p>
          This offer of employment is valid until <strong>{formatDate(acceptanceDeadline)}</strong>. To accept this offer, please sign and return a copy of this letter by the aforementioned date.
        </p>
        <p>
          We are excited about the possibility of you joining our team and look forward to your positive response. If you have any questions, please do not hesitate to contact us.
        </p>
      </div>

      {/* Closing */}
      <div className="mt-12">
        <p>Sincerely,</p>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-start items-end mt-8">
        <div className="text-left">
          {includeDigitalSignature && branding.signatureUrl && (
            <img src={branding.signatureUrl} alt="Signatory Signature" className="h-16 mb-1 object-contain" />
          )}
          {!includeDigitalSignature && <div className="h-16"></div>} {/* Placeholder for spacing if no signature */}
          <div className="border-t border-gray-500 pt-1 min-w-[200px]">
            <p className="font-semibold">{signatoryName || '[Signatory Name]'}</p>
            <p className="text-xs">{signatoryDesignation || '[Signatory Designation]'}</p>
            <p className="text-xs">{institutionName || '[Company Name]'}</p>
          </div>
        </div>
      </div>
      
      {/* Footer Info - Optional */}
      <div className="mt-16 text-center text-xs text-gray-400 border-t pt-2">
         <p>{institutionName || '[Company Name]'} | {orgAddressLine}</p>
         <p>Issued on: {formatDate(issueDate)} | Place: {place || '[Place]'}</p>
      </div>

      {/* Optional Seal - not typical for offer letters but kept for structural consistency */}
      {/*
      {branding.sealUrl && (
        <div className="absolute bottom-16 right-16"> // Positioned differently if used
          <img src={branding.sealUrl} alt="Company Seal" className="h-20 w-20 object-contain opacity-30" />
        </div>
      )}
      */}
    </div>
  );
};

