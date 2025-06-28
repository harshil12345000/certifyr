import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationResult: {
    isValid: boolean;
    status: 'verified' | 'not_found' | 'expired';
    document?: any;
    message: string;
  } | null;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  verificationResult,
}) => {
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const document = verificationResult?.document;

  useEffect(() => {
    const fetchOrgName = async () => {
      if (document && document.organization_id) {
        const { data, error } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', document.organization_id)
          .single();
        if (data && data.name) {
          setOrganizationName(data.name);
        } else {
          setOrganizationName(null);
        }
      } else {
        setOrganizationName(null);
      }
    };
    fetchOrgName();
  }, [document?.organization_id]);

  if (!verificationResult) return null;

  const { isValid, status, message } = verificationResult;

  const getIcon = () => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'expired':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case 'not_found':
      default:
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'verified':
        return 'Document Verified';
      case 'expired':
        return 'Document Expired';
      case 'not_found':
      default:
        return 'Document Not Found';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-500">Valid</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'not_found':
      default:
        return <Badge variant="destructive">Invalid</Badge>;
    }
  };

  const getTemplateDisplayName = (templateType: string) => {
    const templateNames: { [key: string]: string } = {
      'bonafide-1': 'Bonafide Certificate',
      'character-1': 'Character Certificate',
      'completion-certificate-1': 'Completion Certificate',
      'experience-1': 'Experience Certificate',
      'income-certificate-1': 'Income Certificate',
      'address-proof-1': 'Address Proof',
      'bank-verification-1': 'Bank Verification',
      'nda-1': 'Non-Disclosure Agreement',
      'maternity-leave-1': 'Maternity Leave Certificate'
    };
    return templateNames[templateType] || templateType.replace(/-/g, ' ');
  };

  const getDocumentDisplayName = () => {
    if (!document) return '';
    const templateName = getTemplateDisplayName(document.template_type);
    const fullName = document.document_data?.fullName || 'Unknown';
    return `${templateName} for ${fullName}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {getIcon()}
            <DialogTitle className="text-xl text-center">{getTitle()}</DialogTitle>
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
                <div>
                  <p><strong>Document:</strong> {getDocumentDisplayName()}</p>
                  {organizationName && (
                    <p><strong>Issued By:</strong> {organizationName}</p>
                  )}
                </div>
                <div>
                  <p><strong>Generated:</strong> {new Date(document.generated_at).toLocaleDateString()}</p>
                  {document.expires_at && (
                    <p><strong>Expires:</strong> {new Date(document.expires_at).toLocaleDateString()}</p>
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
