
import React, { useState, useEffect } from 'react';
import { AddressProofPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';
import { Letterhead } from './Letterhead';

interface ExtendedAddressProofPreviewProps extends AddressProofPreviewProps {
  isEmployeePreview?: boolean;
  showExportButtons?: boolean;
}

export const AddressProofPreview: React.FC<ExtendedAddressProofPreviewProps> = ({ 
  data, 
  isEmployeePreview = false,
  showExportButtons = true 
}) => {
  const {
    fullName,
    fatherName,
    currentAddress,
    permanentAddress,
    residenceDuration,
    relationshipWithApplicant,
    idProofType,
    idProofNumber,
    purpose,
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
    // Only generate QR code if not in employee preview mode
    if (!isEmployeePreview) {
      const generateQR = async () => {
        if (fullName && currentAddress) {
          const url = await generateDocumentQRCode(
            'address-proof-1',
            data,
            organizationDetails?.name,
            user?.id
          );
          setQrCodeUrl(url);
          if (!url) {
            console.error('QR code URL generation failed for Address Proof Preview.');
          }
        }
      };
      generateQR();
    }
  }, [data, organizationDetails?.name, user?.id, fullName, currentAddress, isEmployeePreview]);

  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  const getIdProofText = (type: string) => {
    switch (type) {
      case 'aadhar': return 'Aadhar Card';
      case 'passport': return 'Passport';
      case 'voter_id': return 'Voter ID Card';
      case 'driving_license': return 'Driving License';
      default: return 'ID Proof';
    }
  };

  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case 'self': return 'the applicant';
      case 'father': return 'father of the applicant';
      case 'mother': return 'mother of the applicant';
      case 'guardian': return 'guardian of the applicant';
      case 'spouse': return 'spouse of the applicant';
      default: return 'relative of the applicant';
    }
  };

  const displayInstitutionName = organizationDetails?.name || institutionName || '[INSTITUTION NAME]';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 text-sm leading-relaxed relative">
      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border-2 border-gray-600 inline-block px-6 py-2">
          <h2 className="text-lg font-bold uppercase tracking-widest">ADDRESS PROOF CERTIFICATE</h2>
        </div>
      </div>

      {/* Reference Number */}
      <div className="flex justify-between mb-6 text-sm">
        <p><strong>Reference No.:</strong> APC/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Letter Content */}
      <div className="space-y-6 text-base leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO WHOM IT MAY CONCERN
        </p>

        <p className="text-justify">
          This is to certify that <strong>{fullName || '[Full Name]'}</strong>, son/daughter of <strong>{fatherName || "[Father's Name]"}</strong>, 
          has been residing at the address mentioned below for a period of <strong>{residenceDuration || '[Duration]'}</strong>.
        </p>

        <div className="ml-8 space-y-2">
          <p><strong>Current Address:</strong></p>
          <p className="ml-4 whitespace-pre-line">{currentAddress || '[Current Address]'}</p>
          
          <p><strong>Permanent Address:</strong></p>
          <p className="ml-4 whitespace-pre-line">{permanentAddress || '[Permanent Address]'}</p>
        </div>

        <p className="text-justify">
          I am <strong>{getRelationshipText(relationshipWithApplicant)}</strong> and can verify the above address details based on 
          my personal knowledge and the records available with me.
        </p>

        <p className="text-justify">
          The verification is based on <strong>{getIdProofText(idProofType)}</strong> bearing number <strong>{idProofNumber || '[ID Number]'}</strong> 
          and other relevant documents.
        </p>

        <p className="text-justify">
          This certificate is being issued for <strong>{purpose || '[Purpose]'}</strong> and is valid as on the date of issue.
        </p>

        <p className="text-center font-medium">
          This certificate is issued upon request for official purposes only.
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
          {/* Only show signature if not in employee preview mode */}
          {!isEmployeePreview && includeDigitalSignature && signatureUrl && (
            <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" />
          )}
          {!isEmployeePreview && !includeDigitalSignature && <div className="h-16"></div>}
          {isEmployeePreview && <div className="h-16 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 italic mb-2 w-48 mx-auto">
            [Signature will appear after approval]
          </div>}
          <div className="border-t border-black pt-2 min-w-[200px]">
            <p className="font-semibold">{signatoryName || '[Authorized Signatory Name]'}</p>
            <p className="text-sm">{signatoryDesignation || '[Designation]'}</p>
            <p className="text-sm">{displayInstitutionName}</p>
          </div>
        </div>
      </div>

      {/* QR Code positioned at bottom right - only show if not in employee preview mode */}
      {!isEmployeePreview && (
        <div className="absolute bottom-8 right-8">
          <QRCode value={qrCodeUrl || ''} size={80} />
        </div>
      )}
      
      {/* Placeholder for QR code in employee preview */}
      {isEmployeePreview && (
        <div className="absolute bottom-8 right-8 w-20 h-20 border border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500">
          QR Code
        </div>
      )}

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img src={sealUrl} alt="Institution Seal" className="h-20 w-20 object-contain opacity-50" />
        </div>
      )}
    </div>
  );
};
