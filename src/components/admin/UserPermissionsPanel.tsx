
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, Users, UserPlus } from "lucide-react";
import dayjs from "dayjs";

interface OrganizationMember {
  id: string;
  user_id: string | null;
  role: string;
  status: string | null;
  invited_email: string | null;
  created_at: string | null;
}

interface OrganizationInvite {
  id: string;
  email: string;
  role: string;
  invited_at: string;
  expires_at: string;
  status: string;
  invited_by: string | null;
}

export function UserPermissionsPanel() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "member"
  });
  const [isInviting, setIsInviting] = useState(false);

  // Check if user is admin and get organization
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      
      // Get user's organization and role
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single();

      if (memberData?.organization_id) {
        setOrganizationId(memberData.organization_id);
        setIsAdmin(memberData.role === 'admin');
        
        if (memberData.role === 'admin') {
          await fetchMembers(memberData.organization_id);
          await fetchInvites(memberData.organization_id);
        }
      }
      
      setLoading(false);
    };
    
    checkAdminStatus();
  }, [user]);

  const fetchMembers = async (orgId: string) => {
    const { data, error } = await supabase
      .from('organization_members')
      .select('id, user_id, role, status, invited_email, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setMembers(data);
    } else if (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchInvites = async (orgId: string) => {
    const { data, error } = await supabase
      .from('organization_invites')
      .select('id, email, role, invited_at, expires_at, status, invited_by')
      .eq('organization_id', orgId)
      .order('invited_at', { ascending: false });
      
    if (!error && data) {
      setInvites(data);
    } else if (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim() || !organizationId) {
      toast({ title: "Please enter an email address", variant: "destructive" });
      return;
    }
    
    setIsInviting(true);
    
    const { error } = await supabase
      .from('organization_invites')
      .insert([{
        organization_id: organizationId,
        email: inviteForm.email.toLowerCase().trim(),
        role: inviteForm.role,
        invited_by: user?.id,
      }]);
      
    if (error) {
      console.error('Error creating invitation:', error);
      toast({ 
        title: "Error", 
        description: error.message.includes('duplicate') 
          ? "This email has already been invited" 
          : "Failed to send invitation", 
        variant: "destructive" 
      });
    } else {
      toast({ title: "Invitation sent successfully!" });
      setInviteForm({ email: "", role: "member" });
      if (organizationId) {
        await fetchInvites(organizationId);
      }
    }
    setIsInviting(false);
  };

  const handleDeleteInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from('organization_invites')
      .delete()
      .eq('id', inviteId);
      
    if (error) {
      console.error('Error deleting invitation:', error);
      toast({ title: "Error", description: "Failed to delete invitation", variant: "destructive" });
    } else {
      toast({ title: "Invitation deleted" });
      if (organizationId) {
        await fetchInvites(organizationId);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      active: "default",
      inactive: "destructive",
      expired: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  if (!organizationId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users & Permissions
          </CardTitle>
          <CardDescription>
            You need to be part of an organization to manage users and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please contact your administrator to be added to an organization.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users & Permissions
          </CardTitle>
          <CardDescription>
            Only organization administrators can manage users and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Contact your organization administrator if you need to invite users or change permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite New User
          </CardTitle>
          <CardDescription>
            Send an invitation to add a new user to your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(f => ({ ...f, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={isInviting} className="w-full md:w-auto">
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
          <CardDescription>
            Invitations that have been sent but not yet accepted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : invites.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending invitations.</p>
          ) : (
            <div className="space-y-3">
              {invites.map(invite => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invite.email}</span>
                      {getStatusBadge(invite.status)}
                      <Badge variant="outline">{invite.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Invited {dayjs(invite.invited_at).format("MMM D, YYYY")} • 
                      Expires {dayjs(invite.expires_at).format("MMM D, YYYY")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteInvite(invite.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Members
          </CardTitle>
          <CardDescription>
            Current members of your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : members.length === 0 ? (
            <p className="text-muted-foreground text-sm">No members found.</p>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {member.invited_email || 'Active User'}
                      </span>
                      {member.status && getStatusBadge(member.status)}
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Joined {member.created_at ? dayjs(member.created_at).format("MMM D, YYYY") : 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
