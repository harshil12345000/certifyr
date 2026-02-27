import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface FieldInfo {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface RequestBody {
  fields: FieldInfo[];
  pdf_field_names: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fields, pdf_field_names }: RequestBody = await req.json();

    if (!fields || fields.length === 0) {
      return new Response(
        JSON.stringify({ error: "Fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pdf_field_names || pdf_field_names.length === 0) {
      return new Response(
        JSON.stringify({ error: "No PDF fields provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Mapping", fields.length, "fields to", pdf_field_names.length, "PDF fields");

    // Build context for AI
    const fieldDescriptions = fields
      .map((f) => `- "${f.name}" (label: "${f.label}")`)
      .join("\n");

    const systemPrompt = `Map form fields to PDF form fields.

Form fields:
${fieldDescriptions}

PDF fields:
${pdf_field_names.map(n => `- "${n}"`).join("\n")}

Task: Match each form field to the best PDF field name. Consider exact matches, partial matches, and synonyms.

Return JSON object mapping form field names to PDF field names:
{"field_name": "pdf_field_name", ...}

Use exact PDF field names. Return ONLY JSON.`;

    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let aiResponse = "";
    try {
      const resp = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Map the fields" }
          ],
          temperature: 0.1,
          max_tokens: 1000
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        aiResponse = data.choices?.[0]?.message?.content || "";
      } else {
        const errText = await resp.text();
        console.error("Groq error:", resp.status, errText);
        return new Response(
          JSON.stringify({ error: `AI API error: ${resp.status}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (err) {
      console.error("Groq failed:", err);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse AI response
    let fieldMappings: Record<string, string> = {};
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fieldMappings = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Parse error:", e, "Raw:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Field mappings:", fieldMappings);

    return new Response(
      JSON.stringify({ field_mappings: fieldMappings }),
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
