import React from "react";
import { CorporateBylawsPreviewProps } from "@/types/templates";
import { useBranding } from "@/contexts/BrandingContext";
import { Letterhead } from "./Letterhead";

interface ExtendedCorporateBylawsPreviewProps
  extends CorporateBylawsPreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const CorporateBylawsPreview: React.FC<
  ExtendedCorporateBylawsPreviewProps
> = ({ data, isEmployeePreview = false, requestStatus = "pending" }) => {
  const {
    companyName,
    stateOfIncorporation,
    registeredAgent,
    registeredOffice,
    directors,
    officers,
    shareholders,
    shareClasses,
    meetings,
    voting,
    indemnification,
    amendments,
    date: issueDate,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl, sealUrl } = useBranding();

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
            CORPORATE BYLAWS
          </h2>
        </div>
      </div>

      {/* Document Content */}
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{companyName}</h1>
        <h2 className="text-xl font-semibold">
          {stateOfIncorporation} Corporation
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          A {stateOfIncorporation} Corporation
        </p>
      </div>

      {/* Article I - Offices */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE I - OFFICES</h3>
        <p>
          <strong>Section 1.1 Principal Office.</strong> The principal office of
          the corporation shall be located at:
        </p>
        <p className="ml-4 whitespace-pre-line">{registeredOffice}</p>
      </div>

      {/* Article II - Shareholders */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE II - SHAREHOLDERS</h3>
        <p>
          <strong>Section 2.1 Annual Meeting.</strong> The annual meeting of
          shareholders shall be held on {meetings.shareholderMeetingDate} of
          each year.
        </p>
        <p className="mt-2">
          <strong>Section 2.2 Voting Rights.</strong> {voting.votingRights}
        </p>
      </div>

      {/* Article III - Board of Directors */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">
          ARTICLE III - BOARD OF DIRECTORS
        </h3>
        <p>
          <strong>Section 3.1 Number and Term.</strong> The corporation shall
          have {directors.numberOfDirectors} directors, each serving a term of{" "}
          {directors.directorTermLength}.
        </p>
        <p className="mt-2">
          <strong>Section 3.2 Meetings.</strong> Regular meetings of the board
          shall be held {directors.boardMeetingFrequency}.
        </p>
      </div>

      {/* Article IV - Officers */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE IV - OFFICERS</h3>
        <p>
          <strong>Section 4.1 Titles.</strong> The officers of the corporation
          shall include: {officers.officerTitles}.
        </p>
      </div>

      {/* Article V - Shares and Dividends */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">
          ARTICLE V - SHARES AND DIVIDENDS
        </h3>
        <p>
          <strong>Section 5.1 Dividend Policy.</strong>{" "}
          {shareClasses.dividendPolicy}
        </p>
      </div>

      {/* Article VI - Fiscal Year */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">ARTICLE VI - FISCAL YEAR</h3>
        <p>
          The fiscal year of the corporation shall end on{" "}
          {meetings.fiscalYearEnd} of each year.
        </p>
      </div>

      {/* Article VII - Amendments */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">ARTICLE VII - AMENDMENTS</h3>
        <p>
          <strong>Section 7.1 Amendment Process.</strong>{" "}
          {amendments.amendmentProcess}
        </p>
      </div>

      {/* Adoption Section */}
      <div className="mt-12">
        <p className="mb-6">
          These bylaws were adopted by the board of directors on{" "}
          {issueDate ? new Date(issueDate).toLocaleDateString() : "[Date]"}.
        </p>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm">
              <strong>Date:</strong>{" "}
              {issueDate ? new Date(issueDate).toLocaleDateString() : "[Date]"}
            </p>
            <p className="text-sm">
              <strong>Place:</strong> {registeredOffice || "[Place]"}
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
              <div className="h-16 mb-4"></div>
            )}
            <div className="border-b border-gray-400 w-64 mb-2"></div>
            <p className="text-sm">
              <strong>{signatoryName || "[Secretary Name]"}</strong>
            </p>
            <p className="text-sm">{signatoryDesignation || "[Title]"}</p>
            <p className="text-sm">{companyName}</p>
          </div>
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
