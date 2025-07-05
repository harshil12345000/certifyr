import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { CheckCircle, XCircle, Clock, FileText, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import * as Previews from "@/components/templates";

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

interface DocumentRequest {
  id: string;
  template_id: string;
  template_data: any;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  processed_at?: string | null;
  employee: {
    id: string;
    full_name: string;
    email: string;
    employee_id: string;
    manager_name: string | null;
  };
}

export function RequestPortalRequests({
  onRequestProcessed,
}: {
  onRequestProcessed?: () => void;
}) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      // Get user's organization
      const { data: orgData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!orgData) {
        setLoading(false);
        return;
      }

      // Get pending document requests with employee info
      const { data: requestsData, error } = await supabase
        .from("document_requests")
        .select(
          `
          *,
          request_portal_employees!inner(
            id,
            full_name,
            email,
            employee_id,
            manager_name
          )
        `,
        )
        .eq("organization_id", orgData.organization_id)
        .eq("status", "pending")
        .order("requested_at", { ascending: false });

      if (error) throw error;

      const formattedRequests =
        requestsData?.map((req) => ({
          id: req.id,
          template_id: req.template_id,
          template_data: req.template_data,
          status: req.status as "pending" | "approved" | "rejected",
          requested_at: req.requested_at,
          processed_at: req.processed_at,
          employee: {
            id: req.request_portal_employees.id,
            full_name: req.request_portal_employees.full_name,
            email: req.request_portal_employees.email,
            employee_id: req.request_portal_employees.employee_id,
            manager_name: req.request_portal_employees.manager_name,
          },
        })) || [];

      setRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to load document requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processRequest = async (
    requestId: string,
    action: "approved" | "rejected",
  ) => {
    try {
      const { error } = await supabase
        .from("document_requests")
        .update({
          status: action,
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${action} successfully`,
      });

      // Refresh requests
      fetchRequests();
      // Notify parent to refresh count
      if (onRequestProcessed) onRequestProcessed();
    } catch (error) {
      console.error("Error processing request:", error);
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive",
      });
    }
  };

  const getTemplateName = (templateId: string) => {
    const templateNames: Record<string, string> = {
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
    return templateNames[templateId] || templateId;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Requests</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Document Requests</CardTitle>
        <CardDescription>
          Review and approve employee document requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const PreviewComponent = Previews[
                TEMPLATE_PREVIEW_MAP[request.template_id]
              ] as any;

              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {getTemplateName(request.template_id)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        <strong>Employee:</strong> {request.employee.full_name}{" "}
                        ({request.employee.employee_id})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Email:</strong> {request.employee.email}
                      </p>
                      {request.employee.manager_name && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Manager:</strong>{" "}
                          {request.employee.manager_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Requested{" "}
                        {formatDistanceToNow(new Date(request.requested_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {getTemplateName(request.template_id)} - Preview
                          </DialogTitle>
                          <DialogDescription>
                            Document preview for {request.employee.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          {PreviewComponent && (
                            <PreviewComponent
                              data={request.template_data}
                              isEmployeePreview={true}
                              showExportButtons={false}
                            />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      onClick={() => processRequest(request.id, "approved")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => processRequest(request.id, "rejected")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
