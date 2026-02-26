import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, Users, UserPlus, AlertTriangle, Crown } from "lucide-react";
import dayjs from "dayjs";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";

interface OrganizationMember {
  id: string;
  user_id: string | null;
  role: string;
  status: string | null;
  invited_email: string | null;
  created_at: string | null;
}

interface MemberProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
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

export function UserPermissionsPanel({
  organizationId,
}: {
  organizationId: string | null;
}) {
  const { user } = useAuth();
  const { limits, activePlan } = usePlanFeatures();
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, MemberProfile>>({});
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "admin" });
  const [isInviting, setIsInviting] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const adminCount = members.filter(m => m.role === "admin" && m.status === "active").length;
  const maxAdmins = limits.maxAdmins;
  const isAtAdminLimit = maxAdmins !== null && adminCount >= maxAdmins;

  // Determine owner: oldest admin by created_at
  const ownerMember = members
    .filter(m => m.role === "admin" && m.status === "active")
    .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())[0];

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !organizationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data: memberData, error: memberError } = await supabase
          .from("organization_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("organization_id", organizationId)
          .maybeSingle();
        if (memberError) {
          setIsAdmin(false);
        } else {
          setIsAdmin(memberData?.role === "admin");
        }
        await fetchMembers(organizationId);
        await fetchInvites(organizationId);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, organizationId]);

  const fetchMembers = async (orgId: string) => {
    const { data, error } = await supabase
      .from("organization_members")
      .select("id, user_id, role, status, invited_email, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setMembers(data);
      // Fetch profiles for members with user_id
      const userIds = data.filter(m => m.user_id).map(m => m.user_id!);
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", userIds);
        if (profiles) {
          const profileMap: Record<string, MemberProfile> = {};
          profiles.forEach(p => {
            profileMap[p.user_id] = {
              first_name: p.first_name,
              last_name: p.last_name,
              email: p.email,
            };
          });
          setMemberProfiles(profileMap);
        }
      }
    }
  };

  const fetchInvites = async (orgId: string) => {
    const { data, error } = await supabase
      .from("organization_invites")
      .select("id, email, role, invited_at, expires_at, status, invited_by")
      .eq("organization_id", orgId)
      .order("invited_at", { ascending: false });
    if (!error && data) {
      setInvites(data);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim() || !organizationId) {
      toast({ title: "Please enter an email address", variant: "destructive" });
      return;
    }
    setIsInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-collaborator', {
        body: {
          email: inviteForm.email.toLowerCase().trim(),
          role: inviteForm.role,
          organizationId,
          invitedBy: user?.id,
        }
      });
      if (error) throw new Error(error.message || 'Failed to invoke edge function');
      if (data?.error) throw new Error(data.error + (data.details ? `: ${data.details}` : ''));

      toast({
        title: data?.existingUserLinked ? "Collaborator added" : "Invitation sent",
        description: data?.existingUserLinked
          ? `${inviteForm.email} has been added to your organization (user already exists)`
          : `An invitation email has been sent to ${inviteForm.email}`,
      });
      setInviteForm({ email: "", role: "admin" });
      await fetchInvites(organizationId);
      await fetchMembers(organizationId);
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from("organization_invites")
      .delete()
      .eq("id", inviteId);
    if (!error && organizationId) {
      await fetchInvites(organizationId);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMemberId(memberId);
    try {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
      toast({ title: "Admin removed", description: "The admin has been removed from your organization." });
      if (organizationId) await fetchMembers(organizationId);
    } catch (error: any) {
      toast({
        title: "Error removing admin",
        description: error.message || "Failed to remove admin.",
        variant: "destructive",
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  const getMemberDisplayName = (member: OrganizationMember) => {
    if (member.user_id && memberProfiles[member.user_id]) {
      const profile = memberProfiles[member.user_id];
      const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
      return name || profile.email || member.invited_email || "Active User";
    }
    return member.invited_email || "Active User";
  };

  const getMemberEmail = (member: OrganizationMember) => {
    if (member.user_id && memberProfiles[member.user_id]?.email) {
      return memberProfiles[member.user_id].email;
    }
    return member.invited_email;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      active: "default",
      inactive: "destructive",
      expired: "outline",
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
            Collaborators
          </CardTitle>
          <CardDescription>
            Complete your organization setup to manage collaborators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please complete your organization information in the Organization
            tab to enable user management features.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaborators
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please wait while we load your organization data.
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
            Collaborators
          </CardTitle>
          <CardDescription>
            Only organization administrators can manage collaborators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Contact your organization administrator if you need to invite collaborators
            or change permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Limit Warning */}
      {isAtAdminLimit && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">Admin limit reached</p>
            <p className="text-sm text-amber-700">
              You've reached your plan's limit of {maxAdmins} admin{maxAdmins !== 1 ? 's' : ''}.
              Upgrade to add more admins.
            </p>
          </div>
        </div>
      )}

      {/* Invite Users Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              <CardTitle>Invite New Admin</CardTitle>
            </div>
            {maxAdmins !== null && (
              <Badge variant={isAtAdminLimit ? "destructive" : "secondary"}>
                {adminCount} / {maxAdmins} admins
              </Badge>
            )}
            {maxAdmins === null && activePlan === 'ultra' && (
              <Badge variant="secondary">Unlimited admins</Badge>
            )}
          </div>
          <CardDescription>
            Send an invitation to add a new admin to your organization.
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
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm((f) => ({ ...f, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={!organizationId || isInviting || isAtAdminLimit}
              className="w-full md:w-auto"
            >
              {isInviting ? "Sending..." : isAtAdminLimit ? "Admin Limit Reached" : "Send Invitation"}
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
          {invites.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending invitations.</p>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invite.email}</span>
                      {getStatusBadge(invite.status)}
                      <Badge variant="outline">{invite.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Invited {dayjs(invite.invited_at).format("MMM D, YYYY")}{" "}
                      • Expires {dayjs(invite.expires_at).format("MMM D, YYYY")}
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
            Admin Collaborators
          </CardTitle>
          <CardDescription>
            Current admin collaborators of your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-sm">No members found.</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const isOwner = ownerMember?.id === member.id;
                const isSelf = member.user_id === user?.id;
                const canRemove = !isOwner && !isSelf;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getMemberDisplayName(member)}
                        </span>
                        {isOwner && (
                          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white">
                            <Crown className="h-3 w-3 mr-1" />
                            Owner
                          </Badge>
                        )}
                        {isSelf && !isOwner && (
                          <Badge variant="outline">You</Badge>
                        )}
                        {member.status && getStatusBadge(member.status)}
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                      {getMemberEmail(member) && (
                        <p className="text-sm text-muted-foreground">
                          {getMemberEmail(member)}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Joined{" "}
                        {member.created_at
                          ? dayjs(member.created_at).format("MMM D, YYYY")
                          : "Unknown"}
                      </p>
                    </div>
                    {canRemove && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            disabled={removingMemberId === member.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Admin</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove{" "}
                              <strong>{getMemberDisplayName(member)}</strong> from
                              your organization? They will lose access to all
                              organization features.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
