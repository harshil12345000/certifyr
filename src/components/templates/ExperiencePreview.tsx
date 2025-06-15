
import React from "react";
import { ExperienceData, ExperiencePreviewProps } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature as SignatureIcon } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";
import { Letterhead } from "./Letterhead";

export function ExperiencePreview({ data }: ExperiencePreviewProps) {
  const { signatureUrl, sealUrl, organizationDetails, isLoading } = useBranding();

  const institutionNameToDisplay = organizationDetails?.name || data.institutionName || "[Institution Name]";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0 a4-document">
      <div className="p-8 min-h-[297mm] w-full max-w-[210mm] mx-auto bg-white relative">
        {/* Letterhead */}
        <Letterhead />

        {/* Certificate title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold border-2 border-gray-300 inline-block px-4 py-2">
            EXPERIENCE CERTIFICATE
          </h2>
        </div>

        {/* Certificate content */}
        <div className="space-y-6 text-base md:text-lg leading-relaxed">
          <p className="text-justify">
            This is to certify that <strong>{data.fullName || "[Full Name]"}</strong> (Employee ID: <strong>{data.employeeId || "[Employee ID]"}</strong>) was employed with <strong>{institutionNameToDisplay}</strong> as a <strong>{data.designation || "[Designation]"}</strong> in the <strong>{data.department || "[Department]"}</strong> department.
          </p>

          <p className="text-justify">
            {data.fullName ? "His/Her" : "[His/Her]"} period of employment was from <strong>{data.joinDate ? formatDate(new Date(data.joinDate)) : "[Join Date]"}</strong> to <strong>{data.resignationDate ? formatDate(new Date(data.resignationDate)) : "[Resignation Date]"}</strong>.
          </p>

          <p className="text-justify">
            During the tenure, {data.fullName ? "he/she" : "[he/she]"} was responsible for <strong>{data.workDescription || "[Work Description]"}</strong>. {data.fullName ? "His/Her" : "[His/Her]"} last drawn salary was <strong>{data.salary || "[Salary]"}</strong> per month.
          </p>

          <p className="text-justify">
            We found {data.fullName ? "him/her" : "[him/her]"} to be hardworking, sincere, and dedicated to duties. We wish {data.fullName ? "him/her" : "[him/her]"} all the best for future endeavors.
          </p>
        </div>

        {/* Date and signature */}
        <div className="flex flex-col md:flex-row justify-between pt-8 mt-16">
          <div>
            <p>
              <strong>Date:</strong> {data.date ? formatDate(new Date(data.date)) : "[Date]"}
            </p>
            <p>
              <strong>Place:</strong> {data.place || "[Place]"}
            </p>
          </div>
          
          <div className="text-right mt-8 md:mt-0">
            {data.includeDigitalSignature ? (
              <div className="h-16 mb-4 flex justify-end">
                {signatureUrl ? (
                  <div className="border-b border-gray-800 px-6">
                    <img 
                      src={signatureUrl}
                      alt="Digital Signature" 
                      className="h-12 object-contain"
                      onError={(e) => handleImageError(e, "signature")}
                    />
                  </div>
                ) : (
                  <div className="border-b border-gray-800 px-6 py-3">
                    <SignatureIcon className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-16 mb-4">
                {/* Space for manual signature */}
              </div>
            )}
            <p className="font-bold">{data.signatoryName || "[Authorized Signatory Name]"}</p>
            <p>{data.signatoryDesignation || "[Designation]"}</p>
            <p>{institutionNameToDisplay}</p>
          </div>
        </div>
        {sealUrl && (
          <div className="absolute bottom-8 left-8">
            <img 
              src={sealUrl}
              alt="Organization Seal" 
              className="h-20 w-20 object-contain opacity-75"
              onError={(e) => handleImageError(e, "seal")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
