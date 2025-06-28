// IMPORTANT: Set VITE_APP_BASE_URL in your .env.production file (e.g., https://your-production-domain.com)
// For local/dev, you may omit it to use window.location.origin automatically.
// This ensures QR verification links work everywhere.
// Debug: Enhanced logging and error handling for QR code generation and verification.

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
  let baseUrl = '';
  // Log which base URL is being used
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_BASE_URL) {
    baseUrl = import.meta.env.VITE_APP_BASE_URL;
    console.log('[QR] Using VITE_APP_BASE_URL:', baseUrl);
  } else if (typeof window !== 'undefined' && window.location) {
    baseUrl = window.location.origin;
    console.log('[QR] Using window.location.origin as base URL:', baseUrl);
  } else {
    console.error('[QR] Could not determine base URL for QR verification. window.location and VITE_APP_BASE_URL unavailable.');
    return '';
  }
  const url = `${baseUrl}/verify/${verificationHash}`;
  console.log('[QR] Generated verification URL:', url);
  return url;
};

export const saveVerifiedDocument = async (data: DocumentVerificationData): Promise<string | null> => {
  try {
    const verificationHash = generateVerificationHash();
    const expiresAt = data.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default
    console.log('[QR] Attempting to save verified document to Supabase:', {
      ...data,
      verificationHash,
      expiresAt: expiresAt.toISOString(),
    });
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
      console.error('[QR] Error saving verified document to Supabase:', error);
      return null;
    }
    console.log('[QR] Successfully saved verified document. Hash:', verificationHash);
    return verificationHash;
  } catch (error) {
    console.error('[QR] Exception in saveVerifiedDocument:', error);
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
    console.log('[QR] Generating QR code for document:', verificationData);
    const verificationHash = await saveVerifiedDocument(verificationData);
    if (!verificationHash) {
      console.error('[QR] QR code generation failed: Could not save verified document.');
      return null;
    }
    const url = createVerificationUrl(verificationHash);
    if (!url) {
      console.error('[QR] QR code generation failed: Could not create verification URL.');
      return null;
    }
    console.log('[QR] QR code URL generated:', url);
    return url;
  } catch (error) {
    console.error('[QR] Exception generating QR code:', error);
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
    console.log('[QR] Logging QR verification event:', {
      verificationHash,
      result,
      documentId,
      templateType,
      organizationId,
      userId,
    });
    await supabase.from('qr_verification_logs').insert({
      verification_hash: verificationHash,
      verification_result: result,
      document_id: documentId,
      template_type: templateType,
      organization_id: organizationId,
      user_id: userId,
      ip_address: '0.0.0.0', // Would be handled server-side in production
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });
  } catch (error) {
    console.error('[QR] Error logging QR verification:', error);
  }
};
