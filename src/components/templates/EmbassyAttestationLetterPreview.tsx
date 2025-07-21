import React, { useState, useEffect } from "react";
import { EmbassyAttestationLetterData } from "@/types/corporate-templates";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { Letterhead } from "./Letterhead";

interface BrandingAssets {
  logoUrl: string | null;
  signatureUrl: string | null;
  organizationAddress: string | null;
  organizationPhone: string | null;
  organizationEmail: string | null;
}

export interface EmbassyAttestationLetterPreviewProps {
  data: EmbassyAttestationLetterData;
}

interface ExtendedEmbassyAttestationLetterPreviewProps
  extends EmbassyAttestationLetterPreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const EmbassyAttestationLetterPreview: React.FC<
  ExtendedEmbassyAttestationLetterPreviewProps
> = ({ data, isEmployeePreview = false, requestStatus = "pending" }) => {
  const {
    applicantName,
    passportNumber,
    nationality,
    dateOfBirth,
    placeOfBirth,
    fatherName,
    motherName,
    documentType,
    documentNumber,
    issuingAuthority,
    documentIssueDate,
    purposeOfAttestation,
    destinationCountry,
    embassyName,
    applicantAddress,
    phoneNumber,
    emailAddress,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const [branding, setBranding] = useState<BrandingAssets>({
    logoUrl: null,
    signatureUrl: null,
    organizationAddress: null,
    organizationPhone: null,
    organizationEmail: null,
  });
  const { user } = useAuth();
  const { signatureUrl: brandingSignatureUrl } =
    useBranding();

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  useEffect(() => {
    const fetchBranding = async () => {
      if (!institutionName && !user?.id) {
        console.warn(
          "Embassy Attestation Letter Preview: Institution name or user context not available for fetching branding.",
        );
        return;
      }
      try {
        let orgIdToQuery: string | null = null;

        if (institutionName) {
          const { data: orgData, error: orgError } = await supabase
            .from("organizations")
            .select("id, address, phone, email")
            .eq("name", institutionName)
            .single();

          if (orgError && orgError.code !== "PGRST116") {
            console.error(
              "Error fetching organization by name:",
              orgError.message,
            );
          } else if (orgError?.code === "PGRST116") {
            console.warn(`Organization named "${institutionName}" not found.`);
          }

          if (orgData) {
            orgIdToQuery = orgData.id;
            setBranding((prev) => ({
              ...prev,
              organizationAddress: orgData.address,
              organizationPhone: orgData.phone,
              organizationEmail: orgData.email,
            }));
          }
        }

        if (orgIdToQuery) {
          const { data: filesData, error: filesError } = await supabase
            .from("branding_files")
            .select("name, path")
            .eq("organization_id", orgIdToQuery);

          if (filesError) {
            console.error("Error fetching branding files:", filesError);
          } else if (filesData) {
            let newLogoUrl: string | null = null;
            let newSignatureUrl: string | null = null;

            filesData.forEach((file) => {
              const publicUrlRes = supabase.storage
                .from("branding-assets")
                .getPublicUrl(file.path);
              const publicUrl = publicUrlRes.data?.publicUrl;
              if (publicUrl) {
                if (file.name === "logo") newLogoUrl = publicUrl;
                if (file.name === "signature") newSignatureUrl = publicUrl;
              }
            });

            setBranding((prev) => ({
              ...prev,
              logoUrl: newLogoUrl,
              signatureUrl: newSignatureUrl,
            }));
          }
        }
      } catch (error) {
        console.error("Unexpected error fetching branding:", error);
      }
    };
    fetchBranding();
  }, [institutionName, user]);

  const formattedDateOfBirth = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "[Date of Birth]";
  const formattedDocumentIssueDate = documentIssueDate
    ? new Date(documentIssueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "[Document Issue Date]";
  const formattedIssueDate = issueDate
    ? new Date(issueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "[Issue Date]";

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

      {/* Letter Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            EMBASSY ATTESTATION LETTER
          </h2>
        </div>
      </div>

      {/* Letter Content */}
      <div className="space-y-4 text-justify leading-7">
        <p className="text-center font-semibold">
          TO: {embassyName || "[Embassy/Consulate Name]"}
        </p>

        <p className="font-semibold">
          Subject: Request for Document Attestation
        </p>

        <p>Dear Sir/Madam,</p>

        <p>
          This is to certify and confirm the authenticity of the document(s)
          submitted by <strong>{applicantName || "[Applicant Name]"}</strong>{" "}
          for the purpose of embassy attestation.
        </p>

        <div className="my-6">
          <h3 className="font-semibold mb-3 text-blue-600">
            Applicant Details:
          </h3>
          <div className="ml-4 space-y-1 bg-blue-50 p-4 rounded">
            <p>
              <strong>Full Name:</strong> {applicantName || "[Applicant Name]"}
            </p>
            <p>
              <strong>Passport Number:</strong>{" "}
              {passportNumber || "[Passport Number]"}
            </p>
            <p>
              <strong>Nationality:</strong> {nationality || "[Nationality]"}
            </p>
            <p>
              <strong>Date of Birth:</strong> {formattedDateOfBirth}
            </p>
            <p>
              <strong>Place of Birth:</strong>{" "}
              {placeOfBirth || "[Place of Birth]"}
            </p>
            <p>
              <strong>Father's Name:</strong> {fatherName || "[Father's Name]"}
            </p>
            <p>
              <strong>Mother's Name:</strong> {motherName || "[Mother's Name]"}
            </p>
          </div>
        </div>

        <div className="my-6">
          <h3 className="font-semibold mb-3 text-blue-600">
            Document Details:
          </h3>
          <div className="ml-4 space-y-1 bg-gray-50 p-4 rounded">
            <p>
              <strong>Document Type:</strong>{" "}
              {documentType || "[Document Type]"}
            </p>
            {documentNumber && (
              <p>
                <strong>Document Number:</strong> {documentNumber}
              </p>
            )}
            <p>
              <strong>Issuing Authority:</strong>{" "}
              {issuingAuthority || "[Issuing Authority]"}
            </p>
            {documentIssueDate && (
              <p>
                <strong>Issue Date:</strong> {formattedDocumentIssueDate}
              </p>
            )}
          </div>
        </div>

        <div className="my-6">
          <h3 className="font-semibold mb-3 text-blue-600">
            Contact Information:
          </h3>
          <div className="ml-4 space-y-1">
            <p>
              <strong>Address:</strong>{" "}
              {applicantAddress || "[Applicant Address]"}
            </p>
            <p>
              <strong>Phone:</strong> {phoneNumber || "[Phone Number]"}
            </p>
            <p>
              <strong>Email:</strong> {emailAddress || "[Email Address]"}
            </p>
          </div>
        </div>

        <p>
          The above-mentioned document is being submitted for attestation for
          the purpose of{" "}
          <strong>{purposeOfAttestation || "[Purpose of Attestation]"}</strong>{" "}
          in <strong>{destinationCountry || "[Destination Country]"}</strong>.
        </p>

        <p>
          We hereby confirm that the document submitted is genuine and has been
          issued by the competent authority. We request your kind consideration
          for the attestation of the said document.
        </p>

        <p>
          We trust that this information is sufficient for your requirements and
          look forward to your favorable response.
        </p>

        <p>Thank you for your cooperation.</p>
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
          {includeDigitalSignature && brandingSignatureUrl && (
            <div className="h-16 mb-4 flex justify-end relative">
              <div className="border-b border-gray-800 px-6">
                <img
                  src={brandingSignatureUrl}
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
          {!includeDigitalSignature && <div className="h-16"></div>}
          <p className="font-semibold">
            {signatoryName || "[Authorized Signatory Name]"}
          </p>
          <p>{signatoryDesignation || "[Designation]"}</p>
          <p>{institutionName || "[Institution Name]"}</p>
        </div>
      </div>
    </div>
  );
};
