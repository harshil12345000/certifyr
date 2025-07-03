import React, { useState, useEffect } from 'react';
import { NDAPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';

export const NDAPreview: React.FC<NDAPreviewProps> = ({ data }) => {
  const {
    disclosingParty,
    disclosingPartyAddress,
    receivingParty,
    receivingPartyAddress,
    effectiveDate,
    purposeOfDisclosure,
    confidentialInformation,
    exclusions,
    obligations,
    termLength,
    returnOfInformation,
    remedies,
    governingLaw,
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
      if (disclosingParty && receivingParty && purposeOfDisclosure) {
        const url = await generateDocumentQRCode(
          'nda-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
        if (!url) {
          console.error('QR code URL generation failed for NDA Preview.');
        }
      }
    };
    generateQR();
  }, [data, organizationDetails?.name, user?.id, disclosingParty, receivingParty, purposeOfDisclosure]);

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
          <h2 className="text-lg font-bold uppercase tracking-widest">NON-DISCLOSURE AGREEMENT</h2>
        </div>
      </div>

      {/* Agreement Content */}
      <div className="space-y-6 text-justify leading-7 text-base">
        <p>
          This Non-Disclosure Agreement ("Agreement") is entered into on <strong>{effectiveDate ? new Date(effectiveDate).toLocaleDateString('en-GB') : '[Effective Date]'}</strong> 
          between <strong>{disclosingParty || '[Disclosing Party]'}</strong>, having its principal place of business at <strong>{disclosingPartyAddress || '[Disclosing Party Address]'}</strong> 
          ("Disclosing Party") and <strong>{receivingParty || '[Receiving Party]'}</strong>, having its principal place of business at <strong>{receivingPartyAddress || '[Receiving Party Address]'}</strong> 
          ("Receiving Party").
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">1. PURPOSE</h3>
          <p>The purpose of this Agreement is to permit the parties to evaluate {purposeOfDisclosure || '[Purpose of Disclosure]'}.</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">2. CONFIDENTIAL INFORMATION</h3>
          <p>{confidentialInformation || '[Definition of Confidential Information]'}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">3. EXCLUSIONS</h3>
          <p>The obligations of confidentiality shall not apply to information that: {exclusions || '[Exclusions from confidentiality]'}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">4. OBLIGATIONS</h3>
          <p>{obligations || '[Obligations of the Receiving Party]'}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">5. TERM</h3>
          <p>This Agreement shall remain in effect for {termLength || '[Term Length]'} from the date of execution.</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">6. RETURN OF INFORMATION</h3>
          <p>{returnOfInformation || '[Return of confidential information provisions]'}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">7. REMEDIES</h3>
          <p>{remedies || '[Remedies for breach of agreement]'}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">8. GOVERNING LAW</h3>
          <p>This Agreement shall be governed by the laws of {governingLaw || '[Governing Law]'}.</p>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-12">
        <p className="mb-6">IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-2 h-16"></div>
            <p className="text-sm font-semibold">{disclosingParty || '[Disclosing Party]'}</p>
            <p className="text-sm">Disclosing Party</p>
          </div>
          
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-2 h-16"></div>
            <p className="text-sm font-semibold">{receivingParty || '[Receiving Party]'}</p>
            <p className="text-sm">Receiving Party</p>
          </div>
        </div>

        <div className="flex justify-between items-end mt-8 mb-32">
          <div>
            <p className="text-sm"><strong>Date:</strong> {issueDate || '[Date]'}</p>
          </div>
          
          {signatoryName && (
            <div className="text-right">
              {includeDigitalSignature && signatureUrl && (
                <img 
                  src={signatureUrl}
                  alt="Digital Signature" 
                  className="h-16 mb-2 object-contain ml-auto"
                  onError={(e) => handleImageError(e, "signature")}
                />
              )}
              <div className="border-b border-gray-400 w-48 mb-2"></div>
              <p className="text-sm"><strong>{signatoryName}</strong></p>
              <p className="text-sm">Witness</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Code positioned at bottom right */}
      <div className="absolute bottom-8 right-8">
        <QRCode value={qrCodeUrl || ''} size={80} />
      </div>

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-8 left-8">
          <img src={sealUrl} alt="Organization Seal" className="h-20 w-20 object-contain opacity-75" onError={(e) => handleImageError(e, "seal")} />
        </div>
      )}
    </div>
  );
};
