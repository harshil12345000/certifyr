
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
      <div className="text-center mb-8 pb-4 border-b-2 border-blue-200">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={`${institutionName || 'Institution'} Logo`} className="h-20 mx-auto mb-4 object-contain" />
        )}
        <h1 className="text-3xl font-bold text-blue-600 uppercase tracking-wide">{institutionName || '[INSTITUTION NAME]'}</h1>
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
        <div className="border-2 border-gray-600 inline-block px-8 py-3">
          <h2 className="text-xl font-bold uppercase tracking-widest">INCOME CERTIFICATE</h2>
        </div>
      </div>

      {/* Reference Number */}
      <div className="flex justify-between mb-6 text-sm">
        <p><strong>Certificate No.:</strong> IC/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Certificate Content */}
      <div className="space-y-6 text-justify leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO WHOM IT MAY CONCERN
        </p>

        <p>
          This is to certify that <strong>{fullName || '[Employee Name]'}</strong>, 
          son/daughter of <strong>{fatherName || "[Father's Name]"}</strong>, 
          is a regular employee of our organization with Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>.
        </p>

        {/* Employee Details Section */}
        <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-bold text-lg mb-4 text-blue-600">Employee Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-semibold">{fullName || '[Employee Name]'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Father's Name</p>
              <p className="font-semibold">{fatherName || "[Father's Name]"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Designation</p>
              <p className="font-semibold">{designation || '[Designation]'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employee ID</p>
              <p className="font-semibold">{employeeId || '[Employee ID]'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-semibold">{department || '[Department]'}</p>
            </div>
          </div>
        </div>

        {/* Income Details Section */}
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-green-500">
          <h3 className="font-bold text-lg mb-4 text-green-600">
            Income Details ({incomeFrequency === 'monthly' ? 'Monthly' : 'Annual'})
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Basic Salary:</span>
              <span className="font-semibold text-lg">₹ {formatCurrency(basicSalary) || '[Basic Salary]'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Allowances:</span>
              <span className="font-semibold text-lg">₹ {formatCurrency(allowances) || '[Allowances]'}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-white rounded px-4 border-2 border-green-500">
              <span className="font-bold text-green-700">Total Income:</span>
              <span className="font-bold text-xl text-green-700">₹ {formatCurrency(totalIncome) || '[Total Income]'}</span>
            </div>
          </div>
        </div>

        <p>
          The above-mentioned income details are based on the current salary structure and are accurate 
          as per our records. This employee is a regular {incomeFrequency === 'monthly' ? 'monthly' : 'annual'} 
          salaried employee and receives the mentioned income on a regular basis.
        </p>

        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <p className="mb-2">
            <strong className="text-yellow-700">Purpose:</strong>
          </p>
          <p className="italic">
            This certificate is being issued for the purpose of <strong>{purpose || '[Purpose]'}</strong> as requested by the employee.
          </p>
        </div>

        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
          <strong>Disclaimer:</strong> This certificate is issued based on the records available with us and is valid as on the date of issue. 
          The organization does not take any responsibility for any misuse of this certificate.
        </p>

        <p className="text-center font-medium text-blue-600">
          We wish <strong>{fullName || '[Employee Name]'}</strong> all the best for future endeavors.
        </p>
      </div>

      {/* Date and Place */}
      <div className="mt-12 mb-8 flex justify-between text-sm">
        <div>
          <p><strong>Date:</strong> {formattedIssueDate}</p>
        </div>
        <div>
          <p><strong>Place:</strong> {place || '[Place]'}</p>
        </div>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-end items-end mt-16">
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
          <div className="border-t-2 border-black pt-2 min-w-[200px]">
            <p className="font-semibold">{signatoryName || '[Authorized Signatory Name]'}</p>
            <p className="text-sm">{signatoryDesignation || '[Designation]'}</p>
            <p className="text-sm">{institutionName || '[Institution Name]'}</p>
          </div>
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
