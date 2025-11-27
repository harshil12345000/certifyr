import { useState, useEffect } from "react";
import { useEmployeePortal } from "@/contexts/EmployeePortalContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as Previews from "@/components/templates";
import { Clock, Eye, FileText, Printer, Download } from "lucide-react";
import { FormData } from "@/types/templates";
import { DocumentRequest } from "@/types/document";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { downloadPDF, downloadJPG, printDocument } from "@/lib/document-utils";
import { useDocumentTracking } from "@/hooks/useDocumentTracking";

const TEMPLATE_PREVIEW_MAP: Record<string, keyof typeof Previews> = {
  "bonafide-1": "BonafidePreview",
  "character-1": "CharacterPreview",
  "experience-1": "ExperiencePreview",
  "embassy-attestation-1": "EmbassyAttestationPreview",
  "completion-certificate-1": "CompletionCertificatePreview",
  "transfer-certificate-1": "TransferCertificatePreview",
  "noc-visa-1": "NocVisaPreview",
  "income-certificate-1": "IncomeCertificatePreview",
  "maternity-leave-1": "MaternityLeavePreview",
  "bank-verification-1": "BankVerificationPreview",
  "offer-letter-1": "OfferLetterPreview",
  "address-proof-1": "AddressProofPreview",
  "articles-incorporation-1": "ArticlesOfIncorporationPreview",
  "corporate-bylaws-1": "CorporateBylawsPreview",
  "founders-agreement-1": "FoundersAgreementPreview",
  "stock-purchase-agreement-1": "StockPurchaseAgreementPreview",
  "employment-agreement-1": "EmploymentAgreementPreview",
  "nda-1": "NDAPreview",
  "academic-transcript-1": "AcademicTranscriptPreview",
  "embassy-attestation-letter-1": "EmbassyAttestationLetterPreview",
};

export function EmployeePendingRequests() {
  const { employee, organizationId, portalSlug } = useEmployeePortal();
  const { trackDocumentCreation } = useDocumentTracking();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [employee, organizationId]);

  const fetchRequests = async () => {
    if (!employee || !organizationId) return;

    try {
      const { data, error } = await supabase
        .from("document_requests")
        .select("*")
        .eq("employee_id", employee.id)
        .eq("organization_id", organizationId)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTemplateName = (templateId: string) => {
    const nameMap: Record<string, string> = {
      "bonafide-1": "Bonafide Certificate",
      "character-1": "Character Certificate",
      "experience-1": "Experience Certificate",
      "embassy-attestation-1": "Embassy Attestation",
      "completion-certificate-1": "Completion Certificate",
      "transfer-certificate-1": "Transfer Certificate",
      "noc-visa-1": "NOC for Visa",
      "income-certificate-1": "Income Certificate",
      "maternity-leave-1": "Maternity Leave Letter",
      "bank-verification-1": "Bank Verification Letter",
      "offer-letter-1": "Offer Letter",
      "address-proof-1": "Address Proof Certificate",
      "articles-incorporation-1": "Articles of Incorporation",
      "corporate-bylaws-1": "Corporate Bylaws",
      "founders-agreement-1": "Founders Agreement",
      "stock-purchase-agreement-1": "Stock Purchase Agreement",
      "employment-agreement-1": "Employment Agreement",
      "nda-1": "Non-Disclosure Agreement",
      "academic-transcript-1": "Academic Transcript",
      "embassy-attestation-letter-1": "Embassy Attestation Letter",
    };
    return nameMap[templateId] || templateId;
  };

  const handlePrint = (elementId: string) => {
    printDocument();
    // Track document creation on print
    trackDocumentCreation();
  };

  const handleDownloadJPG = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      try {
        const canvas = await html2canvas(element);
        const link = document.createElement("a");
        link.download = `${filename}.jpg`;
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
        // Track document creation on download
        trackDocumentCreation();
      } catch (error) {
        console.error("Error generating JPG:", error);
      }
    }
  };

  const handleDownloadPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      try {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${filename}.pdf`);
        // Track document creation on download
        trackDocumentCreation();
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No requests found</h3>
        <p className="text-muted-foreground mb-4">
          You haven't submitted any document requests yet.
        </p>
        <Button
          onClick={() => {
            if (portalSlug) {
              window.location.href = `/portal/${portalSlug}`;
            }
          }}
        >
          Browse Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">My Requests</h1>
        <p className="text-muted-foreground">
          Track the status of your document requests
        </p>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => {
          const PreviewComponent = Previews[
            TEMPLATE_PREVIEW_MAP[request.template_id]
          ] as any;
          const isApproved = request.status === "approved";
          const elementId = `preview-${request.id}`;

          return (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {getTemplateName(request.template_id)}
                    </CardTitle>
                    <CardDescription>
                      Requested on{" "}
                      {new Date(request.requested_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {getTemplateName(request.template_id)}
                          </DialogTitle>
                          <DialogDescription>
                            Document preview - Status: {request.status}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          {isApproved && (
                            <div className="flex justify-end gap-2 mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrint(elementId)}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownloadJPG(
                                    elementId,
                                    `${getTemplateName(request.template_id)}-${request.id}`,
                                  )
                                }
                              >
                                <Download className="h-4 w-4 mr-2" />
                                JPG
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownloadPDF(
                                    elementId,
                                    `${getTemplateName(request.template_id)}-${request.id}`,
                                  )
                                }
                              >
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                            </div>
                          )}
                          <div id={elementId}>
                            {PreviewComponent && (
                              <PreviewComponent
                                data={request.template_data as any}
                                isEmployeePreview={!isApproved}
                                showExportButtons={false}
                              />
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              {request.processed_at && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {request.status === "approved" ? "Approved" : "Processed"}{" "}
                    on {new Date(request.processed_at).toLocaleDateString()}
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
