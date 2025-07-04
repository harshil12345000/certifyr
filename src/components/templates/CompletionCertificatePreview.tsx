import React, { useState, useEffect } from 'react';
import { CompletionCertificatePreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';

export const CompletionCertificatePreview: React.FC<CompletionCertificatePreviewProps> = ({ data }) => {
  const {
    fullName,
    fatherName,
    registrationNumber,
    courseTitle,
    courseDuration,
    completionDate,
    grade,
    percentage,
    programType,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl, sealUrl, organizationDetails } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (fullName && courseTitle && completionDate) {
        const url = await generateDocumentQRCode(
          'completion-certificate-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
        if (!url) {
          console.error('QR code URL generation failed for Completion Certificate Preview.');
        }
      }
    };
    generateQR();
  }, [data, organizationDetails?.name, user?.id, fullName, courseTitle, completionDate]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  const formattedCompletionDate = completionDate ? new Date(completionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Completion Date]';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            {programType === 'course' ? 'COURSE COMPLETION CERTIFICATE' : 'PROGRAM COMPLETION CERTIFICATE'}
          </h2>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="space-y-6 text-justify leading-7 text-base">
        <p className="text-center text-lg font-semibold mb-6">
          This is to certify that
        </p>

        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 mb-2">{fullName || '[Student Name]'}</p>
          {fatherName && <p className="text-lg">Son/Daughter of <strong>{fatherName}</strong></p>}
          {registrationNumber && <p className="text-sm text-gray-600">Registration No: {registrationNumber}</p>}
        </div>

        <p className="text-center text-lg">
          has successfully completed the <strong>{courseTitle || '[Course Title]'}</strong>
        </p>

        <div className="text-center space-y-2">
          <p>Duration: <strong>{courseDuration || '[Duration]'}</strong></p>
          <p>Completion Date: <strong>{formattedCompletionDate}</strong></p>
          {grade && <p>Grade: <strong>{grade}</strong></p>}
          {percentage && <p>Percentage: <strong>{percentage}%</strong></p>}
        </div>

        <p className="text-center text-lg mt-8">
          We wish {fullName ? 'them' : '[them]'} all success in {fullName ? 'their' : '[their]'} future endeavors.
        </p>
      </div>

      {/* Date and signature */}
      <div className="flex justify-between items-end mt-16">
        <div>
          <p><strong>Date:</strong> {formattedIssueDate}</p>
          <p><strong>Place:</strong> {place || '[Place]'}</p>
        </div>
        
        <div className="text-right">
          {includeDigitalSignature ? (
            <div className="h-16 mb-4 flex justify-end">
              {signatureUrl ? (
                <div className="border-b border-gray-800 px-6">
                  <img 
                    src={signatureUrl}
                    alt="Digital Signature" 
                    className="h-12 object-contain"
                    onError={(e) => handleImageError(e, "signature")}
                  />
                </div>
              ) : (
                <div className="border-b border-gray-800 px-6 py-3">
                  <div className="h-8 w-24 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    [Signature]
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-16 mb-4">
              {/* Space for manual signature */}
            </div>
          )}
          <p className="font-bold">{signatoryName || "[Authorized Signatory Name]"}</p>
          <p>{signatoryDesignation || "[Designation]"}</p>
          <p className="mb-4">{institutionName || '[Institution Name]'}</p>
          
          {/* QR Code positioned below institution name */}
          {qrCodeUrl && (
            <div className="flex justify-end">
              <QRCode value={qrCodeUrl} size={75} />
            </div>
          )}
        </div>
      </div>

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-8 left-8">
          <img 
            src={sealUrl}
            alt="Organization Seal" 
            className="h-20 w-20 object-contain opacity-75"
            onError={(e) => handleImageError(e, "seal")}
          />
        </div>
      )}
    </div>
  );
};
