
import React from 'react';
import { CorporateBylawsData } from '@/types/corporate-templates';

interface CorporateBylawsPreviewProps {
  data: CorporateBylawsData;
}

export const CorporateBylawsPreview: React.FC<CorporateBylawsPreviewProps> = ({ data }) => {
  return (
    <div className="a4-document bg-white p-8 shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">CORPORATE BYLAWS</h1>
        <h2 className="text-xl font-semibold">{data.corporationName}</h2>
        <p className="text-sm text-gray-600 mt-2">A {data.stateOfIncorporation} Corporation</p>
      </div>

      {/* Article I - Offices */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE I - OFFICES</h3>
        <p><strong>Section 1.1 Principal Office.</strong> The principal office of the corporation shall be located at:</p>
        <p className="ml-4 whitespace-pre-line">{data.principalOffice}</p>
      </div>

      {/* Article II - Shareholders */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE II - SHAREHOLDERS</h3>
        <p><strong>Section 2.1 Annual Meeting.</strong> The annual meeting of shareholders shall be held on {data.shareholderMeetingDate} of each year.</p>
        <p className="mt-2"><strong>Section 2.2 Voting Rights.</strong> {data.votingRights}</p>
      </div>

      {/* Article III - Board of Directors */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE III - BOARD OF DIRECTORS</h3>
        <p><strong>Section 3.1 Number and Term.</strong> The corporation shall have {data.numberOfDirectors} directors, each serving a term of {data.directorTermLength}.</p>
        <p className="mt-2"><strong>Section 3.2 Meetings.</strong> Regular meetings of the board shall be held {data.boardMeetingFrequency}.</p>
      </div>

      {/* Article IV - Officers */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE IV - OFFICERS</h3>
        <p><strong>Section 4.1 Titles.</strong> The officers of the corporation shall include: {data.officerTitles}.</p>
      </div>

      {/* Article V - Shares and Dividends */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE V - SHARES AND DIVIDENDS</h3>
        <p><strong>Section 5.1 Dividend Policy.</strong> {data.dividendPolicy}</p>
      </div>

      {/* Article VI - Fiscal Year */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE VI - FISCAL YEAR</h3>
        <p>The fiscal year of the corporation shall end on {data.fiscalYearEnd} of each year.</p>
      </div>

      {/* Article VII - Amendments */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">ARTICLE VII - AMENDMENTS</h3>
        <p><strong>Section 7.1 Amendment Process.</strong> {data.amendmentProcess}</p>
      </div>

      {/* Adoption Section */}
      <div className="mt-12">
        <p className="mb-6">These bylaws were adopted by the board of directors on {data.adoptionDate ? new Date(data.adoptionDate).toLocaleDateString() : '[Date]'}.</p>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm"><strong>Date:</strong> {data.date || '[Date]'}</p>
            <p className="text-sm"><strong>Place:</strong> {data.place || '[Place]'}</p>
          </div>
          
          <div className="text-right">
            <div className="border-b border-gray-400 w-64 mb-2"></div>
            <p className="text-sm"><strong>{data.signatoryName || '[Secretary Name]'}</strong></p>
            <p className="text-sm">{data.signatoryDesignation || '[Title]'}</p>
            <p className="text-sm">{data.corporationName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
