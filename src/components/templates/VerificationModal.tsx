
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
  if (!verificationResult) return null;

  const { isValid, status, document, message } = verificationResult;

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
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Document Type:</strong> {document.template_type?.replace(/-/g, ' ')}</p>
                <p><strong>Generated:</strong> {new Date(document.generated_at).toLocaleDateString()}</p>
                {document.expires_at && (
                  <p><strong>Expires:</strong> {new Date(document.expires_at).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
