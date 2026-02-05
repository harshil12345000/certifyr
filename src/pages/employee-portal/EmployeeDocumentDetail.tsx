import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Send } from "lucide-react";
import { DynamicForm } from "@/components/templates/DynamicForm";
import { DynamicPreview } from "@/components/templates/DynamicPreview";
import { getDocumentConfig } from "@/config/documentConfigs";
import { getInitialData } from "@/lib/document-initial-data";
import { EmployeePortalLayout } from "@/components/employee-portal/EmployeePortalLayout";
import { useEmployeePortal, EmployeePortalProvider } from "@/contexts/EmployeePortalContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Inner component that uses the EmployeePortal context
function EmployeeDocumentDetailContent({
  id,
  slug,
  organizationId,
}: {
  id: string;
  slug: string;
  organizationId: string;
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { employee } = useEmployeePortal();
  const previewRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [isViewingExistingRequest, setIsViewingExistingRequest] = useState(false);

  // Find the document config by ID (strip the -1 suffix for config lookup)
  const configKey = id.replace(/-1$/, "");
  const documentConfig = getDocumentConfig(configKey) || getDocumentConfig(id);

  // Initialize form data state
  const [formData, setFormData] = useState<any>(() => {
    return getInitialData(id) || getInitialData(configKey) || {};
  });

  const requestId = searchParams.get("requestId");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  // Fetch existing request data if requestId is provided
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
            setFormData(request.template_data as any);
            setRequestStatus(request.status as "pending" | "approved" | "rejected");
            setIsViewingExistingRequest(true);
            if (request.status === "approved") {
              setTab("preview");
            }
          }
        } catch (error) {
          console.error("Error fetching request data:", error);
          toast.error("Failed to load request data");
        }
      };

      fetchRequestData();
    }
  }, [requestId, employee, organizationId]);

  if (!documentConfig) {
    return (
      <EmployeePortalLayout activeTab="documents">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate(`/portal/${slug}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Document Not Found</h1>
            <p className="text-muted-foreground">
              No document template found for ID: <span className="font-mono">{id}</span>
            </p>
          </div>
        </div>
      </EmployeePortalLayout>
    );
  }

  const handleRequestApproval = async () => {
    if (!employee || !organizationId) {
      toast.error("Employee or organization information not found.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert document request
      const { error } = await supabase.from("document_requests").insert({
        employee_id: employee.id,
        organization_id: organizationId,
        template_id: id,
        template_data: formData as any,
        status: "pending",
      });

      if (error) throw error;

      // Create notification for admin
      await supabase.from("notifications").insert({
        org_id: organizationId,
        type: "document_approval",
        subject: `${employee.full_name} Requested Document Approval`,
        body: `${employee.full_name} requested approval for: ${documentConfig.name}.\n\nCheck Request Portal → Requests.`,
        data: {
          document_id: id,
          employee_id: employee.id,
          template_id: id,
        },
      });

      toast.success("Your document request has been submitted for approval");
      navigate(`/portal/${slug}?tab=pending`);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EmployeePortalLayout activeTab="documents">
      <div className="mx-auto w-full max-w-3xl px-6 py-6">
        {/* Compact Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/portal/${slug}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{documentConfig.name}</h1>
            <p className="text-xs text-muted-foreground">{documentConfig.description}</p>
          </div>
        </div>

        {/* Status Banner - compact */}
        {isViewingExistingRequest && (
          <div className={`mb-3 rounded-md px-3 py-2 text-sm font-medium ${
            requestStatus === "approved" 
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : requestStatus === "rejected"
              ? "bg-destructive/10 border border-destructive/30 text-destructive"
              : "bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400"
          }`}>
            {requestStatus === "approved" && "✓ Approved"}
            {requestStatus === "rejected" && "✗ Rejected"}
            {requestStatus === "pending" && "⏳ Pending approval"}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-0">
            <Card>
              <CardContent className="p-4">
                <DynamicForm
                  config={documentConfig}
                  initialData={formData}
                  onSubmit={(data) => {
                    setFormData(data);
                    setTab("preview");
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <Card>
              <CardContent className="p-4">
                {!isViewingExistingRequest && (
                  <div className="flex gap-2 mb-4 pb-3 border-b">
                    <Button onClick={handleRequestApproval} disabled={isSubmitting} size="sm">
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Submitting..." : "Request Approval"}
                    </Button>
                  </div>
                )}
                <BrandingProvider organizationId={organizationId}>
                  <div ref={previewRef} className="w-full">
                    <DynamicPreview
                      config={documentConfig}
                      data={formData}
                      isEmployeePreview={true}
                      requestStatus={requestStatus}
                    />
                  </div>
                </BrandingProvider>
              </CardContent>
            </Card>
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

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!organizationId || !slug || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Portal Not Found</h1>
          <p className="text-muted-foreground">Unable to load the requested portal.</p>
        </div>
      </div>
    );
  }

  return (
    <EmployeePortalProvider organizationId={organizationId} portalSlug={slug}>
      <EmployeeDocumentDetailContent id={id} slug={slug} organizationId={organizationId} />
    </EmployeePortalProvider>
  );
}
