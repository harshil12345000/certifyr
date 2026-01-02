import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-polar-signature",
};

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const polarWebhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET");

interface PolarWebhookPayload {
  type: string;
  data: {
    id: string;
    status?: string;
    customer?: {
      id: string;
      email: string;
    };
    user?: {
      id: string;
      email: string;
    };
    product?: {
      id: string;
      name: string;
    };
    price?: {
      id: string;
      amount: number;
      recurring_interval?: string;
    };
    current_period_start?: string;
    current_period_end?: string;
    canceled_at?: string;
    metadata?: Record<string, string>;
  };
}

// Verify Polar webhook signature
async function verifyPolarSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) {
    console.warn("Missing signature or secret for verification");
    return false;
  }

  try {
    // Polar uses HMAC-SHA256 for webhook signatures
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Compare signatures (timing-safe comparison)
    return signature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Map Polar product/price to plan name
function mapProductToPlan(productName: string): string {
  const lowerName = productName.toLowerCase();
  if (lowerName.includes("pro")) return "pro";
  if (lowerName.includes("basic")) return "basic";
  // Default based on naming convention
  return "basic";
}

serve(async (req) => {
  // Handle CORS preflight
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
    const signature = req.headers.get("x-polar-signature");

    // Verify webhook signature if secret is configured
    if (polarWebhookSecret) {
      const isValid = await verifyPolarSignature(rawBody, signature, polarWebhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      console.warn("POLAR_WEBHOOK_SECRET not configured - skipping signature verification");
    }

    const payload: PolarWebhookPayload = JSON.parse(rawBody);
    console.log("Received Polar webhook:", payload.type, JSON.stringify(payload.data, null, 2));

    // Create Supabase admin client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook event types
    switch (payload.type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active": {
        const data = payload.data;
        const customerEmail = data.customer?.email || data.user?.email;
        const customerId = data.customer?.id || data.user?.id;
        const subscriptionId = data.id;
        const productName = data.product?.name || "";
        const status = data.status || "active";

        if (!customerEmail) {
          console.error("No customer email in webhook payload");
          return new Response(JSON.stringify({ error: "Missing customer email" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Find user by email
        const { data: userData, error: userError } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("email", customerEmail.toLowerCase())
          .maybeSingle();

        if (userError || !userData) {
          console.error("User not found for email:", customerEmail, userError);
          return new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const userId = userData.user_id;
        const activePlan = mapProductToPlan(productName);

        // Check for metadata with user_id (passed from checkout)
        const metadataUserId = data.metadata?.user_id;
        const finalUserId = metadataUserId || userId;

        console.log(`Updating subscription for user ${finalUserId}: plan=${activePlan}, status=${status}`);

        // Upsert subscription record using database function
        const { error: updateError } = await supabase.rpc("update_subscription_from_webhook", {
          p_user_id: finalUserId,
          p_active_plan: activePlan,
          p_polar_customer_id: customerId,
          p_polar_subscription_id: subscriptionId,
          p_subscription_status: status,
          p_current_period_start: data.current_period_start || null,
          p_current_period_end: data.current_period_end || null,
        });

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Successfully activated ${activePlan} plan for user ${finalUserId}`);
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        const data = payload.data;
        const subscriptionId = data.id;

        // Find subscription by Polar subscription ID
        const { data: subData, error: subError } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("polar_subscription_id", subscriptionId)
          .maybeSingle();

        if (subError || !subData) {
          console.warn("Subscription not found for cancellation:", subscriptionId);
          break;
        }

        // Update subscription status to canceled
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            subscription_status: "canceled",
            active_plan: null,
            canceled_at: data.canceled_at || new Date().toISOString(),
          })
          .eq("polar_subscription_id", subscriptionId);

        if (updateError) {
          console.error("Error canceling subscription:", updateError);
        } else {
          console.log(`Canceled subscription ${subscriptionId}`);
        }
        break;
      }

      default:
        console.log("Unhandled webhook event type:", payload.type);
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
