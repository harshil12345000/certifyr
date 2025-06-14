import React, { useState, useEffect } from 'react';
import { NocVisaData, NocVisaPreviewProps } from '@/types/templates'; // Ensure NocVisaPreviewProps is imported
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

// Interface for organization details fetched from Supabase
interface OrganizationDetailsFromDB {
  id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export const NocVisaPreview: React.FC<NocVisaPreviewProps> = ({ data }) => { // Use NocVisaPreviewProps
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
    institutionName: institutionNameFromData, // Rename to avoid conflict with state
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
    organizationAddress: '123 Institution Address, City, State, ZIP',
    organizationPhone: '(123) 456-7890',
    organizationEmail: 'info@institution.example.com'
  });
  const [currentInstitutionName, setCurrentInstitutionName] = useState<string | null>(institutionNameFromData || '[Institution Name]');
  const { user } = useAuth();

  useEffect(() => {
    const fetchBrandingAndOrgDetails = async () => {
      // Determine the institution name to use for fetching
      const effectiveInstitutionName = institutionNameFromData || currentInstitutionName;
      if (!effectiveInstitutionName && !user?.id) {
        console.warn("NOC Preview: Institution name or user context not available.");
        // Set to placeholders or defaults if no info
        setBranding(prev => ({
            ...prev,
            logoUrl: null, sealUrl: null, signatureUrl: null,
            organizationAddress: '123 Institution Address, City, State, ZIP',
            organizationPhone: '(123) 456-7890',
            organizationEmail: 'info@institution.example.com'
        }));
        setCurrentInstitutionName('[Institution Name]');
        return;
      }

      try {
        let orgIdToQuery: string | null = null;
        let orgDetailsFromDB: OrganizationDetailsFromDB | null = null;

        // Try fetching organization by name if provided
        if (effectiveInstitutionName && effectiveInstitutionName !== '[Institution Name]') {
            const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, address, phone, email')
            .eq('name', effectiveInstitutionName)
            .maybeSingle(); // Use maybeSingle

            if (orgError && orgError.code !== 'PGRST116') { 
                console.error("Error fetching organization by name:", orgError.message);
            } else if (orgData) {
                orgDetailsFromDB = orgData;
                orgIdToQuery = orgData.id;
            } else {
                console.warn(`Organization named "${effectiveInstitutionName}" not found.`);
            }
        }
        
        // If orgId not found by name, try using user's organization_id (if user exists)
        if (!orgIdToQuery && user?.id) {
            const { data: memberData, error: memberError } = await supabase
                .from('organization_members')
                .select('organization_id')
                .eq('user_id', user.id)
                .single();
            
            if (memberError || !memberData?.organization_id) {
                console.warn("NOC Preview: Could not get org_id from user member data.");
            } else {
                orgIdToQuery = memberData.organization_id;
                // Fetch org details if we got ID from user context and didn't have them
                if (!orgDetailsFromDB) {
                    const { data: orgDataUser, error: orgErrorUser } = await supabase
                        .from('organizations')
                        .select('id, name, address, phone, email')
                        .eq('id', orgIdToQuery)
                        .single();
                    if (orgDataUser) {
                        orgDetailsFromDB = orgDataUser;
                    } else if (orgErrorUser) {
                        console.error("Error fetching user's organization details:", orgErrorUser.message);
                    }
                }
            }
        }

        // Update state with fetched organization details or fallbacks
        if (orgDetailsFromDB) {
            setCurrentInstitutionName(orgDetailsFromDB.name || '[Institution Name]');
            setBranding(prev => ({
                ...prev,
                organizationAddress: orgDetailsFromDB.address || prev.organizationAddress,
                organizationPhone: orgDetailsFromDB.phone || prev.organizationPhone,
                organizationEmail: orgDetailsFromDB.email || prev.organizationEmail,
            }));
        } else {
            // If still no org details (e.g. only institutionName from data which was not found)
            // and no user context or user's org not found
             setCurrentInstitutionName(institutionNameFromData || '[Institution Name]'); // Revert to data or placeholder
             // Keep existing placeholder branding address/phone/email or reset them
        }

        if (!orgIdToQuery) {
          console.warn("NOC Preview: Could not determine organization ID. Branding assets might not load.");
          setBranding(prev => ({ ...prev, logoUrl: null, sealUrl: null, signatureUrl: null }));
          return;
        }

        // Fetch branding files using organization_id
        const { data: filesData, error: filesError } = await supabase
          .from('branding_files')
          .select('name, path')
          .eq('organization_id', orgIdToQuery);

        if (filesError) {
          console.error("Error fetching branding files:", filesError.message);
          setBranding(prev => ({ ...prev, logoUrl: null, sealUrl: null, signatureUrl: null }));
          return;
        }

        let newLogoUrl: string | null = null;
        let newSealUrl: string | null = null;
        let newSignatureUrl: string | null = null;

        if (filesData) {
            filesData.forEach(file => {
              const publicUrlRes = supabase.storage.from('branding-assets').getPublicUrl(file.path);
              const publicUrl = publicUrlRes.data?.publicUrl;
              if (publicUrl) {
                if (file.name === 'logo') newLogoUrl = publicUrl;
                if (file.name === 'seal') newSealUrl = publicUrl;
                if (file.name === 'signature') newSignatureUrl = publicUrl;
              }
            });
        }
        setBranding(prev => ({ ...prev, logoUrl: newLogoUrl, sealUrl: newSealUrl, signatureUrl: newSignatureUrl }));

      } catch (error) {
        console.error("Unexpected error fetching branding/org details:", error);
        setBranding(prev => ({ ...prev, logoUrl: null, sealUrl: null, signatureUrl: null }));
        setCurrentInstitutionName(institutionNameFromData || '[Institution Name]'); // Fallback
      }
    };

    fetchBrandingAndOrgDetails();
  }, [institutionNameFromData, user]); // Rerun if institutionName in data changes or user changes


  const formattedTravelStartDate = travelStartDate ? new Date(travelStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Start Date]';
  const formattedTravelEndDate = travelEndDate ? new Date(travelEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[End Date]';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-serif text-sm leading-relaxed">
      {/* Letterhead Section */}
      <div className="text-center mb-8 pb-4 border-b">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={`${currentInstitutionName || 'Institution'} Logo`} className="h-20 mx-auto mb-2 object-contain" />
        )}
        <h1 className="text-2xl font-bold text-blue-700">{currentInstitutionName}</h1>
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
        <p>[Embassy/Consulate Address, City]</p>
      </div>

      <h2 className="text-center font-bold text-lg mb-6 underline uppercase">
        NO OBJECTION CERTIFICATE
      </h2>
      <h3 className="text-center font-semibold mb-6">
        Subject: No Objection Certificate for Mr./Ms. {fullName || '[Full Name]'} – Passport No: {passportNumber || '[Passport Number]'}
      </h3>

      <p className="mb-4">Dear Sir/Madam,</p>

      <p className="mb-4 text-justify">
        This is to certify that Mr./Ms. <strong>{fullName || '[Full Name]'}</strong>, holding Passport No. <strong>{passportNumber || '[Passport Number]'}</strong>, is a bonafide employee/student of <strong>{currentInstitutionName}</strong>. 
        He/She is currently {employeeOrStudentId ? `(ID: ${employeeOrStudentId}) ` : ''}working as/studying <strong>{designationOrCourse || '[Designation/Course]'}</strong> in the <strong>{department || '[Department]'}</strong>.
      </p>

      <p className="mb-4 text-justify">
        Mr./Ms. <strong>{fullName || '[Full Name]'}</strong> intends to travel to <strong>{destinationCountry || '[Destination Country]'}</strong> from <strong>{formattedTravelStartDate}</strong> to <strong>{formattedTravelEndDate}</strong> for the purpose of <strong>{purposeOfVisit || '[Purpose of Visit]'}</strong>.
      </p>
      
      {tripFundSource && (
         <p className="mb-4 text-justify">
           {tripFundSource === 'self' 
             ? `All expenses related to this trip will be borne by Mr./Ms. ${fullName || '[Full Name]'}.`
             : `All expenses related to this trip will be borne by ${currentInstitutionName}.`}
         </p>
      )}

      <p className="mb-4 text-justify">
        <strong>{currentInstitutionName}</strong> has no objection to his/her visit to <strong>{destinationCountry || '[Destination Country]'}</strong> for the stated purpose and duration. We request that his/her visa application be favorably considered.
      </p>

      <p className="mb-6">Thank you for your consideration.</p>

      {/* Signatory Section */}
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
          {!includeDigitalSignature && <div className="h-16"></div>} {/* Placeholder for height */}
          <p className="font-semibold">{signatoryName || '[Signatory Name]'}</p>
          <p>{signatoryDesignation || '[Signatory Designation]'}</p>
          <p>{currentInstitutionName}</p>
        </div>
      </div>
    </div>
  );
};
