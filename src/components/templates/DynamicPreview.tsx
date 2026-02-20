import React from "react";
import DOMPurify from "dompurify";
import { CertificateLayout } from "./layouts/CertificateLayout";
import { LetterLayout } from "./layouts/LetterLayout";
import { AgreementLayout } from "./layouts/AgreementLayout";
import { TranscriptLayout } from "./layouts/TranscriptLayout";

interface DynamicPreviewProps {
  config: any;
  data: any;
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
  customContent?: string;
  isEditing?: boolean;
}

export const DynamicPreview: React.FC<DynamicPreviewProps> = ({
  config,
  data,
  isEmployeePreview = false,
  requestStatus = "pending",
  customContent,
  isEditing = false,
}) => {
  // If we have saved custom content and we're NOT currently editing, render it
  if (customContent && !isEditing) {
    const sanitized = DOMPurify.sanitize(customContent, {
      ADD_TAGS: ["style"],
      ADD_ATTR: ["style", "class"],
    });
    return (
      <div
        className="a4-document"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

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
        <div className="a4-document p-8 bg-background text-foreground">
          <p className="text-center">
            Preview not available for layout type: {config.layoutType}
          </p>
        </div>
      );
  }
};
