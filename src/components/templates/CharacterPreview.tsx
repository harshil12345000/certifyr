
import React from "react";
import { CharacterData } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature } from "lucide-react";

interface CharacterPreviewProps {
  data: CharacterData;
}

export function CharacterPreview({ data }: CharacterPreviewProps) {
  return (
    <div className="bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0 a4-document">
      <div className="p-8 min-h-[297mm] w-full max-w-[210mm] mx-auto bg-white relative">
        {/* Letterhead */}
        <div className="text-center border-b pb-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary">
            {data.institutionName || "[Institution Name]"}
          </h1>
          <p className="text-muted-foreground">
            123 Institution Street, Education City, 400001 • +91 2222 333333 • info@institution.edu
          </p>
        </div>

        {/* Certificate title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold border-2 border-gray-300 inline-block px-4 py-2">
            CHARACTER CERTIFICATE
          </h2>
        </div>

        {/* Certificate content */}
        <div className="space-y-6 text-base md:text-lg leading-relaxed">
          <p>
            This is to certify that <strong>{data.fullName || "[Full Name]"}</strong>, son/daughter of <strong>{data.parentName || "[Parent's Name]"}</strong>, residing at:
          </p>

          <div className="ml-8 p-4 border-l-4 border-gray-300 bg-gray-50">
            <p>{data.address || "[Complete Address]"}</p>
          </div>

          <p>
            I have known the above-mentioned person for <strong>{data.duration || "[Duration]"}</strong> and during this period, I have closely observed their character and conduct.
          </p>

          <div>
            <p><strong>Character Assessment:</strong></p>
            <p className="ml-4 mt-2">
              {data.conduct || "[Description of character, moral values, behavior, and conduct of the person]"}
            </p>
          </div>

          <p>
            Based on my personal knowledge and observation, I can confidently state that {data.fullName ? data.fullName.split(' ')[0] : "[Name]"} is a person of good moral character, honest, and trustworthy. They have maintained an exemplary conduct and have never been involved in any criminal or unethical activities to the best of my knowledge.
          </p>

          <p>
            I have no hesitation in recommending {data.fullName ? data.fullName.split(' ')[0] : "[Name]"} for any position of trust and responsibility.
          </p>

          <p>
            This certificate is issued upon their request for official purposes.
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
