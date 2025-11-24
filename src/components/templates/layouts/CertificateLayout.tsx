import React, { useState, useEffect } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "../Letterhead";
import { QRCode } from "../QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";

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
    if (data.fullName || data.studentName) {
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

  const renderCertificateContent = () => {
    // Bonafide Certificate
    if (config.id === "bonafide") {
      return (
        <>
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
                been with us since <strong>{formatDate(data.startDate)}</strong>.
              </p>
            ) : (
              <p>
                {data.fullName ? "He/She" : "[He/She]"} is working as{" "}
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
              We wish {data.fullName ? "him/her" : "[him/her]"} all the best for future
              endeavors.
            </p>
          </div>
        </>
      );
    }

    // Character Certificate
    if (config.id === "character") {
      return (
        <>
          <div className="text-center mb-8">
            <div className="border border-gray-400 inline-block px-8 py-3">
              <h2 className="text-lg font-bold uppercase tracking-widest">
                CHARACTER CERTIFICATE
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-justify leading-7 text-base">
            <p>
              This is to certify that{" "}
              <strong>{data.fullName || "[Name]"}</strong>
              {data.parentName && `, son/daughter of ${data.parentName},`} residing at{" "}
              <strong>{data.address || "[Address]"}</strong> is known to us for{" "}
              <strong>{data.duration || "[Duration]"}</strong>.
            </p>

            <p>
              During this period, we have found {data.fullName ? "him/her" : "[him/her]"} to be a person of{" "}
              <strong>good moral character and conduct</strong>.{" "}
              {data.conduct && data.conduct}
            </p>

            <p>
              We wish {data.fullName ? "him/her" : "[him/her]"} all success in{" "}
              {data.fullName ? "his/her" : "[his/her]"} future endeavors.
            </p>
          </div>
        </>
      );
    }

    // Experience Certificate
    if (config.id === "experience") {
      return (
        <>
          <div className="text-center mb-8">
            <div className="border border-gray-400 inline-block px-8 py-3">
              <h2 className="text-lg font-bold uppercase tracking-widest">
                EXPERIENCE CERTIFICATE
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-justify leading-7 text-base">
            <p>
              This is to certify that{" "}
              <strong>{data.fullName || "[Employee Name]"}</strong> (Employee ID:{" "}
              <strong>{data.employeeId || "[ID]"}</strong>) has worked with{" "}
              <strong>
                {organizationDetails?.name ||
                  data.institutionName ||
                  "[Institution Name]"}
              </strong>{" "}
              as <strong>{data.designation || "[Designation]"}</strong> in the{" "}
              <strong>{data.department || "[Department]"}</strong> department.
            </p>

            <p>
              {data.fullName ? "His/Her" : "[His/Her]"} period of employment was from{" "}
              <strong>{formatDate(data.joiningDate)}</strong> to{" "}
              <strong>{formatDate(data.relievingDate)}</strong>.
            </p>

            {data.workDescription && (
              <p>
                <strong>Work Description:</strong> {data.workDescription}
              </p>
            )}

            {data.conduct && (
              <p>
                <strong>Conduct & Performance:</strong> {data.conduct}
              </p>
            )}

            <p>
              We wish {data.fullName ? "him/her" : "[him/her]"} the very best in{" "}
              {data.fullName ? "his/her" : "[his/her]"} future endeavors.
            </p>
          </div>
        </>
      );
    }

    // Transfer Certificate
    if (config.id === "transfer") {
      return (
        <>
          <div className="text-center mb-8">
            <div className="border border-gray-400 inline-block px-8 py-3">
              <h2 className="text-lg font-bold uppercase tracking-widest">
                TRANSFER CERTIFICATE
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-justify leading-7 text-base">
            <p>
              This is to certify that{" "}
              <strong>{data.fullName || "[Student Name]"}</strong>, son/daughter of{" "}
              <strong>{data.fatherName || "[Father's Name]"}</strong> and{" "}
              <strong>{data.motherName || "[Mother's Name]"}</strong>, born on{" "}
              <strong>{formatDate(data.dateOfBirth)}</strong>, was a student of this
              institution.
            </p>

            <p>
              <strong>Admission Details:</strong> Admitted on{" "}
              <strong>{formatDate(data.admissionDate)}</strong> in Class{" "}
              <strong>{data.class || "[Class]"}</strong>, Section{" "}
              <strong>{data.section || "[Section]"}</strong>, Roll Number{" "}
              <strong>{data.rollNumber || "[Roll No]"}</strong>, Admission Number{" "}
              <strong>{data.admissionNumber || "[Admission No]"}</strong>.
            </p>

            {data.subjects && (
              <p>
                <strong>Subjects:</strong> {data.subjects}
              </p>
            )}

            <p>
              Last attendance date: <strong>{formatDate(data.lastAttendanceDate)}</strong>
              . Reason for leaving: <strong>{data.reasonForLeaving || "[Reason]"}</strong>
              .
            </p>

            <p>
              <strong>Conduct:</strong> {data.conduct || "[Conduct]"}
            </p>

            <p>
              This certificate is issued on request for the purpose of transfer to
              another institution.
            </p>
          </div>
        </>
      );
    }

    // Completion Certificate
    if (config.id === "completion") {
      return (
        <>
          <div className="text-center mb-8">
            <div className="border border-gray-400 inline-block px-8 py-3">
              <h2 className="text-lg font-bold uppercase tracking-widest">
                CERTIFICATE OF COMPLETION
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-justify leading-7 text-base">
            <p className="text-center text-lg">
              This is to certify that
            </p>

            <p className="text-center text-xl font-bold">
              {data.studentName || "[Student Name]"}
            </p>

            <p>
              Son/Daughter of <strong>{data.fatherName || "[Father's Name]"}</strong> and{" "}
              <strong>{data.motherName || "[Mother's Name]"}</strong>, born on{" "}
              <strong>{formatDate(data.dateOfBirth)}</strong>, has successfully
              completed{" "}
              <strong>{data.courseTitle || "[Course Title]"}</strong> at{" "}
              <strong>
                {organizationDetails?.name ||
                  data.institutionName ||
                  "[Institution Name]"}
              </strong>
              .
            </p>

            <p>
              <strong>Course Duration:</strong> {data.courseDuration || "[Duration]"}
              <br />
              <strong>Course Period:</strong> {formatDate(data.startDate)} to{" "}
              {formatDate(data.endDate)}
              <br />
              <strong>Grade/Performance:</strong> {data.grade || "[Grade]"}
            </p>

            <p>
              We wish {data.studentName ? "him/her" : "[him/her]"} continued success in all
              future endeavors.
            </p>
          </div>
        </>
      );
    }

    // Income Certificate
    if (config.id === "income") {
      return (
        <>
          <div className="text-center mb-8">
            <div className="border border-gray-400 inline-block px-8 py-3">
              <h2 className="text-lg font-bold uppercase tracking-widest">
                INCOME CERTIFICATE
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-justify leading-7 text-base">
            <p>
              This is to certify that{" "}
              <strong>{data.fullName || "[Employee Name]"}</strong> (Employee ID:{" "}
              <strong>{data.employeeId || "[ID]"}</strong>) is currently employed with{" "}
              <strong>
                {organizationDetails?.name ||
                  data.institutionName ||
                  "[Institution Name]"}
              </strong>{" "}
              as <strong>{data.designation || "[Designation]"}</strong> in the{" "}
              <strong>{data.department || "[Department]"}</strong> department.
            </p>

            <p>
              {data.fullName ? "He/She" : "[He/She]"} joined our organization on{" "}
              <strong>{formatDate(data.joiningDate)}</strong>.
            </p>

            <p>
              <strong>Income Details:</strong>
            </p>

            <div className="ml-8 space-y-2">
              <p>
                Basic Salary: <strong>{data.basicSalary || "[Amount]"}</strong>
              </p>
              <p>
                Allowances: <strong>{data.allowances || "[Amount]"}</strong>
              </p>
              <p>
                Total Monthly Income:{" "}
                <strong>{data.totalMonthlyIncome || "[Amount]"}</strong>
              </p>
              <p>
                Annual Income: <strong>{data.annualIncome || "[Amount]"}</strong>
              </p>
            </div>

            <p>
              This certificate is issued for{" "}
              <strong>{data.purpose || "[Purpose]"}</strong> purposes.
            </p>
          </div>
        </>
      );
    }

    // Address Proof Certificate
    if (config.id === "address-proof") {
      return (
        <>
          <div className="text-center mb-8">
            <div className="border border-gray-400 inline-block px-8 py-3">
              <h2 className="text-lg font-bold uppercase tracking-widest">
                ADDRESS PROOF CERTIFICATE
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-justify leading-7 text-base">
            <p>
              This is to certify that{" "}
              <strong>{data.fullName || "[Name]"}</strong>, son/daughter of{" "}
              <strong>{data.fatherName || "[Father's Name]"}</strong>, is a resident at
              the following address:
            </p>

            <div className="ml-8 my-4">
              <p>
                <strong>Current Address:</strong>
              </p>
              <p className="ml-4">{data.currentAddress || "[Current Address]"}</p>
            </div>

            <div className="ml-8 my-4">
              <p>
                <strong>Permanent Address:</strong>
              </p>
              <p className="ml-4">{data.permanentAddress || "[Permanent Address]"}</p>
            </div>

            <p>
              {data.fullName ? "He/She" : "[He/She]"} has been residing at this address
              for <strong>{data.residenceDuration || "[Duration]"}</strong>.
            </p>

            <p>
              <strong>ID Proof Type:</strong> {data.idProofType || "[ID Type]"}
              <br />
              <strong>ID Proof Number:</strong> {data.idProofNumber || "[ID Number]"}
            </p>

            <p>
              This certificate is issued for{" "}
              <strong>{data.purpose || "[Purpose]"}</strong> purposes.
            </p>
          </div>
        </>
      );
    }

    // Generic certificate content for other types
    return (
      <>
        <div className="text-center mb-8">
          <div className="border border-gray-400 inline-block px-8 py-3">
            <h2 className="text-lg font-bold uppercase tracking-widest">
              {config.name.toUpperCase()}
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-justify leading-7 text-base">
          <p>
            This is to certify that the information provided in this document is
            accurate and verified by{" "}
            <strong>
              {organizationDetails?.name ||
                data.institutionName ||
                "[Institution Name]"}
            </strong>
            .
          </p>

          {Object.entries(data).map(([key, value]) => {
            if (
              key === "includeDigitalSignature" ||
              key === "signatoryName" ||
              key === "signatoryDesignation" ||
              key === "date" ||
              key === "place" ||
              !value
            )
              return null;
            return (
              <p key={key}>
                <strong>{key.replace(/([A-Z])/g, " $1").trim()}:</strong>{" "}
                {String(value)}
              </p>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      <Letterhead />

      {renderCertificateContent()}

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
