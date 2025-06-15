
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
  const baseUrl = window.location.origin;
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
      return null;
    }

    return createVerificationUrl(verificationHash);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};
