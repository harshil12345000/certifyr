import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const dodoApiKey = Deno.env.get("DODO_PAYMENTS_API_KEY")!;
const DODO_API_BASE = "https://live.dodopayments.com";

const PLAN_PRODUCTS: Record<string, { monthly: string; yearly: string }> = {
  basic: {
    monthly: "pdt_0NYXDFIglnn4wukqC1Qa2",
    yearly: "pdt_0NYXIK26wpbK6kngEpdrT",
  },
  pro: {
    monthly: "pdt_0NYXEA30vMCJgSxp0pcRw",
    yearly: "pdt_0NYXIQ6Nqc7tDx0YXn8OY",
  },
  ultra: {
    monthly: "pdt_0NYXI4SnmvbXxxUZAkDH0",
    yearly: "pdt_0NYXIWHTsKjeI7gEcRLdR",
  },
};

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
    
    // Decode JWT payload directly to avoid session-dependent getUser/getClaims
    let jwtPayload: { sub?: string; exp?: number };
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
      jwtPayload = JSON.parse(payloadJson);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!jwtPayload.sub || (jwtPayload.exp && jwtPayload.exp * 1000 < Date.now())) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = jwtPayload.sub;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: subscription, error: subError } = await adminClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (subError) {
      console.error("Error fetching subscription:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscription" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "get-details": {
        if (!subscription?.polar_subscription_id) {
          return new Response(
            JSON.stringify({ subscription, dodo: null }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const dodoRes = await fetch(
          `${DODO_API_BASE}/subscriptions/${subscription.polar_subscription_id}`,
          { headers: { Authorization: `Bearer ${dodoApiKey}` } }
        );

        const dodoData = dodoRes.ok ? await dodoRes.json() : null;
        if (!dodoRes.ok) {
          console.error("Dodo get-details failed:", dodoRes.status);
        }

        return new Response(
          JSON.stringify({ subscription, dodo: dodoData }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "change-plan": {
        const { plan, billingPeriod } = params;
        if (!plan || !billingPeriod) {
          return new Response(
            JSON.stringify({ error: "Missing plan or billingPeriod" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const productConfig = PLAN_PRODUCTS[plan];
        if (!productConfig) {
          return new Response(
            JSON.stringify({ error: "Invalid plan" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // No Dodo subscription — update plan directly in DB
        if (!subscription?.polar_subscription_id) {
          const { error: updateError } = await adminClient
            .from("subscriptions")
            .update({
              active_plan: plan,
              selected_plan: plan,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (updateError) {
            console.error("DB plan change error:", updateError);
            return new Response(
              JSON.stringify({ error: "Failed to update plan" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          await adminClient
            .from("user_profiles")
            .update({ plan, updated_at: new Date().toISOString() })
            .eq("user_id", userId);

          console.log(`Plan changed directly for user ${userId}: ${plan} (${billingPeriod})`);
          return new Response(
            JSON.stringify({ success: true, data: { plan, method: "direct" } }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Has Dodo subscription — call Dodo API
        const productId =
          billingPeriod === "yearly"
            ? productConfig.yearly
            : productConfig.monthly;

        const changePlanRes = await fetch(
          `${DODO_API_BASE}/subscriptions/${subscription.polar_subscription_id}/change-plan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${dodoApiKey}`,
            },
            body: JSON.stringify({
              product_id: productId,
              quantity: 1,
              on_payment_failure: "prevent_change",
            }),
          }
        );

        const changePlanText = await changePlanRes.text();
        let changePlanData;
        try {
          changePlanData = changePlanText ? JSON.parse(changePlanText) : {};
        } catch {
          changePlanData = { raw: changePlanText };
        }

        if (!changePlanRes.ok) {
          console.error("Dodo change-plan failed:", changePlanRes.status, changePlanText);
          return new Response(
            JSON.stringify({ error: "Failed to change plan", details: changePlanData }),
            {
              status: changePlanRes.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        console.log(`Plan change initiated for user ${userId}: ${plan} (${billingPeriod})`);
        return new Response(
          JSON.stringify({ success: true, data: changePlanData }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "cancel": {
        // No Dodo subscription — cancel directly in DB
        if (!subscription?.polar_subscription_id) {
          const { error: cancelError } = await adminClient
            .from("subscriptions")
            .update({
              subscription_status: "canceled",
              canceled_at: new Date().toISOString(),
              active_plan: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (cancelError) {
            console.error("DB cancel error:", cancelError);
            return new Response(
              JSON.stringify({ error: "Failed to cancel subscription" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          await adminClient
            .from("user_profiles")
            .update({ plan: "basic", updated_at: new Date().toISOString() })
            .eq("user_id", userId);

          console.log(`Subscription canceled directly for user ${userId}`);
          return new Response(
            JSON.stringify({ success: true, data: { method: "direct" } }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Has Dodo subscription — call Dodo API
        const cancelRes = await fetch(
          `${DODO_API_BASE}/subscriptions/${subscription.polar_subscription_id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${dodoApiKey}`,
            },
            body: JSON.stringify({ cancel_at_next_billing_date: true }),
          }
        );

        const cancelText = await cancelRes.text();
        let cancelData;
        try {
          cancelData = cancelText ? JSON.parse(cancelText) : {};
        } catch {
          cancelData = { raw: cancelText };
        }

        if (!cancelRes.ok) {
          console.error("Dodo cancel failed:", cancelRes.status, cancelText);
          return new Response(
            JSON.stringify({ error: "Failed to cancel subscription", details: cancelData }),
            {
              status: cancelRes.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        await adminClient
          .from("subscriptions")
          .update({ canceled_at: new Date().toISOString() })
          .eq("user_id", userId);

        console.log(`Subscription cancellation scheduled for user ${userId}`);
        return new Response(
          JSON.stringify({ success: true, data: cancelData }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("manage-subscription error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
