import React from 'react';
import { NDAPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { Letterhead } from './Letterhead';

export const NDAPreview: React.FC<NDAPreviewProps> = ({ data }) => {
  const {
    disclosingParty,
    receivingParty,
    confidentialInformation,
    purpose,
    term,
    governingLaw,
    date: issueDate,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl, sealUrl } = useBranding();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-serif text-sm leading-relaxed">
      {/* Letterhead */}
      <Letterhead />

      {/* Document Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">NON-DISCLOSURE AGREEMENT</h2>
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-sm text-gray-600">Effective Date: {data.effectiveDate ? new Date(data.effectiveDate).toLocaleDateString() : '[Date]'}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">PARTIES</h3>
        <p><strong>Disclosing Party:</strong> {data.disclosingParty}</p>
        <p className="ml-4 whitespace-pre-line">{data.disclosingPartyAddress}</p>
        <p className="mt-2"><strong>Receiving Party:</strong> {data.receivingParty}</p>
        <p className="ml-4 whitespace-pre-line">{data.receivingPartyAddress}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">1. PURPOSE</h3>
        <p>{data.purposeOfDisclosure}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">2. CONFIDENTIAL INFORMATION</h3>
        <p>{data.confidentialInformation}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">3. EXCLUSIONS</h3>
        <p>The following information shall not be considered confidential:</p>
        <p className="ml-4 mt-2">{data.exclusions}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">4. OBLIGATIONS</h3>
        <p>{data.obligations}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">5. TERM</h3>
        <p>This Agreement shall remain in effect for a period of {data.termLength} from the effective date.</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">6. RETURN OF INFORMATION</h3>
        <p>{data.returnOfInformation}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">7. REMEDIES</h3>
        <p>{data.remedies}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">8. GOVERNING LAW</h3>
        <p>This Agreement shall be governed by and construed in accordance with the laws of {data.governingLaw}.</p>
      </div>

      <div className="mt-12">
        <p className="mb-6">IN WITNESS WHEREOF, the parties have executed this Non-Disclosure Agreement as of the date first written above.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-semibold">{data.disclosingParty}</p>
            <p className="text-sm">Disclosing Party</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-semibold">{data.receivingParty}</p>
            <p className="text-sm">Receiving Party</p>
          </div>
        </div>

        <div className="flex justify-between items-end mt-8">
          <div>
            <p className="text-sm"><strong>Date:</strong> {data.date || '[Date]'}</p>
            <p className="text-sm"><strong>Place:</strong> {data.place || '[Place]'}</p>
          </div>
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
