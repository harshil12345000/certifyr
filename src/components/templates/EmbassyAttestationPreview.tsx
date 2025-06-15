import React, { useState, useEffect } from 'react';
import { EmbassyAttestationPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { Letterhead } from './Letterhead';

export const EmbassyAttestationPreview: React.FC<EmbassyAttestationPreviewProps> = ({ data }) => {
  const {
    fullName,
    passportNumber,
    nationality,
    visaType,
    destinationCountry,
    purpose,
    duration,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl, sealUrl } = useBranding();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  const formattedDateOfBirth = dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Date of Birth]';
  const formattedDocumentIssueDate = documentIssueDate ? new Date(documentIssueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Document Issue Date]';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-serif text-sm leading-relaxed">
      {/* Letterhead */}
      <Letterhead />

      {/* Letter Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">EMBASSY ATTESTATION LETTER</h2>
        </div>
      </div>

      {/* Letter Content */}
      <div className="space-y-4 text-justify leading-7">
        <p className="text-center font-semibold">
          TO: {embassyName || '[Embassy/Consulate Name]'}
        </p>

        <p className="font-semibold">Subject: Request for Document Attestation</p>

        <p>Dear Sir/Madam,</p>

        <p>
          This is to certify and confirm the authenticity of the document(s) submitted by <strong>{fullName || '[Full Name]'}</strong> for the purpose of embassy attestation.
        </p>

        <div className="my-6">
          <h3 className="font-semibold mb-3">Applicant Details:</h3>
          <div className="ml-4 space-y-1">
            <p><strong>Full Name:</strong> {fullName || '[Full Name]'}</p>
            <p><strong>Passport Number:</strong> {passportNumber || '[Passport Number]'}</p>
            <p><strong>Nationality:</strong> {nationality || '[Nationality]'}</p>
            <p><strong>Date of Birth:</strong> {formattedDateOfBirth}</p>
            <p><strong>Place of Birth:</strong> {placeOfBirth || '[Place of Birth]'}</p>
            <p><strong>Father's Name:</strong> {fatherName || "[Father's Name]"}</p>
            <p><strong>Mother's Name:</strong> {motherName || "[Mother's Name]"}</p>
          </div>
        </div>

        <div className="my-6">
          <h3 className="font-semibold mb-3">Document Details:</h3>
          <div className="ml-4 space-y-1">
            <p><strong>Document Type:</strong> {documentType || '[Document Type]'}</p>
            {documentNumber && <p><strong>Document Number:</strong> {documentNumber}</p>}
            <p><strong>Issuing Authority:</strong> {issuingAuthority || '[Issuing Authority]'}</p>
            {documentIssueDate && <p><strong>Issue Date:</strong> {formattedDocumentIssueDate}</p>}
          </div>
        </div>

        <div className="my-6">
          <h3 className="font-semibold mb-3">Contact Information:</h3>
          <div className="ml-4 space-y-1">
            <p><strong>Address:</strong> {applicantAddress || '[Applicant Address]'}</p>
            <p><strong>Phone:</strong> {phoneNumber || '[Phone Number]'}</p>
            <p><strong>Email:</strong> {emailAddress || '[Email Address]'}</p>
          </div>
        </div>

        <p>
          The above-mentioned document is being submitted for attestation for the purpose of <strong>{purposeOfAttestation || '[Purpose of Attestation]'}</strong> in <strong>{destinationCountry || '[Destination Country]'}</strong>.
        </p>

        <p>
          We hereby confirm that the document submitted is genuine and has been issued by the competent authority. We request your kind consideration for the attestation of the said document.
        </p>

        <p>We trust that this information is sufficient for your requirements and look forward to your favorable response.</p>

        <p>Thank you for your cooperation.</p>
      </div>

      {/* Date and Place */}
      <div className="mt-12 mb-16">
        <p><strong>Date:</strong> {formattedIssueDate}</p>
        <p><strong>Place:</strong> {place || '[Place]'}</p>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-end items-end">
        <div className="text-right">
          {includeDigitalSignature && signatureUrl && (
            <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain ml-auto" />
          )}
          {includeDigitalSignature && !signatureUrl && (
            <div className="h-16 w-48 mb-2 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 italic ml-auto">
              [Digital Signature Placeholder]
            </div>
          )}
          {!includeDigitalSignature && <div className="h-16"></div>}
          <p className="font-semibold">{signatoryName || '[Authorized Signatory Name]'}</p>
          <p>{signatoryDesignation || '[Designation]'}</p>
          <p>{institutionName || '[Institution Name]'}</p>
        </div>
      </div>

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img src={sealUrl} alt="Institution Seal" className="h-24 w-24 object-contain opacity-50" />
        </div>
      )}
    </div>
  );
};
