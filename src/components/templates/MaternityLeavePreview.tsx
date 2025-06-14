
import React, { useState, useEffect } from 'react';
import { MaternityLeavePreviewProps } from '@/types/templates';
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

export const MaternityLeavePreview: React.FC<MaternityLeavePreviewProps> = ({ data }) => {
  const {
    fullName,
    employeeId,
    designation,
    department,
    expectedDeliveryDate,
    leaveStartDate,
    leaveEndDate,
    totalLeaveDays,
    medicalCertificateNumber,
    doctorName,
    hospitalName,
    emergencyContact,
    emergencyContactPhone,
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
        console.warn("Maternity Leave Preview: Institution name or user context not available for fetching branding.");
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
  const formattedExpectedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Expected Delivery Date]';
  const formattedLeaveStartDate = leaveStartDate ? new Date(leaveStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Leave Start Date]';
  const formattedLeaveEndDate = leaveEndDate ? new Date(leaveEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Leave End Date]';

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

      {/* Application Title */}
      <div className="text-center mb-8">
        <div className="border-2 border-gray-600 inline-block px-8 py-3">
          <h2 className="text-xl font-bold uppercase tracking-widest">MATERNITY LEAVE APPLICATION</h2>
        </div>
      </div>

      {/* Reference Number */}
      <div className="flex justify-between mb-6 text-sm">
        <p><strong>Application No.:</strong> ML/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Application Content */}
      <div className="space-y-6 text-justify leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO THE HUMAN RESOURCES DEPARTMENT
        </p>

        <p>
          I, <strong>{fullName || '[Employee Name]'}</strong>, Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>, 
          working as <strong>{designation || '[Designation]'}</strong> in the <strong>{department || '[Department]'}</strong> department, 
          would like to apply for maternity leave as per the organization's policy.
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
          </div>
        </div>

        {/* Leave Details Section */}
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-green-500">
          <h3 className="font-bold text-lg mb-4 text-green-600">Leave Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Expected Delivery Date:</span>
              <span className="font-semibold">{formattedExpectedDeliveryDate}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Leave Start Date:</span>
              <span className="font-semibold">{formattedLeaveStartDate}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Leave End Date:</span>
              <span className="font-semibold">{formattedLeaveEndDate}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-white rounded px-4 border-2 border-green-500">
              <span className="font-bold text-green-700">Total Leave Days:</span>
              <span className="font-bold text-xl text-green-700">{totalLeaveDays || '[Total Days]'}</span>
            </div>
          </div>
        </div>

        {/* Medical Details Section */}
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <h3 className="font-bold text-lg mb-4 text-yellow-600">Medical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Medical Certificate Number</p>
              <p className="font-semibold">{medicalCertificateNumber || '[Certificate Number]'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Doctor's Name</p>
              <p className="font-semibold">{doctorName || "[Doctor's Name]"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Hospital Name</p>
              <p className="font-semibold">{hospitalName || '[Hospital Name]'}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
          <h3 className="font-bold text-lg mb-4 text-red-600">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Contact Person</p>
              <p className="font-semibold">{emergencyContact || '[Emergency Contact]'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-semibold">{emergencyContactPhone || '[Phone Number]'}</p>
            </div>
          </div>
        </div>

        <p>
          I have attached the medical certificate and other necessary documents for your reference. 
          I request you to kindly approve my maternity leave application and make the necessary arrangements 
          for my work responsibilities during my absence.
        </p>

        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
          <strong>Note:</strong> I will be available on my contact number for any urgent matters and will ensure 
          a smooth handover of my responsibilities before commencing my leave.
        </p>

        <p className="text-center font-medium text-blue-600">
          Thank you for your consideration and support.
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

      {/* Employee Signature Section */}
      <div className="flex justify-between items-end mt-16">
        <div className="text-left">
          <div className="h-16"></div>
          <div className="border-t-2 border-black pt-2 min-w-[200px]">
            <p className="font-semibold">{fullName || '[Employee Name]'}</p>
            <p className="text-sm">Employee Signature</p>
            <p className="text-sm">Employee ID: {employeeId || '[Employee ID]'}</p>
          </div>
        </div>

        <div className="text-right">
          {includeDigitalSignature && branding.signatureUrl && (
            <img src={branding.signatureUrl} alt="Authorized Signature" className="h-16 mb-2 object-contain ml-auto" />
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
