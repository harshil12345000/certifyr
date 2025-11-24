import React, { useState, useEffect } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "./Letterhead";
import { QRCode } from "./QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";

interface DynamicPreviewProps {
  config: any;
  data: any;
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const DynamicPreview: React.FC<DynamicPreviewProps> = ({
  config,
  data,
  isEmployeePreview = false,
  requestStatus = "pending",
}) => {
  const { signatureUrl, organizationDetails, organizationId } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  useEffect(() => {
    const generateQR = async () => {
      const url = await generateDocumentQRCode(
        `${config.id}-1`,
        data,
        organizationId || undefined,
        user?.id,
      );
      setQrCodeUrl(url);
    };
    if (data.fullName && data.institutionName) {
      generateQR();
    }
  }, [data, organizationId, user?.id, config.id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "[Date]";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    type: string,
  ) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = "none";
  };

  const formattedIssueDate = data.date
    ? formatDate(data.date)
    : "[Issue Date]";
  const formattedStartDate = data.startDate
    ? formatDate(data.startDate)
    : "[Start Date]";

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      <Letterhead />

      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            BONAFIDE CERTIFICATE
          </h2>
        </div>
      </div>

      <div className="space-y-4 text-justify leading-7 text-base">
        <p>
          This is to certify that{" "}
          <strong>{data.fullName || "[Student Name]"}</strong>
          {data.parentName && `, son/daughter of ${data.parentName},`} is a bonafide{" "}
          <strong>{data.type === "student" ? "student" : "employee"}</strong> of{" "}
          <strong>
            {organizationDetails?.name ||
              data.institutionName ||
              "[Institution Name]"}
          </strong>
          .
        </p>

        {data.type === "student" ? (
          <p>
            {data.fullName ? "He/She" : "[He/She]"} is studying{" "}
            <strong>{data.courseOrDesignation || "[Course]"}</strong> in the{" "}
            <strong>{data.department || "[Department]"}</strong> department and has
            been with us since <strong>{formattedStartDate}</strong>.
          </p>
        ) : (
          <p>
            {data.fullName ? "He/She" : "[He/She]"} is working as{" "}
            <strong>{data.courseOrDesignation || "[Designation]"}</strong> in the{" "}
            <strong>{data.department || "[Department]"}</strong> department and has
            been with us since <strong>{formattedStartDate}</strong>.
          </p>
        )}

        <p>
          This certificate is issued for{" "}
          <strong>{data.purpose || "[Purpose]"}</strong> purposes.
        </p>

        <p>
          We wish {data.fullName ? "him/her" : "[him/her]"} all the best for future
          endeavors.
        </p>
      </div>

      <div className="flex justify-between items-end mt-16">
        <div>
          <p>
            <strong>Date:</strong> {formattedIssueDate}
          </p>
          <p>
            <strong>Place:</strong> {data.place || "[Place]"}
          </p>
        </div>

        <div className="text-right">
          {data.includeDigitalSignature && signatureUrl ? (
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
            {data.signatoryName || "[Authorized Signatory Name]"}
          </p>
          <p>{data.signatoryDesignation || "[Designation]"}</p>
          <p className="mb-4">
            {organizationDetails?.name ||
              data.institutionName ||
              "[Institution Name]"}
          </p>

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
