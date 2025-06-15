
import React, { useState, useEffect } from 'react';
import { ArticlesOfIncorporationPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';

export const ArticlesOfIncorporationPreview: React.FC<ArticlesOfIncorporationPreviewProps> = ({ data }) => {
  const {
    companyName,
    stateOfIncorporation,
    registeredAgent,
    registeredOffice,
    purpose,
    authorizedShares,
    shareClasses,
    incorporators,
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
      if (companyName && stateOfIncorporation && registeredAgent) {
        const url = await generateDocumentQRCode(
          'articles-incorporation-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
      }
    };
    generateQR();
  }, [data, organizationDetails?.name, user?.id, companyName, stateOfIncorporation, registeredAgent]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      {/* Letterhead */}
      <Letterhead />

      {/* Document Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">ARTICLES OF INCORPORATION</h2>
        </div>
      </div>

      {/* Document Content */}
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{companyName}</h1>
        <h2 className="text-xl font-semibold">{stateOfIncorporation}</h2>
        <p className="text-sm text-gray-600 mt-2">State of {stateOfIncorporation}</p>
      </div>

      {/* Article I - Name */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE I - NAME</h3>
        <p>The name of this corporation is <strong>{companyName}</strong>.</p>
      </div>

      {/* Article II - Purpose */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE II - PURPOSE</h3>
        <p>The purpose of the corporation is to engage in any lawful act or activity for which a corporation may be organized under the General Corporation Law of {stateOfIncorporation}.</p>
        <p className="mt-2">Specifically, the corporation shall: {purpose}</p>
      </div>

      {/* Article III - Shares */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE III - SHARES</h3>
        <p>The corporation is authorized to issue <strong>{authorizedShares}</strong> shares of common stock{shareClasses && `, with a par value of ${shareClasses} per share`}.</p>
      </div>

      {/* Article IV - Address */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE IV - PRINCIPAL OFFICE</h3>
        <p>The address of the principal office of the corporation is:</p>
        <p className="ml-4 whitespace-pre-line">{registeredOffice}</p>
      </div>

      {/* Article V - Registered Agent */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE V - REGISTERED AGENT</h3>
        <p>The name and address of the registered agent is:</p>
        <p className="ml-4"><strong>{registeredAgent}</strong></p>
        <p className="ml-4 whitespace-pre-line">{registeredOffice}</p>
      </div>

      {/* Article VI - Incorporator */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">ARTICLE VI - INCORPORATOR</h3>
        <p>The name and address of the incorporator is:</p>
        <p className="ml-4"><strong>{incorporators[0].name}</strong></p>
        <p className="ml-4 whitespace-pre-line">{incorporators[0].address}</p>
      </div>

      {/* Signature Section */}
      <div className="mt-12">
        <p className="mb-6">IN WITNESS WHEREOF, the undersigned incorporator has executed these Articles of Incorporation this {issueDate ? new Date(issueDate).toLocaleDateString() : '[Date]'} day.</p>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm"><strong>Date:</strong> {issueDate ? new Date(issueDate).toLocaleDateString() : '[Date]'}</p>
            <p className="text-sm"><strong>Place:</strong> {incorporators[0].place || '[Place]'}</p>
          </div>
          
          <div className="text-right">
            {includeDigitalSignature && signatureUrl && (
              <img 
                src={signatureUrl}
                alt="Digital Signature" 
                className="h-16 mb-2 object-contain ml-auto"
                onError={(e) => handleImageError(e, "signature")}
              />
            )}
            <div className="border-b border-gray-400 w-64 mb-2"></div>
            <p className="text-sm"><strong>{signatoryName || '[Signatory Name]'}</strong></p>
            <p className="text-sm">{signatoryDesignation || '[Title]'}</p>
            <p className="text-sm mb-4">Incorporator</p>
            
            {/* QR Code positioned below incorporator */}
            {qrCodeUrl && (
              <div className="flex justify-end">
                <QRCode value={qrCodeUrl} size={60} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Filed with the Secretary of State of {stateOfIncorporation}</p>
        <p>Filing Date: {issueDate ? new Date(issueDate).toLocaleDateString() : '[Filing Date]'}</p>
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
