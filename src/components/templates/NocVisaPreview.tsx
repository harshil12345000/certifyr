
import React, { useState, useEffect } from 'react';
import { NocVisaPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';
import { Letterhead } from './Letterhead';
import { downloadPDF, downloadJPG } from '@/lib/document-utils';

interface ExtendedNocVisaPreviewProps extends NocVisaPreviewProps {
  isEmployeePreview?: boolean;
  showExportButtons?: boolean;
}

export const NocVisaPreview: React.FC<ExtendedNocVisaPreviewProps> = ({ 
  data, 
  isEmployeePreview = false,
  showExportButtons = false 
}) => {
  const {
    fullName,
    passportNumber,
    nationality,
    designation,
    employeeId,
    department,
    joinDate,
    travelDates,
    travelPurpose,
    destination,
    visaType,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { logoUrl, sealUrl, signatureUrl, organizationDetails } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (fullName && passportNumber && destination) {
        const url = await generateDocumentQRCode(
          'noc-visa-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
        if (!url) {
          console.error('QR code URL generation failed for NOC Visa Preview.');
        }
      }
    };
    generateQR();
  }, [data, organizationDetails?.name, user?.id, fullName, passportNumber, destination]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';
  const formattedJoinDate = joinDate ? new Date(joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Join Date]';
  const formattedTravelDates = travelDates || '[Travel Dates]';

  const getVisaTypeText = (type: string) => {
    switch (type) {
      case 'tourist': return 'Tourist Visa';
      case 'business': return 'Business Visa';
      case 'work': return 'Work Visa';
      case 'student': return 'Student Visa';
      case 'transit': return 'Transit Visa';
      default: return 'Visa';
    }
  };

  const displayInstitutionName = organizationDetails?.name || institutionName || '[INSTITUTION NAME]';

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
        <div className="border-2 border-gray-600 inline-block px-6 py-2">
          <h2 className="text-lg font-bold uppercase tracking-widest">NO OBJECTION CERTIFICATE</h2>
          <h3 className="text-base font-semibold mt-1">FOR VISA APPLICATION</h3>
        </div>
      </div>

      {/* Reference Number */}
      <div className="flex justify-between mb-6 text-sm">
        <p><strong>Reference No.:</strong> NOC/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Letter Content */}
      <div className="space-y-6 text-base leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO WHOM IT MAY CONCERN
        </p>

        <p className="text-justify">
          This is to certify that <strong>{fullName || '[Employee Name]'}</strong> (Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>) 
          is a regular employee of our organization working as <strong>{designation || '[Designation]'}</strong> 
          in the <strong>{department || '[Department]'}</strong> department since <strong>{formattedJoinDate}</strong>.
        </p>

        <div className="ml-8 space-y-2">
          <p><strong>Employee Details:</strong></p>
          <p className="ml-4"><strong>Full Name:</strong> {fullName || '[Employee Name]'}</p>
          <p className="ml-4"><strong>Passport Number:</strong> {passportNumber || '[Passport Number]'}</p>
          <p className="ml-4"><strong>Nationality:</strong> {nationality || '[Nationality]'}</p>
          <p className="ml-4"><strong>Designation:</strong> {designation || '[Designation]'}</p>
          <p className="ml-4"><strong>Employee ID:</strong> {employeeId || '[Employee ID]'}</p>
        </div>

        <p className="text-justify">
          We have no objection to {fullName ? 'their' : '[their]'} application for <strong>{getVisaTypeText(visaType || 'tourist')}</strong> 
          to travel to <strong>{destination || '[Destination Country]'}</strong> for <strong>{travelPurpose || '[Travel Purpose]'}</strong> 
          during the period <strong>{formattedTravelDates}</strong>.
        </p>

        <p className="text-justify">
          The employee will resume {fullName ? 'their' : '[their]'} duties immediately upon return from the trip. 
          We guarantee that {fullName ? 'they will' : '[they will]'} return to India after the completion of {fullName ? 'their' : '[their]'} visit.
        </p>

        <p className="text-justify">
          We request you to grant the necessary visa to the above-mentioned employee. 
          For any further information or clarification, please feel free to contact us.
        </p>

        <p className="text-center font-medium">
          This certificate is issued upon the request of the employee for visa application purposes only.
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
          {/* Signature Section */}
          {data.includeDigitalSignature && signatureUrl && !isEmployeePreview ? (
            <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" />
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <div className="border-t border-black pt-2 min-w-[200px]">
            <p className="font-semibold">{signatoryName || '[Authorized Signatory Name]'}</p>
            <p className="text-sm">{signatoryDesignation || '[Designation]'}</p>
            <p className="text-sm">{displayInstitutionName}</p>
          </div>
        </div>
      </div>

      {/* QR Code positioned at bottom right */}
      {!isEmployeePreview && qrCodeUrl && (
        <div className="absolute bottom-8 right-8">
          <QRCode value={qrCodeUrl} size={80} />
        </div>
      )}

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img 
            src={sealUrl}
            alt="Institution Seal" 
            className="h-20 w-20 object-contain opacity-50"
            onError={(e) => handleImageError(e, "seal")}
          />
        </div>
      )}
    </div>
  );
};
