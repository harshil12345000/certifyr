import React, { useState, useEffect } from 'react';
import { IncomeCertificatePreviewProps } from '@/types/templates';
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

export const IncomeCertificatePreview: React.FC<IncomeCertificatePreviewProps> = ({ data }) => {
  const {
    fullName,
    fatherName,
    designation,
    employeeId,
    department,
    basicSalary,
    allowances,
    totalIncome,
    incomeFrequency,
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
        console.warn("Income Certificate Preview: Institution name or user context not available for fetching branding.");
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

  const formatCurrency = (amount: string) => {
    if (!amount) return '0';
    const num = parseFloat(amount.replace(/,/g, ''));
    return isNaN(num) ? amount : num.toLocaleString('en-IN');
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
          <h2 className="text-lg font-bold uppercase tracking-widest">INCOME CERTIFICATE</h2>
        </div>
      </div>

      {/* Reference Number */}
      <div className="flex justify-between mb-6 text-sm">
        <p><strong>Certificate No.:</strong> IC/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Certificate Content */}
      <div className="space-y-6 text-base leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO WHOM IT MAY CONCERN
        </p>

        <p className="text-justify">
          This is to certify that <strong>{fullName || '[Employee Name]'}</strong>, 
          son/daughter of <strong>{fatherName || "[Father's Name]"}</strong>, 
          is a regular employee of our organization with Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>.
        </p>

        <p className="text-justify">
          The employee is currently working as <strong>{designation || '[Designation]'}</strong> 
          in the <strong>{department || '[Department]'}</strong> department.
        </p>

        <p className="text-justify">
          The {incomeFrequency === 'monthly' ? 'monthly' : 'annual'} income details of the employee are as follows:
        </p>

        <div className="ml-8 space-y-2">
          <p><strong>Basic Salary:</strong> ₹ {formatCurrency(basicSalary) || '[Basic Salary]'}</p>
          <p><strong>Allowances:</strong> ₹ {formatCurrency(allowances) || '[Allowances]'}</p>
          <p><strong>Total Income:</strong> ₹ {formatCurrency(totalIncome) || '[Total Income]'}</p>
          <p><strong>Frequency:</strong> {incomeFrequency === 'monthly' ? 'Monthly' : 'Annual'}</p>
        </div>

        <p className="text-justify">
          The above-mentioned income details are based on the current salary structure and are accurate 
          as per our records. This employee is a regular {incomeFrequency === 'monthly' ? 'monthly' : 'annual'} 
          salaried employee and receives the mentioned income on a regular basis.
        </p>

        <p className="text-justify">
          This certificate is being issued for the purpose of <strong>{purpose || '[Purpose]'}</strong> 
          as requested by the employee.
        </p>

        <p className="text-justify text-sm">
          <strong>Disclaimer:</strong> This certificate is issued based on the records available with us and is valid as on the date of issue. 
          The organization does not take any responsibility for any misuse of this certificate.
        </p>

        <p className="text-center font-medium">
          This certificate is issued upon the request of the employee for official purposes only.
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
