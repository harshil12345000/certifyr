import React from 'react';
import { StockPurchaseAgreementData } from '@/types/corporate-templates';
import { useBranding } from '@/contexts/BrandingContext';
import { Letterhead } from './Letterhead';

interface StockPurchaseAgreementPreviewProps {
  data: StockPurchaseAgreementData;
}

export const StockPurchaseAgreementPreview: React.FC<StockPurchaseAgreementPreviewProps> = ({ data }) => {
  const { signatureUrl, sealUrl, organizationDetails } = useBranding();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="a4-document bg-white p-8 shadow-lg max-w-4xl mx-auto">
      {/* Letterhead */}
      <Letterhead />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">STOCK PURCHASE AGREEMENT</h1>
        <p className="text-sm text-gray-600">{data.companyName}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">PARTIES</h3>
        <p><strong>Purchaser:</strong> {data.purchaserName}</p>
        <p className="ml-4 whitespace-pre-line">{data.purchaserAddress}</p>
        <p className="mt-2"><strong>Seller:</strong> {data.sellerName}</p>
        <p className="ml-4 whitespace-pre-line">{data.sellerAddress}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">PURCHASE TERMS</h3>
        <p><strong>Company:</strong> {data.companyName}</p>
        <p><strong>Share Class:</strong> {data.shareClass}</p>
        <p><strong>Number of Shares:</strong> {data.numberOfShares}</p>
        <p><strong>Price per Share:</strong> {data.sharePrice}</p>
        <p><strong>Total Purchase Price:</strong> {data.totalPurchasePrice}</p>
        <p><strong>Closing Date:</strong> {data.closingDate ? new Date(data.closingDate).toLocaleDateString() : '[Date]'}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">TRANSFER RESTRICTIONS</h3>
        <p>{data.restrictionsOnTransfer}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">REPRESENTATIONS AND WARRANTIES</h3>
        <p>{data.representationsWarranties}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">GOVERNING LAW</h3>
        <p>This Agreement shall be governed by the laws of {data.governingLaw}.</p>
      </div>

      <div className="mt-12">
        <p className="mb-6">IN WITNESS WHEREOF, the parties have executed this Agreement as of {data.effectiveDate ? new Date(data.effectiveDate).toLocaleDateString() : '[Date]'}.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-semibold">{data.purchaserName}</p>
            <p className="text-sm">Purchaser</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-semibold">{data.sellerName}</p>
            <p className="text-sm">Seller</p>
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
