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
    const sampleSize = Math.min(employeeData.length, 20);
    const employeeJson = JSON.stringify(employeeData.slice(0, sampleSize), null, 2);
    prompt += `EMPLOYEE DATA AVAILABLE (${employeeData.length} total records - showing first ${sampleSize}):
${employeeJson}

CRITICAL FIELD MAPPING - USE THESE EXACT MAPPINGS:
Look for these field names in the JSON (they may have different case/spacing):
- gender: "gender", "Gender", "sex"
- type/person type: "type", "personType", "person_type", "role", "category"
- parent name: "parentName", "parent_name", "parentName", "fatherName", "father_name", "guardianName"
- full name: "name", "fullName", "full_name", "employeeName", "studentName"
- date of birth: "dob", "dateOfBirth", "date_of_birth", "birthDate", "birth_date"
- department: "department", "dept", "Department"
- designation: "designation", "role", "position", "jobTitle"

When you find a person, list ALL their known fields in "Known Information" section.
Only put fields in "Missing Information" if they are truly NOT in the JSON data.
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
CRITICAL INSTRUCTIONS:
1. ALWAYS search the employee JSON data first for the person's information
2. If person is found in data, use ALL their field values - DO NOT ask for them again
3. Only ask for fields that are actually missing from the JSON
4. When you have ALL required fields, generate the document IMMEDIATELY - NO confirmation, NO extra text
5. If user provides purpose/intent in the same message (e.g. "for bank account"), extract it and generate immediately

FOR BONAFIDE CERTIFICATE, these fields are NEEDED:
- fullName (from "name" or "fullName" in data)
- gender (from "gender" field in data) 
- type (person type: "student" or "employee")
- parentName (from "parentName", "parent_name", "fatherName" in data)
- institutionName (use org name)
- institutionAddress (use org address)
- course (from "course", "class", "standard" in data)
- purpose (if not in data, extract from user message like "for [purpose]")
- date (use current date)

If gender, type, parentName, course ARE in the employee data, put them in Known Information and DON'T ask for them.

ONLY put in Missing Information if the field is truly NOT found in the employee JSON.

### Known Information
- Name: [value from JSON or "Not provided"]
- Gender: [value from JSON - if exists, show it]
- Type: [value from JSON - if exists, show it]
- Parent Name: [value from JSON - if exists, show it]
- Course: [value from JSON - if exists, show it]
- Department: [value from JSON - if exists, show it]
- Designation: [value from JSON - if exists, show it]

### Missing Information
- [ONLY list fields that are NOT in the employee data JSON]

REQUIRED FIELD FORMATS - USE THESE EXACT VALUES:
- Gender MUST be lowercase: use "male", "female", or "other" (NOT "Male", "Female", etc.)
- Person Type MUST be lowercase: use "student" or "employee" (NOT "Student", "Employee", etc.)
- All text fields should be proper case

EXAMPLE CORRECT FLOW:
- User: "Create bonafide for John"
- AI searches employee data and finds John with all needed fields
- AI immediately generates the document:
GENERATE_DOCUMENT:bonafide:{"fullName":"John","gender":"male","type":"student","parentName":"Thomas","institutionName":"ABC School","institutionAddress":"123 School St","course":"Class 10","purpose":"for bank account","date":"15/01/2025"}

IF USER SAYS "for bank account" IN SAME MESSAGE:
- User: "Create bonafide for John for bank account"
- AI finds all fields from JSON + purpose from user message
- AI immediately generates:
GENERATE_DOCUMENT:bonafide:{"fullName":"John","gender":"male","type":"student","parentName":"Thomas","institutionName":"ABC School","institutionAddress":"123 School St","course":"Class 10","purpose":"for bank account","date":"15/01/2025"}

EXAMPLE - WHEN FIELDS ARE MISSING:
- User: "Create bonafide for John"
- AI finds John but parentName is missing from data
- AI responds with ONLY:
### Known Information
- Name: John
- Gender: male

### Missing Information
- Parent Name: 

THEN when user provides "parentName", AI generates immediately - NO confirmation needed.

EXAMPLE INCORRECT FLOW (DO NOT DO THIS):
- AI: "Is this correct?" (WRONG - don't ask for confirmation)
- AI: "Shall I proceed?" (WRONG - just generate)
- AI asking for fields that exist in data (WRONG)

8. When ALL required fields are available, respond with ONLY:
   GENERATE_DOCUMENT:{templateId}:{"field1":"value1","field2":"value2",...}
   Use lowercase for gender ("male"/"female"/"other") and type ("student"/"employee")
   DO NOT add any other text - just the GENERATE_DOCUMENT line
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
  issueDate?: string,
  contextCountry?: string
): Promise<string> {
  const { model = getModel(), temperature = 0.3, maxTokens = 1024 } = options;

  const templates = getTemplatesWithFields();
  const systemMessage: ChatMessage = {
    role: 'system',
    content: buildSystemPrompt(employeeData, contextCountry, orgInfo, issueDate),
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
          // Fall through to Groq
        } else {
          console.log('Sarvam error, falling back to Groq...');
          // Fall through to Groq for any error
        }
      } catch (err) {
        console.log('Sarvam failed, trying Groq:', err);
        // Continue to Groq fallback
      }
    }

    // Fallback to Groq - use correct model for Groq
    if (getGroqApiKey()) {
      const groqModel = 'llama-3.1-8b-instant';
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getGroqApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModel,
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
  options: GroqChatOptions = {},
  orgInfo?: OrgInfo,
  issueDate?: string,
  contextCountry?: string
): AsyncGenerator<string> {
  const { model = 'llama-3.1-8b-instant', temperature = 0.3 } = options;

  const systemMessage: ChatMessage = {
    role: 'system',
    content: buildSystemPrompt(employeeData, contextCountry, orgInfo, issueDate),
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

    const groqModel = 'llama-3.1-8b-instant';
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getGroqApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: groqModel,
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
  // Find GENERATE_DOCUMENT anywhere in the response
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
