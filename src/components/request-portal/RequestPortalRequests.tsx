import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import * as Previews from '@/components/templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DocumentRequest {
  id: string;
  template_id: string;
  template_data: any;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  employee: {
    id: string;
    full_name: string;
    email: string;
    employee_id: string;
  };
}

// Add TEMPLATE_PREVIEW_MAP for mapping
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

export function RequestPortalRequests({ onRequestProcessed }: { onRequestProcessed?: () => void }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewRequest, setPreviewRequest] = useState<DocumentRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      // Get user's organization
      const { data: orgData } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!orgData) {
        setLoading(false);
        return;
      }

      // Get pending document requests with employee info
      const { data: requestsData, error } = await supabase
        .from('document_requests')
        .select(`
          *,
          request_portal_employees!inner(
            id,
            full_name,
            email,
            employee_id
          )
        `)
        .eq('organization_id', orgData.organization_id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = requestsData?.map(req => ({
        id: req.id,
        template_id: req.template_id,
        template_data: req.template_data,
        status: req.status as 'pending' | 'approved' | 'rejected',
        requested_at: req.requested_at,
        employee: {
          id: req.request_portal_employees.id,
          full_name: req.request_portal_employees.full_name,
          email: req.request_portal_employees.email,
          employee_id: req.request_portal_employees.employee_id,
        }
      })) || [];

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const processRequest = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('document_requests')
        .update({
          status: action,
          processed_at: new Date().toISOString(),
          processed_by: user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Request ${action} successfully`
      });

      // Refresh requests
      fetchRequests();
      // Notify parent to refresh count
      if (onRequestProcessed) onRequestProcessed();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: 'Error',
        description: `Failed to ${action} request`,
        variant: 'destructive'
      });
    }
  };

  const getTemplateName = (templateId: string) => {
    // Map template IDs to friendly names
    const templateNames: Record<string, string> = {
      'experience': 'Experience Certificate',
      'bonafide': 'Bonafide Certificate',
      'income': 'Income Certificate',
      'character': 'Character Certificate',
      'completion': 'Completion Certificate',
      'offer-letter': 'Offer Letter',
      'maternity-leave': 'Maternity Leave Certificate',
      'transfer': 'Transfer Certificate',
      'academic-transcript': 'Academic Transcript'
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
              // Map template_id to Preview component
              const previewKey = Object.keys(Previews).find(key => key.toLowerCase().startsWith(request.template_id.replace(/-/g, '')));
              const PreviewComponent = previewKey ? (Previews as any)[previewKey] : null;
              return (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {getTemplateName(request.template_id)} for {request.employee.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Requested by {request.employee.email} • Employee ID: {request.employee.employee_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewRequest(request)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => processRequest(request.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => processRequest(request.id, 'rejected')}
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
        {/* Preview Modal */}
        <Dialog open={!!previewRequest} onOpenChange={open => !open && setPreviewRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
              <DialogDescription>
                Preview of the requested document
              </DialogDescription>
            </DialogHeader>
            {previewRequest && (() => {
              const PreviewComponent = TEMPLATE_PREVIEW_MAP[previewRequest.template_id] ? (Previews as any)[TEMPLATE_PREVIEW_MAP[previewRequest.template_id]] : null;
              return PreviewComponent ? (
                <PreviewComponent data={previewRequest.template_data} isEmployeePreview={false} />
              ) : (
                <div>Preview not available for this template.</div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}