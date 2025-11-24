import React, { useState, useEffect } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "../Letterhead";
import { QRCode } from "../QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";

interface LetterLayoutProps {
  config: any;
  data: any;
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const LetterLayout: React.FC<LetterLayoutProps> = ({
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

  const renderLetterContent = () => {
    // Maternity Leave Application
    if (config.id === "maternity-leave") {
      return (
        <div className="space-y-4 text-justify leading-7 text-base">
          <p className="text-right mb-6">
            Date: <strong>{formatDate(data.date)}</strong>
          </p>

          <p>
            <strong>To,</strong>
            <br />
            The HR Manager
            <br />
            {organizationDetails?.name ||
              data.institutionName ||
              "[Institution Name]"}
          </p>

          <p>
            <strong>Subject: Application for Maternity Leave</strong>
          </p>

          <p>Dear Sir/Madam,</p>

          <p>
            I, <strong>{data.fullName || "[Employee Name]"}</strong> (Employee ID:{" "}
            <strong>{data.employeeId || "[ID]"}</strong>), currently working as{" "}
            <strong>{data.designation || "[Designation]"}</strong> in the{" "}
            <strong>{data.department || "[Department]"}</strong> department, would like
            to apply for maternity leave.
          </p>

          <p>
            My expected delivery date is{" "}
            <strong>{formatDate(data.expectedDeliveryDate)}</strong>. I would like to
            request leave from <strong>{formatDate(data.leaveStartDate)}</strong> to{" "}
            <strong>{formatDate(data.leaveEndDate)}</strong>, totaling{" "}
            <strong>{data.totalLeaveDays || "[Number]"}</strong> days.
          </p>

          <p>
            <strong>Medical Details:</strong>
          </p>
          <div className="ml-8">
            <p>Medical Certificate Number: {data.medicalCertificateNumber}</p>
            <p>Doctor Name: {data.doctorName}</p>
            <p>Hospital Name: {data.hospitalName}</p>
          </div>

          <p>
            <strong>Emergency Contact:</strong>
          </p>
          <div className="ml-8">
            <p>Name: {data.emergencyContact}</p>
            <p>Phone: {data.emergencyContactPhone}</p>
          </div>

          <p>
            I have attached the required medical certificate for your reference. I
            request you to kindly approve my leave application.
          </p>

          <p>
            Thank you for your understanding and support.
          </p>

          <p className="mt-6">
            Yours sincerely,
            <br />
            <strong>{data.fullName || "[Employee Name]"}</strong>
          </p>
        </div>
      );
    }

    // Offer Letter
    if (config.id === "offer-letter") {
      return (
        <div className="space-y-4 text-justify leading-7 text-base">
          <p className="text-right mb-6">
            Date: <strong>{formatDate(data.date)}</strong>
          </p>

          <p>
            <strong>To,</strong>
            <br />
            {data.candidateName || "[Candidate Name]"}
            <br />
            {data.candidateAddress || "[Candidate Address]"}
          </p>

          <p>
            <strong>
              Subject: Offer of Employment - {data.jobTitle || "[Job Title]"}
            </strong>
          </p>

          <p>Dear {data.candidateName || "[Candidate Name]"},</p>

          <p>
            We are pleased to offer you employment with{" "}
            <strong>
              {organizationDetails?.name ||
                data.institutionName ||
                "[Institution Name]"}
            </strong>
            . We believe your skills and experience will be valuable additions to our
            team.
          </p>

          <p>
            <strong>Position Details:</strong>
          </p>
          <div className="ml-8 space-y-1">
            <p>Job Title: <strong>{data.jobTitle || "[Job Title]"}</strong></p>
            <p>Department: <strong>{data.department || "[Department]"}</strong></p>
            <p>Start Date: <strong>{formatDate(data.startDate)}</strong></p>
            <p>Reporting Manager: <strong>{data.reportingManager || "[Manager]"}</strong></p>
            <p>Work Location: <strong>{data.workLocation || "[Location]"}</strong></p>
          </div>

          <p>
            <strong>Compensation & Benefits:</strong>
          </p>
          <div className="ml-8">
            <p>Salary: <strong>{data.salaryAmount || "[Amount]"}</strong></p>
            <p className="whitespace-pre-line">{data.benefits}</p>
          </div>

          <p>
            <strong>Job Responsibilities:</strong>
          </p>
          <p className="ml-8 whitespace-pre-line">{data.jobResponsibilities}</p>

          <p>
            <strong>Employment Terms:</strong>
          </p>
          <div className="ml-8 space-y-1">
            <p>Probation Period: {data.probationPeriod}</p>
            <p>Notice Period: {data.noticePeriod}</p>
            <p className="whitespace-pre-line">{data.employmentTerms}</p>
          </div>

          <p>
            Please confirm your acceptance of this offer by{" "}
            <strong>{formatDate(data.acceptanceDeadline)}</strong>.
          </p>

          <p>
            We look forward to welcoming you to our team!
          </p>
        </div>
      );
    }

    // NOC for Visa
    if (config.id === "noc-visa") {
      return (
        <div className="space-y-4 text-justify leading-7 text-base">
          <p className="text-right mb-6">
            Date: <strong>{formatDate(data.date)}</strong>
          </p>

          <p className="text-center font-bold text-lg mb-6">
            NO OBJECTION CERTIFICATE FOR VISA APPLICATION
          </p>

          <p>To Whom It May Concern,</p>

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
            <strong>Travel Details:</strong>
          </p>
          <div className="ml-8 space-y-1">
            <p>Passport Number: <strong>{data.passportNumber}</strong></p>
            <p>Visa Type: <strong>{data.visaType}</strong></p>
            <p>Destination Country: <strong>{data.destinationCountry}</strong></p>
            <p>Travel Purpose: <strong>{data.travelPurpose}</strong></p>
            <p>Travel Dates: <strong>{data.travelDates}</strong></p>
            <p>Expected Return: <strong>{formatDate(data.returnDate)}</strong></p>
            <p>Sponsor Details: <strong>{data.sponsorDetails}</strong></p>
          </div>

          <p>
            We have no objection to {data.fullName ? "his/her" : "[his/her]"} travel to{" "}
            <strong>{data.destinationCountry}</strong> for the stated purpose. We
            confirm that {data.fullName ? "he/she" : "[he/she]"} will return to resume{" "}
            {data.fullName ? "his/her" : "[his/her]"} duties upon completion of{" "}
            {data.fullName ? "his/her" : "[his/her]"} travel.
          </p>

          <p>
            This certificate is issued upon {data.fullName ? "his/her" : "[his/her]"}{" "}
            request for visa application purposes.
          </p>
        </div>
      );
    }

    // Bank Verification Letter
    if (config.id === "bank-verification") {
      return (
        <div className="space-y-4 text-justify leading-7 text-base">
          <p className="text-right mb-6">
            Date: <strong>{formatDate(data.date)}</strong>
          </p>

          <p>
            <strong>To,</strong>
            <br />
            The Branch Manager
            <br />
            {data.bankName || "[Bank Name]"}
            <br />
            {data.branchAddress || "[Branch Address]"}
          </p>

          <p>
            <strong>Subject: Bank Account Verification Letter</strong>
          </p>

          <p>Dear Sir/Madam,</p>

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
            {data.fullName ? "He/She" : "[He/She]"} has been working with us since{" "}
            <strong>{formatDate(data.joinDate)}</strong> and currently draws a monthly
            salary of <strong>{data.currentSalary || "[Salary]"}</strong>.
          </p>

          <p>
            <strong>Bank Account Details:</strong>
          </p>
          <div className="ml-8 space-y-1">
            <p>Account Holder Name: <strong>{data.accountHolderName}</strong></p>
            <p>Bank Name: <strong>{data.bankName}</strong></p>
            <p>Branch: <strong>{data.branchName}</strong></p>
            <p>Account Number: <strong>{data.accountNumber}</strong></p>
            <p>Account Type: <strong>{data.accountType}</strong></p>
            <p>IFSC Code: <strong>{data.ifscCode}</strong></p>
          </div>

          <p>
            This certificate is being issued for{" "}
            <strong>{data.purpose || "[Purpose]"}</strong> at{" "}
            {data.fullName ? "his/her" : "[his/her]"} request.
          </p>

          <p>
            Should you require any further information, please feel free to contact us.
          </p>
        </div>
      );
    }

    // Generic letter content
    return (
      <div className="space-y-4 text-justify leading-7 text-base">
        <p className="text-right mb-6">
          Date: <strong>{formatDate(data.date)}</strong>
        </p>

        <p>To Whom It May Concern,</p>

        <p>
          This letter is issued by{" "}
          <strong>
            {organizationDetails?.name ||
              data.institutionName ||
              "[Institution Name]"}
          </strong>{" "}
          to certify the following information:
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
            <p key={key} className="ml-8">
              <strong>{key.replace(/([A-Z])/g, " $1").trim()}:</strong>{" "}
              {String(value)}
            </p>
          );
        })}

        <p>
          Should you require any further clarification, please feel free to contact
          us.
        </p>
      </div>
    );
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      <Letterhead />

      {renderLetterContent()}

      <div className="mt-16">
        <div className="text-left">
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
            <div className="h-16 mb-4">{/* Space for manual signature */}</div>
          )}
          <p className="font-bold">
            {data.signatoryName || "[Authorized Signatory Name]"}
          </p>
          <p>{data.signatoryDesignation || "[Designation]"}</p>
          <p>
            {organizationDetails?.name ||
              data.institutionName ||
              "[Institution Name]"}
          </p>
          <p className="mt-2">
            {data.place || "[Place]"}
          </p>

          {qrCodeUrl && (
            <div className="mt-4 relative inline-block">
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
