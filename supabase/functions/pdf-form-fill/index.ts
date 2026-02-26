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
}

interface RequestBody {
  pdf_url: string;
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
    const { pdf_url, fields, current_data, document_name, authority, country }: RequestBody = await req.json();

    if (!pdf_url) {
      return new Response(
        JSON.stringify({ error: "PDF URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fieldDescriptions = fields
      .map((f) => `- ${f.name}: ${f.label} (${f.type}, ${f.required ? "required" : "optional"})`)
      .join("\n");

    const currentDataStr = Object.entries(current_data)
      .filter(([_, v]) => v && v.toString().trim())
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");

    const systemPrompt = `You are an expert at analyzing government PDF forms and mapping user data to form fields.
Your task is to:
1. Analyze the official PDF form at the given URL
2. Identify the fields in the PDF form
3. Map the user's provided data to the correct PDF form fields
4. Return the filled field values

The form is: ${document_name}
Authority: ${authority}
Country: ${country}

Available form fields:
${fieldDescriptions}

User's current data:
${currentDataStr || "(No data provided yet)"}

Instructions:
- Analyze the PDF form to understand what each field expects
- Map user's data to the appropriate PDF fields based on field names and labels
- For fields where user hasn't provided data but you can infer from context, make reasonable guesses
- Return ONLY a JSON object with field_name: value pairs
- Do NOT include any explanatory text
- Use the exact field names as provided in the fields list
- If a field cannot be determined, leave it empty string`;

    const userMessage = `Please analyze the PDF form at ${pdf_url} and map the user's data to the form fields. Return the filled field values as JSON.`;

    const sarvamKey = Deno.env.get("SARVAM_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");
    let aiResponse = "";

    // Try Sarvam first
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
            temperature: 0.2,
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
      const resp = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.2,
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

    // Parse the JSON response from AI
    let filledFields: Record<string, string> = {};
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        filledFields = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", filled_fields: {} }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ filled_fields: filledFields }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
