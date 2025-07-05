import React, { useState, useEffect } from "react";
import { EmbassyAttestationPreviewProps } from "@/types/templates";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "./Letterhead";
import { QRCode } from "./QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";

interface ExtendedEmbassyAttestationPreviewProps
  extends EmbassyAttestationPreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const EmbassyAttestationPreview: React.FC<
  ExtendedEmbassyAttestationPreviewProps
> = ({ data, isEmployeePreview = false, requestStatus = "pending" }) => {
  const {
    fullName,
    passportNumber,
    nationality,
    dateOfBirth,
    placeOfBirth,
    fatherName,
    motherName,
    documentType,
    documentNumber,
    issuingAuthority,
    documentIssueDate,
    purposeOfAttestation,
    destinationCountry,
    embassyName,
    applicantAddress,
    phoneNumber,
    emailAddress,
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

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  useEffect(() => {
    const generateQR = async () => {
      if (fullName && documentType && destinationCountry) {
        const url = await generateDocumentQRCode(
          "embassy-attestation-1",
          data,
          organizationDetails?.name,
          user?.id,
        );
        setQrCodeUrl(url);
        if (!url) {
          console.error(
            "QR code URL generation failed for Embassy Attestation Preview.",
          );
        }
      }
    };
    generateQR();
  }, [
    data,
    organizationDetails?.name,
    user?.id,
    fullName,
    documentType,
    destinationCountry,
  ]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    type: string,
  ) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = "none";
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed">
      {/* Letterhead */}
      <Letterhead />

      {/* QR Code for verification */}
      <div className="absolute top-8 right-8">
        <div className="text-center">
          <QRCode value={qrCodeUrl || ""} size={80} />
          <p className="text-xs text-gray-500 mt-1">Verify Document</p>
        </div>
      </div>

      {/* Letter Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            EMBASSY ATTESTATION LETTER
          </h2>
        </div>
      </div>

      {/* Address Section */}
      <div className="mb-8">
        <p>
          <strong>To:</strong>
        </p>
        <p className="ml-4">{embassyName || "[Embassy Name]"}</p>
        <p className="ml-4">{destinationCountry || "[Destination Country]"}</p>
      </div>

      {/* Subject */}
      <div className="mb-6">
        <p>
          <strong>Subject:</strong> Attestation of documents for{" "}
          {fullName || "[Applicant Name]"}
        </p>
      </div>

      {/* Letter Content */}
      <div className="space-y-4 text-justify leading-7 text-base">
        <p>Dear Sir/Madam,</p>

        <p>
          This is to certify that{" "}
          <strong>{fullName || "[Applicant Name]"}</strong>, bearing Passport
          Number <strong>{passportNumber || "[Passport Number]"}</strong>, is a
          citizen of <strong>{nationality || "[Nationality]"}</strong>, born on{" "}
          <strong>
            {dateOfBirth
              ? new Date(dateOfBirth).toLocaleDateString("en-GB")
              : "[Date of Birth]"}
          </strong>
          at <strong>{placeOfBirth || "[Place of Birth]"}</strong>.
        </p>

        <p>
          Father's Name: <strong>{fatherName || "[Father Name]"}</strong>
          <br />
          Mother's Name: <strong>{motherName || "[Mother Name]"}</strong>
        </p>

        <p>The following document(s) are being submitted for attestation:</p>

        <ul className="list-disc ml-8 space-y-2">
          <li>
            Document Type: <strong>{documentType || "[Document Type]"}</strong>
            <br />
            Document Number:{" "}
            <strong>{documentNumber || "[Document Number]"}</strong>
            <br />
            Issuing Authority:{" "}
            <strong>{issuingAuthority || "[Issuing Authority]"}</strong>
            <br />
            Issue Date:{" "}
            <strong>
              {documentIssueDate
                ? new Date(documentIssueDate).toLocaleDateString("en-GB")
                : "[Issue Date]"}
            </strong>
          </li>
        </ul>

        <p>
          <strong>Applicant Details:</strong>
          <br />
          Address: {applicantAddress || "[Applicant Address]"}
          <br />
          Phone: {phoneNumber || "[Phone Number]"}
          <br />
          Email: {emailAddress || "[Email Address]"}
        </p>

        <p>
          The purpose of attestation is{" "}
          <strong>{purposeOfAttestation || "[Purpose of Attestation]"}</strong>.
        </p>

        <p>
          We request you to kindly attest the above-mentioned documents and
          oblige.
        </p>

        <p>Thanking you,</p>
      </div>

      {/* Date and signature */}
      <div className="flex flex-col md:flex-row justify-between pt-8 mt-16">
        <div>
          <p>
            <strong>Date:</strong>{" "}
            {issueDate
              ? new Date(issueDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "[Issue Date]"}
          </p>
          <p>
            <strong>Place:</strong> {place || "[Place]"}
          </p>
        </div>

        <div className="text-right mt-8 md:mt-0">
          {includeDigitalSignature && signatureUrl ? (
            <div className="h-16 mb-4 flex justify-end relative">
              <div className="border-b border-gray-800 px-6">
                <img
                  src={signatureUrl}
                  alt="Digital Signature"
                  className={`h-12 object-contain ${shouldBlur ? "blur-sm" : ""}`}
                  onError={(e) => handleImageError(e, "signature")}
                />
              </div>
              {shouldBlur && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 border border-dashed border-gray-400">
                  <span className="text-xs text-gray-500">
                    Signature pending approval
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-16 mb-4"></div>
          )}
          <p className="font-bold">
            {signatoryName || "[Authorized Signatory Name]"}
          </p>
          <p>{signatoryDesignation || "[Designation]"}</p>
          <p>{institutionName || "[Institution Name]"}</p>
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
