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
          <h2 className="text-lg font-bold uppercase tracking-widest">MATERNITY LEAVE APPLICATION</h2>
        </div>
      </div>

      {/* Application Content */}
      <div className="space-y-6 text-base leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO THE HUMAN RESOURCES DEPARTMENT
        </p>

        <p className="text-justify">
          I, <strong>{fullName || '[Employee Name]'}</strong> (Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>), 
          working as <strong>{designation || '[Designation]'}</strong> in the <strong>{department || '[Department]'}</strong> department, 
          would like to apply for maternity leave as per the organization's policy.
        </p>

        <p className="text-justify">
          My expected delivery date is <strong>{formattedExpectedDeliveryDate}</strong>. I request to avail maternity leave 
          from <strong>{formattedLeaveStartDate}</strong> to <strong>{formattedLeaveEndDate}</strong>, 
          totaling <strong>{totalLeaveDays || '[Total Days]'}</strong> days.
        </p>

        <p className="text-justify">
          I have obtained medical certificate number <strong>{medicalCertificateNumber || '[Certificate Number]'}</strong> 
          from Dr. <strong>{doctorName || "[Doctor's Name]"}</strong> at <strong>{hospitalName || '[Hospital Name]'}</strong> 
          confirming my pregnancy and expected delivery date.
        </p>

        <p className="text-justify">
          In case of emergency during my leave period, I can be contacted through <strong>{emergencyContact || '[Emergency Contact]'}</strong> 
          at <strong>{emergencyContactPhone || '[Phone Number]'}</strong>.
        </p>

        <p className="text-justify">
          I will ensure proper handover of my responsibilities before commencing my leave and will be available 
          for any urgent matters through the emergency contact provided above.
        </p>

        <p className="text-justify">
          I request you to kindly approve my maternity leave application and make the necessary arrangements 
          for my work responsibilities during my absence.
        </p>

        <p className="text-center font-medium">
          Thank you for your consideration and support.
        </p>
      </div>

      {/* Date and Place */}
      <div className="mt-16 mb-8">
        <p><strong>Date:</strong> {formattedIssueDate}</p>
        <p><strong>Place:</strong> {place || '[Place]'}</p>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-16">
        <div className="text-left">
          <div className="h-16"></div>
          <div className="text-center">
            <p className="font-semibold border-t border-black pt-2 min-w-[200px]">
              {fullName || '[Employee Name]'}
            </p>
            <p className="text-sm">Employee Signature</p>
            <p className="text-sm">Employee ID: {employeeId || '[Employee ID]'}</p>
          </div>
        </div>

        <div className="text-right">
          {includeDigitalSignature && branding.signatureUrl && (
            <img src={branding.signatureUrl} alt="Authorized Signature" className="h-16 mb-2 object-contain ml-auto" />
          )}
          {!includeDigitalSignature && <div className="h-16"></div>}
          <div className="text-center">
            <p className="font-semibold border-t border-black pt-2 min-w-[200px]">
              {signatoryName || '[Authorized Signatory Name]'}
            </p>
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
