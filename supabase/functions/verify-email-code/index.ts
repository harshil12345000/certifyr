import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// In-memory store for verification codes (expires after 10 minutes)
const verificationCodes = new Map<string, { code: string; timestamp: number }>();

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) {
      verificationCodes.delete(email);
    }
  }
}, 5 * 60 * 1000);

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, code } = await req.json();

    if (action === "send") {
      // Generate and store verification code
      const verificationCode = generateCode();
      verificationCodes.set(email.toLowerCase(), {
        code: verificationCode,
        timestamp: Date.now(),
      });

      // Send email with verification code
      const emailResponse = await resend.emails.send({
        from: "Certifyr <onboarding@resend.dev>",
        to: [email],
        subject: "Your Certifyr Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Verify Your Email</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Thank you for signing up with Certifyr! To complete your registration, please use the verification code below:
            </p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px;">
                ${verificationCode}
              </span>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">
              Certifyr - Digital Certificate Management Platform
            </p>
          </div>
        `,
      });

      console.log("Verification email sent:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, message: "Verification code sent" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else if (action === "verify") {
      // Verify the code
      const stored = verificationCodes.get(email.toLowerCase());
      
      if (!stored) {
        return new Response(
          JSON.stringify({ success: false, message: "No verification code found. Please request a new one." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Check if code is expired (10 minutes)
      if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
        verificationCodes.delete(email.toLowerCase());
        return new Response(
          JSON.stringify({ success: false, message: "Verification code has expired. Please request a new one." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Check if code matches
      if (stored.code !== code) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid verification code. Please try again." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Code is valid, remove it
      verificationCodes.delete(email.toLowerCase());

      return new Response(
        JSON.stringify({ success: true, message: "Email verified successfully" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid action" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in verify-email-code function:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
