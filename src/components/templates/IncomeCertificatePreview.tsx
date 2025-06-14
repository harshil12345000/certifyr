
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
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-xl font-bold uppercase tracking-widest">INCOME CERTIFICATE</h2>
        </div>
      </div>

      {/* Reference Number */}
      <div className="mb-6">
        <p><strong>Certificate No.:</strong> IC/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Certificate Content */}
      <div className="space-y-4 text-justify leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO WHOM IT MAY CONCERN
        </p>

        <p>
          This is to certify that <strong>{fullName || '[Employee Name]'}</strong>, 
          son/daughter of <strong>{fatherName || "[Father's Name]"}</strong>, 
          is a regular employee of our organization with Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>.
        </p>

        <div className="my-6">
          <h3 className="font-bold text-lg mb-3">Employee Details:</h3>
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50 w-1/3">Full Name</td>
                <td className="border border-gray-400 p-2">{fullName || '[Employee Name]'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Father's Name</td>
                <td className="border border-gray-400 p-2">{fatherName || "[Father's Name]"}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Designation</td>
                <td className="border border-gray-400 p-2">{designation || '[Designation]'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Employee ID</td>
                <td className="border border-gray-400 p-2">{employeeId || '[Employee ID]'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Department</td>
                <td className="border border-gray-400 p-2">{department || '[Department]'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="my-6">
          <h3 className="font-bold text-lg mb-3">Income Details ({incomeFrequency === 'monthly' ? 'Monthly' : 'Annual'}):</h3>
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50 w-1/3">Basic Salary</td>
                <td className="border border-gray-400 p-2">₹ {formatCurrency(basicSalary) || '[Basic Salary]'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Allowances</td>
                <td className="border border-gray-400 p-2">₹ {formatCurrency(allowances) || '[Allowances]'}</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="border border-gray-400 p-2 font-bold">Total Income</td>
                <td className="border border-gray-400 p-2 font-bold">₹ {formatCurrency(totalIncome) || '[Total Income]'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The above-mentioned income details are based on the current salary structure and are accurate 
          as per our records. This employee is a regular {incomeFrequency === 'monthly' ? 'monthly' : 'annual'} 
          salaried employee and receives the mentioned income on a regular basis.
        </p>

        <p>
          <strong>Purpose:</strong> This certificate is being issued for the purpose of 
          <strong> {purpose || '[Purpose]'}</strong> as requested by the employee.
        </p>

        <p>
          This certificate is issued based on the records available with us and is valid as on the date of issue. 
          The organization does not take any responsibility for any misuse of this certificate.
        </p>

        <p className="mt-6">
          We wish {fullName || '[Employee Name]'} all the best for future endeavors.
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
