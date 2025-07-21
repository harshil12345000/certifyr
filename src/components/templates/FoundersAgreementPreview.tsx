import React from "react";
import { FoundersAgreementPreviewProps } from "@/types/templates";
import { useBranding } from "@/contexts/BrandingContext";
import { Letterhead } from "./Letterhead";

interface ExtendedFoundersAgreementPreviewProps
  extends FoundersAgreementPreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const FoundersAgreementPreview: React.FC<
  ExtendedFoundersAgreementPreviewProps
> = ({ data, isEmployeePreview = false, requestStatus = "pending" }) => {
  const {
    companyName,
    founders,
    equityDistribution,
    vestingSchedule,
    rolesAndResponsibilities,
    intellectualProperty,
    nonCompete,
    termination,
    governingLaw,
    date: issueDate,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl } = useBranding();

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

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

      {/* Document Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            FOUNDERS AGREEMENT
          </h2>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{companyName}</h1>
        <h2 className="text-xl font-semibold">
          Effective Date:{" "}
          {issueDate ? new Date(issueDate).toLocaleDateString() : "[Date]"}
        </h2>
      </div>

      {/* Parties */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">PARTIES</h3>
        <p>
          This Founders Agreement ("Agreement") is entered into by and between
          the following founders (collectively, the "Founders"):
        </p>
        <p className="ml-4 mt-2">{founders}</p>
        <p className="mt-2">
          in connection with the formation and operation of{" "}
          <strong>{companyName}</strong> (the "Company").
        </p>
      </div>

      {/* Business Description */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">1. BUSINESS DESCRIPTION</h3>
        <p>{rolesAndResponsibilities}</p>
      </div>

      {/* Equity Distribution */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">2. EQUITY DISTRIBUTION</h3>
        <p>
          The ownership interests in the Company shall be distributed among the
          Founders as follows:
        </p>
        <p className="ml-4 mt-2 whitespace-pre-line">{equityDistribution}</p>
      </div>

      {/* Vesting */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">3. VESTING SCHEDULE</h3>
        <p>
          Founder equity shall vest according to the following schedule:{" "}
          {vestingSchedule}
        </p>
      </div>

      {/* Roles and Responsibilities */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">
          4. ROLES AND RESPONSIBILITIES
        </h3>
        <p className="whitespace-pre-line">{rolesAndResponsibilities}</p>
      </div>

      {/* Capital Contributions */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">5. CAPITAL CONTRIBUTIONS</h3>
        <p className="whitespace-pre-line">{rolesAndResponsibilities}</p>
      </div>

      {/* Intellectual Property */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">6. INTELLECTUAL PROPERTY</h3>
        <p>{intellectualProperty}</p>
      </div>

      {/* Confidentiality */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">7. CONFIDENTIALITY</h3>
        <p>{rolesAndResponsibilities}</p>
      </div>

      {/* Non-Compete */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">8. NON-COMPETE</h3>
        <p>{nonCompete}</p>
      </div>

      {/* Dispute Resolution */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">9. DISPUTE RESOLUTION</h3>
        <p>{rolesAndResponsibilities}</p>
      </div>

      {/* Governing Law */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">10. GOVERNING LAW</h3>
        <p>This Agreement shall be governed by the laws of {governingLaw}.</p>
      </div>

      {/* Signature Section */}
      <div className="mt-12">
        <p className="mb-6">
          IN WITNESS WHEREOF, the parties have executed this Agreement as of the
          date first written above.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {founders.split(",").map((founder, index) => (
            <div key={index} className="text-center">
              <div className="border-b border-gray-400 w-full mb-2"></div>
              <p className="text-sm font-semibold">{founder.trim()}</p>
              <p className="text-sm">Founder</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end mt-8">
          <div>
            <p className="text-sm">
              <strong>Date:</strong> {issueDate || "[Date]"}
            </p>
            <p className="text-sm">
              <strong>Place:</strong> {rolesAndResponsibilities || "[Place]"}
            </p>
          </div>

          {signatoryName && (
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
                <div className="h-16 mb-4"></div>
              )}
              <div className="border-b border-gray-400 w-48 mb-2"></div>
              <p className="text-sm">
                <strong>{signatoryName}</strong>
              </p>
              <p className="text-sm">Witness</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
