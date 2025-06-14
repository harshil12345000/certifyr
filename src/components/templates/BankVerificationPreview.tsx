
import React, { useState, useEffect } from 'react';
import { BankVerificationPreviewProps } from '@/types/templates';
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

export const BankVerificationPreview: React.FC<BankVerificationPreviewProps> = ({ data }) => {
  const {
    fullName,
    employeeId,
    designation,
    department,
    bankName,
    accountNumber,
    accountType,
    ifscCode,
    branchName,
    branchAddress,
    accountHolderName,
    joinDate,
    currentSalary,
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
        console.warn("Bank Verification Preview: Institution name or user context not available for fetching branding.");
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
  const formattedJoinDate = joinDate ? new Date(joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Join Date]';

  const formatCurrency = (amount: string) => {
    if (!amount) return '0';
    const num = parseFloat(amount.replace(/,/g, ''));
    return isNaN(num) ? amount : num.toLocaleString('en-IN');
  };

  const getAccountTypeText = (type: string) => {
    switch (type) {
      case 'savings': return 'Savings Account';
      case 'current': return 'Current Account';
      case 'salary': return 'Salary Account';
      default: return 'Account';
    }
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
          <h2 className="text-xl font-bold uppercase tracking-widest">BANK ACCOUNT VERIFICATION LETTER</h2>
        </div>
      </div>

      {/* Reference Number */}
      <div className="flex justify-between mb-6 text-sm">
        <p><strong>Reference No.:</strong> BAV/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Letter Content */}
      <div className="space-y-6 text-justify leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO WHOM IT MAY CONCERN
        </p>

        <p>
          This is to certify that <strong>{fullName || '[Employee Name]'}</strong>, 
          Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>, is a regular employee of our organization 
          working as <strong>{designation || '[Designation]'}</strong> in the <strong>{department || '[Department]'}</strong> department 
          since <strong>{formattedJoinDate}</strong>.
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
              <p className="text-sm text-gray-600">Employee ID</p>
              <p className="font-semibold">{employeeId || '[Employee ID]'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Designation</p>
              <p className="font-semibold">{designation || '[Designation]'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-semibold">{department || '[Department]'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Joining</p>
              <p className="font-semibold">{formattedJoinDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Salary</p>
              <p className="font-semibold">₹ {formatCurrency(currentSalary) || '[Current Salary]'}</p>
            </div>
          </div>
        </div>

        {/* Bank Account Details Section */}
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-green-500">
          <h3 className="font-bold text-lg mb-4 text-green-600">Bank Account Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Account Holder Name:</span>
              <span className="font-semibold">{accountHolderName || '[Account Holder Name]'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Bank Name:</span>
              <span className="font-semibold">{bankName || '[Bank Name]'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Account Number:</span>
              <span className="font-semibold">{accountNumber || '[Account Number]'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Account Type:</span>
              <span className="font-semibold">{getAccountTypeText(accountType || 'savings')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">IFSC Code:</span>
              <span className="font-semibold">{ifscCode || '[IFSC Code]'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Branch Name:</span>
              <span className="font-semibold">{branchName || '[Branch Name]'}</span>
            </div>
          </div>
        </div>

        {/* Branch Address Section */}
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <h3 className="font-bold text-lg mb-4 text-yellow-600">Branch Address</h3>
          <p className="text-gray-700 leading-relaxed">
            {branchAddress || '[Branch Address]'}
          </p>
        </div>

        <p>
          We hereby confirm that the above-mentioned bank account details are authentic and belong to our employee. 
          The salary of the employee is directly credited to this account on a monthly basis.
        </p>

        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <p className="mb-2">
            <strong className="text-green-700">Purpose:</strong>
          </p>
          <p className="italic text-gray-700">
            {purpose || '[Purpose for bank account verification]'}
          </p>
        </div>

        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
          <strong>Disclaimer:</strong> This letter is issued based on the records available with us and is valid as on the date of issue. 
          The organization does not take any responsibility for any financial transactions or commitments made by the employee.
        </p>

        <p className="text-center font-medium text-blue-600">
          This letter is issued upon the request of the employee for official purposes only.
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
