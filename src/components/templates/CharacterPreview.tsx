import React, { useState, useEffect } from "react";
import { CharacterPreviewProps } from "@/types/templates";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "./Letterhead";
import { QRCode } from "./QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";
import { pronouns } from "@/lib/pronouns";

interface ExtendedCharacterPreviewProps extends CharacterPreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const CharacterPreview: React.FC<ExtendedCharacterPreviewProps> = ({
  data,
  isEmployeePreview = false,
  requestStatus = "pending",
}) => {
  const {
    fullName,
    parentName,
    address,
    duration,
    conduct,
    institutionName,
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
    // Only generate QR for approved documents (not pending/rejected employee previews)
    if (isEmployeePreview && requestStatus !== "approved") {
      setQrCodeUrl(null);
      return;
    }
    
    if (fullName && parentName && duration) {
      const generateQR = async () => {
        const url = await generateDocumentQRCode(
          "character-1",
          data,
          organizationId || undefined,
          user?.id,
        );
        setQrCodeUrl(url);
        if (!url) {
          console.error("QR code URL generation failed for Character Preview.");
        }
      };
      generateQR();
    }
  }, [
    data,
    organizationId,
    user?.id,
    fullName,
    parentName,
    duration,
    isEmployeePreview,
    requestStatus,
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

  // Determine if content should be blurred for employee preview
  const shouldBlur = isEmployeePreview && requestStatus !== "approved";
  const p = pronouns(data.gender);

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            CHARACTER CERTIFICATE
          </h2>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="space-y-4 text-justify leading-7 text-base">
        <p>
          This is to certify that{" "}
          <strong>{fullName || "[Student Name]"}</strong>,
          {parentName && ` ${p.sonDaughter} of ${parentName},`}
          {address && ` residing at ${address},`} has been known to me for{" "}
          <strong>{duration || "[Duration]"}</strong>.
        </p>

        <p>
          During this period, I have found {fullName ? p.their : "[their]"}{" "}
          character and conduct to be{" "}
          <strong>{conduct || "[Character/Conduct]"}</strong>.
          {fullName ? p.theyHave : "[They have]"} always been honest,
          disciplined, and of good moral character.
        </p>

        <p>
          I have no hesitation in recommending {fullName || "[Student Name]"}{" "}
          for any position or opportunity {p.they.toLowerCase()} may seek.
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
          {includeDigitalSignature && signatureUrl && !shouldBlur ? (
            <div className="h-16 mb-4 flex justify-end">
              <div className="border-b border-gray-800 px-6">
                <img
                  src={signatureUrl}
                  alt="Digital Signature"
                  className="h-12 object-contain"
                  onError={(e) => handleImageError(e, "signature")}
                />
              </div>
            </div>
          ) : shouldBlur && includeDigitalSignature ? (
            <div className="h-16 mb-4 flex justify-end">
              <div className="flex items-center justify-center bg-gray-100 border border-dashed border-gray-400 px-6 h-12">
                <span className="text-xs text-gray-500">
                  Signature pending approval
                </span>
              </div>
            </div>
          ) : (
            <div className="h-16 mb-4">{/* Space for manual signature */}</div>
          )}
          <p className="font-bold">
            {signatoryName || "[Authorized Signatory Name]"}
          </p>
          <p>{signatoryDesignation || "[Designation]"}</p>
          <p className="mb-4">{institutionName || "[Institution Name]"}</p>

          {/* QR Code positioned below institution name */}
          {qrCodeUrl && !shouldBlur && (
            <div className="flex justify-end">
              <QRCode value={qrCodeUrl} size={75} />
            </div>
          )}
          {shouldBlur && (
            <div className="flex justify-end">
              <div className="flex items-center justify-center bg-gray-100 border border-dashed border-gray-400 w-[75px] h-[75px]">
                <span className="text-xs text-gray-500 text-center">
                  QR pending
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
