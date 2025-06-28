import React from "react";
import { useBranding } from "@/contexts/BrandingContext";

interface LetterheadProps {
  children?: React.ReactNode;
  className?: string;
}

export const Letterhead: React.FC<LetterheadProps> = ({ children, className = "" }) => {
  const { logoUrl, organizationDetails, isLoading } = useBranding();

  if (isLoading) return null;

  const orgName = organizationDetails?.name ?? "[Institution Name]";
  const orgAddress = organizationDetails?.address ?? "[Institution Address]";
  const orgPhone = organizationDetails?.phone ?? "[Phone Number]";
  const orgEmail = organizationDetails?.email ?? "[Email Address]";

  return (
    <div className={`text-center border-b pb-4 mb-8 ${className}`}>
      {logoUrl && (
        <div className="flex justify-center mb-2">
          <img
            src={logoUrl}
            alt="Organization Logo"
            className="h-16 object-contain"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary">{orgName}</h1>
      <p className="text-muted-foreground break-words">
        {orgAddress}
        {orgPhone && <> • {orgPhone}</>}
        {orgEmail && <> • {orgEmail}</>}
      </p>
      {children}
    </div>
  );
};
