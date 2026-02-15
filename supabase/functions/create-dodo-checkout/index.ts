import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
// Use test key while merchant isn't live; switch to DODO_PAYMENTS_API_KEY for live mode
const dodoApiKey = Deno.env.get("DODO_PAYMENTS_TEST_API_KEY")!;

// Dodo Payments API base URL (test mode until merchant goes live)
const DODO_API_BASE = "https://test.dodopayments.com";

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
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const userEmail = user.email;

    // Parse request body
    const { productId, plan, billingPeriod, successUrl, cancelUrl } = await req.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: "Missing productId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Dodo Payments checkout session via REST API
    const checkoutPayload = {
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: userEmail,
        name: userEmail, // Dodo requires a name
      },
      payment_link: true,
      return_url: successUrl || `${req.headers.get("origin") || "https://certifyr.lovable.app"}/checkout/success`,
      metadata: {
        user_id: userId,
        plan: plan || "",
        billing_period: billingPeriod || "",
      },
    };

    console.log("Creating Dodo checkout session:", JSON.stringify(checkoutPayload));

    const dodoResponse = await fetch(`${DODO_API_BASE}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dodoApiKey}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    const dodoText = await dodoResponse.text();
    let dodoData;
    try {
      dodoData = dodoText ? JSON.parse(dodoText) : {};
    } catch {
      console.error("Dodo returned non-JSON response:", dodoText);
      dodoData = { error: dodoText };
    }
    if (!dodoResponse.ok) {
      console.error("Dodo checkout creation failed:", JSON.stringify(dodoData));
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session", details: dodoData }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Dodo checkout session created:", dodoData.session_id);

    // Save selected plan to subscriptions table
    const adminClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await adminClient.from("subscriptions").upsert(
      {
        user_id: userId,
        selected_plan: plan,
        subscription_status: "pending",
        polar_checkout_id: dodoData.session_id || null,
      },
      { onConflict: "user_id" }
    );

    return new Response(
      JSON.stringify({
        checkout_url: dodoData.checkout_url,
        session_id: dodoData.session_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout creation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
