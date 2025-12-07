import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, XCircle, AlertTriangle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerificationModal } from "@/components/templates/VerificationModal";
import { downloadPDF } from "@/lib/document-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VerificationResponse {
  valid: boolean;
  status: "verified" | "expired" | "inactive" | "not_found" | "error";
  message: string;
  document?: {
    id: string;
    template_type: string;
    generated_at: string;
    expires_at: string | null;
    is_active: boolean;
  };
  organization?: {
    name: string;
    logo_url: string | null;
  } | null;
}

const VerifyDocument = () => {
  const { hash } = useParams<{ hash: string }>();
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    const verifyDocument = async () => {
      if (!hash) {
        const result = {
          isValid: false,
          status: "not_found" as const,
          message: "Invalid verification link",
        };
        setVerificationResult(result);
        setVerificationData({
          valid: false,
          status: "not_found",
          message: "Invalid verification link",
        });
        setLoading(false);
        setShowModal(true);
        return;
      }

      try {
        // Call the secure verification Edge Function
        const { data, error } = await supabase.functions.invoke("verify-document", {
          body: { hash },
        });

        if (error) {
          console.error("Verification error:", error);
          const result = {
            isValid: false,
            status: "not_found" as const,
            message: "An error occurred during verification",
          };
          setVerificationResult(result);
          setVerificationData({
            valid: false,
            status: "error",
            message: "An error occurred during verification",
          });
        } else {
          const response = data as VerificationResponse;
          setVerificationData(response);
          
          const result = {
            isValid: response.valid,
            status: response.status === "verified" ? "verified" as const : 
                   response.status === "expired" ? "expired" as const : "not_found" as const,
            document: response.document,
            message: response.message,
          };
          setVerificationResult(result);
        }
        
        setShowModal(true);
      } catch (err) {
        console.error("Verification error:", err);
        const result = {
          isValid: false,
          status: "not_found" as const,
          message: "An error occurred during verification",
        };
        setVerificationResult(result);
        setVerificationData({
          valid: false,
          status: "error",
          message: "An error occurred during verification",
        });
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    verifyDocument();
  }, [hash]);

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
    if (!verificationData?.document) return "";
    return getTemplateDisplayName(verificationData.document.template_type);
  };

  const handleDownloadReport = async () => {
    if (!verificationData?.document) return;

    try {
      const doc = verificationData.document;
      const reportContent = `
        <div class="a4-document p-8 bg-white text-gray-800 font-sans">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold">Document Verification Report</h1>
          </div>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div><strong>Document:</strong> ${getDocumentDisplayName()}</div>
              <div><strong>Generated:</strong> ${new Date(doc.generated_at).toLocaleDateString()}</div>
              <div><strong>Status:</strong> ${verificationData.valid ? "Valid" : "Invalid"}</div>
              ${doc.expires_at ? `<div><strong>Expires:</strong> ${new Date(doc.expires_at).toLocaleDateString()}</div>` : ""}
            </div>
            <div class="mt-8">
              <p><strong>Verification Hash:</strong> ${hash}</p>
              <p><strong>Verified On:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      `;

      const tempDiv = globalThis.document.createElement("div");
      tempDiv.innerHTML = reportContent;
      tempDiv.className = "fixed -left-full top-0";
      globalThis.document.body.appendChild(tempDiv);

      await downloadPDF(`verification-report-${doc.template_type}.pdf`);

      globalThis.document.body.removeChild(tempDiv);
    } catch (error) {
      console.error("Error generating verification report:", error);
      alert("Failed to generate verification report");
    }
  };

  const isExpired = verificationData?.status === "expired";
  const isActive = verificationData?.document?.is_active ?? false;
  const isValid = verificationData?.valid ?? false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {!verificationData || verificationData.status === "not_found" || verificationData.status === "error" ? (
                <XCircle className="h-16 w-16 text-red-500" />
              ) : isExpired || !isActive ? (
                <AlertTriangle className="h-16 w-16 text-yellow-500" />
              ) : (
                <Check className="h-16 w-16 text-green-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {!verificationData || verificationData.status === "not_found"
                ? "Document Not Found"
                : verificationData.status === "error"
                  ? "Verification Failed"
                  : isExpired
                    ? "Document Expired"
                    : !isActive
                      ? "Document Inactive"
                      : "Document Verified"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(verificationData?.status === "not_found" || verificationData?.status === "error") && (
              <div className="text-center text-red-600">
                <p>{verificationData.message}</p>
              </div>
            )}

            {verificationData?.document && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {verificationData.organization && (
                    <div className="col-span-2">
                      <label className="font-semibold">Organization:</label>
                      <div className="flex items-center gap-3 mt-1">
                        <Avatar>
                          {verificationData.organization.logo_url && (
                            <AvatarImage src={verificationData.organization.logo_url} alt="Organization Logo" />
                          )}
                          <AvatarFallback>{verificationData.organization.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-base">{verificationData.organization.name || "-"}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="font-semibold">Document:</label>
                    <p>{getDocumentDisplayName()}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Generated:</label>
                    <p>
                      {new Date(verificationData.document.generated_at).toLocaleString(undefined, { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit', 
                        timeZoneName: 'short' 
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="font-semibold">Status:</label>
                    <div>
                      <Badge
                        variant={isValid ? "default" : "destructive"}
                      >
                        {isValid
                          ? "Valid"
                          : isExpired
                            ? "Expired"
                            : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  {verificationData.document.expires_at && (
                    <div>
                      <label className="font-semibold">Expires:</label>
                      <p>
                        {new Date(verificationData.document.expires_at).toLocaleString(undefined, { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          second: '2-digit', 
                          timeZoneName: 'short' 
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleDownloadReport}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <VerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        verificationResult={verificationResult}
      />
    </div>
  );
};

export default VerifyDocument;
