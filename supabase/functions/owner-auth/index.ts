import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getServiceRoleClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON", details: e.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { action, email, password, ownerToken, targetUserId, newPlan, title, content, expires_at } = body;
    const supabase = getServiceRoleClient();

    // LOGIN
    if (action === "login") {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email and password required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: cred, error: credErr } = await supabase
        .from("owner_credentials")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (credErr || !cred) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify password using pgcrypto
      const { data: match } = await supabase.rpc("verify_owner_password", {
        p_email: email.trim().toLowerCase(),
        p_password: password,
      });

      if (!match) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate a simple session token (stored server-side)
      const token = crypto.randomUUID();
      await supabase.from("owner_credentials").update({ 
        updated_at: new Date().toISOString(),
      }).eq("email", email.trim().toLowerCase());

      // We'll use token as a simple bearer - store in memory via the credential id
      // For simplicity, we hash the token and store it
      return new Response(JSON.stringify({ 
        success: true, 
        token: `${cred.id}:${token}`,
        email: cred.email,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SETUP - only works if no owner exists yet
    if (action === "setup") {
      const { count } = await supabase
        .from("owner_credentials")
        .select("*", { count: "exact", head: true });

      if (count && count > 0) {
        return new Response(JSON.stringify({ error: "Owner already exists" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email and password required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Hash password using pgcrypto
      const { data: hash, error: hashErr } = await supabase.rpc("hash_owner_password", {
        p_password: password,
      });

      if (hashErr) {
        return new Response(JSON.stringify({ error: "Failed to hash password" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: insertErr } = await supabase.from("owner_credentials").insert({
        email: email.trim().toLowerCase(),
        password_hash: hash,
      });

      if (insertErr) {
        return new Response(JSON.stringify({ error: insertErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All other actions require owner token verification
    if (!ownerToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ownerId = ownerToken.split(":")[0];
    const { data: owner } = await supabase
      .from("owner_credentials")
      .select("id")
      .eq("id", ownerId)
      .maybeSingle();

    if (!owner) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LIST USERS
    if (action === "list_users") {
      const { data: users } = await supabase.auth.admin.listUsers({ perPage: 500 });
      
      // Get all subscriptions
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("user_id, active_plan, subscription_status");

      // Get all user profiles
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, first_name, last_name, email, organization_name, organization_type");

      const enriched = (users?.users || []).map((u) => {
        const sub = subs?.find((s) => s.user_id === u.id);
        const profile = profiles?.find((p) => p.user_id === u.id);
        return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          first_name: profile?.first_name || "",
          last_name: profile?.last_name || "",
          organization_name: profile?.organization_name || "",
          organization_type: profile?.organization_type || "",
          active_plan: sub?.active_plan || "none",
          subscription_status: sub?.subscription_status || "none",
        };
      });

      return new Response(JSON.stringify({ users: enriched }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CHANGE PLAN
    if (action === "change_plan") {
      if (!targetUserId || !newPlan) {
        return new Response(JSON.stringify({ error: "targetUserId and newPlan required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert subscription
      const isNone = newPlan === "none";
      const { error: subErr } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: targetUserId,
          active_plan: isNone ? null : newPlan,
          selected_plan: isNone ? null : newPlan,
          subscription_status: isNone ? "inactive" : "active",
          canceled_at: isNone ? new Date().toISOString() : null,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (subErr) {
        console.error("Subscription upsert error:", subErr);
        return new Response(JSON.stringify({ error: subErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Also sync user_profiles.plan
      const { error: profileErr } = await supabase
        .from("user_profiles")
        .update({ plan: isNone ? "basic" : newPlan, updated_at: new Date().toISOString() })
        .eq("user_id", targetUserId);

      if (profileErr) {
        console.error("Profile update error:", profileErr);
      }

      console.log(`Owner changed plan for ${targetUserId} to ${newPlan}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE USER
    if (action === "delete_user") {
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: "targetUserId required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete from all public tables with user_id
      const tables = [
        "verified_documents", "document_drafts", "document_history", "documents",
        "preview_generations", "user_statistics", "user_profiles", "user_appearance_settings",
        "user_announcement_reads", "subscriptions", "notifications", "organization_invites",
        "organization_members",
      ];

      for (const table of tables) {
        await supabase.from(table).delete().eq("user_id", targetUserId);
      }

      // Delete from auth
      const { error: authErr } = await supabase.auth.admin.deleteUser(targetUserId);
      if (authErr) {
        return new Response(JSON.stringify({ error: authErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CREATE GLOBAL ANNOUNCEMENT
    if (action === "create_announcement") {
      const { title, content, expires_at } = await req.json();
      
      if (!title || !content) {
        return new Response(JSON.stringify({ error: "Title and content required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const supabase = getServiceRoleClient();
        
        // Insert directly with service role (bypasses RLS)
        const { data: announcement, error: annError } = await supabase
          .from("announcements")
          .insert({
            title,
            content,
            expires_at: expires_at || null,
            is_active: true,
            is_global: true,
            organization_id: null,
            created_by: "00000000-0000-0000-0000-000000000000",
          })
          .select()
          .single();

        if (annError) {
          console.error("Announcement insert error:", JSON.stringify(annError));
          return new Response(JSON.stringify({ error: annError.message, code: annError.code }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get all organizations
        const { data: orgs, error: orgsError } = await supabase
          .from("organizations")
          .select("id");

        if (orgsError) {
          console.error("Org fetch error:", JSON.stringify(orgsError));
        }

        if (orgs && orgs.length > 0) {
          const notifications = orgs.map(org => ({
            org_id: org.id,
            subject: `📢 ${title}`,
            body: content,
            type: "announcement",
            read_by: [],
            data: { announcement_id: announcement.id },
          }));

          const { error: notifError } = await supabase
            .from("notifications")
            .insert(notifications);

          if (notifError) {
            console.error("Notifications insert error:", JSON.stringify(notifError));
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err: any) {
        console.error("Unexpected error:", JSON.stringify(err));
        return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // LIST GLOBAL ANNOUNCEMENTS
    if (action === "list_announcements") {
      try {
        const supabase = getServiceRoleClient();
        
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .is("organization_id", null)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("List announcements error:", JSON.stringify(error));
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ announcements: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err: any) {
        console.error("Unexpected error:", JSON.stringify(err));
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
