
import React, { forwardRef } from "react";
import { BonafideData } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature } from "lucide-react";

interface BonafidePreviewProps {
  data: BonafideData;
}

export function BonafidePreview({ data }: BonafidePreviewProps) {
  const getRelation = () => {
    switch (data.gender) {
      case "male":
        return "son";
      case "female":
        return "daughter";
      default:
        return "child";
    }
  };

  const getPronoun = () => {
    switch (data.gender) {
      case "male":
        return "He";
      case "female":
        return "She";
      default:
        return "They";
    }
  };

  const getPersonType = () => {
    return data.type === "student" ? "studying" : "working";
  };

  const getPosition = () => {
    return data.type === "student" ? "enrolled" : "employed";
  };

  return (
    <div className="bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0 a4-document">
      <div className="p-8 min-h-[297mm] w-full max-w-[210mm] mx-auto bg-white relative">
        {/* Letterhead */}
        <div className="text-center border-b pb-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary">
            {data.institutionName || "[Institution Name]"}
          </h1>
          <p className="text-muted-foreground">
            123 Education Street, Knowledge City, 400001 • +91 2222 333333 • info@institution.edu
          </p>
        </div>

        {/* Certificate title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold border-2 border-gray-300 inline-block px-4 py-2">
            BONAFIDE CERTIFICATE
          </h2>
        </div>

        {/* Certificate content */}
        <div className="space-y-6 text-base md:text-lg leading-relaxed">
          <p>
            This is to certify that{" "}
            <strong>{data.fullName || "[Full Name]"}</strong>, {getRelation()}{" "}
            of <strong>{data.parentName || "[Parent's Name]"}</strong>, is
            a bonafide {data.type || "student/employee"} of{" "}
            <strong>{data.institutionName || "[Institution Name]"}</strong>.
          </p>

          <p>
            {getPronoun()} has been {getPersonType()} in this institution since{" "}
            <strong>
              {data.startDate ? formatDate(new Date(data.startDate)) : "[Start Date]"}
            </strong>{" "}
            and is currently {getPosition()} as a{" "}
            <strong>
              {data.courseOrDesignation || "[Course/Designation]"}
            </strong>{" "}
            in the{" "}
            <strong>{data.department || "[Department]"}</strong>.
          </p>

          <p>
            This certificate is issued upon the request of the individual for the
            purpose of{" "}
            <strong>{data.purpose || "[Purpose]"}</strong>.
          </p>

          <p>
            We confirm that the above information is true and correct to the best of
            our knowledge and records.
          </p>
        </div>

        {/* Date and signature */}
        <div className="flex flex-col md:flex-row justify-between pt-8 mt-16">
          <div>
            <p>
              <strong>Date:</strong> {data.date ? formatDate(new Date(data.date)) : "[Date]"}
            </p>
            <p>
              <strong>Place:</strong> {data.place || "[City, State]"}
            </p>
          </div>
          
          <div className="text-right mt-8 md:mt-0">
            {data.includeDigitalSignature ? (
              <div className="h-16 mb-4 flex justify-end">
                <div className="border-b border-gray-800 px-6">
                  <Signature className="h-12 w-12 text-primary" />
                </div>
              </div>
            ) : (
              <div className="h-16 mb-4">
                {/* Space for manual signature */}
              </div>
            )}
            <p className="font-bold">{data.signatoryName || "[Authorized Signatory Name]"}</p>
            <p>{data.signatoryDesignation || "[Designation]"}</p>
            <p>{data.institutionName || "[Institution Name]"}</p>
            <div className="mt-2 border border-dashed inline-block p-2">
              <p className="text-xs text-center text-muted-foreground">SEAL/STAMP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
