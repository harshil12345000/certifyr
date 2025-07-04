import React from "react";
import { useBranding } from "@/contexts/BrandingContext";

interface LetterheadProps {
  children?: React.ReactNode;
  className?: string;
}

export const Letterhead: React.FC<LetterheadProps> = ({ children, className = "" }) => {
  const { logoUrl, organizationDetails, isLoading } = useBranding();

  if (isLoading) {
    return (
      <div className={`text-center border-b pb-4 mb-8 ${className}`}>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded mb-2 mx-auto w-32"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const orgName = organizationDetails?.name || "[Institution Name]";
  const orgAddress = organizationDetails?.address || "[Institution Address]";
  const orgPhone = organizationDetails?.phone || "[Phone Number]";
  const orgEmail = organizationDetails?.email || "[Email Address]";

  return (
    <div className={`text-center border-b pb-4 mb-8 ${className}`}>
      {logoUrl && (
        <div className="flex justify-center mb-4">
          <img
            src={logoUrl}
            alt="Organization Logo"
            className="h-16 object-contain"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Error loading logo image:', e);
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-blue-600 mb-2">
        {orgName}
      </h1>
      <div className="text-muted-foreground text-sm space-y-1">
        {orgAddress && <p>{orgAddress}</p>}
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {orgPhone && (
            <>
              <span>{orgPhone}</span>
              {orgEmail && <span>•</span>}
            </>
          )}
          {orgEmail && <span>{orgEmail}</span>}
        </div>
      </div>
      {children}
    </div>
  );
};
