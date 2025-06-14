
import React from 'react';
import { ArticlesOfIncorporationData } from '@/types/corporate-templates';

interface ArticlesOfIncorporationPreviewProps {
  data: ArticlesOfIncorporationData;
}

export const ArticlesOfIncorporationPreview: React.FC<ArticlesOfIncorporationPreviewProps> = ({ data }) => {
  return (
    <div className="a4-document bg-white p-8 shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">ARTICLES OF INCORPORATION</h1>
        <h2 className="text-xl font-semibold">{data.corporationName}</h2>
        <p className="text-sm text-gray-600 mt-2">State of {data.stateOfIncorporation}</p>
      </div>

      {/* Article I - Name */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE I - NAME</h3>
        <p>The name of this corporation is <strong>{data.corporationName}</strong>.</p>
      </div>

      {/* Article II - Purpose */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE II - PURPOSE</h3>
        <p>The purpose of the corporation is to engage in any lawful act or activity for which a corporation may be organized under the General Corporation Law of {data.stateOfIncorporation}.</p>
        <p className="mt-2">Specifically, the corporation shall: {data.businessPurpose}</p>
      </div>

      {/* Article III - Shares */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE III - SHARES</h3>
        <p>The corporation is authorized to issue <strong>{data.authorizedShares}</strong> shares of common stock{data.shareValue && `, with a par value of ${data.shareValue} per share`}.</p>
      </div>

      {/* Article IV - Address */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE IV - PRINCIPAL OFFICE</h3>
        <p>The address of the principal office of the corporation is:</p>
        <p className="ml-4 whitespace-pre-line">{data.corporateAddress}</p>
      </div>

      {/* Article V - Registered Agent */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE V - REGISTERED AGENT</h3>
        <p>The name and address of the registered agent is:</p>
        <p className="ml-4"><strong>{data.registeredAgent}</strong></p>
        <p className="ml-4 whitespace-pre-line">{data.registeredAgentAddress}</p>
      </div>

      {/* Article VI - Incorporator */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">ARTICLE VI - INCORPORATOR</h3>
        <p>The name and address of the incorporator is:</p>
        <p className="ml-4"><strong>{data.incorporatorName}</strong></p>
        <p className="ml-4 whitespace-pre-line">{data.incorporatorAddress}</p>
      </div>

      {/* Signature Section */}
      <div className="mt-12">
        <p className="mb-6">IN WITNESS WHEREOF, the undersigned incorporator has executed these Articles of Incorporation this {data.filingDate ? new Date(data.filingDate).toLocaleDateString() : '[Date]'} day.</p>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm"><strong>Date:</strong> {data.date || '[Date]'}</p>
            <p className="text-sm"><strong>Place:</strong> {data.place || '[Place]'}</p>
          </div>
          
          <div className="text-right">
            <div className="border-b border-gray-400 w-64 mb-2"></div>
            <p className="text-sm"><strong>{data.signatoryName || '[Signatory Name]'}</strong></p>
            <p className="text-sm">{data.signatoryDesignation || '[Title]'}</p>
            <p className="text-sm">Incorporator</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Filed with the Secretary of State of {data.stateOfIncorporation}</p>
        <p>Filing Date: {data.filingDate ? new Date(data.filingDate).toLocaleDateString() : '[Filing Date]'}</p>
      </div>
    </div>
  );
};
