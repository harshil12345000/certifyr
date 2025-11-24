import React, { useState, useEffect } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "../Letterhead";
import { QRCode } from "../QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";

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
    if (data.studentName) {
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

  // Parse subjects string into array
  const parseSubjects = (subjectsStr: string): string[] => {
    if (!subjectsStr) return [];
    return subjectsStr.split("\n").filter(s => s.trim());
  };

  const subjects = parseSubjects(data.subjects);

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      <Letterhead />

      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            ACADEMIC TRANSCRIPT
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Student Information */}
        <div className="border border-gray-400 p-4">
          <h3 className="font-bold mb-3 text-base">STUDENT INFORMATION</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <span className="font-semibold">Student Name:</span>{" "}
              {data.studentName || "[Student Name]"}
            </div>
            <div>
              <span className="font-semibold">Student ID:</span>{" "}
              {data.studentId || "[Student ID]"}
            </div>
            <div>
              <span className="font-semibold">Father's Name:</span>{" "}
              {data.fatherName || "[Father's Name]"}
            </div>
            <div>
              <span className="font-semibold">Mother's Name:</span>{" "}
              {data.motherName || "[Mother's Name]"}
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="border border-gray-400 p-4">
          <h3 className="font-bold mb-3 text-base">ACADEMIC DETAILS</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <span className="font-semibold">Program/Course:</span>{" "}
              {data.courseTitle || "[Course Title]"}
            </div>
            <div>
              <span className="font-semibold">Academic Year:</span>{" "}
              {data.academicYear || "[Academic Year]"}
            </div>
            <div>
              <span className="font-semibold">Semester:</span>{" "}
              {data.semester || "[Semester]"}
            </div>
            <div>
              <span className="font-semibold">Institution:</span>{" "}
              {organizationDetails?.name ||
                data.institutionName ||
                "[Institution Name]"}
            </div>
          </div>
        </div>

        {/* Subjects Table */}
        {subjects.length > 0 && (
          <div className="border border-gray-400">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400">
                  <th className="text-left p-2 border-r border-gray-400">S.No</th>
                  <th className="text-left p-2 border-r border-gray-400">Subject</th>
                  <th className="text-center p-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => (
                  <tr key={index} className="border-b border-gray-400">
                    <td className="p-2 border-r border-gray-400">{index + 1}</td>
                    <td className="p-2 border-r border-gray-400">{subject}</td>
                    <td className="p-2 text-center">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Performance Summary */}
        <div className="border border-gray-400 p-4">
          <h3 className="font-bold mb-3 text-base">PERFORMANCE SUMMARY</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <span className="font-semibold">CGPA:</span>{" "}
              {data.cgpa || "[CGPA]"}
            </div>
            <div>
              <span className="font-semibold">Percentage:</span>{" "}
              {data.percentage || "[Percentage]"}
            </div>
            <div>
              <span className="font-semibold">Overall Grade:</span>{" "}
              {data.grades || "[Grade]"}
            </div>
            <div>
              <span className="font-semibold">Class/Division:</span>{" "}
              {data.class || "[Class]"}
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-6 text-sm">
          <p>
            This is to certify that the above information is true and accurate as per
            our records.
          </p>
        </div>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between items-end mt-16">
        <div>
          <p>
            <strong>Date:</strong> {formatDate(data.date)}
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
