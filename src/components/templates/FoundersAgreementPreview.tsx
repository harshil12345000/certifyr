
import React from 'react';
import { FoundersAgreementData } from '@/types/corporate-templates';
import { useBranding } from '@/contexts/BrandingContext';
import { Letterhead } from './Letterhead';

interface FoundersAgreementPreviewProps {
  data: FoundersAgreementData;
}

export const FoundersAgreementPreview: React.FC<FoundersAgreementPreviewProps> = ({ data }) => {
  const { signatureUrl, sealUrl, organizationDetails } = useBranding();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="a4-document bg-white p-8 shadow-lg max-w-4xl mx-auto">
      {/* Letterhead */}
      <Letterhead />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">FOUNDERS AGREEMENT</h1>
        <h2 className="text-xl font-semibold">{data.companyName}</h2>
        <p className="text-sm text-gray-600 mt-2">Effective Date: {data.effectiveDate ? new Date(data.effectiveDate).toLocaleDateString() : '[Date]'}</p>
      </div>

      {/* Parties */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">PARTIES</h3>
        <p>This Founders Agreement ("Agreement") is entered into by and between the following founders (collectively, the "Founders"):</p>
        <p className="ml-4 mt-2">{data.founderNames}</p>
        <p className="mt-2">in connection with the formation and operation of <strong>{data.companyName}</strong> (the "Company").</p>
      </div>

      {/* Business Description */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">1. BUSINESS DESCRIPTION</h3>
        <p>{data.businessDescription}</p>
      </div>

      {/* Equity Distribution */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">2. EQUITY DISTRIBUTION</h3>
        <p>The ownership interests in the Company shall be distributed among the Founders as follows:</p>
        <p className="ml-4 mt-2 whitespace-pre-line">{data.equityDistribution}</p>
      </div>

      {/* Vesting */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">3. VESTING SCHEDULE</h3>
        <p>Founder equity shall vest according to the following schedule: {data.vestingSchedule}</p>
      </div>

      {/* Roles and Responsibilities */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">4. ROLES AND RESPONSIBILITIES</h3>
        <p className="whitespace-pre-line">{data.roles}</p>
      </div>

      {/* Capital Contributions */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">5. CAPITAL CONTRIBUTIONS</h3>
        <p className="whitespace-pre-line">{data.capitalContributions}</p>
      </div>

      {/* Intellectual Property */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">6. INTELLECTUAL PROPERTY</h3>
        <p>{data.intellectualProperty}</p>
      </div>

      {/* Confidentiality */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">7. CONFIDENTIALITY</h3>
        <p>{data.confidentiality}</p>
      </div>

      {/* Non-Compete */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">8. NON-COMPETE</h3>
        <p>{data.nonCompete}</p>
      </div>

      {/* Dispute Resolution */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">9. DISPUTE RESOLUTION</h3>
        <p>Any disputes arising under this Agreement shall be resolved through {data.disputeResolution}.</p>
      </div>

      {/* Governing Law */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">10. GOVERNING LAW</h3>
        <p>This Agreement shall be governed by the laws of {data.governingLaw}.</p>
      </div>

      {/* Signature Section */}
      <div className="mt-12">
        <p className="mb-6">IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {data.founderNames.split(',').map((founder, index) => (
            <div key={index} className="text-center">
              <div className="border-b border-gray-400 w-full mb-2"></div>
              <p className="text-sm font-semibold">{founder.trim()}</p>
              <p className="text-sm">Founder</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end mt-8">
          <div>
            <p className="text-sm"><strong>Date:</strong> {data.date || '[Date]'}</p>
            <p className="text-sm"><strong>Place:</strong> {data.place || '[Place]'}</p>
          </div>
          
          {data.signatoryName && (
            <div className="text-right">
              {data.includeDigitalSignature && signatureUrl && (
                <img 
                  src={signatureUrl}
                  alt="Digital Signature" 
                  className="h-16 mb-2 object-contain ml-auto"
                  onError={(e) => handleImageError(e, "signature")}
                />
              )}
              <div className="border-b border-gray-400 w-48 mb-2"></div>
              <p className="text-sm"><strong>{data.signatoryName}</strong></p>
              <p className="text-sm">Witness</p>
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
