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

/**
 * Search employee records for a name match.
 * Returns { type: "exact", record } | { type: "disambiguate", matches } | { type: "none" }
 */
function searchEmployeeByName(
  employeeData: Record<string, unknown>[],
  searchName: string
): { type: "exact"; record: Record<string, unknown> }
  | { type: "disambiguate"; matches: Record<string, unknown>[] }
  | { type: "none" } {
  if (!searchName || employeeData.length === 0) {
    return { type: "none" };
  }

  const search = searchName.toLowerCase().trim();

  // Find all matches (partial name matching)
  const matches = employeeData.filter((record) => {
    const nameFields = ["name", "fullName", "full_name", "employeeName", "studentName", "Name", "FullName"];
    for (const field of nameFields) {
      const val = record[field];
      if (typeof val === "string" && val.toLowerCase().includes(search)) {
        return true;
      }
    }
    return false;
  });

  if (matches.length === 1) {
    return { type: "exact", record: matches[0] };
  } else if (matches.length > 1) {
    return { type: "disambiguate", matches };
  }
  return { type: "none" };
}

/**
 * Extract a person name from the user message for lookup.
 */
function extractNameFromMessage(message: string): string | null {
  // Common patterns: "create bonafide for John Smith", "generate certificate for Emma"
  const patterns = [
    /(?:for|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /(?:certificate|bonafide|letter|document|noc|offer|experience|transfer|transcript|nda|agreement)\s+(?:for|of)\s+(.+?)(?:\.|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function buildSystemPrompt(
  employeeRecord: Record<string, unknown> | null,
  allEmployeeCount: number,
  templates: TemplateInfo[],
  contextCountry: string | undefined,
  orgInfo: OrgInfo | undefined,
  issueDate: string | undefined,
): string {
  let prompt = `You are Certifyr AI Assistant, an intelligent document generation assistant.

You help users create certificates and documents by extracting information from employee data or asking for missing details.

`;

  // Organization info (NOT shown in Known Information cards)
  if (orgInfo) {
    prompt += `ORGANIZATION DETAILS (these are pre-filled, do NOT list in Known Information):
- Organization Name: ${orgInfo.name}
- Organization Place/Location: ${orgInfo.place || orgInfo.organizationLocation || "N/A"}
- Organization Address: ${orgInfo.address}
- Organization Email: ${orgInfo.email}
- Organization Phone: ${orgInfo.phone}
- Organization Type: ${orgInfo.organizationType || "N/A"}
- Signatory Name (Admin): ${orgInfo.signatoryName}
- Signatory Designation: ${orgInfo.signatoryDesignation}

USE THESE VALUES WHEN GENERATING DOCUMENTS but do NOT display them in Known Information section.

`;
  }

  prompt += `AVAILABLE TEMPLATES AND THEIR FIELDS:
${templates.map((t) => `- ${t.name} (${t.id}): Required fields: ${t.requiredFields.join(", ")}`).join("\n")}

`;

  if (employeeRecord) {
    const employeeJson = JSON.stringify(employeeRecord, null, 2);
    prompt += `MATCHED EMPLOYEE RECORD (verified from database):
${employeeJson}

THIS IS THE EXACT RECORD FROM THE DATABASE. Use ONLY these values. Do NOT modify, guess, or infer any values.
Every field you see here is confirmed accurate. Use them exactly as shown.

`;
  } else if (allEmployeeCount > 0) {
    prompt += `There are ${allEmployeeCount} employee/student records in the database. When the user mentions a name, the system will automatically look up the exact record. If no data is provided here, ask the user for the person's name to look up.

`;
  } else {
    prompt += `NO EMPLOYEE DATA UPLOADED. Collect all information manually from the user.

`;
  }

  if (contextCountry && contextCountry !== "global") {
    prompt += `DOCUMENT CONTEXT: Follow ${contextCountry} legal requirements and document formats.\n`;
  }

  if (issueDate) {
    prompt += `CURRENT DATE: ${issueDate} (use for Date/Issue Date fields)\n`;
  }

  prompt += `
CRITICAL INSTRUCTIONS:

1. RESPONSE FORMAT for showing employee data:
   When you have found employee data, format your response with these EXACT markdown headers:

   ### Known Information
   - **Full Name**: [value]
   - **Gender**: [value]
   - **Date of Birth**: [value in DD/MM/YYYY]
   (list ONLY employee/student fields - NOT organization details)

   ### Missing Information
   - **Purpose**: Please provide the purpose of this certificate
   - **Course**: What course/program?
   (list fields that are required but not in the data)

2. In Known Information, ONLY list employee/student-specific fields:
   name, gender, parent name, course, department, designation, dates, employee ID, etc.
   Do NOT list: organization name, signatory name, signatory designation, place, email, phone.

3. DATE FORMAT: Always use DD/MM/YYYY (e.g., 21/02/2026).
4. GENDER: Always lowercase: "male", "female", or "other".
5. TYPE: Always lowercase: "student" or "employee".

6. DO NOT GENERATE DOCUMENT until ALL required template fields have values.
   If ANY field is missing, ask for it.

7. When ALL fields are ready, respond with:
   GENERATE_DOCUMENT:{templateId}:{"field1":"value1","field2":"value2"}

8. DATE FIELD MAPPING from JSON:
   - startDate: "startDate", "start_date", "DateOfJoining", "date_of_joining", "joiningDate", "doj", "DOJ"
   - dateOfBirth: "dateOfBirth", "date_of_birth", "dob", "DOB", "birthDate"
   - endDate: "endDate", "end_date", "DateOfLeaving", "date_of_leaving"

9. GENDER FIELD MAPPING: "gender", "Gender", "sex"
10. NAME FIELDS: "name", "fullName", "full_name", "employeeName", "studentName"
11. PARENT NAME: "parentName", "parent_name", "fatherName", "father_name", "guardianName"

FOR BONAFIDE CERTIFICATE - ALL REQUIRED: fullName, gender, type, parentName, course, purpose, date
`;

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
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

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
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

    // Handle title generation request
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

      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: titlePrompt }],
          temperature: 0.5,
          max_tokens: 20,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const title = (data.choices?.[0]?.message?.content || "New Chat").trim().replace(/["'.]+$/g, "");
        return new Response(JSON.stringify({ title }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ title: "New Chat" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Main chat logic
    // Step 1: If user mentions a name, do precise employee lookup
    let employeeRecord: Record<string, unknown> | null = null;
    let disambiguateMatches: Record<string, unknown>[] | null = null;

    if (organizationId && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
      if (lastUserMsg) {
        const searchName = extractNameFromMessage(lastUserMsg.content);
        if (searchName) {
          // Fetch employee data from DB server-side
          const serviceClient = createClient(
            supabaseUrl,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          );

          const { data: records } = await serviceClient
            .from("organization_data_records")
            .select("data")
            .eq("organization_id", organizationId);

          const allEmployees: Record<string, unknown>[] = [];
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

          const result = searchEmployeeByName(allEmployees, searchName);
          if (result.type === "exact") {
            employeeRecord = result.record;
          } else if (result.type === "disambiguate") {
            disambiguateMatches = result.matches;
          }
        }
      }
    }

    // If multiple matches, return disambiguation response
    if (disambiguateMatches && disambiguateMatches.length > 1) {
      const nameField = (r: Record<string, unknown>) => {
        for (const f of ["name", "fullName", "full_name", "employeeName", "studentName", "Name"]) {
          if (typeof r[f] === "string") return r[f] as string;
        }
        return "Unknown";
      };
      const idField = (r: Record<string, unknown>) => {
        for (const f of ["employeeId", "employee_id", "id", "ID", "studentId", "student_id"]) {
          if (r[f] !== undefined) return String(r[f]);
        }
        return "";
      };
      const deptField = (r: Record<string, unknown>) => {
        for (const f of ["department", "Department", "dept", "course", "Course"]) {
          if (typeof r[f] === "string") return r[f] as string;
        }
        return "";
      };

      const matchList = disambiguateMatches.map((m) => ({
        name: nameField(m),
        id: idField(m),
        department: deptField(m),
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

    // Build system prompt with the single matched record
    const systemPrompt = buildSystemPrompt(
      employeeRecord,
      employeeCount || 0,
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

    // Call AI API
    const sarvamKey = Deno.env.get("SARVAM_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");

    let aiResponse = "";

    // Try Sarvam first
    if (sarvamKey) {
      try {
        const resp = await fetch(SARVAM_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sarvamKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sarvam-m",
            messages: apiMessages,
            temperature: 0.3,
            max_tokens: 1024,
          }),
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
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: apiMessages,
          temperature: 0.3,
          max_tokens: 1024,
        }),
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
