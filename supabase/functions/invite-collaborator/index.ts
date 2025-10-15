import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get request body
    const { email, role, organizationId, invitedBy } = await req.json();

    console.log('Invitation request:', { email, role, organizationId, invitedBy });

    // Validate input
    if (!email || !role || !organizationId || !invitedBy) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the inviting user is an admin of the organization
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('organization_members')
      .select('role')
      .eq('user_id', invitedBy)
      .eq('organization_id', organizationId)
      .eq('role', 'admin')
      .eq('status', 'active')
      .single();

    if (membershipError || !membership) {
      console.error('Membership verification failed:', membershipError);
      return new Response(
        JSON.stringify({ error: 'Not authorized to invite users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get organization details for the invitation email
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      console.error('Organization fetch failed:', orgError);
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create invitation record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('organization_invites')
      .insert({
        email,
        role,
        organization_id: organizationId,
        invited_by: invitedBy,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Invite creation failed:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send invitation email using Supabase Auth
    const redirectUrl = `${supabaseUrl.replace('.supabase.co', '')}/auth/callback?next=/admin&org_invite=${invite.id}`;
    
    const { data: inviteData, error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: redirectUrl,
        data: {
          organization_id: organizationId,
          organization_name: organization.name,
          role: role,
          invited_by: invitedBy,
          invite_id: invite.id,
        }
      }
    );

    if (emailError) {
      console.error('Email invitation failed:', emailError);
      // Delete the invite record if email fails
      await supabaseAdmin
        .from('organization_invites')
        .delete()
        .eq('id', invite.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation email', details: emailError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Invitation sent successfully:', { email, inviteId: invite.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        inviteId: invite.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in invite-collaborator function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
