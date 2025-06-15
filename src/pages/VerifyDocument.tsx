
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { logQRVerification } from '@/lib/qr-utils';
import { VerificationModal } from '@/components/templates/VerificationModal';
import { downloadPDF } from '@/lib/document-utils';

interface VerifiedDocument {
  id: string;
  template_type: string;
  document_data: any;
  generated_at: string;
  expires_at: string | null;
  is_active: boolean;
  organization_id: string | null;
  user_id: string | null;
}

const VerifyDocument = () => {
  const { hash } = useParams<{ hash: string }>();
  const [document, setDocument] = useState<VerifiedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    const verifyDocument = async () => {
      if (!hash) {
        const result = {
          isValid: false,
          status: 'not_found' as const,
          message: 'Invalid verification link'
        };
        setVerificationResult(result);
        setError('Invalid verification link');
        setLoading(false);
        setShowModal(true);
        await logQRVerification(hash || '', 'not_found');
        return;
      }

      try {
        // Fetch document
        const { data, error: fetchError } = await supabase
          .from('verified_documents')
          .select('*')
          .eq('verification_hash', hash)
          .single();

        if (fetchError || !data) {
          const result = {
            isValid: false,
            status: 'not_found' as const,
            message: 'Document not found or verification failed'
          };
          setVerificationResult(result);
          setError('Document not found or verification failed');
          await logQRVerification(hash, 'not_found');
        } else {
          setDocument(data);
          const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
          const isActive = data.is_active;

          if (isExpired) {
            const result = {
              isValid: false,
              status: 'expired' as const,
              document: data,
              message: 'This document has expired'
            };
            setVerificationResult(result);
            await logQRVerification(hash, 'expired', data.id, data.template_type, data.organization_id, data.user_id);
          } else if (!isActive) {
            const result = {
              isValid: false,
              status: 'not_found' as const,
              document: data,
              message: 'This document is no longer active'
            };
            setVerificationResult(result);
            await logQRVerification(hash, 'not_found', data.id, data.template_type, data.organization_id, data.user_id);
          } else {
            const result = {
              isValid: true,
              status: 'verified' as const,
              document: data,
              message: 'Document is valid and verified'
            };
            setVerificationResult(result);
            await logQRVerification(hash, 'verified', data.id, data.template_type, data.organization_id, data.user_id);
          }
        }
        setShowModal(true);
      } catch (err) {
        console.error('Verification error:', err);
        const result = {
          isValid: false,
          status: 'not_found' as const,
          message: 'An error occurred during verification'
        };
        setVerificationResult(result);
        setError('An error occurred during verification');
        setShowModal(true);
        await logQRVerification(hash, 'not_found');
      } finally {
        setLoading(false);
      }
    };

    verifyDocument();
  }, [hash]);

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

  const handleDownloadReport = async () => {
    if (!document) return;
    
    try {
      // Create a temporary verification report element
      const reportContent = `
        <div class="a4-document p-8 bg-white text-gray-800 font-sans">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold">Document Verification Report</h1>
          </div>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div><strong>Document:</strong> ${getDocumentDisplayName()}</div>
              <div><strong>Generated:</strong> ${new Date(document.generated_at).toLocaleDateString()}</div>
              <div><strong>Status:</strong> ${document.is_active && (!document.expires_at || new Date(document.expires_at) > new Date()) ? 'Valid' : 'Invalid'}</div>
              ${document.expires_at ? `<div><strong>Expires:</strong> ${new Date(document.expires_at).toLocaleDateString()}</div>` : ''}
            </div>
            <div class="mt-8">
              <p><strong>Verification Hash:</strong> ${hash}</p>
              <p><strong>Verified On:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      `;
      
      // Create temporary element using global document object
      const tempDiv = globalThis.document.createElement('div');
      tempDiv.innerHTML = reportContent;
      tempDiv.className = 'fixed -left-full top-0';
      globalThis.document.body.appendChild(tempDiv);
      
      // Generate PDF
      await downloadPDF(`verification-report-${document.template_type}.pdf`);
      
      // Clean up using global document object
      globalThis.document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating verification report:', error);
      alert('Failed to generate verification report');
    }
  };

  const isExpired = document?.expires_at && new Date(document.expires_at) < new Date();
  const isActive = document?.is_active;

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
              {error || !document ? (
                <XCircle className="h-16 w-16 text-red-500" />
              ) : isExpired || !isActive ? (
                <AlertTriangle className="h-16 w-16 text-yellow-500" />
              ) : (
                <CheckCircle className="h-16 w-16 text-green-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {error ? 'Verification Failed' : 
               !document ? 'Document Not Found' :
               isExpired ? 'Document Expired' :
               !isActive ? 'Document Inactive' :
               'Document Verified'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center text-red-600">
                <p>{error}</p>
              </div>
            )}
            
            {document && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Document:</label>
                    <p>{getDocumentDisplayName()}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Generated:</label>
                    <p>{new Date(document.generated_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Status:</label>
                    <div>
                      <Badge variant={isActive && !isExpired ? 'default' : 'destructive'}>
                        {isActive && !isExpired ? 'Valid' : isExpired ? 'Expired' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  {document.expires_at && (
                    <div>
                      <label className="font-semibold">Expires:</label>
                      <p>{new Date(document.expires_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <Button onClick={handleDownloadReport} variant="outline" className="gap-2">
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
