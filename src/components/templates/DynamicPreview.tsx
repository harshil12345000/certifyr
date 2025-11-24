import React from "react";
import { CertificateLayout } from "./layouts/CertificateLayout";
import { LetterLayout } from "./layouts/LetterLayout";
import { AgreementLayout } from "./layouts/AgreementLayout";
import { TranscriptLayout } from "./layouts/TranscriptLayout";

interface DynamicPreviewProps {
  config: any;
  data: any;
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const DynamicPreview: React.FC<DynamicPreviewProps> = ({
  config,
  data,
  isEmployeePreview = false,
  requestStatus = "pending",
}) => {
  // Route to appropriate layout based on document layoutType
  switch (config.layoutType) {
    case "certificate":
      return (
        <CertificateLayout
          config={config}
          data={data}
          isEmployeePreview={isEmployeePreview}
          requestStatus={requestStatus}
        />
      );

    case "letter":
      return (
        <LetterLayout
          config={config}
          data={data}
          isEmployeePreview={isEmployeePreview}
          requestStatus={requestStatus}
        />
      );

    case "agreement":
      return (
        <AgreementLayout
          config={config}
          data={data}
          isEmployeePreview={isEmployeePreview}
          requestStatus={requestStatus}
        />
      );

    case "transcript":
      return (
        <TranscriptLayout
          config={config}
          data={data}
          isEmployeePreview={isEmployeePreview}
          requestStatus={requestStatus}
        />
      );

    default:
      return (
        <div className="a4-document p-8 bg-white text-gray-800">
          <p className="text-center">
            Preview not available for layout type: {config.layoutType}
          </p>
        </div>
      );
  }
};
