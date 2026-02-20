import React, { useState, useEffect } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "../Letterhead";
import { QRCode } from "../QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";
import { parse } from "date-fns";
import { pronouns } from "@/lib/pronouns";

interface CertificateLayoutProps {
  config: any;
  data: any;
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const CertificateLayout: React.FC<CertificateLayoutProps> = ({
  config,
  data,
  isEmployeePreview = false,
  requestStatus = "pending",
}) => {
  const { signatureUrl, organizationDetails, organizationId, userProfile, enableQr } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  useEffect(() => {
    // Only generate QR for approved documents (not pending/rejected employee previews)
    if (isEmployeePreview && requestStatus !== "approved") {
      setQrCodeUrl(null);
      return;
    }
    
    // Skip QR generation if disabled
    if (enableQr === false) {
      setQrCodeUrl(null);
      return;
    }
    
    const generateQR = async () => {
      const url = await generateDocumentQRCode(
        `${config.id}-1`,
        data,
        organizationId || undefined,
        user?.id,
      );
      setQrCodeUrl(url);
    };
    if (data.fullName || data.studentName) {
      generateQR();
    }
  }, [data, organizationId, user?.id, config.id, isEmployeePreview, requestStatus, enableQr]);

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
    const country = parts[parts.length - 1] || "";
    return country;
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    type: string,
  ) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = "none";
  };

  // Render specific certificate content based on document ID
  const renderContent = () => {
    const docId = config.id;
    const p = pronouns(data.gender);

    switch (docId) {
      case "bonafide":
        return (
          <div className="space-y-4 text-justify leading-7 text-base">
            <p>
              This is to certify that{" "}
              <strong>{data.fullName || "[Student Name]"}</strong>
              {data.parentName && `, ${p.sonDaughter} of ${data.parentName},`} is a bonafide{" "}
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
                {data.fullName ? p.heShe : "[He/She]"} is studying{" "}
                <strong>{data.courseOrDesignation || "[Course]"}</strong> in the{" "}
                <strong>{data.department || "[Department]"}</strong> department and has
                been with us since <strong>{formatDate(data.startDate)}</strong>.
              </p>
            ) : (
              <p>
                {data.fullName ? p.heShe : "[He/She]"} is working as{" "}
                <strong>{data.courseOrDesignation || "[Designation]"}</strong> in the{" "}
                <strong>{data.department || "[Department]"}</strong> department and has
                been with us since <strong>{formatDate(data.startDate)}</strong>.
              </p>
            )}

            <p>
              This certificate is issued for{" "}
              <strong>{data.purpose || "[Purpose]"}</strong> purposes.
            </p>

            <p>
              We wish {data.fullName ? p.himHer : "[him/her]"} all the best for future
              endeavors.
            </p>
          </div>
        );

      case "character":
        return (
          <div className="space-y-4 text-justify leading-7 text-base">
            <p>
              This is to certify that{" "}
              <strong>{data.fullName || "[Student Name]"}</strong>,
              {data.parentName && ` ${p.sonDaughter} of ${data.parentName},`}
              {data.address && ` residing at ${data.address},`} has been known to me for{" "}
              <strong>{data.duration || "[Duration]"}</strong>.
            </p>

            <p>
              During this period, I have found {data.fullName ? p.their : "[their]"}{" "}
              character and conduct to be{" "}
              <strong>{data.conduct || "[Character/Conduct]"}</strong>.
              {data.fullName ? ` ${p.theyHave}` : " [They have]"} always been honest,
              disciplined, and of good moral character.
            </p>

            <p>
              I have no hesitation in recommending {data.fullName || "[Student Name]"}{" "}
              for any position or opportunity {p.they.toLowerCase()} may seek.
            </p>
          </div>
        );

      case "completion":
        return (
          <div className="space-y-6 text-justify leading-7 text-base">
            <p className="text-center text-lg font-semibold mb-6">
              This is to certify that
            </p>

            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {data.studentName || data.fullName || "[Student Name]"}
              </p>
              {data.fatherName && (
                <p className="text-lg">
                  {p.SonDaughter} of <strong>{data.fatherName}</strong>
                </p>
              )}
              {data.registrationNumber && (
                <p className="text-sm text-gray-600">
                  Registration No: {data.registrationNumber}
                </p>
              )}
            </div>

            <p className="text-center text-lg">
              has successfully completed the{" "}
              <strong>{data.courseTitle || "[Course Title]"}</strong>
            </p>

            <div className="text-center space-y-2">
              <p>
                Duration: <strong>{data.courseDuration || "[Duration]"}</strong>
              </p>
              {data.completionDate && (
                <p>
                  Completion Date: <strong>{formatDate(data.completionDate)}</strong>
                </p>
              )}
              {data.endDate && (
                <p>
                  End Date: <strong>{formatDate(data.endDate)}</strong>
                </p>
              )}
              {data.grade && (
                <p>
                  Grade: <strong>{data.grade}</strong>
                </p>
              )}
              {data.percentage && (
                <p>
                  Percentage: <strong>{data.percentage}%</strong>
                </p>
              )}
            </div>

            <p className="text-center text-lg mt-8">
              We wish {data.fullName || data.studentName ? p.them : "[them]"} all success in{" "}
              {data.fullName || data.studentName ? p.their : "[their]"} future endeavors.
            </p>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-6 text-base md:text-lg leading-relaxed">
            <p className="text-justify">
              This is to certify that{" "}
              <strong>{data.fullName || "[Full Name]"}</strong> (Employee ID:{" "}
              <strong>{data.employeeId || "[Employee ID]"}</strong>) was employed
              with <strong>{organizationDetails?.name || data.institutionName || "[Institution Name]"}</strong> as a{" "}
              <strong>{data.designation || "[Designation]"}</strong> in the{" "}
              <strong>{data.department || "[Department]"}</strong> department.
            </p>

            <p className="text-justify">
              {data.fullName ? p.hisHer : "[His/Her]"} period of employment was
              from{" "}
              <strong>
                {data.joiningDate
                  ? formatDate(data.joiningDate)
                  : "[Join Date]"}
              </strong>{" "}
              to{" "}
              <strong>
                {data.relievingDate
                  ? formatDate(data.relievingDate)
                  : "[Resignation Date]"}
              </strong>
              .
            </p>

            <p className="text-justify">
              During the tenure, {data.fullName ? p.heShe.toLowerCase() : "[he/she]"} was
              responsible for{" "}
              <strong>{data.workDescription || "[Work Description]"}</strong>.{" "}
              {data.conduct && (
                <>We found {data.fullName ? p.himHer : "[him/her]"} to be {data.conduct}.</>
              )}
            </p>

            <p className="text-justify">
              We wish {data.fullName ? p.himHer : "[him/her]"} all the best for future
              endeavors.
            </p>
          </div>
        );

      case "transfer":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Full Name:</strong> {data.fullName || "[Full Name]"}</div>
              <div><strong>Father's Name:</strong> {data.fatherName || "[Father's Name]"}</div>
              <div><strong>Mother's Name:</strong> {data.motherName || "[Mother's Name]"}</div>
              <div><strong>Date of Birth:</strong> {formatDate(data.dateOfBirth)}</div>
              <div><strong>Class:</strong> {data.class || "[Class]"}</div>
              <div><strong>Section:</strong> {data.section || "[Section]"}</div>
              <div><strong>Roll Number:</strong> {data.rollNumber || "[Roll Number]"}</div>
              <div><strong>Admission Number:</strong> {data.admissionNumber || "[Admission Number]"}</div>
              <div><strong>Admission Date:</strong> {formatDate(data.admissionDate)}</div>
              <div><strong>Last Attendance:</strong> {formatDate(data.lastAttendanceDate)}</div>
              <div><strong>Conduct:</strong> {data.conduct || "[Conduct]"}</div>
            </div>
            <div>
              <strong>Reason for Leaving:</strong>
              <p className="mt-2">{data.reasonForLeaving || "[Reason for Leaving]"}</p>
            </div>
            <div>
              <strong>Subjects Studied:</strong>
              <p className="mt-2">{data.subjects || "[Subjects]"}</p>
            </div>
          </div>
        );

      case "income":
        return (
          <div className="space-y-6">
            <p className="text-justify">
              This is to certify that <strong>{data.fullName || "[Full Name]"}</strong> (Employee ID: <strong>{data.employeeId || "[Employee ID]"}</strong>)
              is employed with <strong>{organizationDetails?.name || data.institutionName || "[Institution Name]"}</strong> as a{" "}
              <strong>{data.designation || "[Designation]"}</strong> in the <strong>{data.department || "[Department]"}</strong> department
              since <strong>{formatDate(data.joiningDate)}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm border border-gray-300 p-4 rounded">
              <div><strong>Basic Salary:</strong> ₹{data.basicSalary || "[Basic Salary]"}</div>
              <div><strong>Allowances:</strong> ₹{data.allowances || "[Allowances]"}</div>
              <div><strong>Total Monthly Income:</strong> ₹{data.totalMonthlyIncome || "[Total Monthly Income]"}</div>
              <div><strong>Annual Income:</strong> ₹{data.annualIncome || "[Annual Income]"}</div>
            </div>

            <p>
              This certificate is issued for <strong>{data.purpose || "[Purpose]"}</strong> purposes.
            </p>
          </div>
        );

      case "address-proof":
        return (
          <div className="space-y-6">
            <p className="text-justify">
              This is to certify that <strong>{data.fullName || "[Full Name]"}</strong>,
              {p.sonDaughter} of <strong>{data.fatherName || "[Father's Name]"}</strong>, is a bonafide
              resident at the address mentioned below.
            </p>

            <div className="space-y-4">
              <div>
                <strong>Current Address:</strong>
                <p className="mt-2 border border-gray-300 p-3 rounded">{data.currentAddress || "[Current Address]"}</p>
              </div>
              <div>
                <strong>Permanent Address:</strong>
                <p className="mt-2 border border-gray-300 p-3 rounded">{data.permanentAddress || "[Permanent Address]"}</p>
              </div>
              <div>
                <strong>Duration of Residence:</strong> {data.residenceDuration || "[Duration]"}
              </div>
              <div>
                <strong>ID Proof:</strong> {data.idProofType || "[ID Type]"} - {data.idProofNumber || "[ID Number]"}
              </div>
            </div>

            <p>
              This certificate is issued for <strong>{data.purpose || "[Purpose]"}</strong> purposes.
            </p>
          </div>
        );

      default:
        return (
          <div className="space-y-4 text-justify leading-7 text-base">
            <p className="text-center text-lg font-semibold">
              Document content will appear here
            </p>
          </div>
        );
    }
  };

  const getTitle = () => {
    const titles: Record<string, string> = {
      "bonafide": "BONAFIDE CERTIFICATE",
      "character": "CHARACTER CERTIFICATE",
      "completion": data.programType === "course" ? "COURSE COMPLETION CERTIFICATE" : "PROGRAM COMPLETION CERTIFICATE",
      "experience": "EXPERIENCE CERTIFICATE",
      "transfer": "TRANSFER CERTIFICATE",
      "income": "INCOME CERTIFICATE",
      "address-proof": "ADDRESS PROOF CERTIFICATE",
    };
    return titles[config.id] || config.name.toUpperCase();
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      <Letterhead />

      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            {getTitle()}
          </h2>
        </div>
      </div>

      {renderContent()}

      <div className="flex justify-between items-end mt-16">
        <div>
          <p>
            <strong>Date:</strong> {formatDate(data.date)}
          </p>
          <p>
            <strong>Place:</strong> {parseLocation(organizationDetails?.address) || data.place || "[Place]"}
          </p>
        </div>

        <div className="text-right">
          {data.includeDigitalSignature && signatureUrl && !shouldBlur ? (
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
          ) : shouldBlur && data.includeDigitalSignature ? (
            <div className="h-16 mb-4 flex justify-end">
              <div className="flex items-center justify-center bg-gray-100 border border-dashed border-gray-400 px-6 h-12">
                <span className="text-xs text-gray-500">
                  Signature pending approval
                </span>
              </div>
            </div>
          ) : (
            <div className="h-16 mb-4"></div>
          )}
          <p className="font-bold">
            {userProfile?.firstName && userProfile?.lastName 
              ? `${userProfile.firstName} ${userProfile.lastName}` 
              : data.signatoryName || "[Authorized Signatory Name]"}
          </p>
          <p>{userProfile?.designation || data.signatoryDesignation || "[Designation]"}</p>
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
