import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function err(message: string, status = 400) {
  return json({ error: message }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return err("Method not allowed", 405);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "list";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    switch (action) {
      case "list":
        return await handleList(supabase, url.searchParams);
      case "get":
        return await handleGet(supabase, url.searchParams);
      case "search":
        return await handleSearch(supabase, url.searchParams);
      case "schema":
        return handleSchema();
      default:
        return err(`Unknown action: ${action}. Valid actions: list, get, search, schema`);
    }
  } catch (e) {
    console.error("library-api error:", e);
    return err("Internal server error", 500);
  }
});

// ── LIST ──────────────────────────────────────────────────────────────────────

async function handleList(supabase: any, params: URLSearchParams) {
  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("library_documents")
    .select(
      "id, slug, official_name, form_name, short_description, country, state, domain, authority, version, official_source_url, official_pdf_url, created_at, updated_at",
      { count: "exact" }
    );

  const country = params.get("country");
  const domain = params.get("domain");
  const authority = params.get("authority");
  const state = params.get("state");

  if (country) query = query.ilike("country", `%${country}%`);
  if (domain) query = query.ilike("domain", `%${domain}%`);
  if (authority) query = query.ilike("authority", `%${authority}%`);
  if (state) query = query.ilike("state", `%${state}%`);

  query = query.order("official_name").range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return err(error.message, 500);

  return json({
    action: "list",
    page,
    limit,
    total: count,
    total_pages: Math.ceil((count || 0) / limit),
    data,
  });
}

// ── GET ───────────────────────────────────────────────────────────────────────

async function handleGet(supabase: any, params: URLSearchParams) {
  const slug = params.get("slug");
  if (!slug) return err("Missing required parameter: slug");

  const { data: doc, error } = await supabase
    .from("library_documents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return err(error.message, 500);
  if (!doc) return err("Document not found", 404);

  // Fetch related data in parallel
  const [fieldsRes, attachmentsRes, dependenciesRes] = await Promise.all([
    supabase.from("library_fields").select("*").eq("document_id", doc.id),
    supabase.from("library_attachments").select("*").eq("document_id", doc.id),
    supabase.from("library_dependencies").select("*").eq("document_id", doc.id),
  ]);

  return json({
    action: "get",
    data: {
      ...doc,
      fields: fieldsRes.data || [],
      attachments: attachmentsRes.data || [],
      dependencies: dependenciesRes.data || [],
    },
  });
}

// ── SEARCH ────────────────────────────────────────────────────────────────────

async function handleSearch(supabase: any, params: URLSearchParams) {
  const q = params.get("q");
  if (!q) return err("Missing required parameter: q");

  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  // Search across multiple text columns using OR
  const searchTerm = `%${q}%`;
  const { data, error, count } = await supabase
    .from("library_documents")
    .select(
      "id, slug, official_name, form_name, short_description, country, state, domain, authority, purpose, who_must_file, version, official_source_url, official_pdf_url",
      { count: "exact" }
    )
    .or(
      `official_name.ilike.${searchTerm},form_name.ilike.${searchTerm},short_description.ilike.${searchTerm},purpose.ilike.${searchTerm},who_must_file.ilike.${searchTerm},full_description.ilike.${searchTerm},domain.ilike.${searchTerm},authority.ilike.${searchTerm}`
    )
    .order("official_name")
    .range(offset, offset + limit - 1);

  if (error) return err(error.message, 500);

  return json({
    action: "search",
    query: q,
    page,
    limit,
    total: count,
    total_pages: Math.ceil((count || 0) / limit),
    data,
  });
}

// ── SCHEMA ────────────────────────────────────────────────────────────────────

function handleSchema() {
  return json({
    action: "schema",
    api_version: "1.0",
    description:
      "Certifyr Legal Library API — structured access to government and legal document metadata including required fields, attachments, and dependencies.",
    endpoints: {
      list: {
        description: "Paginated list of all documents with optional filters",
        params: {
          action: "list",
          country: "Filter by country (partial match)",
          domain: "Filter by domain, e.g. Tax, Corporate, Employment",
          authority: "Filter by issuing authority",
          state: "Filter by state/province",
          page: "Page number (default 1)",
          limit: "Results per page (default 20, max 100)",
        },
      },
      get: {
        description:
          "Full document detail including fields, attachments, and dependencies",
        params: {
          action: "get",
          slug: "Document slug identifier (required)",
        },
      },
      search: {
        description:
          "Search across document names, descriptions, purposes, and domains",
        params: {
          action: "search",
          q: "Search query (required)",
          page: "Page number (default 1)",
          limit: "Results per page (default 20, max 100)",
        },
      },
      schema: {
        description: "Returns this API schema",
        params: { action: "schema" },
      },
    },
    document_model: {
      id: "uuid",
      slug: "string — unique identifier for URLs and API access",
      official_name: "string — official document title",
      form_name: "string | null — form number or code",
      short_description: "string | null",
      full_description: "string | null",
      country: "string",
      state: "string | null",
      domain: "string — e.g. Tax, Corporate, Employment",
      authority: "string — issuing government body",
      purpose: "string | null",
      who_must_file: "string | null",
      filing_method: "string | null",
      official_source_url: "string | null — link to official source",
      official_pdf_url: "string | null — link to official PDF form",
      version: "string | null",
      fields: "array of field objects (name, type, label, required, validation)",
      attachments: "array of required/optional supporting documents",
      dependencies: "array of prerequisite documents",
    },
  });
}
