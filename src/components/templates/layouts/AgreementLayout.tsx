import React, { useState, useEffect } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "../Letterhead";
import { QRCode } from "../QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";

interface AgreementLayoutProps {
  config: any;
  data: any;
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const AgreementLayout: React.FC<AgreementLayoutProps> = ({
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
    if (Object.keys(data).length > 0) {
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

  const renderAgreementContent = () => {
    // NDA
    if (config.id === "nda") {
      return (
        <>
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold uppercase">
              NON-DISCLOSURE AGREEMENT
            </h2>
          </div>

          <div className="space-y-6 text-justify leading-7 text-base">
            <p>
              This Non-Disclosure Agreement (the "Agreement") is entered into as of{" "}
              <strong>{formatDate(data.date)}</strong> at{" "}
              <strong>{data.place || "[Place]"}</strong>.
            </p>

            <div>
              <p className="font-bold">BETWEEN:</p>
              <p className="ml-8">
                <strong>
                  {organizationDetails?.name ||
                    data.institutionName ||
                    "[Company Name]"}
                </strong>
                , hereinafter referred to as the "Disclosing Party"
              </p>
            </div>

            <div>
              <p className="font-bold">AND:</p>
              <p className="ml-8">
                <strong>{data.partyName || "[Party Name]"}</strong>
                {data.partyAddress && `, ${data.partyAddress}`}, hereinafter referred
                to as the "Receiving Party"
              </p>
            </div>

            <div>
              <p className="font-bold">1. PURPOSE</p>
              <p className="ml-8">
                {data.purpose ||
                  "The purpose of this Agreement is to protect confidential information shared between the parties."}
              </p>
            </div>

            <div>
              <p className="font-bold">2. CONFIDENTIAL INFORMATION</p>
              <p className="ml-8">
                {data.confidentialInfo ||
                  "Confidential Information includes all information disclosed by the Disclosing Party to the Receiving Party, whether written, oral, or electronic."}
              </p>
            </div>

            <div>
              <p className="font-bold">3. OBLIGATIONS</p>
              <p className="ml-8">
                The Receiving Party agrees to:
                <br />
                (a) Keep all Confidential Information strictly confidential
                <br />
                (b) Not disclose Confidential Information to third parties without prior
                written consent
                <br />
                (c) Use Confidential Information solely for the stated purpose
                <br />
                (d) Return or destroy all Confidential Information upon request
              </p>
            </div>

            <div>
              <p className="font-bold">4. TERM</p>
              <p className="ml-8">
                This Agreement shall remain in effect for a period of{" "}
                <strong>{data.duration || "[Duration]"}</strong> from the date of
                signing.
              </p>
            </div>

            <div>
              <p className="font-bold">5. GOVERNING LAW</p>
              <p className="ml-8">
                This Agreement shall be governed by the laws of{" "}
                <strong>{data.governingLaw || "[Jurisdiction]"}</strong>.
              </p>
            </div>

            {data.additionalTerms && (
              <div>
                <p className="font-bold">6. ADDITIONAL TERMS</p>
                <p className="ml-8 whitespace-pre-line">{data.additionalTerms}</p>
              </div>
            )}
          </div>
        </>
      );
    }

    // Employment Agreement
    if (config.id === "employment-agreement") {
      return (
        <>
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold uppercase">
              EMPLOYMENT AGREEMENT
            </h2>
          </div>

          <div className="space-y-6 text-justify leading-7 text-base">
            <p>
              This Employment Agreement is entered into on{" "}
              <strong>{formatDate(data.date)}</strong> at{" "}
              <strong>{data.place || "[Place]"}</strong>.
            </p>

            <div>
              <p className="font-bold">BETWEEN:</p>
              <p className="ml-8">
                <strong>
                  {organizationDetails?.name ||
                    data.institutionName ||
                    "[Company Name]"}
                </strong>
                , hereinafter referred to as the "Employer"
              </p>
            </div>

            <div>
              <p className="font-bold">AND:</p>
              <p className="ml-8">
                <strong>{data.employeeName || "[Employee Name]"}</strong>
                {data.employeeAddress && `, ${data.employeeAddress}`}, hereinafter
                referred to as the "Employee"
              </p>
            </div>

            <div>
              <p className="font-bold">1. POSITION AND DUTIES</p>
              <p className="ml-8">
                The Employee is hired as <strong>{data.jobTitle || "[Job Title]"}</strong>{" "}
                and shall perform duties as assigned. Start date:{" "}
                <strong>{formatDate(data.startDate)}</strong>.
              </p>
            </div>

            <div>
              <p className="font-bold">2. COMPENSATION</p>
              <p className="ml-8">
                The Employee shall receive a salary of{" "}
                <strong>{data.salary || "[Salary]"}</strong> per annum, payable monthly.
                {data.benefits && (
                  <>
                    <br />
                    <br />
                    Benefits: {data.benefits}
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="font-bold">3. WORK HOURS</p>
              <p className="ml-8">
                {data.workHours ||
                  "The Employee shall work standard business hours as determined by the Employer."}
              </p>
            </div>

            <div>
              <p className="font-bold">4. PROBATION PERIOD</p>
              <p className="ml-8">
                The Employee shall be on probation for{" "}
                <strong>{data.probationPeriod || "[Period]"}</strong>.
              </p>
            </div>

            <div>
              <p className="font-bold">5. TERMINATION</p>
              <p className="ml-8">
                Either party may terminate this agreement with{" "}
                <strong>{data.noticePeriod || "[Notice Period]"}</strong> written
                notice.
              </p>
            </div>

            <div>
              <p className="font-bold">6. CONFIDENTIALITY</p>
              <p className="ml-8">
                The Employee agrees to maintain confidentiality of all proprietary
                information.
              </p>
            </div>

            {data.additionalTerms && (
              <div>
                <p className="font-bold">7. ADDITIONAL TERMS</p>
                <p className="ml-8 whitespace-pre-line">{data.additionalTerms}</p>
              </div>
            )}
          </div>
        </>
      );
    }

    // Generic Agreement
    return (
      <>
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase">{config.name}</h2>
        </div>

        <div className="space-y-6 text-justify leading-7 text-base">
          <p>
            This Agreement is entered into on <strong>{formatDate(data.date)}</strong>{" "}
            at <strong>{data.place || "[Place]"}</strong>.
          </p>

          <div>
            <p className="font-bold">PARTIES:</p>
            <p className="ml-8">
              <strong>
                {organizationDetails?.name ||
                  data.institutionName ||
                  "[Party Name]"}
              </strong>
            </p>
            {data.partyName && (
              <p className="ml-8">
                <strong>{data.partyName}</strong>
              </p>
            )}
          </div>

          {Object.entries(data).map(([key, value], index) => {
            if (
              key === "includeDigitalSignature" ||
              key === "signatoryName" ||
              key === "signatoryDesignation" ||
              key === "date" ||
              key === "place" ||
              key === "institutionName" ||
              !value
            )
              return null;
            return (
              <div key={key}>
                <p className="font-bold">
                  {index + 1}. {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                </p>
                <p className="ml-8">{String(value)}</p>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      <Letterhead />

      {renderAgreementContent()}

      <div className="mt-16 pt-8 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-bold mb-2">DISCLOSING PARTY / EMPLOYER</p>
            {data.includeDigitalSignature && signatureUrl ? (
              <div className="mb-4 relative inline-block">
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
              <div className="h-16 mb-4 border-b border-gray-800">{/* Signature space */}</div>
            )}
            <p className="font-bold">
              {data.signatoryName || "[Authorized Signatory]"}
            </p>
            <p>{data.signatoryDesignation || "[Designation]"}</p>
            <p>
              {organizationDetails?.name ||
                data.institutionName ||
                "[Institution Name]"}
            </p>
            <p className="mt-2">Date: {formatDate(data.date)}</p>
          </div>

          <div>
            <p className="font-bold mb-2">RECEIVING PARTY / EMPLOYEE</p>
            <div className="h-16 mb-4 border-b border-gray-800">{/* Signature space */}</div>
            <p className="font-bold">{data.partyName || data.employeeName || "[Name]"}</p>
            <p className="mt-2">Date: {formatDate(data.date)}</p>
          </div>
        </div>

        {qrCodeUrl && (
          <div className="mt-8 flex justify-center relative inline-block">
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
  );
};
