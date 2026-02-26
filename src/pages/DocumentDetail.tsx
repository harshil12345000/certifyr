import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Printer, Save, PencilLine } from 'lucide-react';
import { DynamicForm } from '@/components/templates/DynamicForm';
import { DynamicPreview } from '@/components/templates/DynamicPreview';
import { getDocumentConfig } from '@/config/documentConfigs';
import { getInitialData } from '@/lib/document-initial-data';
import { toast } from 'sonner';
import { exportElementToPdfA4, printElementA4 } from '@/lib/document-utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { useDocumentHistory } from '@/hooks/useDocumentHistory';
import { useOrganizationSecurity } from '@/hooks/useOrganizationSecurity';
import { usePreviewTracking } from '@/hooks/usePreviewTracking';
import { DocumentEditToolbar } from '@/components/templates/DocumentEditToolbar';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import { getOrganizationMembershipForUser } from '@/hooks/useOrganizationMembership';

// Helper function to parse organization location to show only country
const parseLocation = (location: string | null | undefined): string => {
  if (!location) return '';
  // Extract country (last segment after comma)
  const parts = location.split(',').map(part => part.trim());
  const country = parts[parts.length - 1] || '';
  return country;
};

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { organizationId } = useOrganizationSecurity();
  const { saveDocument } = useDocumentHistory();
  const { userProfile, organizationDetails, isLoading: brandingLoading } = useBranding();
  const { trackPreviewGeneration } = usePreviewTracking();
  const { activePlan } = useSubscription();
  const [showUpgradePaywall, setShowUpgradePaywall] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Find the document config by ID
  const documentConfig = getDocumentConfig(id || '');
  
  // Check if we have saved history data from navigation state
  const historyData = location.state?.historyData;
  
  // Check for prefill data from query params (AI Assistant)
  const prefillData = Object.fromEntries([...searchParams.entries()].filter(([key]) => !key.startsWith('_')));
  const hasPrefill = Object.keys(prefillData).length > 0;
  
  // Initialize form data state - use history data if available, otherwise use defaults
  const [formData, setFormData] = useState<any>(() => {
    if (historyData?.form_data) {
      console.log("Loading saved document data:", historyData.form_data);
      return historyData.form_data;
    }
    if (hasPrefill) {
      console.log("Loading prefill data from query params:", prefillData);
      return { ...getInitialData(id || ''), ...prefillData };
    }
    return getInitialData(id || '');
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('form');
  const [isEditing, setIsEditing] = useState(false);

  // Auto-populate form data with organization and user profile information
  // Only run if we don't have history data (which already has all the values)
  useEffect(() => {
    // Skip auto-population if we loaded from history
    if (historyData?.form_data) {
      console.log("Skipping auto-population - using saved history data");
      toast.success("Document loaded from history");
      return;
    }

    if (brandingLoading) {
      console.log("Branding still loading, waiting...");
      return;
    }

    console.log("Auto-populating fields from organization and user profile");
    console.log("Organization details:", organizationDetails);
    console.log("User profile:", userProfile);

    // Parse location from organization details
    const parsedPlace = parseLocation(organizationDetails?.address);
    
    // Get signatory details from user profile
    const parsedSignatoryName = userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
      : '';
    const parsedDesignation = userProfile?.designation || '';

    console.log("Parsed values:", {
      place: parsedPlace,
      signatoryName: parsedSignatoryName,
      signatoryDesignation: parsedDesignation
    });

    // Update form data with parsed values
    setFormData((prev: any) => {
      const updated = {
        ...prev,
        place: parsedPlace || prev.place,
        signatoryName: parsedSignatoryName || prev.signatoryName,
        signatoryDesignation: parsedDesignation || prev.signatoryDesignation,
      };
      console.log("Updated formData:", updated);
      return updated;
    });
  }, [organizationDetails, userProfile, brandingLoading, historyData]);

  if (!documentConfig) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p>Document not found</p>
          <Button onClick={() => navigate('/documents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const resolveExportElement = (): HTMLElement | null => {
    const container = previewRef.current;
    if (!container) return null;
    return (container.querySelector(".a4-document") as HTMLElement) || container;
  };

  const handleDownloadPDF = async () => {
    const element = resolveExportElement();
    if (!element) return;

    setIsProcessing(true);
    try {
      await exportElementToPdfA4(
        element,
        `${documentConfig?.name || "document"}.pdf`,
      );
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = async () => {
    const element = resolveExportElement();
    if (!element) return;

    try {
      await printElementA4(element, documentConfig?.name || 'Print Document');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print document');
    }
  };

  const handleSaveDocument = async () => {
    if (!user) {
      toast.error('You must be logged in to save documents');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Use the hook's saveDocument function which handles organization lookup,
      // duplicate checking, and syncing with document_drafts
      const result = await saveDocument(
        documentConfig?.name || 'Untitled Document',
        formData,
        documentConfig?.id || id || ''
      );
      
      if (result && organizationId) {
        // Increment documents_created stat
        await supabase.rpc('increment_user_stat', {
          p_user_id: user.id,
          p_stat_field: 'documents_created',
          p_organization_id: organizationId || '',
        });
      }
      
    } catch (error) {
      console.error('Save document error:', error);
      toast.error('Failed to save document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnterEditMode = () => {
    setIsEditing(true);
    // Make the preview container editable after render
    setTimeout(() => {
      const container = previewRef.current;
      if (container) {
        container.setAttribute('contenteditable', 'true');
        container.focus();
      }
    }, 50);
  };

  const handleSaveEdits = () => {
    const container = previewRef.current;
    if (container) {
      container.removeAttribute('contenteditable');
      const editedHtml = container.innerHTML;
      setFormData((prev: any) => ({ ...prev, customContent: editedHtml }));
      toast.success('Edits saved to preview');
    }
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/documents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{documentConfig.name}</h1>
            <p className="text-sm text-muted-foreground">{documentConfig.description}</p>
          </div>
        </div>

        {/* Form and Preview Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Card>
              <CardContent className="pt-6">
                <DynamicForm
                  config={documentConfig}
                  initialData={formData}
                  organizationType={userProfile?.organizationType || ""}
                  onSubmit={async (data) => {
                      // Check document limit for Basic plan users only (not pro/ultra)
                      const isBasicPlan = activePlan === 'basic';
                      if (isBasicPlan && user?.id) {
                      const orgId =
                        organizationId ??
                        (await getOrganizationMembershipForUser(user.id))?.organization_id;

                      if (orgId) {
                        // Count from preview_generations table (same as "Documents Created" card)
                        const { count } = await supabase
                          .from('preview_generations')
                          .select('*', { count: 'exact', head: true })
                          .eq('organization_id', orgId);
                        
                        const used = count || 0;
                        if (used >= 25) {
                          setShowUpgradePaywall(true);
                          return;
                        }
                      }
                    }
                    
                    // Clear custom content when form is re-submitted so preview regenerates from template
                    setFormData({ ...data, customContent: undefined });
                    setActiveTab('preview');
                    await trackPreviewGeneration(documentConfig?.id || id || '', 'update');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6">
                {/* Action Buttons */}
                {!isEditing ? (
                  <div className="flex gap-2 mb-6 pb-4 border-b">
                    <Button 
                      onClick={handleDownloadPDF} 
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={isProcessing}
                      variant="default"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button 
                      onClick={handlePrint}
                      onMouseDown={(e) => e.preventDefault()}
                      variant="outline"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                    <Button 
                      onClick={handleSaveDocument} 
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={isProcessing}
                      variant="outline"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Document
                    </Button>
                    <Button
                      onClick={handleEnterEditMode}
                      variant="outline"
                    >
                      <PencilLine className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                ) : (
                  <DocumentEditToolbar onSaveEdits={handleSaveEdits} />
                )}

                {/* Preview Content */}
                <div ref={previewRef} className="w-full">
                  <DynamicPreview
                    config={documentConfig}
                    data={formData}
                    customContent={formData.customContent}
                    isEditing={isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <UpgradePrompt 
        requiredPlan="pro" 
        variant="force"
        open={showUpgradePaywall}
        onOpenChange={setShowUpgradePaywall}
      />
    </DashboardLayout>
  );
}
