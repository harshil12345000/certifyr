import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface FieldInfo {
  name: string;
  label: string;
  type: string;
  required: boolean;
  pdf_field_mapping: string | null;
}

interface RequestBody {
  fields: FieldInfo[];
  current_data: Record<string, string>;
  document_name: string;
  authority: string;
  country: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fields, current_data, document_name, authority, country }: RequestBody = await req.json();

    if (!fields || fields.length === 0) {
      return new Response(
        JSON.stringify({ error: "Fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a mapping context from user-entered data and field definitions
    const fieldDescriptions = fields
      .map((f) => {
        const mapping = f.pdf_field_mapping ? ` (PDF mapping: "${f.pdf_field_mapping}")` : "";
        return `- "${f.name}" (label: "${f.label}", type: ${f.type}, ${f.required ? "required" : "optional"})${mapping}`;
      })
      .join("\n");

    const currentDataEntries = Object.entries(current_data)
      .filter(([_, v]) => v && v.toString().trim())
      .map(([k, v]) => `- ${k}: "${v}"`)
      .join("\n");

    const systemPrompt = `You are an expert at filling government and legal forms. You help auto-complete form fields ONLY when the value is definitively known from the context.

Document: ${document_name}
Authority: ${authority}
Country: ${country}

Form fields:
${fieldDescriptions}

User's already-entered data:
${currentDataEntries || "(No data entered yet)"}

Instructions:
- Only fill fields with values that are DEFINITIVELY known from the document context, authority, or country — never guess or infer.
- For fields like "country", if the document is for India, fill with "India".
- For fields like "state", if the state is known from authority or country context, fill it.
- For ALL other fields (name, address, ID numbers, dates, purpose, subject, place of issue, jurisdiction, etc.) — leave them as empty string "".
- Do NOT provide typical/common values — leave them empty for the user to fill.
- Return ONLY a valid JSON object mapping field names to suggested values.
- Use the exact field names from the fields list as keys.
- Do NOT include any text outside the JSON object.`;

    const userMessage = `Based on the document "${document_name}" from ${authority} (${country}), ONLY fill in values that are DEFINITIVELY known (like country = "${country}"). Leave all other fields empty. Return as JSON.`;

    const sarvamKey = Deno.env.get("SARVAM_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");
    let aiResponse = "";

    // Try Sarvam first (better for Indian documents)
    if (sarvamKey) {
      try {
        const resp = await fetch(SARVAM_API_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${sarvamKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sarvam-m",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage }
            ],
            temperature: 0.1,
            max_tokens: 2000
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
      try {
        const resp = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage }
            ],
            temperature: 0.1,
            max_tokens: 2000
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
        }
      } catch (err) {
        console.error("Groq failed:", err);
      }
    }

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: "No AI API key configured or all providers failed." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from AI
    let filledFields: Record<string, string> = {};
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        filledFields = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr, "Raw:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", filled_fields: {} }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter: only return fields that exist in the original field list
    // and only for fields the user hasn't already filled
    const validFieldNames = new Set(fields.map(f => f.name));
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(filledFields)) {
      if (validFieldNames.has(key) && value && value.toString().trim()) {
        // Don't overwrite user-entered data
        if (!current_data[key] || !current_data[key].toString().trim()) {
          filtered[key] = value.toString();
        }
      }
    }

    return new Response(
      JSON.stringify({ filled_fields: filtered }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
