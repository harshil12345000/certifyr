
import React from "react";
import { ExperienceData } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature } from "lucide-react";

interface ExperiencePreviewProps {
  data: ExperienceData;
}

export function ExperiencePreview({ data }: ExperiencePreviewProps) {
  return (
    <div className="bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0 a4-document">
      <div className="p-8 min-h-[297mm] w-full max-w-[210mm] mx-auto bg-white relative">
        {/* Letterhead */}
        <div className="text-center border-b pb-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary">
            {data.institutionName || "[Institution Name]"}
          </h1>
          <p className="text-muted-foreground">
            123 Business Street, Corporate City, 400001 • +91 2222 333333 • info@company.com
          </p>
        </div>

        {/* Certificate title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold border-2 border-gray-300 inline-block px-4 py-2">
            EXPERIENCE CERTIFICATE
          </h2>
        </div>

        {/* Certificate content */}
        <div className="space-y-6 text-base md:text-lg leading-relaxed">
          <p>
            This is to certify that <strong>{data.fullName || "[Full Name]"}</strong>, Employee ID: <strong>{data.employeeId || "[Employee ID]"}</strong>, was employed with <strong>{data.institutionName || "[Institution Name]"}</strong> from <strong>{data.joinDate ? formatDate(new Date(data.joinDate)) : "[Join Date]"}</strong> to <strong>{data.resignationDate ? formatDate(new Date(data.resignationDate)) : "[Resignation Date]"}</strong>.
          </p>

          <p>
            During the employment period, {data.fullName ? data.fullName.split(' ')[0] : "[Name]"} worked as a <strong>{data.designation || "[Designation]"}</strong> in the <strong>{data.department || "[Department]"}</strong> department.
          </p>

          <div>
            <p><strong>Work Description:</strong></p>
            <p className="ml-4 mt-2">
              {data.workDescription || "[Detailed description of work responsibilities, achievements, and contributions during the employment period]"}
            </p>
          </div>

          <p>
            During the tenure, the employee drew a salary of <strong>{data.salary || "[Salary Amount]"}</strong>.
          </p>

          <p>
            We found {data.fullName ? data.fullName.split(' ')[0] : "the employee"} to be hardworking, sincere, and dedicated. Their conduct and behavior were satisfactory throughout the employment period.
          </p>

          <p>
            We wish {data.fullName ? data.fullName.split(' ')[0] : "them"} all the best for future endeavors.
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
