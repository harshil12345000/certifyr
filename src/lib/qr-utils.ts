// IMPORTANT: Set VITE_APP_BASE_URL in your .env file (e.g., http://localhost:3000 for local dev, your Netlify/Vercel URL for preview, etc.)
// This ensures QR verification links work everywhere.
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentVerificationData {
  documentId: string;
  templateType: string;
  organizationId?: string;
  userId?: string;
  documentData: any;
  expiresAt?: Date;
}

export const generateVerificationHash = (): string => {
  return uuidv4().replace(/-/g, '');
};

export const createVerificationUrl = (verificationHash: string): string => {
  // Priority: VITE_APP_BASE_URL > window.location.origin > production fallback
  let baseUrl = '';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_BASE_URL) {
    baseUrl = import.meta.env.VITE_APP_BASE_URL;
  } else if (typeof window !== 'undefined' && window.location) {
    baseUrl = window.location.origin;
  } else {
    baseUrl = 'https://certifyr.lovable.app';
    console.error('Could not determine base URL for QR verification. Falling back to production URL.');
  }
  return `${baseUrl}/verify/${verificationHash}`;
};

export const saveVerifiedDocument = async (data: DocumentVerificationData): Promise<string | null> => {
  try {
    const verificationHash = generateVerificationHash();
    const expiresAt = data.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default

    const { error } = await supabase
      .from('verified_documents')
      .insert({
        id: data.documentId,
        template_type: data.templateType,
        organization_id: data.organizationId,
        user_id: data.userId,
        document_data: data.documentData,
        verification_hash: verificationHash,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      console.error('Error saving verified document:', error);
      return null;
    }

    return verificationHash;
  } catch (error) {
    console.error('Error in saveVerifiedDocument:', error);
    return null;
  }
};

export const generateDocumentQRCode = async (
  templateId: string,
  formData: any,
  organizationId?: string,
  userId?: string
): Promise<string | null> => {
  try {
    const documentId = uuidv4();
    const verificationData: DocumentVerificationData = {
      documentId,
      templateType: templateId,
      organizationId,
      userId,
      documentData: formData,
    };

    const verificationHash = await saveVerifiedDocument(verificationData);
    if (!verificationHash) {
      console.error('QR code generation failed: Could not save verified document.');
      return null;
    }

    return createVerificationUrl(verificationHash);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

export const logQRVerification = async (
  verificationHash: string,
  result: 'verified' | 'not_found' | 'expired',
  documentId?: string,
  templateType?: string,
  organizationId?: string,
  userId?: string
): Promise<void> => {
  try {
    await supabase.from('qr_verification_logs').insert({
      verification_hash: verificationHash,
      verification_result: result,
      document_id: documentId,
      template_type: templateType,
      organization_id: organizationId,
      user_id: userId,
      ip_address: '0.0.0.0', // Would be handled server-side in production
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error logging QR verification:', error);
  }
};
