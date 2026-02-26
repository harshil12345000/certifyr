import React, { useState, useEffect, useCallback, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Trash2, Shield, Send, Megaphone, Users, Bell } from "lucide-react";

interface OwnerUser {
  id: string;
  email: string;
  created_at: string;
  first_name: string;
  last_name: string;
  organization_name: string;
  organization_type: string;
  active_plan: string;
  subscription_status: string;
}

const PLANS = ["none", "basic", "pro", "ultra"];

interface GlobalAnnouncement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

const callOwnerApi = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("owner-auth", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
};

export default function OwnerDashboard() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem("owner_token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<OwnerUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState<GlobalAnnouncement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    expires_at: "",
  });
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "announcements">("users");

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const data = await callOwnerApi({ action: "list_users", ownerToken: token });
      setUsers(data.users || []);
    } catch (err: any) {
      if (err.message === "Invalid token") {
        sessionStorage.removeItem("owner_token");
        setToken(null);
      }
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingUsers(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  const fetchAnnouncements = useCallback(async () => {
    setLoadingAnnouncements(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .is('organization_id', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchAnnouncements();
    }
  }, [token, fetchUsers, fetchAnnouncements]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await callOwnerApi({ action: "login", email, password });
      sessionStorage.setItem("owner_token", data.token);
      setToken(data.token);
      toast({ title: "Authenticated", description: "Welcome, Owner." });
    } catch (err: any) {
      if (err.message === "Invalid credentials") {
        setNeedsSetup(true);
      }
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    void handleLogin();
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      await callOwnerApi({ action: "setup", email, password });
      toast({ title: "Owner created", description: "Now log in." });
      setNeedsSetup(false);
    } catch (err: any) {
      toast({ title: "Setup failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (userId: string, newPlan: string) => {
    setActionLoading(userId);
    try {
      await callOwnerApi({ action: "change_plan", ownerToken: token, targetUserId: userId, newPlan });
      toast({ title: "Plan updated", description: `Set to ${newPlan}` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await callOwnerApi({ action: "delete_user", ownerToken: token, targetUserId: userId });
      toast({ title: "User deleted" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
      return;
    }

    setSendingAnnouncement(true);
    try {
      const result = await callOwnerApi({ 
        action: "create_announcement", 
        ownerToken: token,
        title: announcementForm.title,
        content: announcementForm.content,
        expires_at: announcementForm.expires_at || null,
      });

      toast({ title: "Success", description: "Announcement sent to all organizations" });
      setAnnouncementForm({ title: "", content: "", expires_at: "" });
      fetchAnnouncements();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const toggleAnnouncementStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setAnnouncements(prev =>
        prev.map(ann => ann.id === id ? { ...ann, is_active: !currentStatus } : ann)
      );
      toast({ title: "Success", description: "Announcement status updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
      toast({ title: "Success", description: "Announcement deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("owner_token");
    setToken(null);
    setUsers([]);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.organization_name?.toLowerCase().includes(q)
    );
  });

  // Login screen
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-10 w-10 text-primary mb-2" />
            <CardTitle className="text-xl">Owner Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground">Restricted access</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
              {needsSetup && (
                <Button variant="outline" className="w-full" onClick={handleSetup} disabled={loading} type="button">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Owner Account
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

// Dashboard
  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            onClick={() => setActiveTab("users")}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Users
          </Button>
          <Button
            variant={activeTab === "announcements" ? "default" : "ghost"}
            onClick={() => setActiveTab("announcements")}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Announcements
          </Button>
        </div>

        {activeTab === "users" && (
          <>
            <Input
              placeholder="Search by name, email, or org..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />

            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">
                            {user.first_name} {user.last_name}
                          </p>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {user.organization_type || "N/A"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.organization_name || "No org"} · Joined{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Select
                          value={user.active_plan || "none"}
                          onValueChange={(val) => handleChangePlan(user.id, val)}
                          disabled={actionLoading === user.id}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PLANS.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete user permanently?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete <strong>{user.email}</strong> and all their data.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "announcements" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Send Global Announcement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcement-title">Title</Label>
                    <Input
                      id="announcement-title"
                      placeholder="Announcement title"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="announcement-content">Content</Label>
                    <Textarea
                      id="announcement-content"
                      placeholder="Announcement content"
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="announcement-expires">Expiration Date (Optional)</Label>
                    <Input
                      id="announcement-expires"
                      type="date"
                      value={announcementForm.expires_at}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, expires_at: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={sendingAnnouncement}>
                    {sendingAnnouncement && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="mr-2 h-4 w-4" />
                    Send to All Organizations
                  </Button>
                </form>
              </CardContent>
            </Card>

            {announcements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Previous Global Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <p className="text-sm text-muted-foreground">{announcement.content}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              Created: {new Date(announcement.created_at).toLocaleDateString()}
                              {announcement.expires_at && (
                                <span>• Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={announcement.is_active ? "default" : "secondary"}>
                              {announcement.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAnnouncementStatus(announcement.id, announcement.is_active)}
                          >
                            {announcement.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteAnnouncement(announcement.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
