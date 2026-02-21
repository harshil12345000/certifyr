import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface OrgInfo {
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

interface TemplateInfo {
  id: string;
  name: string;
  requiredFields: string[];
}

// ─── Employee search helpers ───

function getNameFromRecord(record: Record<string, unknown>): string {
  const nameFields = ["name", "fullName", "full_name", "employeeName", "studentName", "Name", "FullName", "FULL NAME", "Full Name", "full name"];
  for (const field of nameFields) {
    const val = record[field];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

function getIdFromRecord(record: Record<string, unknown>): string {
  const idFields = ["employeeId", "employee_id", "id", "ID", "studentId", "student_id", "Employee ID", "Student ID", "emp_id", "roll_number", "rollNumber"];
  for (const field of idFields) {
    if (record[field] !== undefined && record[field] !== null) return String(record[field]);
  }
  return "";
}

function getDeptFromRecord(record: Record<string, unknown>): string {
  const deptFields = ["department", "Department", "dept", "course", "Course", "DEPARTMENT"];
  for (const field of deptFields) {
    if (typeof record[field] === "string") return record[field] as string;
  }
  return "";
}

/**
 * Search employee records for a name match.
 * Uses flexible partial matching on any name-like field.
 */
function searchEmployeeByName(
  employeeData: Record<string, unknown>[],
  searchName: string
): { type: "exact"; record: Record<string, unknown> }
  | { type: "disambiguate"; matches: Record<string, unknown>[] }
  | { type: "none" } {
  if (!searchName || employeeData.length === 0) return { type: "none" };

  const search = searchName.toLowerCase().trim();
  if (search.length < 2) return { type: "none" };

  const matches = employeeData.filter((record) => {
    const name = getNameFromRecord(record).toLowerCase();
    if (!name) return false;
    // Match if the search term is contained in the name OR the name contains the search
    return name.includes(search) || search.includes(name);
  });

  if (matches.length === 1) {
    return { type: "exact", record: matches[0] };
  } else if (matches.length > 1) {
    return { type: "disambiguate", matches };
  }
  return { type: "none" };
}

/**
 * Extract a person name from the user message.
 * Much more flexible than before — handles many patterns.
 */
function extractNameFromMessage(message: string, hasEmployeeData: boolean): string | null {
  if (!hasEmployeeData) return null;

  const lowerMsg = message.toLowerCase();

  // Skip messages that are clearly answers to questions (not name lookups)
  const answerPatterns = [
    /^(passport|visa|bank|loan|education|employment|travel|admission|scholarship|verification|proof|legal|personal|official)/i,
    /^(yes|no|ok|okay|sure|done|thanks|thank you|correct|right|wrong|exactly)/i,
    /^(the purpose|purpose is|for |it'?s for|i need it for)/i,
  ];
  for (const pattern of answerPatterns) {
    if (pattern.test(message.trim())) return null;
  }

  // Pattern 1: "for <Name>" or "of <Name>"
  const forOfMatch = message.match(/(?:for|of)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/);
  if (forOfMatch) return forOfMatch[1].trim();

  // Pattern 2: "certificate/bonafide/document ... <Name>" at end
  const docNameMatch = message.match(
    /(?:certificate|bonafide|letter|document|noc|offer|experience|transfer|transcript|nda|agreement)\s+(?:for|of|to)\s+(.+?)(?:\.|,|$)/i
  );
  if (docNameMatch) return docNameMatch[1].trim();

  // Pattern 3: Explicit name mention with "create/generate/make" + name
  const createMatch = message.match(/(?:create|generate|make|prepare|issue|draft)\s+(?:\w+\s+){0,3}(?:for|of)\s+(.+?)(?:\.|,|$)/i);
  if (createMatch) return createMatch[1].trim();

  // Pattern 4: "I'm referring to <Name>" (disambiguation follow-up)
  const referMatch = message.match(/(?:i'?m\s+referring\s+to|i\s+mean|it'?s)\s+(.+?)(?:\s*\(|$)/i);
  if (referMatch) return referMatch[1].trim();

  // Pattern 5: Just a name by itself (capitalized words, 1-4 words)
  const standaloneNameMatch = message.trim().match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3})$/);
  if (standaloneNameMatch) return standaloneNameMatch[1].trim();

  // Pattern 6: Message contains a capitalized name (2+ chars) anywhere — only if short message
  if (message.trim().split(/\s+/).length <= 6) {
    const capitalMatch = message.match(/\b([A-Z][a-z]{1,}(?:\s+[A-Z][a-z]+)*)\b/);
    if (capitalMatch) {
      const candidate = capitalMatch[1];
      // Filter out common words that aren't names
      const nonNames = new Set(["The", "This", "That", "What", "When", "Where", "How", "Who", "Please", "Thank", "Thanks", "Hello", "Create", "Generate", "Make", "Issue", "Draft", "Prepare", "Send", "Get", "Give", "Show", "List", "Find", "Search", "Known", "Missing", "Information", "Certificate", "Document", "Letter", "Bonafide"]);
      if (!nonNames.has(candidate)) return candidate;
    }
  }

  return null;
}

// ─── System prompt builder ───

function buildSystemPrompt(
  employeeRecord: Record<string, unknown> | null,
  allEmployeeCount: number,
  templates: TemplateInfo[],
  contextCountry: string | undefined,
  orgInfo: OrgInfo | undefined,
  issueDate: string | undefined,
): string {
  let prompt = `You are Certifyr AI Assistant, an intelligent document generation assistant for organizations. You help users create certificates and official documents by using employee/student data that is already available in the system.\n\n`;

  // Organization info
  if (orgInfo) {
    prompt += `ORGANIZATION DETAILS (pre-filled, use when generating documents but do NOT show in Known Information):
- Organization Name: ${orgInfo.name}
- Place/Location: ${orgInfo.place || orgInfo.organizationLocation || "N/A"}
- Address: ${orgInfo.address || "N/A"}
- Email: ${orgInfo.email || "N/A"}
- Phone: ${orgInfo.phone || "N/A"}
- Organization Type: ${orgInfo.organizationType || "N/A"}
- Signatory Name: ${orgInfo.signatoryName || "N/A"}
- Signatory Designation: ${orgInfo.signatoryDesignation || "N/A"}

`;
  }

  prompt += `AVAILABLE DOCUMENT TEMPLATES:\n`;
  for (const t of templates) {
    prompt += `- ${t.name} (ID: ${t.id}): Fields: ${t.requiredFields.join(", ")}\n`;
  }
  prompt += `\n`;

  if (employeeRecord) {
    prompt += `MATCHED EMPLOYEE/STUDENT RECORD (verified from database - use EXACTLY as shown):\n`;
    prompt += JSON.stringify(employeeRecord, null, 2);
    prompt += `\n\nThis is the EXACT record from the database. Use ONLY these values. Do NOT modify, guess, or infer any values.\n\n`;
  } else if (allEmployeeCount > 0) {
    prompt += `There are ${allEmployeeCount} employee/student records in the database. When the user mentions a person's name, the system automatically looks up the exact record. If no record is shown above, ask the user for the person's name so we can look them up.\n\n`;
  } else {
    prompt += `NO EMPLOYEE/STUDENT DATA UPLOADED. Collect all information manually from the user.\n\n`;
  }

  if (contextCountry && contextCountry !== "global") {
    prompt += `DOCUMENT CONTEXT: Follow ${contextCountry} legal requirements and document formats.\n`;
  }

  if (issueDate) {
    prompt += `TODAY'S DATE: ${issueDate} (use for Issue Date / Date fields)\n`;
  }

  prompt += `
CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY:

1. ALWAYS check the employee/student data above FIRST. All information about the employee/student is already there.
2. If the employee/student record exists in the data, use their information directly. DO NOT ask for fields that already exist in the data.
3. ONLY ask for missing fields that are NOT in the employee/student data (e.g., purpose, reason, custom fields).
4. The employee/student data may contain: name, id, email, phone, department, designation, gender, date of birth, course, year, joining date, parent name, address, etc.
5. When the user asks for a document, use the matched employee/student data and auto-fill as many fields as possible.
6. Do NOT ask for: name, email, phone, department, designation, gender, date of birth, parent name, employee ID, student ID, course, etc. if they exist in the data.
7. Only ask for: purpose (why they need the document), or other custom fields not in the data.

RESPONSE FORMAT when you have employee/student data:

### Known Information
- **Full Name**: [exact value from data]
- **Gender**: [value]
- **Date of Birth**: [value in DD/MM/YYYY]
- **Department**: [value]
(list ALL employee/student fields found - NOT organization/signatory details)

### Missing Information
1. **Purpose**: What is the purpose of this certificate?
(list ONLY fields that are required for the template but missing from data)

IMPORTANT RULES FOR Known Information:
- ONLY list employee/student-specific fields: name, gender, parent name, course, department, designation, dates, employee ID, student ID, etc.
- Do NOT list: organization name, signatory name, signatory designation, place, email, phone, address (these are pre-filled from org data).

EXAMPLE CORRECT FLOW:
User: "Create bonafide for John"
AI finds John in data with: name=John Smith, department=IT, designation=Developer, gender=male, dob=15/03/1995
AI responds:
"I found John Smith's information:

### Known Information
- **Full Name**: John Smith
- **Gender**: male
- **Department**: IT
- **Designation**: Developer
- **Date of Birth**: 15/03/1995

### Missing Information
1. **Purpose**: What is the purpose of this bonafide certificate?
2. **Person Type**: Is John a student or employee?

EXAMPLE INCORRECT FLOW (DO NOT DO THIS):
- AI: "What is John's full name?" (WRONG - name is already in the data)
- AI: "What is John's department?" (WRONG - department is in the data)

8. When ALL required fields are collected, respond with EXACTLY this format on its own line:
   GENERATE_DOCUMENT:{templateId}:{"field1":"value1","field2":"value2",...}

9. If NO employee/student data is available and no record was matched, ask for all required fields manually. Collect ALL missing fields IN ONE MESSAGE.

10. DATE FORMAT: Always use DD/MM/YYYY (e.g., 21/02/2026). Convert any date from the data to this format.

11. ISSUE DATE: For "Date of Issue", "Issue Date", "Current Date" fields - ALWAYS use today's date (${issueDate || "user's local date"}) in DD/MM/YYYY format. Do NOT ask the user for this.

13. GENDER: Always use lowercase: "male", "female", or "other".

14. TYPE: Always use lowercase: "student" or "employee".

15. Format field names nicely in your responses (e.g., "Full Name" not "fullName", "Date of Birth" not "dateOfBirth").

16. CRITICAL: Do NOT assume or guess fields like "purpose", "reason", etc. If the user did not specify these, ASK them explicitly.

17. Ask for ALL missing required fields IN ONE MESSAGE. Do NOT ask one field at a time across multiple messages.

18. UNDERSTANDING USER REPLIES: When the user replies to your questions (e.g., you asked "What is the purpose?" and they say "passport"), understand that their reply is an ANSWER to your question, NOT a new document request or name lookup. Only treat a message as a new request if they explicitly mention creating/generating a document or certificate.

19. DATE FIELD MAPPING from employee/student data JSON keys:
    - startDate: "startDate", "start_date", "DateOfJoining", "date_of_joining", "joiningDate", "doj", "DOJ", "Joining Date"
    - dateOfBirth: "dateOfBirth", "date_of_birth", "dob", "DOB", "birthDate", "Date of Birth"
    - endDate: "endDate", "end_date", "DateOfLeaving", "date_of_leaving", "Relieving Date"

20. NAME FIELDS: "name", "fullName", "full_name", "employeeName", "studentName", "Name", "Full Name", "FULL NAME"
21. PARENT NAME: "parentName", "parent_name", "fatherName", "father_name", "guardianName", "Father Name", "Parent Name"
22. GENDER: "gender", "Gender", "sex"
23. ID FIELDS: "employeeId", "employee_id", "studentId", "student_id", "ID", "Employee ID", "Student ID", "roll_number"

24. For BONAFIDE CERTIFICATE - ALL REQUIRED: fullName, gender, type, parentName, course/courseOrDesignation, purpose, date, institutionName, startDate, department, place, signatoryName, signatoryDesignation
    - Organization name, place, signatory details are auto-filled from org data
    - Employee/student-specific fields come from the matched record
    - Only "purpose" and possibly "type" (student/employee) typically need to be asked

25. ALWAYS use the FULL NAME from the data. Never abbreviate or use only first names.

26. If you have all the information needed (from data + user input + org info), generate the document immediately without asking unnecessary follow-up questions.
`;

  return prompt;
}

// ─── Main handler ───

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      messages,
      orgInfo,
      contextCountry,
      issueDate,
      organizationId,
      templates,
      employeeCount,
      action,
    } = body;

    // ─── Title generation ───
    if (action === "generate_title") {
      const userMessage = body.userMessage || "";
      const titlePrompt = `Generate a concise 4-5 word title for a chat conversation that starts with this message: "${userMessage}". Return ONLY the title, nothing else. No quotes, no punctuation at the end.`;

      const groqKey = Deno.env.get("GROQ_API_KEY");
      const sarvamKey = Deno.env.get("SARVAM_API_KEY");
      const apiKey = sarvamKey || groqKey;
      const apiUrl = sarvamKey ? SARVAM_API_URL : GROQ_API_URL;
      const model = sarvamKey ? "sarvam-m" : "llama-3.1-8b-instant";

      if (!apiKey) {
        return new Response(JSON.stringify({ title: "New Chat" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const resp = await fetch(apiUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: [{ role: "user", content: titlePrompt }], temperature: 0.5, max_tokens: 20 }),
        });
        if (resp.ok) {
          const data = await resp.json();
          const title = (data.choices?.[0]?.message?.content || "New Chat").trim().replace(/^["']+|["']+$/g, "");
          return new Response(JSON.stringify({ title }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch { /* fall through */ }

      return new Response(JSON.stringify({ title: "New Chat" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Main chat logic ───

    // Step 1: Load all employee data for this org
    let allEmployees: Record<string, unknown>[] = [];
    if (organizationId) {
      const serviceClient = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const { data: records } = await serviceClient
        .from("organization_data_records")
        .select("data")
        .eq("organization_id", organizationId);

      if (records) {
        for (const record of records) {
          if (record.data) {
            if (Array.isArray(record.data)) {
              allEmployees.push(...record.data);
            } else if (typeof record.data === "object") {
              allEmployees.push(record.data as Record<string, unknown>);
            }
          }
        }
      }
    }

    // Step 2: Check if user mentions a name — do precise lookup
    let employeeRecord: Record<string, unknown> | null = null;
    let disambiguateMatches: Record<string, unknown>[] | null = null;

    if (allEmployees.length > 0 && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
      if (lastUserMsg) {
        const searchName = extractNameFromMessage(lastUserMsg.content, true);
        if (searchName) {
          console.log(`[ai-chat] Searching for name: "${searchName}" in ${allEmployees.length} records`);
          const result = searchEmployeeByName(allEmployees, searchName);
          if (result.type === "exact") {
            employeeRecord = result.record;
            console.log(`[ai-chat] Exact match found: ${getNameFromRecord(result.record)}`);
          } else if (result.type === "disambiguate") {
            disambiguateMatches = result.matches;
            console.log(`[ai-chat] Multiple matches found: ${result.matches.length}`);
          } else {
            console.log(`[ai-chat] No matches found for "${searchName}"`);
          }
        }
      }
    }

    // Step 3: Return disambiguation if multiple matches
    if (disambiguateMatches && disambiguateMatches.length > 1) {
      const matchList = disambiguateMatches.map((m) => ({
        name: getNameFromRecord(m),
        id: getIdFromRecord(m),
        department: getDeptFromRecord(m),
      }));

      return new Response(
        JSON.stringify({
          type: "disambiguate",
          matches: matchList,
          message: `DISAMBIGUATE:${JSON.stringify(matchList)}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Build system prompt with single matched record
    const systemPrompt = buildSystemPrompt(
      employeeRecord,
      employeeCount || allEmployees.length || 0,
      templates || [],
      contextCountry,
      orgInfo,
      issueDate,
    );

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Step 5: Call AI API
    const sarvamKey = Deno.env.get("SARVAM_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");
    let aiResponse = "";

    // Try Sarvam first
    if (sarvamKey) {
      try {
        const resp = await fetch(SARVAM_API_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${sarvamKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "sarvam-m", messages: apiMessages, temperature: 0.3, max_tokens: 1500 }),
        });
        if (resp.ok) {
          const data = await resp.json();
          aiResponse = data.choices?.[0]?.message?.content || "";
        } else {
          console.log("Sarvam error:", resp.status, await resp.text());
        }
      } catch (err) {
        console.log("Sarvam failed:", err);
      }
    }

    // Fallback to Groq
    if (!aiResponse && groqKey) {
      const resp = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: apiMessages, temperature: 0.3, max_tokens: 1500 }),
      });
      if (resp.ok) {
        const data = await resp.json();
        aiResponse = data.choices?.[0]?.message?.content || "";
      } else {
        const errText = await resp.text();
        console.error("Groq error:", resp.status, errText);
        if (resp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ error: `AI API error: ${resp.status}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: "No AI API key configured. Contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ type: "response", message: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
