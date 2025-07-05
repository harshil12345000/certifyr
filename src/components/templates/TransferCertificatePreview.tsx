import React, { useState, useEffect } from "react";
import { TransferCertificatePreviewProps } from "@/types/templates";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "./Letterhead";

interface BrandingAssets {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
  organizationAddress: string | null;
  organizationPhone: string | null;
  organizationEmail: string | null;
}

interface ExtendedTransferCertificatePreviewProps
  extends TransferCertificatePreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const TransferCertificatePreview: React.FC<
  ExtendedTransferCertificatePreviewProps
> = ({ data, isEmployeePreview = false, requestStatus = "pending" }) => {
  const {
    fullName,
    fatherName,
    motherName,
    dateOfBirth,
    admissionNumber,
    class: studentClass,
    section,
    academicYear,
    dateOfAdmission,
    dateOfLeaving,
    reasonForLeaving,
    conduct,
    subjects,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const [branding, setBranding] = useState<BrandingAssets>({
    logoUrl: null,
    sealUrl: null,
    signatureUrl: null,
    organizationAddress: null,
    organizationPhone: null,
    organizationEmail: null,
  });
  const { user } = useAuth();

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  useEffect(() => {
    const fetchBranding = async () => {
      if (!institutionName && !user?.id) {
        console.warn(
          "Transfer Certificate Preview: Institution name or user context not available for fetching branding.",
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
            let newSealUrl: string | null = null;
            let newSignatureUrl: string | null = null;

            filesData.forEach((file) => {
              const publicUrlRes = supabase.storage
                .from("branding-assets")
                .getPublicUrl(file.path);
              const publicUrl = publicUrlRes.data?.publicUrl;
              if (publicUrl) {
                if (file.name === "logo") newLogoUrl = publicUrl;
                if (file.name === "seal") newSealUrl = publicUrl;
                if (file.name === "signature") newSignatureUrl = publicUrl;
              }
            });

            setBranding((prev) => ({
              ...prev,
              logoUrl: newLogoUrl,
              sealUrl: newSealUrl,
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
  const formattedDateOfAdmission = dateOfAdmission
    ? new Date(dateOfAdmission).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "[Date of Admission]";
  const formattedDateOfLeaving = dateOfLeaving
    ? new Date(dateOfLeaving).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "[Date of Leaving]";
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
    <div className="a4-document p-8 bg-white text-gray-800 text-sm leading-relaxed">
      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-xl font-bold uppercase tracking-widest">
            TRANSFER CERTIFICATE
          </h2>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="space-y-4 text-justify leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          School Leaving Certificate / Transfer Certificate
        </p>

        <table className="w-full border-collapse border border-gray-400">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50 w-1/3">
                Student's Name
              </td>
              <td className="border border-gray-400 p-2">
                {fullName || "[Student Name]"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Father's Name
              </td>
              <td className="border border-gray-400 p-2">
                {fatherName || "[Father's Name]"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Mother's Name
              </td>
              <td className="border border-gray-400 p-2">
                {motherName || "[Mother's Name]"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Date of Birth
              </td>
              <td className="border border-gray-400 p-2">
                {formattedDateOfBirth}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Admission Number
              </td>
              <td className="border border-gray-400 p-2">
                {admissionNumber || "[Admission Number]"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Class
              </td>
              <td className="border border-gray-400 p-2">
                {studentClass || "[Class]"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Section
              </td>
              <td className="border border-gray-400 p-2">
                {section || "[Section]"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Academic Year
              </td>
              <td className="border border-gray-400 p-2">
                {academicYear || "[Academic Year]"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Date of Admission
              </td>
              <td className="border border-gray-400 p-2">
                {formattedDateOfAdmission}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Date of Leaving
              </td>
              <td className="border border-gray-400 p-2">
                {formattedDateOfLeaving}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Reason for Leaving
              </td>
              <td className="border border-gray-400 p-2">
                {reasonForLeaving || "[Reason for Leaving]"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                Conduct
              </td>
              <td className="border border-gray-400 p-2">
                {conduct || "[Conduct]"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-50 align-top">
                Subjects Studied
              </td>
              <td className="border border-gray-400 p-2">
                {subjects || "[Subjects Studied]"}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 text-center">
          <p className="text-lg font-semibold">
            This certificate is issued on the application of the
            parent/guardian.
          </p>
        </div>
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
          {includeDigitalSignature && branding.signatureUrl && (
            <div className="h-16 mb-4 flex justify-end relative">
              <div className="border-b border-gray-800 px-6">
                <img
                  src={branding.signatureUrl}
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

      {/* Seal */}
      {branding.sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img
            src={branding.sealUrl}
            alt="Institution Seal"
            className="h-24 w-24 object-contain opacity-50"
          />
        </div>
      )}
    </div>
  );
};
