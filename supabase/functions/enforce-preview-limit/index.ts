import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("active_plan, documents_used_this_month, monthly_usage_reset_date")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: "No subscription found", allowed: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentDate = new Date();
    const resetDate = subscription.monthly_usage_reset_date
      ? new Date(subscription.monthly_usage_reset_date)
      : null;

    let usedCount = subscription.documents_used_this_month || 0;
    let needsReset = false;

    if (resetDate && currentDate >= resetDate) {
      needsReset = true;
      usedCount = 0;
    }

    const limit = 25;
    const isBasic = subscription.active_plan === "basic";

    if (isBasic && usedCount >= limit) {
      return new Response(
        JSON.stringify({
          error: "PLAN_LIMIT_REACHED",
          message: "You have reached your monthly document generation limit",
          used: usedCount,
          limit: limit,
          remaining: 0,
          reset_date: resetDate?.toISOString() || null,
          allowed: false,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (isBasic) {
      const newCount = usedCount + 1;
      const nextMonthReset = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          documents_used_this_month: newCount,
          monthly_usage_reset_date: needsReset
            ? nextMonthReset.toISOString()
            : subscription.monthly_usage_reset_date,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error incrementing count:", updateError);
      }

      return new Response(
        JSON.stringify({
          allowed: true,
          used: newCount,
          limit: limit,
          remaining: limit - newCount,
          reset_date: resetDate?.toISOString() || null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        used: usedCount,
        limit: null,
        remaining: "unlimited",
        message: "Unlimited plan",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in enforce-preview-limit:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
