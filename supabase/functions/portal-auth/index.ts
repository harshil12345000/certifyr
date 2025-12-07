import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

        // Check if it's bcrypt hash or legacy base64
        let isValid = false;
        if (settings.password_hash.startsWith("$2")) {
          // bcrypt hash
          isValid = await bcrypt.compare(password, settings.password_hash);
        } else {
          // Legacy base64 - migrate on successful login
          try {
            const decodedPassword = atob(settings.password_hash);
            isValid = decodedPassword === password;
            
            if (isValid) {
              // Migrate to bcrypt
              const newHash = await bcrypt.hash(password);
              await supabase
                .from("request_portal_settings")
                .update({ password_hash: newHash })
                .eq("organization_id", organization_id);
              console.log("Migrated legacy password to bcrypt for org:", organization_id);
            }
          } catch {
            isValid = false;
          }
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

        // Check password
        let isValid = false;
        if (employee.password_hash.startsWith("$2")) {
          isValid = await bcrypt.compare(password, employee.password_hash);
        } else {
          // Legacy base64
          try {
            const decodedPassword = atob(employee.password_hash);
            isValid = decodedPassword === password;
            
            if (isValid) {
              // Migrate to bcrypt
              const newHash = await bcrypt.hash(password);
              await supabase
                .from("request_portal_employees")
                .update({ password_hash: newHash })
                .eq("id", employee.id);
              console.log("Migrated legacy employee password to bcrypt:", employee.id);
            }
          } catch {
            isValid = false;
          }
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
        // Employee registration with bcrypt password
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

        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash(password);

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
        // Save portal password with bcrypt (requires auth)
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, error: "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { organization_id, password, enabled, portal_url } = payload;
        
        if (!organization_id || !password) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash(password);

        const { error } = await supabase
          .from("request_portal_settings")
          .upsert({
            organization_id,
            enabled: enabled ?? false,
            password_hash: passwordHash,
            portal_url: portal_url || "",
          }, { onConflict: "organization_id" });

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
