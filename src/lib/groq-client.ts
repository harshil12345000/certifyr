import { getTemplatesWithFields } from '@/config/documentConfigs';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface GroqChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface OrgInfo {
  name: string;
  address: string;
  place: string;
  email: string;
  phone: string;
  signatoryName: string;
  signatoryDesignation: string;
  organizationType: string;
  organizationLocation: string;
}

/**
 * Send chat message via the ai-chat edge function (server-side).
 * API keys are stored as Supabase secrets — never exposed client-side.
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  _employeeData: Record<string, unknown>[],
  options: GroqChatOptions = {},
  orgInfo?: OrgInfo,
  issueDate?: string,
  contextCountry?: string,
  organizationId?: string,
): Promise<{ type: string; message: string; matches?: { name: string; id: string; department: string }[] }> {
  const templates = getTemplatesWithFields();

  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: {
      messages: messages.map(({ role, content }) => ({ role, content })),
      orgInfo,
      contextCountry,
      issueDate,
      organizationId,
      templates,
      employeeCount: _employeeData.length,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to get AI response');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Generate a chat title via the ai-chat edge function.
 */
export async function generateChatTitle(userMessage: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { action: 'generate_title', userMessage },
    });

    if (error || !data?.title) return 'New Chat';
    return data.title;
  } catch {
    return 'New Chat';
  }
}

export function parseGenerationResponse(content: string): { templateId: string; data: Record<string, string> } | null {
  const match = content.match(/GENERATE_DOCUMENT:([^:]+):(.+)/s);
  if (!match) return null;

  try {
    const data = JSON.parse(match[2]);

    // Normalize gender values to lowercase
    if (data.gender) {
      const genderMap: Record<string, string> = {
        'male': 'male', 'm': 'male', 'man': 'male', 'boy': 'male',
        'female': 'female', 'f': 'female', 'woman': 'female', 'girl': 'female',
        'other': 'other', 'o': 'other', 'others': 'other'
      };
      const normalizedGender = data.gender.toString().toLowerCase().trim();
      data.gender = genderMap[normalizedGender] || normalizedGender;
    }

    // Normalize type values to lowercase
    if (data.type) {
      const typeMap: Record<string, string> = {
        'student': 'student', 's': 'student', 'studying': 'student',
        'employee': 'employee', 'e': 'employee', 'staff': 'employee', 'faculty': 'employee'
      };
      const normalizedType = data.type.toString().toLowerCase().trim();
      data.type = typeMap[normalizedType] || normalizedType;
    }

    return {
      templateId: match[1],
      data,
    };
  } catch {
    return null;
  }
}

export function extractTemplateFromMessage(message: string): string | null {
  const templates = getTemplatesWithFields();
  const lowerMessage = message.toLowerCase();

  for (const template of templates) {
    if (lowerMessage.includes(template.name.toLowerCase()) ||
        lowerMessage.includes(template.id.toLowerCase())) {
      return template.id;
    }
  }

  const keywords: Record<string, string> = {
    'bonafide': 'bonafide',
    'bona fide': 'bonafide',
    'character': 'character',
    'experience': 'experience',
    'transfer': 'transfer',
    'transcript': 'academic-transcript',
    'completion': 'completion',
    'income': 'income',
    'maternity': 'maternity-leave',
    'offer letter': 'offer-letter',
    'noc': 'noc-visa',
    'visa': 'noc-visa',
    'bank verification': 'bank-verification',
    'address proof': 'address-proof',
    'nda': 'nda',
    'employment agreement': 'employment-agreement',
  };

  for (const [keyword, templateId] of Object.entries(keywords)) {
    if (lowerMessage.includes(keyword)) {
      return templateId;
    }
  }

  return null;
}
