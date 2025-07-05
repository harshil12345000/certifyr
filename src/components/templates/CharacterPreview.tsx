
import React, { useState, useEffect } from 'react';
import { CharacterPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';

interface ExtendedCharacterPreviewProps extends CharacterPreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: 'pending' | 'approved' | 'rejected';
}

export const CharacterPreview: React.FC<ExtendedCharacterPreviewProps> = ({ 
  data, 
  isEmployeePreview = false,
  requestStatus = 'pending'
}) => {
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
    if (fullName && parentName && duration) {
      const generateQR = async () => {
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
      };
      generateQR();
    }
  }, [data, organizationDetails?.name, user?.id, fullName, parentName, duration]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  // Determine if content should be blurred for employee preview
  const shouldBlur = isEmployeePreview && requestStatus !== 'approved';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
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
          {includeDigitalSignature && signatureUrl ? (
            <div className="h-16 mb-4 flex justify-end relative">
              <div className="border-b border-gray-800 px-6">
                <img 
                  src={signatureUrl}
                  alt="Digital Signature" 
                  className={`h-12 object-contain ${shouldBlur ? 'blur-sm' : ''}`}
                  onError={(e) => handleImageError(e, "signature")}
                />
              </div>
              {shouldBlur && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 border border-dashed border-gray-400">
                  <span className="text-xs text-gray-500">Signature pending approval</span>
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
            <div className="flex justify-end relative">
              <div className={shouldBlur ? 'blur-sm' : ''}>
                <QRCode value={qrCodeUrl} size={75} />
              </div>
              {shouldBlur && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 border border-dashed border-gray-400 w-[75px] h-[75px]">
                  <span className="text-xs text-gray-500 text-center">QR pending approval</span>
                </div>
              )}
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
