import React, { useState, useEffect } from 'react';
import { CharacterPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';
import { downloadPDF, downloadJPG } from '@/lib/document-utils';

export const CharacterPreview: React.FC<CharacterPreviewProps> = ({ data, isEmployeePreview = false, showExportButtons = false }) => {
  const {
    fullName,
    parentName,
    address,
    duration,
    conduct,
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
      if (fullName && parentName && duration) {
        const url = await generateDocumentQRCode(
          'character-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
        if (!url) {
          console.error('QR code URL generation failed for Character Preview.');
        }
      }
    };
    generateQR();
  }, [data, organizationDetails?.name, user?.id, fullName, parentName, duration]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0">
      {showExportButtons && (
        <div className="flex gap-2 justify-end mb-4">
          <button onClick={() => downloadPDF('character-certificate.pdf')} className="px-3 py-1 bg-blue-600 text-white rounded">Download PDF</button>
          <button onClick={() => downloadJPG('character-certificate.jpg')} className="px-3 py-1 bg-gray-600 text-white rounded">Download JPG</button>
        </div>
      )}
      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">CHARACTER CERTIFICATE</h2>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="space-y-4 text-justify leading-7 text-base">
        <p>
          This is to certify that <strong>{fullName || '[Student Name]'}</strong>, 
          {parentName && ` son/daughter of ${parentName},`} 
          {address && ` residing at ${address},`} has been known to me for <strong>{duration || '[Duration]'}</strong>.
        </p>

        <p>
          During this period, I have found {fullName ? 'their' : '[their]'} character and conduct to be <strong>{conduct || '[Character/Conduct]'}</strong>. 
          {fullName ? 'They have' : '[They have]'} always been honest, disciplined, and of good moral character.
        </p>

        <p>
          I have no hesitation in recommending {fullName || '[Student Name]'} for any position or opportunity they may seek.
        </p>
      </div>

      {/* Date and signature */}
      <div className="flex justify-between items-end mt-16">
        <div>
          <p><strong>Date:</strong> {formattedIssueDate}</p>
          <p><strong>Place:</strong> {place || '[Place]'}</p>
        </div>
        
        <div className="text-right">
          {/* Signature Section */}
          {data.includeDigitalSignature && data.signatoryName && !isEmployeePreview ? (
            <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" />
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <p className="font-bold">{signatoryName || "[Authorized Signatory Name]"}</p>
          <p>{signatoryDesignation || "[Designation]"}</p>
          <p className="mb-4">{institutionName || '[Institution Name]'}</p>
          
          {/* QR Code Section */}
          {!isEmployeePreview && qrCodeUrl && (
            <QRCode value={qrCodeUrl} size={75} />
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
