import React from "react";
import { AcademicTranscriptData } from "@/types/corporate-templates";
import { useBranding } from "@/contexts/BrandingContext";
import { Letterhead } from "./Letterhead";

export interface AcademicTranscriptPreviewProps {
  data: AcademicTranscriptData;
}

interface ExtendedAcademicTranscriptPreviewProps
  extends AcademicTranscriptPreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const AcademicTranscriptPreview: React.FC<
  ExtendedAcademicTranscriptPreviewProps
> = ({ data, isEmployeePreview = false, requestStatus = "pending" }) => {
  const {
    studentName,
    studentId,
    fatherName,
    motherName,
    dateOfBirth,
    courseTitle,
    academicYear,
    semester,
    subjects,
    grades,
    cgpa,
    percentage,
    class: studentClass,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { logoUrl, sealUrl, signatureUrl, organizationDetails } = useBranding();

  const formattedDateOfBirth = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "[Date of Birth]";
  const formattedIssueDate = issueDate
    ? new Date(issueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "[Issue Date]";

  const displayInstitutionName =
    organizationDetails?.name || institutionName || "[INSTITUTION NAME]";

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
            ACADEMIC TRANSCRIPT
          </h2>
        </div>
      </div>

      {/* Student Information */}
      <div className="mb-8">
        <h3 className="text-base font-bold mb-4 text-blue-600 border-b border-blue-200 pb-1">
          STUDENT INFORMATION
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Student Name:</strong> {studentName || "[Student Name]"}
          </div>
          <div>
            <strong>Student ID:</strong> {studentId || "[Student ID]"}
          </div>
          <div>
            <strong>Father's Name:</strong> {fatherName || "[Father's Name]"}
          </div>
          <div>
            <strong>Mother's Name:</strong> {motherName || "[Mother's Name]"}
          </div>
          <div>
            <strong>Date of Birth:</strong> {formattedDateOfBirth}
          </div>
          <div>
            <strong>Course:</strong> {courseTitle || "[Course Title]"}
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="mb-8">
        <h3 className="text-base font-bold mb-4 text-blue-600 border-b border-blue-200 pb-1">
          ACADEMIC DETAILS
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <strong>Academic Year:</strong> {academicYear || "[Academic Year]"}
          </div>
          <div>
            <strong>Semester/Year:</strong> {semester || "[Semester]"}
          </div>
          <div>
            <strong>Class/Division:</strong> {studentClass || "[Class]"}
          </div>
          <div>
            <strong>Overall Grade:</strong> {grades || "[Grade]"}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-6 bg-blue-50 p-4 rounded">
          <div className="text-center">
            <strong>CGPA/GPA</strong>
            <div className="text-lg font-bold text-blue-600">
              {cgpa || "[CGPA]"}
            </div>
          </div>
          <div className="text-center">
            <strong>Percentage</strong>
            <div className="text-lg font-bold text-blue-600">
              {percentage || "[Percentage]"}
            </div>
          </div>
          <div className="text-center">
            <strong>Class</strong>
            <div className="text-lg font-bold text-blue-600">
              {studentClass || "[Class]"}
            </div>
          </div>
        </div>

        {/* Subjects and Marks */}
        <div className="mb-6">
          <h4 className="font-bold mb-2">Subjects & Marks:</h4>
          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-line">
            {subjects || "[Subjects and marks will be listed here]"}
          </div>
        </div>
      </div>

      {/* Certification */}
      <div className="mb-8 text-justify">
        <p>
          This is to certify that the above academic record is true and correct
          as per the records maintained by this institution.
          <strong> {studentName || "[Student Name]"}</strong> has successfully
          completed the requirements for{" "}
          <strong>{courseTitle || "[Course Title]"}</strong>
          during the academic year{" "}
          <strong>{academicYear || "[Academic Year]"}</strong>.
        </p>
      </div>

      {/* Date and Place */}
      <div className="mt-12 mb-16">
        <p>
          <strong>Date:</strong> {formattedIssueDate}
        </p>
        <p>
          <strong>Place:</strong> {place || "[Place]"}
        </p>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-end items-end">
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
          {!includeDigitalSignature && <div className="h-16"></div>}
          <p className="font-semibold">
            {signatoryName || "[Authorized Signatory Name]"}
          </p>
          <p>{signatoryDesignation || "[Designation]"}</p>
          <p>{displayInstitutionName}</p>
        </div>
      </div>

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img
            src={sealUrl}
            alt="Institution Seal"
            className="h-24 w-24 object-contain opacity-50"
          />
        </div>
      )}
    </div>
  );
};
