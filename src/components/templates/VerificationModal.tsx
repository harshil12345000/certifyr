import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, XCircle, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationResult: {
    isValid: boolean;
    status: "verified" | "not_found" | "expired";
    document?: any;
    message: string;
  } | null;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  verificationResult,
}) => {
  if (!verificationResult) return null;

  const { isValid, status, document, message } = verificationResult;
  const [organizationDetails, setOrganizationDetails] = useState<{ name: string } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandingLoading, setBrandingLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      if (document?.organization_id) {
        setBrandingLoading(true);
        const { data: orgData } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", document.organization_id)
          .single();

        if (orgData) {
          setOrganizationDetails(orgData);

          const { data: fileData } = await supabase
            .from("branding_files")
            .select("path")
            .eq("organization_id", document.organization_id)
            .eq("name", "logo")
            .single();

          if (fileData?.path) {
            const { data: urlData } = supabase.storage
              .from("branding-assets")
              .getPublicUrl(fileData.path);
            setLogoUrl(urlData.publicUrl);
          }
        }
        setBrandingLoading(false);
      } else {
        setBrandingLoading(false);
      }
    };
    if (isOpen) {
      fetchBranding();
    }
  }, [document, isOpen]);

  const getIcon = () => {
    switch (status) {
      case "verified":
        return <Check className="h-12 w-12 text-green-500" />;
      case "expired":
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case "not_found":
      default:
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "verified":
        return "Document Verified";
      case "expired":
        return "Document Expired";
      case "not_found":
      default:
        return "Document Not Found";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default" className="bg-green-500">
            Valid
          </Badge>
        );
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "not_found":
      default:
        return <Badge variant="destructive">Invalid</Badge>;
    }
  };

  const getTemplateDisplayName = (templateType: string) => {
    const templateNames: { [key: string]: string } = {
      "bonafide-1": "Bonafide Certificate",
      "character-1": "Character Certificate",
      "completion-certificate-1": "Completion Certificate",
      "experience-1": "Experience Certificate",
      "income-certificate-1": "Income Certificate",
      "address-proof-1": "Address Proof",
      "bank-verification-1": "Bank Verification",
      "nda-1": "Non-Disclosure Agreement",
      "maternity-leave-1": "Maternity Leave Certificate",
    };
    return templateNames[templateType] || templateType.replace(/-/g, " ");
  };

  const getDocumentDisplayName = () => {
    if (!document) return "";
    const templateName = getTemplateDisplayName(document.template_type);
    const fullName = document.document_data?.fullName || "Unknown";
    return `${templateName} for ${fullName}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {getIcon()}
            <DialogTitle className="text-xl text-center">
              {getTitle()}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-2">{message}</p>
            {getStatusBadge()}
          </div>
          {isValid && document && (
            <div className="space-y-2 text-sm">
              <div className="bg-gray-50 p-3 rounded flex flex-col md:grid md:grid-cols-2 md:gap-4">
                {!brandingLoading && organizationDetails && (
                  <div className="col-span-2">
                    <strong>Organization:</strong>
                    <div className="flex items-center gap-3 mt-1">
                      <Avatar>
                        {logoUrl && <AvatarImage src={logoUrl} alt="Organization Logo" />}
                        <AvatarFallback>{organizationDetails.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-base">{organizationDetails.name || "-"}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p>
                    <strong>Document:</strong> {getDocumentDisplayName()}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Generated:</strong>{" "}
                    {new Date(document.generated_at).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })}
                  </p>
                  {document.expires_at && (
                    <p>
                      <strong>Expires:</strong>{" "}
                      {new Date(document.expires_at).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
