import React, { useState, useEffect } from 'react';
import { BonafidePreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';

export const BonafidePreview: React.FC<BonafidePreviewProps> = ({ data }) => {
  const {
    fullName: studentName,
    courseOrDesignation: course,
    department,
    startDate: academicYear,
    purpose,
    institutionName,
    date: issueDate,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl, sealUrl, organizationDetails } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (studentName && course && department) {
        const url = await generateDocumentQRCode(
          'bonafide-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
      }
    };
    generateQR();
  }, [data, organizationDetails?.name, user?.id, studentName, course, department]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      {/* Letterhead */}
      <Letterhead />

      {/* Letter Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">BONAFIDE CERTIFICATE</h2>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="space-y-4 text-justify leading-7 text-base">
        <p>
          This is to certify that <strong>{studentName || '[Student Name]'}</strong> 
          is a bonafide {course || '[Course]'} of this institution in the {department || '[Department]'} department since <strong>{academicYear || '[Academic Year]'}</strong>.
        </p>

        <p>
          This certificate is issued for <strong>{purpose || '[Purpose]'}</strong> purposes.
        </p>

        <p>
          I wish {studentName || '[Student Name]'} all success in {studentName ? 'their' : '[their]'} future endeavors.
        </p>
      </div>

      {/* Date and signature */}
      <div className="flex flex-col md:flex-row justify-between pt-8 mt-16">
        <div>
          <p>
            <strong>Date:</strong> {issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]'}
          </p>
          <p>
            <strong>Place:</strong> {institutionName || '[Institution Name]'}
          </p>
        </div>
        
        <div className="text-right mt-8 md:mt-0 relative">
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
