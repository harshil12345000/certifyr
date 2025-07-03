import React, { useState, useEffect } from 'react';
import { NocVisaPreviewProps } from '@/types/templates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { downloadPDF, downloadJPG } from '@/lib/document-utils';

interface BrandingAssets {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
  organizationAddress: string | null;
  organizationPhone: string | null;
  organizationEmail: string | null;
}

export const NocVisaPreview: React.FC<NocVisaPreviewProps> = ({ data, isEmployeePreview = false, showExportButtons = false }) => {
  const {
    fullName,
    designation,
    employeeId,
    department,
    passportNumber,
    visaType,
    destinationCountry,
    travelPurpose,
    travelDates,
    returnDate,
    sponsorDetails,
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
        console.warn("NOC Visa Preview: Institution name or user context not available for fetching branding.");
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

  const formattedReturnDate = returnDate ? new Date(returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Return Date]';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0">
      {showExportButtons && (
        <div className="flex gap-2 justify-end mb-4">
          <button onClick={() => downloadPDF('noc-visa.pdf')} className="px-3 py-1 bg-blue-600 text-white rounded">Download PDF</button>
          <button onClick={() => downloadJPG('noc-visa.jpg')} className="px-3 py-1 bg-gray-600 text-white rounded">Download JPG</button>
        </div>
      )}
      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-xl font-bold uppercase tracking-widest">NO OBJECTION CERTIFICATE</h2>
          <p className="text-sm mt-1 font-semibold">For Visa Application</p>
        </div>
      </div>

      {/* Reference Number */}
      <div className="mb-6">
        <p><strong>Ref. No.:</strong> NOC/VISA/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Address */}
      <div className="mb-6">
        <p><strong>To,</strong></p>
        <p className="mt-2">The Visa Officer</p>
        <p>Embassy/Consulate of {destinationCountry || '[Destination Country]'}</p>
        <p>New Delhi / Mumbai / Chennai / Kolkata</p>
      </div>

      {/* Subject */}
      <div className="mb-6">
        <p><strong>Subject:</strong> No Objection Certificate for Visa Application - {fullName || '[Employee Name]'}</p>
      </div>

      {/* Salutation */}
      <div className="mb-6">
        <p>Dear Sir/Madam,</p>
      </div>

      {/* Certificate Content */}
      <div className="space-y-4 text-justify leading-7">
        <p>
          This is to certify that <strong>{fullName || '[Employee Name]'}</strong>, 
          Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>, 
          working as <strong>{designation || '[Designation]'}</strong> in the 
          <strong> {department || '[Department]'}</strong> department of our organization, 
          has been granted permission to travel to <strong>{destinationCountry || '[Destination Country]'}</strong> 
          for the purpose of <strong>{travelPurpose || '[Travel Purpose]'}</strong>.
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
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Passport Number</td>
                <td className="border border-gray-400 p-2">{passportNumber || '[Passport Number]'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="my-6">
          <h3 className="font-bold text-lg mb-3">Travel Details:</h3>
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50 w-1/3">Visa Type</td>
                <td className="border border-gray-400 p-2">{visaType || '[Visa Type]'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Destination Country</td>
                <td className="border border-gray-400 p-2">{destinationCountry || '[Destination Country]'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Travel Dates</td>
                <td className="border border-gray-400 p-2">{travelDates || '[Travel Dates]'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Expected Return Date</td>
                <td className="border border-gray-400 p-2">{formattedReturnDate}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50 align-top">Purpose of Travel</td>
                <td className="border border-gray-400 p-2">{travelPurpose || '[Purpose of Travel]'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <strong>Sponsor Details:</strong> {sponsorDetails || '[Sponsor Details]'}
        </p>

        <p>
          The organization has no objection to the employee's travel and will continue employment upon return. 
          The employee is expected to return to duties on or before the expected return date mentioned above.
        </p>

        <p>
          We request you to kindly consider the visa application favorably and grant the necessary visa 
          to enable the employee to travel for the stated purpose.
        </p>

        <p>
          Should you require any additional information or clarification, please feel free to contact 
          the undersigned.
        </p>

        <p className="mt-6">
          Thank you for your kind consideration.
        </p>
      </div>

      {/* Date and Place */}
      <div className="flex justify-between items-end mt-16">
        <div>
          <p><strong>Date:</strong> {formattedIssueDate}</p>
          <p><strong>Place:</strong> {place || '[Place]'}</p>
        </div>
        <div className="text-right">
          {includeDigitalSignature && branding.signatureUrl && !isEmployeePreview && (
            <img 
              src={branding.signatureUrl}
              alt="Signatory Signature" 
              className="h-16 mb-2 object-contain ml-auto"
              onError={(e) => handleImageError(e, "signature")}
            />
          )}
          <div className="border-b border-gray-400 w-48 mb-2"></div>
          <p className="font-bold">{signatoryName || '[Authorized Signatory Name]'}</p>
          <p>{signatoryDesignation || '[Designation]'}</p>
          <p>{institutionName || '[Institution Name]'}</p>
          {/* QR Code positioned below institution name */}
          {!isEmployeePreview && (
            <div className="flex justify-end">
              {/* QR code rendering logic here if present */}
            </div>
          )}
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
