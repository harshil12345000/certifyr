import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("DODO_PAYMENTS_WEBHOOK_SECRET");

/**
 * Verify Dodo Payments webhook signature (Standard Webhooks spec).
 * Signature format: v1,<base64-encoded-hmac>
 * Signed content: "{webhook-id}.{webhook-timestamp}.{body}"
 */
async function verifyWebhookSignature(
  body: string,
  headers: Headers
): Promise<boolean> {
  if (!webhookSecret) {
    console.warn("DODO_PAYMENTS_WEBHOOK_SECRET not configured — skipping verification");
    return true;
  }

  const webhookId = headers.get("webhook-id");
  const webhookTimestamp = headers.get("webhook-timestamp");
  const webhookSignature = headers.get("webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    console.error("Missing standard webhook headers");
    return false;
  }

  // Tolerance check: reject timestamps older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(webhookTimestamp, 10);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    console.error("Webhook timestamp too old or invalid");
    return false;
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;

  // The secret from Dodo may be prefixed with "whsec_" and is base64-encoded
  let secretBytes: Uint8Array;
  const rawSecret = webhookSecret.startsWith("whsec_")
    ? webhookSecret.slice(6)
    : webhookSecret;

  try {
    // Decode base64 secret
    const binaryStr = atob(rawSecret);
    secretBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      secretBytes[i] = binaryStr.charCodeAt(i);
    }
  } catch {
    // If not base64, use raw UTF-8
    secretBytes = new TextEncoder().encode(rawSecret);
  }

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent)
  );

  const expectedSig = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  // webhook-signature can contain multiple space-separated signatures: "v1,<sig1> v1,<sig2>"
  const signatures = webhookSignature.split(" ");
  for (const sig of signatures) {
    const [version, value] = sig.split(",", 2);
    if (version === "v1" && value === expectedSig) {
      return true;
    }
  }

  console.error("Webhook signature mismatch");
  return false;
}

// Map Dodo product ID to internal plan
const PRODUCT_TO_PLAN: Record<string, string> = {
  "pdt_0NYXDFIglnn4wukqC1Qa2": "basic",  // basic monthly
  "pdt_0NYXIK26wpbK6kngEpdrT": "basic",  // basic yearly
  "pdt_0NYXEA30vMCJgSxp0pcRw": "pro",    // pro monthly
  "pdt_0NYXIQ6Nqc7tDx0YXn8OY": "pro",    // pro yearly
  "pdt_0NYXI4SnmvbXxxUZAkDH0": "ultra",  // ultra monthly
  "pdt_0NYXIWHTsKjeI7gEcRLdR": "ultra",  // ultra yearly
};

function resolvePlan(data: any): string {
  // 1. Trust metadata.plan set during checkout creation
  if (data.metadata?.plan) {
    const p = data.metadata.plan.toLowerCase();
    if (p === "basic" || p === "pro" || p === "ultra") return p;
  }
  // 2. Map product_id directly
  if (data.product_id && PRODUCT_TO_PLAN[data.product_id]) {
    return PRODUCT_TO_PLAN[data.product_id];
  }
  // 3. Fallback: try product name
  const name = (data.product?.name || "").toLowerCase();
  if (name.includes("ultra")) return "ultra";
  if (name.includes("pro")) return "pro";
  return "basic";
}

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
    const rawBody = await req.text();

    // Verify signature
    const isValid = await verifyWebhookSignature(rawBody, req.headers);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type;
    const data = payload.data;

    console.log("Received Dodo webhook:", eventType, JSON.stringify(data, null, 2));

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (eventType) {
      // ── Subscription lifecycle ──────────────────────────────────
      case "subscription.active": {
        const customerEmail = data.customer?.email;
        const customerId = data.customer?.customer_id;
        const subscriptionId = data.subscription_id;
        const productName = data.product?.name || data.product_id || "";
        const metadataUserId = data.metadata?.user_id;
        const status = data.status || "active";

        console.log(`Subscription ${status} for ${customerEmail}, product: ${productName}`);

        // Resolve user ID from metadata or email lookup
        let userId = metadataUserId;
        if (!userId && customerEmail) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("user_id")
            .eq("email", customerEmail.toLowerCase())
            .maybeSingle();
          userId = profile?.user_id;
        }

        if (!userId) {
          console.error("Cannot resolve user for subscription.active");
          break;
        }

        const plan = resolvePlan(data);

        // Mirror Dodo's status: could be 'trialing' or 'active'
        const mappedStatus = status === "trialing" ? "trialing" : "active";

        const { error: upsertErr } = await supabase.rpc("update_subscription_from_webhook", {
          p_user_id: userId,
          p_active_plan: plan,
          p_polar_customer_id: customerId || "",
          p_polar_subscription_id: subscriptionId || "",
          p_subscription_status: mappedStatus,
          p_current_period_start: data.current_period_start || new Date().toISOString(),
          p_current_period_end: data.current_period_end || data.trial_end || null,
          p_trial_start: data.trial_start || (mappedStatus === "trialing" ? new Date().toISOString() : null),
          p_trial_end: data.trial_end || data.current_period_end || null,
        });

        if (upsertErr) console.error("Error upserting subscription:", upsertErr);
        else console.log(`${mappedStatus} ${plan} for user ${userId}`);
        break;
      }

      case "subscription.updated": {
        const customerEmail = data.customer?.email;
        const subscriptionId = data.subscription_id;
        const productName = data.product?.name || data.product_id || "";
        const status = data.status || "active";
        const metadataUserId = data.metadata?.user_id;

        let userId = metadataUserId;
        if (!userId && customerEmail) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("user_id")
            .eq("email", customerEmail.toLowerCase())
            .maybeSingle();
          userId = profile?.user_id;
        }

        if (!userId) {
          // Try finding by subscription ID
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("polar_subscription_id", subscriptionId)
            .maybeSingle();
          userId = sub?.user_id;
        }

        if (!userId) {
          console.error("Cannot resolve user for subscription.updated");
          break;
        }

        const plan = resolvePlan(data);
        const mappedStatus = status === "on_hold" ? "on_hold" 
          : status === "trialing" ? "trialing"
          : status === "active" ? "active" 
          : status;

        const { error } = await supabase.rpc("update_subscription_from_webhook", {
          p_user_id: userId,
          p_active_plan: plan,
          p_polar_customer_id: data.customer?.customer_id || "",
          p_polar_subscription_id: subscriptionId || "",
          p_subscription_status: mappedStatus,
          p_current_period_start: data.current_period_start || new Date().toISOString(),
          p_current_period_end: data.current_period_end || null,
          p_trial_start: data.trial_start || null,
          p_trial_end: data.trial_end || null,
        });

        if (error) console.error("Error updating subscription:", error);
        else console.log(`Updated subscription for user ${userId}: plan=${plan}, status=${mappedStatus}`);
        break;
      }

      case "subscription.on_hold":
      case "subscription.failed":
      case "subscription.cancelled": {
        const subscriptionId = data.subscription_id;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("polar_subscription_id", subscriptionId)
          .maybeSingle();

        if (!sub) {
          console.warn("Subscription not found for cancellation:", subscriptionId);
          break;
        }

        const cancelStatus = eventType === "subscription.on_hold" ? "on_hold" : "canceled";

        // If trialing with time remaining, keep active_plan so access continues until trial_end
        const currentSub = await supabase
          .from("subscriptions")
          .select("subscription_status, current_period_end")
          .eq("polar_subscription_id", subscriptionId)
          .maybeSingle();

        const stillInTrial = currentSub?.data?.subscription_status === "trialing" &&
          currentSub?.data?.current_period_end &&
          new Date(currentSub.data.current_period_end) > new Date();

        const updateData: Record<string, unknown> = {
          subscription_status: cancelStatus,
          canceled_at: data.canceled_at || new Date().toISOString(),
        };

        // Only null out active_plan if not in an active trial
        if (!stillInTrial) {
          updateData.active_plan = null;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("polar_subscription_id", subscriptionId);

        if (error) console.error("Error canceling subscription:", error);
        else console.log(`${cancelStatus} subscription ${subscriptionId}`);
        break;
      }

      // ── One-time payment (if needed) ────────────────────────────
      case "payment.succeeded": {
        console.log("Payment succeeded:", data.payment_id);
        // Handle one-time payments if applicable
        break;
      }

      default:
        console.log("Unhandled Dodo webhook event:", eventType);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
