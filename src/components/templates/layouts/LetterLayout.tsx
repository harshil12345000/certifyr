import React, { useState, useEffect } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "../Letterhead";
import { QRCode } from "../QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";
import { parse } from "date-fns";

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
  const { signatureUrl, organizationDetails, organizationId, userProfile } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  useEffect(() => {
    // Only generate QR for approved documents (not pending/rejected employee previews)
    if (isEmployeePreview && requestStatus !== "approved") {
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
    generateQR();
  }, [data, organizationId, user?.id, config.id, isEmployeePreview, requestStatus]);

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

  const renderContent = () => {
    const docId = config.id;

    switch (docId) {
      case "maternity-leave":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">MATERNITY LEAVE CERTIFICATE</h2>
            </div>

            <p className="text-justify">
              This is to certify that <strong>{data.fullName || "[Employee Name]"}</strong> (Employee ID: <strong>{data.employeeId || "[Employee ID]"}</strong>),
              working as <strong>{data.designation || "[Designation]"}</strong> in the <strong>{data.department || "[Department]"}</strong> department,
              has been granted maternity leave.
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm border border-gray-300 p-4 rounded">
              <div><strong>Expected Delivery Date:</strong> {formatDate(data.expectedDeliveryDate)}</div>
              <div><strong>Leave Start Date:</strong> {formatDate(data.leaveStartDate)}</div>
              <div><strong>Leave End Date:</strong> {formatDate(data.leaveEndDate)}</div>
              <div><strong>Total Leave Days:</strong> {data.totalLeaveDays || "[Total Days]"}</div>
            </div>

            <div>
              <strong>Medical Details:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <p>Medical Certificate No: {data.medicalCertificateNumber || "[Certificate Number]"}</p>
                <p>Doctor Name: {data.doctorName || "[Doctor Name]"}</p>
                <p>Hospital: {data.hospitalName || "[Hospital Name]"}</p>
              </div>
            </div>

            <div>
              <strong>Emergency Contact:</strong>
              <div className="mt-2 text-sm">
                <p>{data.emergencyContact || "[Contact Name]"} - {data.emergencyContactPhone || "[Phone Number]"}</p>
              </div>
            </div>

            <p>
              This certificate is issued at the request of the employee for official purposes.
            </p>
          </div>
        );

      case "offer-letter":
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <p><strong>Ref No:</strong> {data.referenceNumber || "[Reference Number]"}</p>
              <p><strong>Date:</strong> {formatDate(data.date)}</p>
            </div>

            <div className="mb-4">
              <p><strong>To:</strong></p>
              <p>{data.candidateName || "[Candidate Name]"}</p>
              <p>{data.candidateAddress || "[Candidate Address]"}</p>
            </div>

            <p className="font-bold">Subject: Offer of Employment</p>

            <p>Dear {data.candidateName || "[Candidate Name]"},</p>

            <p className="text-justify">
              We are pleased to offer you the position of <strong>{data.jobTitle || "[Job Title]"}</strong> with{" "}
              <strong>{organizationDetails?.name || data.institutionName || "[Company Name]"}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <strong>Position Details:</strong>
                <ul className="list-disc ml-6 mt-2">
                  <li>Department: {data.department || "[Department]"}</li>
                  <li>Start Date: {formatDate(data.startDate)}</li>
                  <li>Reporting Manager: {data.reportingManager || "[Manager Name]"}</li>
                  <li>Work Location: {data.workLocation || "[Location]"}</li>
                </ul>
              </div>

              <div>
                <strong>Compensation:</strong>
                <p className="mt-2">Salary: {data.salaryAmount || "[Salary Amount]"}</p>
                <p className="mt-2"><strong>Benefits:</strong></p>
                <p className="whitespace-pre-line">{data.benefits || "[Benefits]"}</p>
              </div>

              <div>
                <strong>Job Responsibilities:</strong>
                <p className="mt-2 whitespace-pre-line">{data.jobResponsibilities || "[Job Responsibilities]"}</p>
              </div>

              <div>
                <strong>Employment Terms:</strong>
                <ul className="list-disc ml-6 mt-2">
                  <li>Probation Period: {data.probationPeriod || "[Probation Period]"}</li>
                  <li>Notice Period: {data.noticePeriod || "[Notice Period]"}</li>
                </ul>
                <p className="mt-2 whitespace-pre-line">{data.employmentTerms || "[Employment Terms]"}</p>
              </div>
            </div>

            <p>
              Please confirm your acceptance of this offer by <strong>{formatDate(data.acceptanceDeadline)}</strong>.
            </p>

            <p>We look forward to welcoming you to our team.</p>

            <p>Sincerely,</p>
          </div>
        );

      case "noc-visa":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">NO OBJECTION CERTIFICATE</h2>
              <p className="text-sm">(For Visa Application)</p>
            </div>

            <div className="mb-4">
              <p><strong>To:</strong> {data.embassyName || "[Embassy Name]"}</p>
              <p>{data.embassyCountry || "[Embassy Country]"}</p>
            </div>

            <p><strong>Subject: No Objection Certificate for {data.fullName || "[Employee Name]"}</strong></p>

            <p>Dear Sir/Madam,</p>

            <p className="text-justify">
              This is to certify that <strong>{data.fullName || "[Full Name]"}</strong> (Employee ID: <strong>{data.employeeId || "[Employee ID]"}</strong>)
              is employed with <strong>{organizationDetails?.name || data.institutionName || "[Institution Name]"}</strong> as{" "}
              <strong>{data.designation || "[Designation]"}</strong> in the <strong>{data.department || "[Department]"}</strong> department.
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm border border-gray-300 p-4 rounded">
              <div><strong>Passport Number:</strong> {data.passportNumber || "[Passport Number]"}</div>
              <div><strong>Visa Type:</strong> {data.visaType || "[Visa Type]"}</div>
              <div><strong>Destination:</strong> {data.destinationCountry || "[Country]"}</div>
              <div><strong>Purpose:</strong> {data.travelPurpose || "[Purpose]"}</div>
              <div><strong>Travel Dates:</strong> {data.travelDates || "[Travel Dates]"}</div>
              <div><strong>Return Date:</strong> {formatDate(data.returnDate)}</div>
            </div>

            <p className="text-justify">
              We have no objection to {data.fullName ? "his/her" : "[his/her]"} applying for the visa and traveling to{" "}
              <strong>{data.destinationCountry || "[Country]"}</strong> for the stated purpose.
            </p>

            {data.sponsorDetails && (
              <p><strong>Sponsor Details:</strong> {data.sponsorDetails}</p>
            )}

            <p>
              {data.fullName ? "He/She" : "[He/She]"} will resume duties upon return. This certificate is issued at{" "}
              {data.fullName ? "his/her" : "[his/her]"} request for visa application purposes.
            </p>

            <p>Thank you for your consideration.</p>
          </div>
        );

      case "bank-verification":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">BANK ACCOUNT VERIFICATION LETTER</h2>
            </div>

            <p><strong>To: {data.bankName || "[Bank Name]"}</strong></p>
            <p>{data.branchName || "[Branch Name]"}</p>
            <p>{data.branchAddress || "[Branch Address]"}</p>

            <p><strong>Subject: Verification of Bank Account</strong></p>

            <p>Dear Sir/Madam,</p>

            <p className="text-justify">
              This is to certify that <strong>{data.fullName || "[Full Name]"}</strong> (Employee ID: <strong>{data.employeeId || "[Employee ID]"}</strong>)
              is employed with <strong>{organizationDetails?.name || data.institutionName || "[Institution Name]"}</strong> as{" "}
              <strong>{data.designation || "[Designation]"}</strong> in the <strong>{data.department || "[Department]"}</strong> department
              since <strong>{formatDate(data.joinDate)}</strong>.
            </p>

            <div className="border border-gray-300 p-4 rounded space-y-2">
              <p><strong>Bank Account Details:</strong></p>
              <p>Account Holder Name: {data.accountHolderName || "[Account Holder Name]"}</p>
              <p>Account Number: {data.accountNumber || "[Account Number]"}</p>
              <p>Account Type: {data.accountType || "[Account Type]"}</p>
              <p>IFSC Code: {data.ifscCode || "[IFSC Code]"}</p>
              <p>Current Salary: ₹{data.currentSalary || "[Salary Amount]"}</p>
            </div>

            <p>
              This certificate is issued for <strong>{data.purpose || "[Purpose]"}</strong> purposes at the request of the employee.
            </p>

            <p>Please feel free to contact us for any further clarification.</p>
          </div>
        );

      case "embassy-attestation":
      case "embassy-attestation-letter":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">EMBASSY ATTESTATION LETTER</h2>
            </div>

            <p><strong>To: {data.embassyName || "[Embassy Name]"}</strong></p>
            <p>{data.embassyCountry || "[Embassy Country]"}</p>

            <p><strong>Subject: Request for Document Attestation</strong></p>

            <p>Dear Sir/Madam,</p>

            <p className="text-justify">
              I hereby request the attestation of the following document for <strong>{data.applicantName || "[Applicant Name]"}</strong>.
            </p>

            <div className="space-y-4 border border-gray-300 p-4 rounded">
              <p><strong>Applicant Details:</strong></p>
              <p>Name: {data.applicantName || "[Applicant Name]"}</p>
              <p>Passport Number: {data.passportNumber || "[Passport Number]"}</p>
              <p>Nationality: {data.nationality || "[Nationality]"}</p>
              <p>Date of Birth: {formatDate(data.dateOfBirth)}</p>
              {data.residentialAddress && <p>Address: {data.residentialAddress}</p>}

              <p><strong>Document Details:</strong></p>
              <p>Document Type: {data.documentType || "[Document Type]"}</p>
              <p>Document Number: {data.documentNumber || "[Document Number]"}</p>
              <p>Issuing Authority: {data.issuingAuthority || "[Issuing Authority]"}</p>
              <p>Issue Date: {formatDate(data.issueDate)}</p>
            </div>

            <p><strong>Purpose of Attestation:</strong></p>
            <p className="whitespace-pre-line">{data.purposeOfAttestation || "[Purpose of Attestation]"}</p>

            {data.contactInformation && (
              <>
                <p><strong>Contact Information:</strong></p>
                <p className="whitespace-pre-line">{data.contactInformation}</p>
              </>
            )}

            <p>I kindly request you to attest the above-mentioned document at the earliest.</p>

            <p>Thank you for your assistance.</p>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-center text-lg font-semibold">
              Letter content will appear here
            </p>
          </div>
        );
    }
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed">
      <Letterhead />

      {renderContent()}

      <div className="mt-16">
        <p><strong>Date:</strong> {formatDate(data.date)}</p>
        <p><strong>Place:</strong> {parseLocation(organizationDetails?.address) || data.place || "[Place]"}</p>
      </div>

      <div className="mt-8 text-right">
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

        {qrCodeUrl && !shouldBlur && (
          <div className="flex justify-end">
            <QRCode value={qrCodeUrl} size={75} />
          </div>
        )}
        {shouldBlur && (
          <div className="flex justify-end">
            <div className="flex items-center justify-center bg-gray-100 border border-dashed border-gray-400 w-[75px] h-[75px]">
              <span className="text-xs text-gray-500 text-center">
                QR pending
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
