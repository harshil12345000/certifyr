
import React, { useState, useEffect } from 'react';
import { NocVisaData } from '@/types/templates';
import { supabase } from '@/integrations/supabase/client'; // For fetching branding
import { useAuth } from '@/contexts/AuthContext'; // To get user/org context if needed

interface BrandingAssets {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
  organizationAddress: string | null;
  organizationPhone: string | null;
  organizationEmail: string | null;
}

export const NocVisaPreview: React.FC<NocVisaPreviewProps> = ({ data }) => {
  const {
    fullName,
    employeeOrStudentId,
    designationOrCourse,
    department,
    passportNumber,
    destinationCountry,
    travelStartDate,
    travelEndDate,
    purposeOfVisit,
    tripFundSource,
    institutionName,
    date: issueDate, // Renamed to avoid conflict
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const [branding, setBranding] = useState<BrandingAssets>({ 
    logoUrl: null, 
    sealUrl: null, 
    signatureUrl: null,
    organizationAddress: '123 Institution Address, City, State, ZIP', // Placeholder
    organizationPhone: '(123) 456-7890', // Placeholder
    organizationEmail: 'info@institution.example.com' // Placeholder
  });
  const { user } = useAuth(); // Assuming user is linked to an organization

  useEffect(() => {
    const fetchBranding = async () => {
      if (!institutionName && !user?.id) { // Need institutionName or a way to get organization_id
        console.warn("NOC Preview: Institution name or user context not available for fetching branding.");
        return;
      }

      try {
        // Step 1: Get organization_id.
        // This logic might need to be more robust, e.g., using user's org or a selected org.
        // For now, try to find organization by name, or use user's default org if applicable.
        let orgIdToQuery: string | null = null;

        if (institutionName) {
            const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, address, phone, email') // Assuming these columns exist in 'organizations'
            .eq('name', institutionName)
            .single();

            if (orgError && orgError.code !== 'PGRST116') { // PGRST116: 0 rows
                console.error("Error fetching organization by name:", orgError);
            }
            if (orgData) {
                orgIdToQuery = orgData.id;
                setBranding(prev => ({
                    ...prev,
                    organizationAddress: orgData.address || prev.organizationAddress,
                    organizationPhone: orgData.phone || prev.organizationPhone,
                    organizationEmail: orgData.email || prev.organizationEmail,
                }));
            }
        }
        
        // Fallback or primary way: if user context provides an organization_id
        // const userOrgId = user?.organization_id; // Example if available in user context
        // if (!orgIdToQuery && userOrgId) orgIdToQuery = userOrgId;


        if (!orgIdToQuery) {
          console.warn("NOC Preview: Could not determine organization ID for branding.");
          return;
        }

        // Step 2: Fetch branding files using organization_id
        const { data: filesData, error: filesError } = await supabase
          .from('branding_files')
          .select('name, path')
          .eq('organization_id', orgIdToQuery);

        if (filesError) {
          console.error("Error fetching branding files:", filesError);
          return;
        }

        let newLogoUrl: string | null = null;
        let newSealUrl: string | null = null;
        let newSignatureUrl: string | null = null;

        filesData?.forEach(file => {
          const publicUrlRes = supabase.storage.from('branding-assets').getPublicUrl(file.path);
          const publicUrl = publicUrlRes.data?.publicUrl;
          if (publicUrl) {
            if (file.name === 'logo') newLogoUrl = publicUrl;
            if (file.name === 'seal') newSealUrl = publicUrl;
            if (file.name === 'signature') newSignatureUrl = publicUrl;
          }
        });
        
        setBranding(prev => ({ ...prev, logoUrl: newLogoUrl, sealUrl: newSealUrl, signatureUrl: newSignatureUrl }));

      } catch (error) {
        console.error("Unexpected error fetching branding:", error);
      }
    };

    fetchBranding();
  }, [institutionName, user]);


  const formattedStartDate = travelStartDate ? new Date(travelStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Start Date]';
  const formattedEndDate = travelEndDate ? new Date(travelEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[End Date]';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-serif text-sm leading-relaxed">
      {/* Letterhead Section - Similar to Bonafide */}
      <div className="text-center mb-8 pb-4 border-b">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={`${institutionName || 'Institution'} Logo`} className="h-20 mx-auto mb-2 object-contain" />
        )}
        <h1 className="text-2xl font-bold text-blue-700">{institutionName || '[Institution Name]'}</h1>
        <p className="text-xs">{branding.organizationAddress}</p>
        <p className="text-xs">Phone: {branding.organizationPhone} | Email: {branding.organizationEmail}</p>
      </div>

      <div className="flex justify-between mb-6">
        <div>
          {/* Ref No. can be added if needed */}
        </div>
        <div>
          <p>Date: {formattedIssueDate}</p>
          <p>Place: {place || '[Place of Issue]'}</p>
        </div>
      </div>

      <div className="mb-6">
        <p>To,</p>
        <p>The Visa Officer,</p>
        <p>The Embassy/Consulate of {destinationCountry || '[Destination Country]'}</p>
        <p>[Embassy/Consulate Address, City]</p> {/* This is usually generic */}
      </div>

      <h2 className="text-center font-bold text-lg mb-6 underline uppercase">
        NO OBJECTION CERTIFICATE
      </h2>
      <h3 className="text-center font-semibold mb-6">
        Subject: No Objection Certificate for Mr./Ms. {fullName || '[Full Name]'} – Passport No: {passportNumber || '[Passport Number]'}
      </h3>

      <p className="mb-4">Dear Sir/Madam,</p>

      <p className="mb-4 text-justify">
        This is to certify that Mr./Ms. <strong>{fullName || '[Full Name]'}</strong>, holding Passport No. <strong>{passportNumber || '[Passport Number]'}</strong>, is a bonafide employee/student of <strong>{institutionName || '[Institution Name]'}</strong>. 
        He/She is currently {employeeOrStudentId ? `(ID: ${employeeOrStudentId}) ` : ''}working as/studying <strong>{designationOrCourse || '[Designation/Course]'}</strong> in the <strong>{department || '[Department]'}</strong>.
      </p>

      <p className="mb-4 text-justify">
        Mr./Ms. <strong>{fullName || '[Full Name]'}</strong> intends to travel to <strong>{destinationCountry || '[Destination Country]'}</strong> from <strong>{formattedStartDate}</strong> to <strong>{formattedEndDate}</strong> for the purpose of <strong>{purposeOfVisit || '[Purpose of Visit]'}</strong>.
      </p>
      
      {tripFundSource && (
         <p className="mb-4 text-justify">
           {tripFundSource === 'self' 
             ? `All expenses related to this trip will be borne by Mr./Ms. ${fullName || '[Full Name]'}.`
             : `All expenses related to this trip will be borne by ${institutionName || '[Institution Name]'}.`}
         </p>
      )}

      <p className="mb-4 text-justify">
        <strong>{institutionName || '[Institution Name]'}</strong> has no objection to his/her visit to <strong>{destinationCountry || '[Destination Country]'}</strong> for the stated purpose and duration. We request that his/her visa application be favorably considered.
      </p>

      <p className="mb-6">Thank you for your consideration.</p>

      {/* Signatory Section - Similar to Bonafide */}
      <div className="mt-16 flex justify-between items-end">
        <div>
          {branding.sealUrl && (
            <img src={branding.sealUrl} alt="Institution Seal" className="h-20 w-20 object-contain opacity-75" />
          )}
        </div>
        <div className="text-center">
          {includeDigitalSignature && branding.signatureUrl && (
            <img src={branding.signatureUrl} alt="Signatory Signature" className="h-16 mx-auto mb-1 object-contain" />
          )}
          {includeDigitalSignature && !branding.signatureUrl && (
            <div className="h-16 w-48 my-2 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 italic mx-auto">
              [Digital Signature Placeholder]
            </div>
          )}
          {!includeDigitalSignature && <div className="h-16"></div>}
          <p className="font-semibold">{signatoryName || '[Signatory Name]'}</p>
          <p>{signatoryDesignation || '[Signatory Designation]'}</p>
          <p>{institutionName || '[Institution Name]'}</p>
        </div>
      </div>
    </div>
  );
};
