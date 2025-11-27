import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import * as Forms from "@/components/templates/forms";
import * as Previews from "@/components/templates";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getInitialData } from "@/lib/document-initial-data";
import { EmployeePortalLayout } from "@/components/employee-portal/EmployeePortalLayout";
import { FormData } from "@/types/templates";
import { useEmployeePortal, EmployeePortalProvider } from "@/contexts/EmployeePortalContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BrandingProvider } from "@/contexts/BrandingContext";

const TEMPLATE_NAMES: Record<string, string> = {
  "academic-transcript-1": "Academic Transcript",
  "embassy-attestation-letter-1": "Embassy Attestation Letter",
  "employment-agreement-1": "Employment Agreement",
  "nda-1": "Non-Disclosure Agreement",
  "founders-agreement-1": "Founders Agreement",
  "stock-purchase-agreement-1": "Stock Purchase Agreement",
  "articles-incorporation-1": "Articles of Incorporation",
  "corporate-bylaws-1": "Corporate Bylaws",
  "bonafide-1": "Bonafide Certificate",
  "character-1": "Character Certificate",
  "experience-1": "Experience Certificate",
  "embassy-attestation-1": "Embassy Attestation",
  "completion-certificate-1": "Completion Certificate",
  "transfer-certificate-1": "Transfer Certificate",
  "noc-visa-1": "NOC for Visa",
  "income-certificate-1": "Income Certificate",
  "maternity-leave-1": "Maternity Leave Certificate",
  "bank-verification-1": "Bank Verification Letter",
  "offer-letter-1": "Offer Letter",
  "address-proof-1": "Address Proof",
};

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  "academic-transcript-1": "Official record of a student's academic performance.",
  "embassy-attestation-letter-1": "Letter for embassy attestation and verification.",
  "employment-agreement-1": "Contract outlining terms of employment.",
  "nda-1": "Agreement to protect confidential information.",
  "founders-agreement-1": "Agreement between company founders.",
  "stock-purchase-agreement-1": "Agreement for the purchase of company stock.",
  "articles-incorporation-1": "Legal document to form a corporation.",
  "corporate-bylaws-1": "Rules governing the management of a corporation.",
  "bonafide-1": "Certificate confirming a person's association with an institution.",
  "character-1": "Certificate attesting to a person's character.",
  "experience-1": "Certificate of work experience.",
  "embassy-attestation-1": "Document for embassy attestation purposes.",
  "completion-certificate-1": "Certificate for successful course or program completion.",
  "transfer-certificate-1": "Certificate for transfer between institutions.",
  "noc-visa-1": "No Objection Certificate for visa applications.",
  "income-certificate-1": "Certificate stating income details.",
  "maternity-leave-1": "Certificate for maternity leave approval.",
  "bank-verification-1": "Letter for bank account verification.",
  "offer-letter-1": "Official job offer letter.",
  "address-proof-1": "Document to verify address.",
};

const TEMPLATE_FORM_MAP: Record<string, keyof typeof Forms> = {
  "bonafide-1": "BonafideForm",
  "character-1": "CharacterForm",
  "experience-1": "ExperienceForm",
  "embassy-attestation-1": "EmbassyAttestationForm",
  "completion-certificate-1": "CompletionCertificateForm",
  "transfer-certificate-1": "TransferCertificateForm",
  "noc-visa-1": "NocVisaForm",
  "income-certificate-1": "IncomeCertificateForm",
  "maternity-leave-1": "MaternityLeaveForm",
  "bank-verification-1": "BankVerificationForm",
  "offer-letter-1": "OfferLetterForm",
  "address-proof-1": "AddressProofForm",
  "articles-incorporation-1": "ArticlesOfIncorporationForm",
  "corporate-bylaws-1": "CorporateBylawsForm",
  "founders-agreement-1": "FoundersAgreementForm",
  "stock-purchase-agreement-1": "StockPurchaseAgreementForm",
  "employment-agreement-1": "EmploymentAgreementForm",
  "nda-1": "NDAForm",
  "academic-transcript-1": "AcademicTranscriptForm",
  "embassy-attestation-letter-1": "EmbassyAttestationLetterForm",
};

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

const getTemplateName = (templateId: string) => {
  return TEMPLATE_NAMES[templateId] || templateId;
};

const getTemplateDescription = (templateId: string) => {
  return TEMPLATE_DESCRIPTIONS[templateId] || "";
};

// Inner component that uses the EmployeePortal context
function EmployeeDocumentDetailContent({ 
  id, 
  slug, 
  organizationId 
}: { 
  id: string; 
  slug: string; 
  organizationId: string;
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const { employee } = useEmployeePortal();
  const { toast } = useToast();

  // Scroll to top when component mounts or template changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  const [formData, setFormData] = useState<FormData>(() => {
    if (id) {
      const initialData = getInitialData(id);
      return initialData as FormData;
    }
    return {
      fullName: "",
      gender: "male" as const,
      parentName: "",
      type: "student" as const,
      institutionName: "",
      startDate: "",
      courseOrDesignation: "",
      department: "",
      purpose: "",
      date: "",
      place: "",
      signatoryName: "",
      signatoryDesignation: "",
      includeDigitalSignature: false,
    };
  });

  const requestId = searchParams.get("requestId");

  useEffect(() => {
    if (requestId && employee && organizationId) {
      const fetchRequestData = async () => {
        try {
          const { data: request, error } = await supabase
            .from("document_requests")
            .select("*")
            .eq("id", requestId)
            .eq("employee_id", employee.id)
            .single();

          if (error) throw error;

          if (request) {
            setFormData(request.template_data as unknown as FormData);
            setRequestStatus(request.status as "pending" | "approved" | "rejected");
            if (request.status === "approved") {
              setTab("preview");
            }
          }
        } catch (error) {
          console.error("Error fetching request data:", error);
          toast({
            title: "Error",
            description: "Failed to load request data",
            variant: "destructive",
          });
        }
      };

      fetchRequestData();
    }
  }, [requestId, employee, organizationId, toast]);

  if (!id || !(id in TEMPLATE_FORM_MAP)) {
    return (
      <EmployeePortalLayout activeTab="templates">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
          <p className="text-muted-foreground">
            No template found for ID: <span className="font-mono">{id}</span>
          </p>
        </div>
      </EmployeePortalLayout>
    );
  }

  const FormComponent = Forms[TEMPLATE_FORM_MAP[id]];
  const PreviewComponent = Previews[TEMPLATE_PREVIEW_MAP[id]];

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setTab("preview");
  };

  const handleFormDataChange = (data: FormData) => {
    setFormData(data);
  };

  const handleRequestApproval = async () => {
    if (!employee || !organizationId) {
      toast({
        title: "Error",
        description: "Employee or organization information not found.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("document_requests").insert({
        employee_id: employee.id,
        organization_id: organizationId,
        template_id: id,
        template_data: formData as any,
        status: "pending",
      });

      if (error) throw error;

      await supabase.from("notifications").insert({
        org_id: organizationId,
        type: "document_approval",
        subject: `${employee.full_name} Requested Document Approval`,
        body: `${employee.full_name} requested approval for: ${getTemplateName(id)}.\n\nCheck Request Portal → Requests.`,
        data: {
          document_id: id,
          employee_id: employee.id,
          template_id: id,
        },
      });

      toast({
        title: "Request Submitted",
        description: "Your document request has been submitted for approval",
      });

      navigate(`/portal/${slug}?tab=pending`);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EmployeePortalLayout activeTab="templates">
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{getTemplateName(id)}</h1>
          {getTemplateDescription(id) && (
            <p className="text-muted-foreground text-sm mt-1">
              {getTemplateDescription(id)}
            </p>
          )}
        </div>

        {requestStatus === "approved" && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-green-800 font-medium">✓ This document has been approved</p>
          </div>
        )}

        {requestStatus === "rejected" && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 font-medium">✗ This document request was rejected</p>
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-0">
            <div className="bg-card p-6 rounded-lg border">
              <FormComponent
                onSubmit={handleFormSubmit as any}
                onDataChange={handleFormDataChange as any}
                initialData={formData as any}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="bg-card rounded-lg border">
              {!requestId && (
                <div className="p-4 border-b flex justify-end">
                  <Button onClick={handleRequestApproval} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Request Approval"}
                  </Button>
                </div>
              )}
              <div className="p-6">
                {organizationId && (
                  <BrandingProvider organizationId={organizationId}>
                    {PreviewComponent && (
                      <PreviewComponent
                        data={formData as any}
                        isEmployeePreview={false}
                        requestStatus={requestStatus}
                      />
                    )}
                  </BrandingProvider>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EmployeePortalLayout>
  );
}

// Outer wrapper component that resolves slug and wraps in provider
export default function EmployeeDocumentDetail() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve slug to organization ID
  useEffect(() => {
    const resolveSlug = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id")
          .eq("portal_slug", slug)
          .maybeSingle();

        if (error || !data) {
          console.error("Error resolving slug:", error);
          setLoading(false);
          return;
        }

        setOrganizationId(data.id);
        setLoading(false);
      } catch (error) {
        console.error("Error resolving organization slug:", error);
        setLoading(false);
      }
    };

    resolveSlug();
  }, [slug]);

  if (loading || !organizationId || !slug || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!(id in TEMPLATE_FORM_MAP)) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
        <p className="text-muted-foreground">
          No template found for ID: <span className="font-mono">{id}</span>
        </p>
      </div>
    );
  }

  return (
    <EmployeePortalProvider organizationId={organizationId} portalSlug={slug}>
      <EmployeeDocumentDetailContent 
        id={id} 
        slug={slug} 
        organizationId={organizationId} 
      />
    </EmployeePortalProvider>
  );
}
