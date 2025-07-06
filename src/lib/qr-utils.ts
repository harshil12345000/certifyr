// IMPORTANT: Set VITE_APP_BASE_URL in your .env.production file (e.g., https://your-production-domain.com)
// For local/dev, you may omit it to use window.location.origin automatically.
// This ensures QR verification links work everywhere.
// Debug: Enhanced logging and error handling for QR code generation and verification.

import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { getOrganizationIdForUser, incrementUserStat } from "@/hooks/useUserStats";

export interface DocumentVerificationData {
  documentId: string;
  templateType: string;
  organizationId?: string;
  userId?: string;
  documentData: any;
  expiresAt?: Date;
}

export const generateVerificationHash = (): string => {
  return uuidv4().replace(/-/g, "");
};

export function getBaseUrl() {
  // Use env var if set, otherwise fallback to window.location.origin
  return import.meta.env.VITE_APP_BASE_URL || window.location.origin;
}

export const createVerificationUrl = (verificationHash: string): string => {
  let baseUrl = "";
  // Log which base URL is being used
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_APP_BASE_URL
  ) {
    baseUrl = import.meta.env.VITE_APP_BASE_URL;
  } else if (typeof window !== "undefined" && window.location) {
    baseUrl = window.location.origin;
  } else {
    return "";
  }
  const url = `${baseUrl}/verify/${verificationHash}`;
  return url;
};

export const saveVerifiedDocument = async (
  data: DocumentVerificationData,
): Promise<string | null> => {
  try {
    const verificationHash = generateVerificationHash();
    const expiresAt =
      data.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default
    // document_id is a uuid, generate if not present
    let document_id: string | undefined = undefined;
    try {
      if (
        typeof data.documentId === "string" &&
        /^[0-9a-fA-F-]{36}$/.test(data.documentId)
      ) {
        document_id = data.documentId;
      }
    } catch {}
    // organization_id must be a valid uuid or null
    let organization_id: string | null = null;
    if (
      typeof data.organizationId === "string" &&
      /^[0-9a-fA-F-]{36}$/.test(data.organizationId)
    ) {
      organization_id = data.organizationId;
    }
    const payload = {
      document_id,
      template_type: data.templateType,
      organization_id,
      user_id: data.userId || null,
      document_data: data.documentData,
      verification_hash: verificationHash,
      expires_at: expiresAt.toISOString(),
    };
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key],
    );
    const { error } = await supabase.from("verified_documents").insert(payload);
    if (error) {
      if (error.code === "42501" || error.code === "PGRST301") {
        return null;
      }
      return null;
    }
    return verificationHash;
  } catch (error) {
    return null;
  }
};

export const generateDocumentQRCode = async (
  templateId: string,
  formData: any,
  organizationId?: string,
  userId?: string,
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
    const url = createVerificationUrl(verificationHash);
    if (!url) {
      return null;
    }
    return url;
  } catch (error) {
    return null;
  }
};

export const logQRVerification = async (
  verificationHash: string,
  result: "verified" | "not_found" | "expired",
  documentId?: string,
  templateType?: string,
  organizationId?: string,
  userId?: string,
): Promise<void> => {
  try {
    await supabase.from("qr_verification_logs").insert({
      verification_hash: verificationHash,
      verification_result: result,
      document_id: documentId,
      template_type: templateType,
      organization_id: organizationId,
      user_id: userId,
      ip_address: "0.0.0.0", // Would be handled server-side in production
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    });
    // Increment user_statistics for total_verifications if org and user are present
    if (organizationId && userId) {
      try {
        await incrementUserStat({
          userId,
          organizationId,
          statField: "total_verifications", // Make sure this matches your DB field
        });
      } catch (statError) {
        console.error("Error incrementing total_verifications stat:", statError);
      }
    }
  } catch (error) {
  }
};
