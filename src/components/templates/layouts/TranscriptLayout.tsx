import React, { useState, useEffect } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "../Letterhead";
import { QRCode } from "../QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";
import { parse } from "date-fns";

interface TranscriptLayoutProps {
  config: any;
  data: any;
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const TranscriptLayout: React.FC<TranscriptLayoutProps> = ({
  config,
  data,
  isEmployeePreview = false,
  requestStatus = "pending",
}) => {
  const { signatureUrl, organizationDetails, organizationId, userProfile } = useBranding();
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
    if (data.studentName) {
      generateQR();
    }
  }, [data, organizationId, user?.id, config.id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "[Date]";
    try {
      const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date());
      return parsedDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const parseLocation = (location: string | null | undefined): string => {
    if (!location) return "";
    const parts = location.split(",").map(part => part.trim());
    if (parts.length >= 2) {
      const city = parts[0] || "";
      const country = parts[parts.length - 1] || "";
      return city && country ? `${city}, ${country}` : "";
    }
    return "";
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    type: string,
  ) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = "none";
  };

  const displayInstitutionName =
    organizationDetails?.name || data.institutionName || "[INSTITUTION NAME]";

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed">
      <Letterhead />

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
            <strong>Student Name:</strong> {data.studentName || "[Student Name]"}
          </div>
          <div>
            <strong>Student ID:</strong> {data.studentId || "[Student ID]"}
          </div>
          <div>
            <strong>Father's Name:</strong> {data.fatherName || "[Father's Name]"}
          </div>
          <div>
            <strong>Mother's Name:</strong> {data.motherName || "[Mother's Name]"}
          </div>
          {data.dateOfBirth && (
            <div>
              <strong>Date of Birth:</strong> {formatDate(data.dateOfBirth)}
            </div>
          )}
          <div>
            <strong>Course:</strong> {data.courseTitle || "[Course Title]"}
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
            <strong>Academic Year:</strong> {data.academicYear || "[Academic Year]"}
          </div>
          <div>
            <strong>Semester/Year:</strong> {data.semester || "[Semester]"}
          </div>
          <div>
            <strong>Class/Division:</strong> {data.class || "[Class]"}
          </div>
          <div>
            <strong>Overall Grade:</strong> {data.grades || "[Grade]"}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-6 bg-blue-50 p-4 rounded">
          <div className="text-center">
            <strong>CGPA/GPA</strong>
            <div className="text-lg font-bold text-blue-600">
              {data.cgpa || "[CGPA]"}
            </div>
          </div>
          <div className="text-center">
            <strong>Percentage</strong>
            <div className="text-lg font-bold text-blue-600">
              {data.percentage || "[Percentage]"}
            </div>
          </div>
          <div className="text-center">
            <strong>Class</strong>
            <div className="text-lg font-bold text-blue-600">
              {data.class || "[Class]"}
            </div>
          </div>
        </div>

        {/* Subjects and Marks */}
        <div className="mb-6">
          <h4 className="font-bold mb-2">Subjects & Marks:</h4>
          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-line">
            {data.subjects || "[Subjects and marks will be listed here]"}
          </div>
        </div>
      </div>

      {/* Certification */}
      <div className="mb-8 text-justify">
        <p>
          This is to certify that the above academic record is true and correct
          as per the records maintained by this institution.
          <strong> {data.studentName || "[Student Name]"}</strong> has successfully
          completed the requirements for{" "}
          <strong>{data.courseTitle || "[Course Title]"}</strong>
          during the academic year{" "}
          <strong>{data.academicYear || "[Academic Year]"}</strong>.
        </p>
      </div>

      {/* Date and Place */}
      <div className="mt-12 mb-16">
        <p>
          <strong>Date:</strong> {formatDate(data.date)}
        </p>
        <p>
          <strong>Place:</strong> {parseLocation(organizationDetails?.address) || data.place || "[Place]"}
        </p>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-end items-end">
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
            <div className="h-16 mb-4"></div>
          )}
          <p className="font-semibold">
            {userProfile?.firstName && userProfile?.lastName 
              ? `${userProfile.firstName} ${userProfile.lastName}` 
              : data.signatoryName || "[Authorized Signatory Name]"}
          </p>
          <p>{userProfile?.designation || data.signatoryDesignation || "[Designation]"}</p>
          <p>{displayInstitutionName}</p>

          {qrCodeUrl && (
            <div className="flex justify-end mt-4">
              <QRCode value={qrCodeUrl} size={75} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
