
import React, { useRef, useState } from "react";
import { BonafideData } from "@/types/templates";
import { formatDate } from "@/lib/utils";
import { Signature } from "lucide-react";

interface BonafidePreviewProps {
  data: BonafideData;
}

export function BonafidePreview({ data }: BonafidePreviewProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  
  // Format the date for display
  const formattedDate = data.date ? formatDate(new Date(data.date)) : "";
  const formattedStartDate = data.startDate ? formatDate(new Date(data.startDate)) : "";
  
  // Determine pronouns based on gender
  const pronoun = data.gender === "female" ? "She" : data.gender === "male" ? "He" : "They";
  const possessivePronoun = data.gender === "female" ? "her" : data.gender === "male" ? "his" : "their";

  return (
    <div className="flex justify-center">
      <div 
        ref={certificateRef}
        className="max-w-3xl w-full bg-white border-2 border-gray-300 shadow-lg p-8 md:p-12"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-500">
                {data.institutionName ? data.institutionName.charAt(0) : "A"}
              </span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {data.institutionName || "Institution Name"}
          </h1>
          <p className="text-gray-500 mt-1">
            123 Education Street, Academic City, India
          </p>
          <h2 className="text-xl md:text-2xl font-bold mt-6 text-primary-600 border-b-2 border-primary-200 pb-2 mx-auto inline-block">
            BONAFIDE CERTIFICATE
          </h2>
        </div>

        {/* Certificate Body */}
        <div className="space-y-6 text-gray-700 text-base md:text-lg leading-relaxed">
          <p>
            This is to certify that{" "}
            <span className="font-medium">{data.fullName || "[Full Name]"}</span>, 
            {data.gender === "female" ? " daughter " : data.gender === "male" ? " son " : " child "} 
            of <span className="font-medium">{data.parentName || "[Parent's Name]"}</span>, 
            is a bonafide {data.type || "student/employee"} of{" "}
            <span className="font-medium">{data.institutionName || "[Institution Name]"}</span>.
          </p>
          
          <p>
            {pronoun} has been {data.type === "student" ? "studying" : "working"} in this institution 
            since <span className="font-medium">{formattedStartDate || "[Start Date]"}</span> and 
            is currently {data.type === "student" ? "enrolled" : "employed"} as 
            a <span className="font-medium">{data.courseOrDesignation || "[Course Name/Designation]"}</span> in 
            the <span className="font-medium">{data.department || "[Department Name]"}</span>.
          </p>
          
          <p>
            This certificate is issued upon the request of the individual for the purpose 
            of <span className="font-medium">{data.purpose || "[Purpose]"}</span>.
          </p>
          
          <p>
            We confirm that the above information is true and correct to the best of our knowledge and records.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <div className="flex flex-wrap justify-between items-start">
            <div>
              <p><strong>Date:</strong> {formattedDate || "[DD/MM/YYYY]"}</p>
              <p><strong>Place:</strong> {data.place || "[City, State]"}</p>
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
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-block border-2 border-gray-300 rounded-full p-2">
              <p className="text-sm text-gray-500">Official Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
