
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Forms from '@/components/templates/forms';
import * as Previews from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getInitialData } from '@/pages/TemplateDetail';
import { EmployeePortalLayout } from '@/components/employee-portal/EmployeePortalLayout';
import { FormData } from '@/types/templates';
import { useEmployeePortal } from '@/contexts/EmployeePortalContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TEMPLATE_FORM_MAP: Record<string, keyof typeof Forms> = {
  'bonafide-1': 'BonafideForm',
  'character-1': 'CharacterForm',
  'experience-1': 'ExperienceForm',
  'embassy-attestation-1': 'EmbassyAttestationForm',
  'completion-certificate-1': 'CompletionCertificateForm',
  'transfer-certificate-1': 'TransferCertificateForm',
  'noc-visa-1': 'NocVisaForm',
  'income-certificate-1': 'IncomeCertificateForm',
  'maternity-leave-1': 'MaternityLeaveForm',
  'bank-verification-1': 'BankVerificationForm',
  'offer-letter-1': 'OfferLetterForm',
  'address-proof-1': 'AddressProofForm',
  'articles-incorporation-1': 'ArticlesOfIncorporationForm',
  'corporate-bylaws-1': 'CorporateBylawsForm',
  'founders-agreement-1': 'FoundersAgreementForm',
  'stock-purchase-agreement-1': 'StockPurchaseAgreementForm',
  'employment-agreement-1': 'EmploymentAgreementForm',
  'nda-1': 'NDAForm',
  'academic-transcript-1': 'AcademicTranscriptForm',
  'embassy-attestation-letter-1': 'EmbassyAttestationLetterForm',
};

const TEMPLATE_PREVIEW_MAP: Record<string, keyof typeof Previews> = {
  'bonafide-1': 'BonafidePreview',
  'character-1': 'CharacterPreview',
  'experience-1': 'ExperiencePreview',
  'embassy-attestation-1': 'EmbassyAttestationPreview',
  'completion-certificate-1': 'CompletionCertificatePreview',
  'transfer-certificate-1': 'TransferCertificatePreview',
  'noc-visa-1': 'NocVisaPreview',
  'income-certificate-1': 'IncomeCertificatePreview',
  'maternity-leave-1': 'MaternityLeavePreview',
  'bank-verification-1': 'BankVerificationPreview',
  'offer-letter-1': 'OfferLetterPreview',
  'address-proof-1': 'AddressProofPreview',
  'articles-incorporation-1': 'ArticlesOfIncorporationPreview',
  'corporate-bylaws-1': 'CorporateBylawsPreview',
  'founders-agreement-1': 'FoundersAgreementPreview',
  'stock-purchase-agreement-1': 'StockPurchaseAgreementPreview',
  'employment-agreement-1': 'EmploymentAgreementPreview',
  'nda-1': 'NDAPreview',
  'academic-transcript-1': 'AcademicTranscriptPreview',
  'embassy-attestation-letter-1': 'EmbassyAttestationLetterPreview',
};

export default function EmployeeTemplateDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { employee, organizationId } = useEmployeePortal();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(() => {
    if (id) {
      const initialData = getInitialData(id);
      return initialData as FormData;
    }
    return {
      fullName: '',
      gender: 'male' as const,
      parentName: '',
      type: 'student' as const,
      institutionName: '',
      startDate: '',
      courseOrDesignation: '',
      department: '',
      purpose: '',
      date: '',
      place: '',
      signatoryName: '',
      signatoryDesignation: '',
      includeDigitalSignature: false,
    };
  });

  if (!id || !(id in TEMPLATE_FORM_MAP)) {
    return (
      <EmployeePortalLayout activeTab="templates">
        <div className="max-w-2xl mx-auto py-12">
          <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
          <p className="text-muted-foreground mb-2">No template found for ID: <span className="font-mono">{id}</span></p>
        </div>
      </EmployeePortalLayout>
    );
  }

  const FormComponent = Forms[TEMPLATE_FORM_MAP[id]];
  const PreviewComponent = Previews[TEMPLATE_PREVIEW_MAP[id]];

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setTab('preview');
  };

  const handleFormDataChange = (data: FormData) => {
    setFormData(data);
  };

  const handleRequestApproval = async () => {
    if (!employee || !organizationId) {
      toast({
        title: "Error",
        description: "Employee or organization information not found",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('document_requests')
        .insert({
          employee_id: employee.id,
          organization_id: organizationId,
          template_id: id,
          template_data: formData as any, // Convert FormData to Json
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your document request has been submitted for approval",
      });

      // Redirect to pending tab or templates
      window.location.href = `/${organizationId}/request-portal?tab=pending`;
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EmployeePortalLayout activeTab="templates">
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-4">Fill Out Template</h1>
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <div className="bg-card p-6 rounded shadow">
              <FormComponent 
                onSubmit={handleFormSubmit as any}
                onDataChange={handleFormDataChange as any}
                initialData={formData as any} 
              />
            </div>
          </TabsContent>
          <TabsContent value="preview">
            <div className="bg-card p-6 rounded shadow relative">
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={handleRequestApproval}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Submitting..." : "Request Approval"}
                </Button>
              </div>
              <PreviewComponent data={formData as any} isEmployeePreview={true} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EmployeePortalLayout>
  );
}
