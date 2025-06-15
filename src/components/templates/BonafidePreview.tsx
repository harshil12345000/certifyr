
import React from 'react';
import { BonafidePreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { Letterhead } from './Letterhead';

export const BonafidePreview: React.FC<BonafidePreviewProps> = ({ data }) => {
  const {
    fullName,
    gender,
    parentName,
    type,
    startDate,
    courseOrDesignation,
    department,
    purpose,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl, sealUrl, organizationDetails, isLoading } = useBranding();

  const pronoun = gender === 'female' ? 'She' : 'He';
  const childPronoun = gender === 'female' ? 'daughter' : 'son';

  const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Start Date]';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  const institutionNameToDisplay = organizationDetails?.name || data.institutionName || "[Institution Name]";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0 a4-document">
      <div className="p-8 min-h-[297mm] w-full max-w-[210mm] mx-auto bg-white relative">
        {/* Letterhead */}
        <Letterhead />

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <div className="border border-gray-400 inline-block px-8 py-3">
            <h2 className="text-lg font-bold uppercase tracking-widest">BONAFIDE CERTIFICATE</h2>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="space-y-4 text-justify leading-7 text-base">
          <p>
            This is to certify that <strong>{fullName || '[Full Name]'}</strong>, {childPronoun} of <strong>{parentName || '[Parent Name]'}</strong>, 
            is a bonafide {type} of this institution{type === 'student' ? ` studying ${courseOrDesignation || '[Course/Program]'}` : ` working as ${courseOrDesignation || '[Designation]'}`} 
            {department && ` in the ${department} department`} since <strong>{formattedStartDate}</strong>.
          </p>

          <p>
            {pronoun} is of good character and conduct. This certificate is issued for <strong>{purpose || '[Purpose]'}</strong> purposes.
          </p>

          <p>
            I wish {gender === 'female' ? 'her' : 'him'} all success in {gender === 'female' ? 'her' : 'his'} future endeavors.
          </p>
        </div>

        {/* Date and signature */}
        <div className="flex flex-col md:flex-row justify-between pt-8 mt-16">
          <div>
            <p>
              <strong>Date:</strong> {formattedIssueDate}
            </p>
            <p>
              <strong>Place:</strong> {place || "[Place]"}
            </p>
          </div>
          
          <div className="text-right mt-8 md:mt-0">
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
            <p>{institutionNameToDisplay}</p>
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
    </div>
  );
};
