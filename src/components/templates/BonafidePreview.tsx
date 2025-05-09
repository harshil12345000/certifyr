
import React, { forwardRef } from "react";
import { BonafideData } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature } from "lucide-react";

interface BonafidePreviewProps {
  data: BonafideData;
}

export function BonafidePreview({ data }: BonafidePreviewProps) {
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

  const getChildRelation = () => {
    switch (data.gender) {
      case "male":
        return "son";
      case "female":
        return "daughter";
      default:
        return "child";
    }
  };

  const getPersonType = () => {
    return data.type === "student" ? "studying" : "working";
  };

  const getPosition = () => {
    return data.type === "student" ? "enrolled" : "employed";
  };

  return (
    <div className="bg-white p-4 md:p-8 shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0">
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
          <span className="font-semibold">{data.fullName || "[Full Name]"}</span>, {getChildRelation()}{" "}
          of <span className="font-semibold">{data.parentName || "[Parent's Name]"}</span>, is
          a bonafide {data.type || "student/employee"} of{" "}
          <span className="font-semibold">{data.institutionName || "[Institution Name]"}</span>.
        </p>

        <p>
          {getPronoun()} has been {getPersonType()} in this institution since{" "}
          <span className="font-semibold">
            {data.startDate ? formatDate(new Date(data.startDate)) : "[Start Date]"}
          </span>{" "}
          and is currently {getPosition()} as a{" "}
          <span className="font-semibold">
            {data.courseOrDesignation || "[Course/Designation]"}
          </span>{" "}
          in the{" "}
          <span className="font-semibold">{data.department || "[Department]"}</span>.
        </p>

        <p>
          This certificate is issued upon the request of the individual for the
          purpose of{" "}
          <span className="font-semibold">{data.purpose || "[Purpose]"}</span>.
        </p>

        <p>
          We confirm that the above information is true and correct to the best of
          our knowledge and records.
        </p>

        {/* Date and signature */}
        <div className="flex flex-col md:flex-row justify-between pt-8">
          <div>
            <p>
              Date: <span className="font-semibold">{data.date ? formatDate(new Date(data.date)) : "[Date]"}</span>
            </p>
            <p>
              Place: <span className="font-semibold">{data.place || "[City, State]"}</span>
            </p>
          </div>
          
          <div className="text-right mt-4 md:mt-0">
            {data.includeDigitalSignature ? (
              <div className="h-16 mb-2 flex justify-end">
                <div className="border-b-2 border-gray-800 flex items-center justify-center p-2">
                  <Signature className="h-10 w-10 text-primary" />
                </div>
              </div>
            ) : (
              <div className="h-16 mb-2">
                {/* Space for signature */}
              </div>
            )}
            <p className="font-bold">{data.signatoryName || "[Signatory Name]"}</p>
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
