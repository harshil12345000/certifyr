import React from "react";
import { EmploymentAgreementData } from "@/types/corporate-templates";
import { useBranding } from "@/contexts/BrandingContext";
import { Letterhead } from "./Letterhead";

interface EmploymentAgreementPreviewProps {
  data: EmploymentAgreementData;
}

interface ExtendedEmploymentAgreementPreviewProps
  extends EmploymentAgreementPreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const EmploymentAgreementPreview: React.FC<
  ExtendedEmploymentAgreementPreviewProps
> = ({ data, isEmployeePreview = false, requestStatus = "pending" }) => {
  const { signatureUrl, organizationDetails } = useBranding();

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    type: string,
  ) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = "none";
  };

  return (
    <div className="a4-document bg-white p-8 shadow-lg max-w-4xl mx-auto">
      {/* Letterhead */}
      <Letterhead />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">EMPLOYMENT AGREEMENT</h1>
        <p className="text-sm text-gray-600">{data.employerName}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">PARTIES</h3>
        <p>
          <strong>Employer:</strong> {data.employerName}
        </p>
        <p>
          <strong>Employee:</strong> {data.employeeName}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">POSITION DETAILS</h3>
        <p>
          <strong>Job Title:</strong> {data.jobTitle}
        </p>
        {data.department && (
          <p>
            <strong>Department:</strong> {data.department}
          </p>
        )}
        <p>
          <strong>Employment Type:</strong> {data.employmentType}
        </p>
        <p>
          <strong>Start Date:</strong>{" "}
          {data.startDate
            ? new Date(data.startDate).toLocaleDateString()
            : "[Date]"}
        </p>
        <p>
          <strong>Work Location:</strong> {data.workLocation}
        </p>
        <p>
          <strong>Work Hours:</strong> {data.workHours}
        </p>
        {data.probationPeriod && (
          <p>
            <strong>Probation Period:</strong> {data.probationPeriod}
          </p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">COMPENSATION</h3>
        <p>
          <strong>Salary:</strong> {data.salary}
        </p>
        <p>
          <strong>Pay Frequency:</strong> {data.payFrequency}
        </p>
        {data.benefits && (
          <div className="mt-2">
            <p>
              <strong>Benefits:</strong>
            </p>
            <p className="ml-4 whitespace-pre-line">{data.benefits}</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">TERMINATION</h3>
        <p>{data.terminationClause}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">CONFIDENTIALITY</h3>
        <p>{data.confidentialityClause}</p>
      </div>

      {data.nonCompeteClause && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">NON-COMPETE</h3>
          <p>{data.nonCompeteClause}</p>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">GOVERNING LAW</h3>
        <p>
          This Agreement shall be governed by the laws of {data.governingLaw}.
        </p>
      </div>

      <div className="mt-12">
        <p className="mb-6">
          By signing below, both parties acknowledge that they have read,
          understood, and agree to be bound by the terms of this Employment
          Agreement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-semibold">{data.employeeName}</p>
            <p className="text-sm">Employee</p>
          </div>
          <div className="text-center">
            {data.includeDigitalSignature && signatureUrl && (
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
            )}
            <div className="border-b border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-semibold">
              {data.signatoryName || "[HR Representative]"}
            </p>
            <p className="text-sm">
              {data.signatoryDesignation || "HR Representative"}
            </p>
            <p className="text-sm">{data.employerName}</p>
          </div>
        </div>

        <div className="flex justify-between items-end mt-8">
          <div>
            <p className="text-sm">
              <strong>Date:</strong> {data.date || "[Date]"}
            </p>
            <p className="text-sm">
              <strong>Place:</strong> {data.place || "[Place]"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
