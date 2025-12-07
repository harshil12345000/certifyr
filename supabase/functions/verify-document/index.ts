import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hash } = await req.json();

    if (!hash || typeof hash !== "string") {
      console.log("Invalid hash provided:", hash);
      return new Response(
        JSON.stringify({
          valid: false,
          status: "not_found",
          message: "Invalid verification link",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch only non-sensitive fields from verified_documents
    const { data: doc, error } = await supabase
      .from("verified_documents")
      .select(
        "id, template_type, generated_at, expires_at, is_active, organization_id, user_id"
      )
      .eq("verification_hash", hash)
      .single();

    if (error || !doc) {
      console.log("Document not found for hash:", hash);
      
      // Log verification attempt
      await supabase.from("qr_verification_logs").insert({
        verification_hash: hash,
        verification_result: "not_found",
        ip_address: "0.0.0.0",
        user_agent: req.headers.get("user-agent") || "",
      });

      return new Response(
        JSON.stringify({
          valid: false,
          status: "not_found",
          message: "Document not found or verification failed",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isExpired = doc.expires_at && new Date(doc.expires_at) < new Date();
    const isActive = doc.is_active;

    let status: "verified" | "expired" | "inactive" | "not_found";
    let valid = false;
    let message = "";

    if (isExpired) {
      status = "expired";
      message = "This document has expired";
    } else if (!isActive) {
      status = "inactive";
      message = "This document is no longer active";
    } else {
      status = "verified";
      valid = true;
      message = "Document is valid and verified";
    }

    // Log verification attempt
    await supabase.from("qr_verification_logs").insert({
      verification_hash: hash,
      verification_result: status === "inactive" ? "not_found" : status,
      document_id: doc.id,
      template_type: doc.template_type,
      organization_id: doc.organization_id,
      user_id: doc.user_id,
      ip_address: "0.0.0.0",
      user_agent: req.headers.get("user-agent") || "",
    });

    // Increment verification stats if verified
    if (valid && doc.user_id) {
      try {
        await supabase.rpc("increment_user_stat", {
          p_user_id: doc.user_id,
          p_organization_id: doc.organization_id,
          p_stat_field: "total_verifications",
        });
      } catch (statError) {
        console.error("Error incrementing stats:", statError);
      }
    }

    // Fetch organization details if available
    let organizationName: string | null = null;
    let logoUrl: string | null = null;

    if (doc.organization_id) {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", doc.organization_id)
        .single();

      if (orgData) {
        organizationName = orgData.name;

        // Get logo URL
        const { data: fileData } = await supabase
          .from("branding_files")
          .select("path")
          .eq("organization_id", doc.organization_id)
          .eq("name", "logo")
          .single();

        if (fileData?.path) {
          const { data: urlData } = supabase.storage
            .from("branding-assets")
            .getPublicUrl(fileData.path);
          logoUrl = urlData.publicUrl;
        }
      }
    }

    // Return only safe, non-PII data
    const response = {
      valid,
      status,
      message,
      document: {
        id: doc.id,
        template_type: doc.template_type,
        generated_at: doc.generated_at,
        expires_at: doc.expires_at,
        is_active: doc.is_active,
      },
      organization: organizationName
        ? {
            name: organizationName,
            logo_url: logoUrl,
          }
        : null,
    };

    console.log("Verification successful:", { hash, status, valid });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        status: "error",
        message: "An error occurred during verification",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
