import { getTemplatesWithFields } from '@/config/documentConfigs';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface GroqChatOptions {
  model?: 'groq/compound' | 'groq/compound-mini' | 'llama-3.1-8b-instant' | 'llama-3.3-70b-versatile' | 'mixtral-8x7b-32768';
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }
  return apiKey;
}

function buildSystemPrompt(employeeData: Record<string, unknown>[], contextCountry?: string): string {
  const templates = getTemplatesWithFields();
  
  let prompt = `You are Certifyr AI Assistant, an intelligent document generation assistant.

You help users create certificates and documents by extracting information from employee data or asking for missing details.

AVAILABLE TEMPLATES AND THEIR FIELDS:
${templates.map(t => `- ${t.name} (${t.id}): Required fields: ${t.requiredFields.join(', ')}`).join('\n')}

`;

  if (employeeData.length > 0) {
    prompt += `EMPLOYEE DATA AVAILABLE (${employeeData.length} records):
${JSON.stringify(employeeData.slice(0, 10), null, 2)}
(Showing first 10 records)
`;
  } else {
    prompt += `NO EMPLOYEE DATA UPLOADED. You can ask the user to upload employee data in the Organization > Data tab, or collect all information manually.
`;
  }

  if (contextCountry && contextCountry !== 'global') {
    prompt += `\nDOCUMENT CONTEXT: The organization follows ${contextCountry} legal requirements and document formats.
`;
  }

  prompt += `
INSTRUCTIONS:
1. When user asks to create a document, identify which template they want from their message
2. Search the employee data for the person (exact match on name or ID first, then partial match)
3. List which fields can be auto-filled from the data
4. Ask specifically for any missing required fields
5. Once all required data is collected, respond with exactly this format:
   GENERATE_DOCUMENT:{templateId}:{"field1":"value1","field2":"value2",...}
6. Be concise. No fluff. Ask direct questions for missing info.
7. If no employee data is available, ask for all required fields manually.
`;

  return prompt;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  employeeData: Record<string, unknown>[],
  options: GroqChatOptions = {}
): Promise<string> {
  const { model = 'groq/compound', temperature = 0.3, maxTokens = 1024 } = options;

  const templates = getTemplatesWithFields();
  const systemMessage: ChatMessage = {
    role: 'system',
    content: buildSystemPrompt(employeeData),
  };

  const apiMessages = [
    systemMessage,
    ...messages.map(({ role, content }) => ({ role, content }))
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
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
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function* streamChatMessage(
  messages: ChatMessage[],
  employeeData: Record<string, unknown>[],
  options: GroqChatOptions = {}
): AsyncGenerator<string> {
  const { model = 'groq/compound', temperature = 0.3 } = options;

  const systemMessage: ChatMessage = {
    role: 'system',
    content: buildSystemPrompt(employeeData),
  };

  const apiMessages = [
    systemMessage,
    ...messages.map(({ role, content }) => ({ role, content }))
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
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
    throw new Error(`Groq API error: ${response.status} - ${error}`);
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
