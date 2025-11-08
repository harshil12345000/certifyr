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
    const fallbackUrl = "https://yjeeamhahyhfawwgebtd.supabase.co";
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || fallbackUrl;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl) {
      console.error('Missing database URL.');
      return new Response(
        JSON.stringify({ error: 'Server not configured, database URL is missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!anonKey) {
      console.error('Missing anon key.');
      return new Response(
        JSON.stringify({ error: 'Server not configured. Missing anon key.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!serviceRoleKey) {
      console.error('Missing service role key.');
      return new Response(
        JSON.stringify({ error: 'Server not configured: Service role key is missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    console.log('Received invitation request:', { email, role, organizationId });

    if (!email || !role || !organizationId) {
      console.error('Missing required fields:', { email: !!email, role: !!role, organizationId: !!organizationId });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, role, and organizationId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get inviter from JWT
    const { data: userData, error: getUserError } = await supabaseAuth.auth.getUser();
    if (getUserError || !userData?.user) {
      console.error('Failed to get user from JWT:', getUserError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please log in again' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const inviterId = userData.user.id;
    console.log('Inviter ID:', inviterId);

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
      console.error('Membership verification failed:', membershipError);
      return new Response(
        JSON.stringify({ error: 'You must be an organization admin to invite collaborators' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('Inviter is verified admin of organization');

    // Fetch organization for email metadata
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .maybeSingle();
    if (orgError || !organization) {
      console.error('Organization fetch failed:', orgError);
      return new Response(
        JSON.stringify({ error: 'Organization not found. Please contact support.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('Organization found:', organization.name);

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
      console.error('Invite creation failed:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation record: ' + inviteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('Invitation record created:', invite.id);

    // Try sending Supabase Auth invitation email (new users only)
    console.log('Attempting to send invitation email to:', email);
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

    console.log('Email invitation result:', { success: !emailError, error: emailError?.message });

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
      console.error('Email sending failed, rolling back invite:', emailError);
      await supabaseAdmin.from('organization_invites').delete().eq('id', invite.id);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send invitation email. Please ensure email is configured in email service settings.',
          details: emailError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Invitation sent successfully');

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
