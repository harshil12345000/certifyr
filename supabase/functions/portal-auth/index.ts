import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Use Web Crypto API for password hashing (works in Deno Deploy)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(derivedBits);
  // Combine salt + hash and encode as base64
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  return `pbkdf2:${btoa(String.fromCharCode(...combined))}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Handle legacy base64-encoded passwords
  if (!storedHash.startsWith("pbkdf2:") && !storedHash.startsWith("$2")) {
    try {
      const decodedPassword = atob(storedHash);
      return decodedPassword === password;
    } catch {
      return false;
    }
  }

  // Handle bcrypt hashes (can't verify, need re-save)
  if (storedHash.startsWith("$2")) {
    // For bcrypt hashes, we can't verify in this runtime
    // User should re-save the password
    return false;
  }

  // Handle PBKDF2 hashes
  if (storedHash.startsWith("pbkdf2:")) {
    try {
      const encoder = new TextEncoder();
      const combined = Uint8Array.from(atob(storedHash.slice(7)), c => c.charCodeAt(0));
      const salt = combined.slice(0, 16);
      const storedHashBytes = combined.slice(16);

      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        256
      );
      const hashArray = new Uint8Array(derivedBits);
      
      // Compare hashes
      if (hashArray.length !== storedHashBytes.length) return false;
      for (let i = 0; i < hashArray.length; i++) {
        if (hashArray[i] !== storedHashBytes[i]) return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...payload } = await req.json();

    console.log(`Portal auth action: ${action}`);

    switch (action) {
      case "verify_portal_password": {
        // Verify organization portal password
        const { organization_id, password } = payload;
        
        if (!organization_id || !password) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: settings, error } = await supabase
          .from("request_portal_settings")
          .select("password_hash")
          .eq("organization_id", organization_id)
          .eq("enabled", true)
          .maybeSingle();

        if (error || !settings) {
          console.log("Portal not found or not enabled:", error);
          return new Response(
            JSON.stringify({ success: false, error: "Portal not found or not enabled" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const isValid = await verifyPassword(password, settings.password_hash);

        // If valid with legacy format, migrate to PBKDF2
        if (isValid && !settings.password_hash.startsWith("pbkdf2:")) {
          const newHash = await hashPassword(password);
          await supabase
            .from("request_portal_settings")
            .update({ password_hash: newHash })
            .eq("organization_id", organization_id);
          console.log("Migrated legacy password to PBKDF2 for org:", organization_id);
        }

        return new Response(
          JSON.stringify({ success: isValid }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "employee_signin": {
        // Employee sign in
        const { organization_id, email, password } = payload;
        
        if (!organization_id || !email || !password) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: employee, error } = await supabase
          .from("request_portal_employees")
          .select("*")
          .eq("organization_id", organization_id)
          .eq("email", email)
          .eq("status", "approved")
          .maybeSingle();

        if (error || !employee) {
          console.log("Employee not found or not approved:", error);
          return new Response(
            JSON.stringify({ success: false, error: "Invalid credentials or account not approved" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const isValid = await verifyPassword(password, employee.password_hash);
        
        // Migrate legacy passwords
        if (isValid && !employee.password_hash.startsWith("pbkdf2:")) {
          const newHash = await hashPassword(password);
          await supabase
            .from("request_portal_employees")
            .update({ password_hash: newHash })
            .eq("id", employee.id);
          console.log("Migrated legacy employee password to PBKDF2:", employee.id);
        }

        if (!isValid) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid credentials" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Don't return password_hash in response
        const { password_hash: _, ...safeEmployee } = employee;
        return new Response(
          JSON.stringify({ success: true, employee: safeEmployee }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "employee_register": {
        // Employee registration with PBKDF2 password
        const { organization_id, full_name, email, employee_id, phone_number, manager_name, password } = payload;
        
        if (!organization_id || !full_name || !email || !password) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (password.length < 6) {
          return new Response(
            JSON.stringify({ success: false, error: "Password must be at least 6 characters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check for existing employee
        const { data: existing } = await supabase
          .from("request_portal_employees")
          .select("id")
          .eq("organization_id", organization_id)
          .or(`email.eq.${email},full_name.eq.${full_name}`)
          .maybeSingle();

        if (existing) {
          return new Response(
            JSON.stringify({ success: false, error: "An employee with this email or name already exists" }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Hash password with PBKDF2
        const passwordHash = await hashPassword(password);

        const { data: employee, error } = await supabase
          .from("request_portal_employees")
          .insert({
            organization_id,
            full_name,
            email,
            employee_id: employee_id || null,
            phone_number: phone_number || null,
            manager_name: manager_name || null,
            password_hash: passwordHash,
            status: "pending",
          })
          .select()
          .single();

        if (error) {
          console.error("Registration error:", error);
          return new Response(
            JSON.stringify({ success: false, error: "Failed to register" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create notification for admin
        await supabase.from("notifications").insert({
          org_id: organization_id,
          type: "employee_registration",
          subject: `${full_name} Requested Portal Access`,
          body: `${full_name} has requested access to your organization's Certifyr Request Portal.\n\nDetails:\n• Email: ${email}\n• Employee ID: ${employee_id || "Not provided"}\n• Phone: ${phone_number || "Not provided"}\n• Manager: ${manager_name || "Not provided"}\n\nPlease review and approve/reject this request in Request Portal → Members.`,
          data: { email, employeeId: employee_id, phoneNumber: phone_number, managerName: manager_name },
        });

        const { password_hash: _, ...safeEmployee } = employee;
        return new Response(
          JSON.stringify({ success: true, employee: safeEmployee }),
          { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "save_portal_password": {
        // Save portal password with PBKDF2 (requires auth)
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, error: "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { organization_id, password, enabled, portal_url } = payload;
        
        if (!organization_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing organization_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Build upsert data
        const upsertData: Record<string, unknown> = {
          organization_id,
          enabled: enabled ?? false,
          portal_url: portal_url || "",
        };

        // Only update password if a new one was provided
        if (password && password.trim()) {
          upsertData.password_hash = await hashPassword(password);
        }

        // If no existing record and no password provided, require password
        if (!password || !password.trim()) {
          const { data: existing } = await supabase
            .from("request_portal_settings")
            .select("id")
            .eq("organization_id", organization_id)
            .maybeSingle();
          
          if (!existing) {
            return new Response(
              JSON.stringify({ success: false, error: "Password is required for initial setup" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        const { error } = await supabase
          .from("request_portal_settings")
          .upsert(upsertData, { onConflict: "organization_id" });

        if (error) {
          console.error("Error saving portal settings:", error);
          return new Response(
            JSON.stringify({ success: false, error: "Failed to save settings" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Portal auth error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
