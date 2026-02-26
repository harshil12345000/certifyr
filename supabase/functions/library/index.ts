import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname.split("/").filter(Boolean);
    const action = path[path.length - 1];

    // GET /library - List all documents
    if (req.method === "GET" && (action === "library" || action === "")) {
      const country = url.searchParams.get("country");
      const state = url.searchParams.get("state");
      const domain = url.searchParams.get("domain");
      const authority = url.searchParams.get("authority");
      const search = url.searchParams.get("search");
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "12"), 100);

      let query = supabase
        .from("library_documents")
        .select(`
          *,
          library_document_tags(
            tag_id,
            library_tags(*)
          )
        `, { count: "exact" });

      if (country) query = query.eq("country", country);
      if (state) query = query.eq("state", state);
      if (domain) query = query.eq("domain", domain);
      if (authority) query = query.eq("authority", authority);
      if (search) {
        query = query.or(`official_name.ilike.%${search}%,short_description.ilike.%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({
          documents: data,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil((count || 0) / limit)
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /library/tags - Get all available tags
    if (req.method === "GET" && action === "tags") {
      const { data, error } = await supabase
        .from("library_tags")
        .select("*")
        .order("tag_type")
        .order("tag_name");

      if (error) throw error;

      return new Response(
        JSON.stringify({ tags: data }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /library/filter-options - Get filter options
    if (req.method === "GET" && action === "filter-options") {
      const [countries, domains, authorities] = await Promise.all([
        supabase.from("library_documents").select("country").order("country"),
        supabase.from("library_documents").select("domain").order("domain"),
        supabase.from("library_documents").select("authority").order("authority"),
      ]);

      const uniqueCountries = [...new Set(countries.data?.map(d => d.country) || [])];
      const uniqueDomains = [...new Set(domains.data?.map(d => d.domain) || [])];
      const uniqueAuthorities = [...new Set(authorities.data?.map(d => d.authority) || [])];

      return new Response(
        JSON.stringify({
          countries: uniqueCountries,
          domains: uniqueDomains,
          authorities: uniqueAuthorities,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /library/:slug - Get single document
    if (req.method === "GET" && path.includes("library") && path.length > 2) {
      const slug = path[path.length - 1];
      
      const { data: document, error } = await supabase
        .from("library_documents")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !document) {
        return new Response(
          JSON.stringify({ error: "Document not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get tags
      const { data: docTags } = await supabase
        .from("library_document_tags")
        .select("library_tags(*)")
        .eq("document_id", document.id);

      // Get fields
      const { data: fields } = await supabase
        .from("library_fields")
        .select("*")
        .eq("document_id", document.id)
        .order("field_name");

      // Get dependencies
      const { data: dependencies } = await supabase
        .from("library_dependencies")
        .select("*")
        .eq("document_id", document.id)
        .order("dependency_name");

      // Get attachments
      const { data: attachments } = await supabase
        .from("library_attachments")
        .select("*")
        .eq("document_id", document.id)
        .order("attachment_name");

      return new Response(
        JSON.stringify({
          document,
          tags: docTags?.map(t => t.library_tags) || [],
          fields: fields || [],
          dependencies: dependencies || [],
          attachments: attachments || [],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /library/:slug/schema - Get document schema
    if (req.method === "GET" && path.includes("schema")) {
      const slug = path[path.length - 2];
      
      const { data: document } = await supabase
        .from("library_documents")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!document) {
        return new Response(
          JSON.stringify({ error: "Document not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: fields } = await supabase
        .from("library_fields")
        .select("*")
        .eq("document_id", document.id)
        .order("field_name");

      return new Response(
        JSON.stringify({ schema: fields }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Library API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
