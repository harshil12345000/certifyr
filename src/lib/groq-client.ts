import { getTemplatesWithFields } from '@/config/documentConfigs';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface GroqChatOptions {
  model?: 'compound-beta' | 'compound-beta-mini' | 'llama-3.3-70b-versatile' | 'llama-3.1-70b-versatile' | 'llama-3.1-8b-instant';
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions';

function getSarvamApiKey(): string | null {
  return import.meta.env.VITE_SARVAM_API_KEY || null;
}

function getGroqApiKey(): string | null {
  return import.meta.env.VITE_GROQ_API_KEY || null;
}

function getApiKey(): string {
  const groqKey = getGroqApiKey();
  if (groqKey) return groqKey;
  
  const sarvamKey = getSarvamApiKey();
  if (sarvamKey) return sarvamKey;
  
  throw new Error('Backend issue with API, kindly contact support for a fix.');
}

function useSarvam(): boolean {
  return !!getSarvamApiKey() && !getGroqApiKey();
}

function getApiUrl(): string {
  if (useSarvam()) return SARVAM_API_URL;
  return GROQ_API_URL;
}

function getModel(): string {
  if (useSarvam()) return 'sarvam-m';
  return 'llama-3.1-8b-instant';
}

function buildSystemPrompt(
  employeeData: Record<string, unknown>[], 
  contextCountry?: string,
  orgInfo?: OrgInfo,
  issueDate?: string
): string {
  const templates = getTemplatesWithFields();
  
  let prompt = `You are Certifyr AI Assistant, an intelligent document generation assistant.

You help users create certificates and documents by extracting information from employee data or asking for missing details.

`;

  // Add organization info if available
  if (orgInfo) {
    prompt += `ORGANIZATION DETAILS:
- Organization Name: ${orgInfo.name}
- Organization Place/Location: ${orgInfo.place || orgInfo.organizationLocation || 'N/A'}
- Organization Address: ${orgInfo.address}
- Organization Email: ${orgInfo.email}
- Organization Phone: ${orgInfo.phone}
- Organization Type: ${orgInfo.organizationType || 'N/A'}
- Signatory Name (Admin): ${orgInfo.signatoryName}
- Signatory Designation: ${orgInfo.signatoryDesignation}

USE THESE VALUES WHEN GENERATING DOCUMENTS:
- Use "${orgInfo.name}" for organization/company name fields
- Use "${orgInfo.place}" for organization place/address
- Use "${orgInfo.signatoryName}" for signatory/authorizer name
- Use "${orgInfo.signatoryDesignation}" for signatory designation
- Use "${orgInfo.email}" for organization email
- Use "${orgInfo.phone}" for organization phone

`;
  }

  prompt += `AVAILABLE TEMPLATES AND THEIR FIELDS:
${templates.map(t => `- ${t.name} (${t.id}): Required fields: ${t.requiredFields.join(', ')}`).join('\n')}

`;

  if (employeeData.length > 0) {
    const sampleSize = Math.min(employeeData.length, 15);
    prompt += `EMPLOYEE DATA AVAILABLE (${employeeData.length} records - USE THIS DATA TO FILL DOCUMENT FIELDS):
${JSON.stringify(employeeData.slice(0, sampleSize), null, 2)}

CRITICAL: You MUST use this employee data to fill document fields. Do NOT ask for information that is already present in the employee data above. Always search this data first before asking the user.
`;
  } else {
    prompt += `NO EMPLOYEE DATA UPLOADED. You can ask the user to upload employee data in the Organization > Data tab, or collect all information manually.
`;
  }

  if (contextCountry && contextCountry !== 'global') {
    prompt += `\nDOCUMENT CONTEXT: The organization follows ${contextCountry} legal requirements and document formats.
`;
  }

  // Add issue date info
  if (issueDate) {
    prompt += `\nCURRENT DATE: ${issueDate} (use this for Date field/Issue Date)
`;
  }

  prompt += `
CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY:
1. ALWAYS check the employee data first - all information about employees/students is already in the data provided above
2. If the employee exists in the data, use their information directly - DO NOT ask for fields they already have
3. ONLY ask for missing fields that are NOT in the employee data
4. The employee data contains: name, id, email, phone, department, designation, gender, date of birth, course, year, joining date, etc.
5. When user asks for a document, search the employee data for that person and use their existing info
6. Do NOT ask for: name, email, phone, department, designation, gender, date of birth if it exists in the data
7. Only ask for: purpose (why they need the document), or other custom fields not in the data

EXAMPLE CORRECT FLOW:
- User: "Create bonafide for John"
- AI finds John in employee data with: name=John, email=john@company.com, department=IT, designation=Developer, gender=male
- AI responds: "I found John's information:
- Name: John
- Department: IT
- Designation: Developer

I need one more field:
- Purpose: What is this bonafide certificate for?"

EXAMPLE INCORRECT FLOW (DO NOT DO THIS):
- AI: "What is John's full name?" (WRONG - name is in data)
- AI: "What is John's department?" (WRONG - department is in data)

8. When all required fields are collected, respond with:
   GENERATE_DOCUMENT:{templateId}:{"field1":"value1","field2":"value2",...}
`;

  return prompt;
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

export async function sendChatMessage(
  messages: ChatMessage[],
  employeeData: Record<string, unknown>[],
  options: GroqChatOptions = {},
  orgInfo?: OrgInfo,
  issueDate?: string
): Promise<string> {
  const { model = getModel(), temperature = 0.3, maxTokens = 1024 } = options;

  const templates = getTemplatesWithFields();
  const systemMessage: ChatMessage = {
    role: 'system',
    content: buildSystemPrompt(employeeData, undefined, orgInfo, issueDate),
  };

  const apiMessages = [
    systemMessage,
    ...messages.map(({ role, content }) => ({ role, content }))
  ];

  // Try Sarvam first, then fallback to Groq
  const tryApis = async (): Promise<string> => {
    // Try Sarvam first
    if (getSarvamApiKey()) {
      try {
        const response = await fetch(SARVAM_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getSarvamApiKey()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sarvam-m',
            messages: apiMessages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Sarvam API response:', data);
          return data.choices[0]?.message?.content || '';
        }
        
        const errorText = await response.text();
        console.log('Sarvam API error:', response.status, errorText);
        
        if (response.status === 429) {
          console.log('Sarvam rate limited, trying Groq...');
        }
      } catch (err) {
        console.log('Sarvam failed:', err);
      }
    }

    // Fallback to Groq
    if (getGroqApiKey()) {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getGroqApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.log('Groq API error:', response.status, error);
        if (response.status === 429) {
          throw new Error("We're experiencing a lot of demand. Please try again in a bit.");
        }
        throw new Error(`Groq API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      console.log('Groq API response:', data);
      return data.choices[0]?.message?.content || '';
    }

    throw new Error('Backend issue with API, kindly contact support for a fix.');
  };

  return tryApis();
}

export async function* streamChatMessage(
  messages: ChatMessage[],
  employeeData: Record<string, unknown>[],
  options: GroqChatOptions = {}
): AsyncGenerator<string> {
  const { model = 'llama-3.1-8b-instant', temperature = 0.3 } = options;

  const systemMessage: ChatMessage = {
    role: 'system',
    content: buildSystemPrompt(employeeData),
  };

  const apiMessages = [
    systemMessage,
    ...messages.map(({ role, content }) => ({ role, content }))
  ];

  let response: Response;

  // Try Sarvam first
  if (getSarvamApiKey()) {
    try {
      response = await fetch(SARVAM_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getSarvamApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sarvam-m',
          messages: apiMessages,
          temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.log('Sarvam rate limited, trying Groq...');
        } else {
          console.log('Sarvam API error:', response.status);
        }
      }
    } catch (err) {
      console.log('Sarvam failed:', err);
      response = null as unknown as Response;
    }
  } else {
    response = null as unknown as Response;
  }

  // Fallback to Groq if Sarvam failed
  if (!response || !response.ok) {
    if (!getGroqApiKey()) {
      throw new Error('Backend issue with API, kindly contact support for a fix.');
    }

    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getGroqApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      if (response.status === 429) {
        throw new Error("We're experiencing a lot of demand. Please try again in a bit.");
      }
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  if (!reader) {
    throw new Error('No response body');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }
}

export function parseGenerationResponse(content: string): { templateId: string; data: Record<string, string> } | null {
  const match = content.match(/GENERATE_DOCUMENT:([^:]+):(.+)/);
  if (!match) return null;

  try {
    return {
      templateId: match[1],
      data: JSON.parse(match[2]),
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
