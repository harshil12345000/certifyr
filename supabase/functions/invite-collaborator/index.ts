import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client bound to the caller's JWT (to get the inviter user securely)
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Admin client with elevated privileges
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Parse body
    const { email, role, organizationId } = await req.json();

    if (!email || !role || !organizationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get inviter from JWT
    const { data: userData, error: getUserError } = await supabaseAuth.auth.getUser();
    if (getUserError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const inviterId = userData.user.id;

    // Verify inviter is an active admin of the organization
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('organization_members')
      .select('role')
      .eq('user_id', inviterId)
      .eq('organization_id', organizationId)
      .eq('role', 'admin')
      .eq('status', 'active')
      .maybeSingle();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to invite users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch organization for email metadata
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .maybeSingle();
    if (orgError || !organization) {
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create/record invite first
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('organization_invites')
      .insert({
        email: String(email).toLowerCase().trim(),
        role,
        organization_id: organizationId,
        invited_by: inviterId,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try sending Supabase Auth invitation email (new users only)
    const { data: inviteData, error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      String(email).toLowerCase().trim(),
      {
        // Do not set redirectTo here; use project Site URL configured in Supabase
        data: {
          organization_id: organizationId,
          organization_name: organization.name,
          role,
          invited_by: inviterId,
          invite_id: invite.id,
        },
      },
    );

    if (emailError) {
      // If user already exists, directly add them as a member and mark invite accepted
      const alreadyRegistered =
        typeof emailError.message === 'string' &&
        emailError.message.toLowerCase().includes('already registered');

      if (alreadyRegistered) {
        // Lookup existing user by email
        const listRes = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1,
          email: String(email).toLowerCase().trim(),
        } as any);

        // @ts-ignore: types for listUsers filter may vary across versions
        const existingUser = listRes.data?.users?.[0];
        if (existingUser?.id) {
          // Add to organization members
          const { error: addMemberError } = await supabaseAdmin
            .from('organization_members')
            .insert({
              user_id: existingUser.id,
              organization_id: organizationId,
              role,
              status: 'active',
              invited_email: String(email).toLowerCase().trim(),
            });

          if (addMemberError) {
            return new Response(
              JSON.stringify({ error: 'Failed to add existing user to organization' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Mark the invite as accepted
          await supabaseAdmin
            .from('organization_invites')
            .update({ status: 'accepted' })
            .eq('id', invite.id);

          return new Response(
            JSON.stringify({ success: true, existingUserLinked: true, inviteId: invite.id }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      }

      // For other email errors, roll back the invite
      await supabaseAdmin.from('organization_invites').delete().eq('id', invite.id);
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, inviteId: invite.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in invite-collaborator function:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
