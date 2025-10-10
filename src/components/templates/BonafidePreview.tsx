import React, { useState, useEffect } from "react";
import { BonafidePreviewProps } from "@/types/templates";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "./Letterhead";
import { QRCode } from "./QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";

interface ExtendedBonafidePreviewProps extends BonafidePreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const BonafidePreview: React.FC<ExtendedBonafidePreviewProps> = ({
  data,
  isEmployeePreview = false,
  requestStatus = "pending",
}) => {
  const {
    fullName,
    parentName,
    type,
    institutionName,
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

  const { signatureUrl, organizationDetails, organizationId } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (fullName && type && institutionName) {
      const generateQR = async () => {
        const url = await generateDocumentQRCode(
          "bonafide-1",
          data,
          organizationId || undefined,
          user?.id,
        );
        setQrCodeUrl(url);
        if (!url) {
          console.error("QR code URL generation failed for Bonafide Preview.");
        }
      };
      generateQR();
    }
  }, [
    data,
    organizationId,
    user?.id,
    fullName,
    type,
    institutionName,
  ]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    type: string,
  ) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = "none";
  };

  const formattedIssueDate = issueDate
    ? new Date(issueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "[Issue Date]";
  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "[Start Date]";

  // Determine if content should be blurred for employee preview
  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            BONAFIDE CERTIFICATE
          </h2>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="space-y-4 text-justify leading-7 text-base">
        <p>
          This is to certify that{" "}
          <strong>{fullName || "[Student Name]"}</strong>
          {parentName && `, son/daughter of ${parentName},`} is a bonafide{" "}
          <strong>{type === "student" ? "student" : "employee"}</strong> of{" "}
          <strong>
            {organizationDetails?.name ||
              institutionName ||
              "[Institution Name]"}
          </strong>
          .
        </p>

        {type === "student" ? (
          <p>
            {fullName ? "He/She" : "[He/She]"} is studying{" "}
            <strong>{courseOrDesignation || "[Course]"}</strong> in the{" "}
            <strong>{department || "[Department]"}</strong> department and has
            been with us since <strong>{formattedStartDate}</strong>.
          </p>
        ) : (
          <p>
            {fullName ? "He/She" : "[He/She]"} is working as{" "}
            <strong>{courseOrDesignation || "[Designation]"}</strong> in the{" "}
            <strong>{department || "[Department]"}</strong> department and has
            been with us since <strong>{formattedStartDate}</strong>.
          </p>
        )}

        <p>
          This certificate is issued for{" "}
          <strong>{purpose || "[Purpose]"}</strong> purposes.
        </p>

        <p>
          We wish {fullName ? "him/her" : "[him/her]"} all the best for future
          endeavors.
        </p>
      </div>

      {/* Date and signature */}
      <div className="flex justify-between items-end mt-16">
        <div>
          <p>
            <strong>Date:</strong> {formattedIssueDate}
          </p>
          <p>
            <strong>Place:</strong> {place || "[Place]"}
          </p>
        </div>

        <div className="text-right">
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
            <div className="h-16 mb-4">{/* Space for manual signature */}</div>
          )}
          <p className="font-bold">
            {signatoryName || "[Authorized Signatory Name]"}
          </p>
          <p>{signatoryDesignation || "[Designation]"}</p>
          <p className="mb-4">
            {organizationDetails?.name ||
              institutionName ||
              "[Institution Name]"}
          </p>

          {/* QR Code positioned below institution name */}
          {qrCodeUrl && (
            <div className="flex justify-end relative">
              <div className={shouldBlur ? "blur-sm" : ""}>
                <QRCode value={qrCodeUrl} size={75} />
              </div>
              {shouldBlur && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 border border-dashed border-gray-400 w-[75px] h-[75px]">
                  <span className="text-xs text-gray-500 text-center">
                    QR pending approval
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
