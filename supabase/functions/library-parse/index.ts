import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ParsedField {
  field_name: string;
  field_label: string;
  field_type: string;
  required: boolean;
  validation_regex: string | null;
  conditional_logic: Record<string, unknown> | null;
}

interface ParsedDependency {
  dependency_name: string;
  description: string | null;
}

interface ParsedAttachment {
  attachment_name: string;
  is_required: boolean;
  description: string | null;
}

interface LegalDocumentSchema {
  country: string;
  state?: string;
  authority: string;
  domain: string;
  official_name: string;
  description?: string;
  purpose?: string;
  who_must_file?: string;
  filing_method?: string;
  official_source_url?: string;
  official_pdf_url?: string;
  version?: string;
  required_fields?: ParsedField[];
  attachments_required?: ParsedAttachment[];
  dependencies?: ParsedDependency[];
}

function normalizeFieldType(type: string): string {
  const normalized = type.toLowerCase().trim();
  if (normalized.includes('date')) return 'date';
  if (normalized.includes('number') || normalized.includes('numeric') || normalized.includes('amount')) return 'number';
  if (normalized.includes('email')) return 'email';
  if (normalized.includes('phone') || normalized.includes('mobile') || normalized.includes('tel')) return 'tel';
  if (normalized.includes('url') || normalized.includes('link') || normalized.includes('website')) return 'url';
  if (normalized.includes('checkbox') || normalized.includes('boolean') || normalized.includes('yes/no')) return 'checkbox';
  if (normalized.includes('select') || normalized.includes('dropdown') || normalized.includes('choice')) return 'select';
  if (normalized.includes('radio')) return 'radio';
  if (normalized.includes('text') && normalized.includes('long')) return 'textarea';
  if (normalized.includes('text')) return 'text';
  return 'text';
}

function extractValidationRegex(fieldType: string, fieldName: string): string | null {
  const name = fieldName.toLowerCase();
  const type = fieldType.toLowerCase();
  
  if (name.includes('email')) return '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$';
  if (name.includes('phone') || name.includes('mobile')) {
    if (name.includes('india') || name.includes('in')) return '^[6-9]\\d{9}$';
    return '^\\d{10,15}$';
  }
  if (name.includes('aadhaar')) return '^\\d{12}$';
  if (name.includes('pan')) return '^[A-Z]{5}[0-9]{4}[A-Z]{1}$';
  if (name.includes('ifsc')) return '^[A-Z]{4}0[A-Z0-9]{6}$';
  if (name.includes('ssn')) return '^\\d{3}-\\d{2}-\\d{4}$';
  if (name.includes('pin') || name.includes('zip')) return '^\\d{5,6}$';
  if (name.includes('gst')) return '^\\d{2}[A-Z]{5}\\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$';
  if (type === 'number' || type === 'amount' || type === 'turnover' || type === 'investment') return '^\\d+$';
  if (type === 'date') return null;
  
  return null;
}

function determineConditionalLogic(fieldName: string, allFields: string[]): Record<string, unknown> | null {
  const lowerName = fieldName.toLowerCase();
  
  if (lowerName.includes('if') || lowerName.includes('when') || lowerName.includes('dependent')) {
    const possibleConditions = ['turnover', 'investment', 'type', 'category', 'has_employees', 'employee_count'];
    for (const cond of possibleConditions) {
      if (allFields.some(f => f.toLowerCase().includes(cond))) {
        return {
          depends_on: cond,
          operator: '<=',
          value: lowerName.includes('small') ? 5000000 : lowerName.includes('micro') ? 1000000 : 15000000
        };
      }
    }
  }
  
  return null;
}

async function callSarvamAI(prompt: string): Promise<string> {
  const sarvamApiKey = Deno.env.get('SARVAM_API_KEY');
  
  if (!sarvamApiKey) {
    throw new Error('SARVAM_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sarvamApiKey}`,
      },
      body: JSON.stringify({
        model: 'sarvam-m',
        messages: [
          {
            role: 'system',
            content: 'You are a legal document parser. Extract structured information from legal documents and return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sarvam API error: ${response.statusText}`);
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Sarvam AI error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { json_content, pdf_url, document_id } = await req.json();

    let parsedDocument: LegalDocumentSchema;
    let parsingConfidence = 0.5;

    if (json_content) {
      try {
        if (typeof json_content === 'string') {
          parsedDocument = JSON.parse(json_content) as LegalDocumentSchema;
        } else {
          parsedDocument = json_content as LegalDocumentSchema;
        }
        
        if (!parsedDocument.country || !parsedDocument.authority || !parsedDocument.official_name) {
          throw new Error('Missing required fields: country, authority, official_name');
        }
        
        parsingConfidence = 0.85;
      } catch (e) {
        throw new Error(`Invalid JSON format: ${(e as Error).message}`);
      }
    } else if (pdf_url) {
      const prompt = `Parse the following legal document and extract structured information. Return JSON with these fields:
- country (string)
- state (string, optional)
- authority (string)
- domain (string) 
- official_name (string)
- description (string)
- purpose (string)
- who_must_file (string)
- filing_method (string)
- official_source_url (string)
- official_pdf_url (string)
- version (string)
- required_fields (array of objects with: field_name, field_label, field_type, required, validation_regex)
- attachments_required (array of objects with: attachment_name, is_required, description)
- dependencies (array of objects with: dependency_name, description)

PDF URL: ${pdf_url}

Return ONLY valid JSON, no explanation.`;

      const sarvamResponse = await callSarvamAI(prompt);
      
      try {
        const jsonMatch = sarvamResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedDocument = JSON.parse(jsonMatch[0]) as LegalDocumentSchema;
          parsingConfidence = 0.75;
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (e) {
        throw new Error(`Failed to parse AI response: ${(e as Error).message}`);
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Either json_content or pdf_url is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (document_id) {
      const { data: existingDoc } = await supabase
        .from("library_documents")
        .select("id")
        .eq("id", document_id)
        .single();

      if (existingDoc) {
        const slug = parsedDocument.official_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const { error: updateError } = await supabase
          .from("library_documents")
          .update({
            country: parsedDocument.country,
            state: parsedDocument.state || null,
            authority: parsedDocument.authority,
            domain: parsedDocument.domain,
            official_name: parsedDocument.official_name,
            slug,
            short_description: parsedDocument.description?.substring(0, 200) || null,
            full_description: parsedDocument.description || null,
            purpose: parsedDocument.purpose || null,
            who_must_file: parsedDocument.who_must_file || null,
            filing_method: parsedDocument.filing_method || null,
            official_source_url: parsedDocument.official_source_url || null,
            official_pdf_url: parsedDocument.official_pdf_url || null,
            version: parsedDocument.version || '1.0',
            last_verified_at: new Date().toISOString(),
            parsing_confidence: parsingConfidence,
            needs_review: parsingConfidence < 0.7,
          })
          .eq("id", document_id);

        if (updateError) throw updateError;

        if (parsedDocument.required_fields) {
          await supabase.from("library_fields").delete().eq("document_id", document_id);
          
          const fieldNames = parsedDocument.required_fields.map(f => f.field_name);
          
          const fieldsToInsert = parsedDocument.required_fields.map(field => ({
            document_id,
            field_name: field.field_name,
            field_label: field.field_label,
            field_type: normalizeFieldType(field.field_type),
            required: field.required ?? true,
            validation_regex: field.validation_regex || extractValidationRegex(field.field_type, field.field_name),
            conditional_logic: field.conditional_logic || determineConditionalLogic(field.field_name, fieldNames),
          }));

          await supabase.from("library_fields").insert(fieldsToInsert);
        }

        if (parsedDocument.attachments_required) {
          await supabase.from("library_attachments").delete().eq("document_id", document_id);
          
          const attachmentsToInsert = parsedDocument.attachments_required.map(att => ({
            document_id,
            attachment_name: att.attachment_name,
            is_required: att.is_required ?? true,
            description: att.description || null,
          }));

          await supabase.from("library_attachments").insert(attachmentsToInsert);
        }

        if (parsedDocument.dependencies) {
          await supabase.from("library_dependencies").delete().eq("document_id", document_id);
          
          const depsToInsert = parsedDocument.dependencies.map(dep => ({
            document_id,
            dependency_name: dep.dependency_name,
            dependency_slug: null,
            description: dep.description || null,
          }));

          await supabase.from("library_dependencies").insert(depsToInsert);
        }

        return new Response(
          JSON.stringify({
            success: true,
            document_id,
            parsing_confidence: parsingConfidence,
            needs_review: parsingConfidence < 0.7,
            message: 'Document updated successfully'
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const slug = parsedDocument.official_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: newDoc, error: insertError } = await supabase
      .from("library_documents")
      .insert({
        country: parsedDocument.country,
        state: parsedDocument.state || null,
        authority: parsedDocument.authority,
        domain: parsedDocument.domain,
        official_name: parsedDocument.official_name,
        slug,
        short_description: parsedDocument.description?.substring(0, 200) || null,
        full_description: parsedDocument.description || null,
        purpose: parsedDocument.purpose || null,
        who_must_file: parsedDocument.who_must_file || null,
        filing_method: parsedDocument.filing_method || null,
        official_source_url: parsedDocument.official_source_url || null,
        official_pdf_url: parsedDocument.official_pdf_url || null,
        version: parsedDocument.version || '1.0',
        last_verified_at: new Date().toISOString(),
        parsing_confidence: parsingConfidence,
        needs_review: parsingConfidence < 0.7,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const docId = newDoc.id;

    if (parsedDocument.required_fields) {
      const fieldNames = parsedDocument.required_fields.map(f => f.field_name);
      
      const fieldsToInsert = parsedDocument.required_fields.map(field => ({
        document_id: docId,
        field_name: field.field_name,
        field_label: field.field_label,
        field_type: normalizeFieldType(field.field_type),
        required: field.required ?? true,
        validation_regex: field.validation_regex || extractValidationRegex(field.field_type, field.field_name),
        conditional_logic: field.conditional_logic || determineConditionalLogic(field.field_name, fieldNames),
      }));

      await supabase.from("library_fields").insert(fieldsToInsert);
    }

    if (parsedDocument.attachments_required) {
      const attachmentsToInsert = parsedDocument.attachments_required.map(att => ({
        document_id: docId,
        attachment_name: att.attachment_name,
        is_required: att.is_required ?? true,
        description: att.description || null,
      }));

      await supabase.from("library_attachments").insert(attachmentsToInsert);
    }

    if (parsedDocument.dependencies) {
      const depsToInsert = parsedDocument.dependencies.map(dep => ({
        document_id: docId,
        dependency_name: dep.dependency_name,
        dependency_slug: null,
        description: dep.description || null,
      }));

      await supabase.from("library_dependencies").insert(depsToInsert);
    }

    return new Response(
      JSON.stringify({
        success: true,
        document_id: docId,
        slug,
        parsing_confidence: parsingConfidence,
        needs_review: parsingConfidence < 0.7,
        message: 'Document created successfully'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Library Parse Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
