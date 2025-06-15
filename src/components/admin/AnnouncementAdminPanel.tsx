import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import dayjs from "dayjs";
interface Announcement {
  id: string;
  title: string;
  content: string;
  is_global: boolean;
  is_active: boolean;
  created_at: string;
  expires_at?: string | null;
  organization_id?: string | null;
}
export function AnnouncementAdminPanel() {
  const {
    user
  } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    is_active: true,
    expires_at: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);

  // Fetch user's organization and announcements
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // Get user's organization ID
        const {
          data: memberData,
          error: memberError
        } = await supabase.from('organization_members').select('organization_id').eq('user_id', user.id).maybeSingle();
        if (memberError && memberError.code !== 'PGRST116') {
          console.error('Error fetching organization membership:', memberError);
          toast({
            title: "Error",
            description: "Failed to check organization membership",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        if (memberData?.organization_id) {
          setOrganizationId(memberData.organization_id);

          // Fetch announcements for this organization
          const {
            data,
            error
          } = await supabase.from("announcements").select("id, title, content, is_global, is_active, created_at, expires_at, organization_id").eq('organization_id', memberData.organization_id).order('created_at', {
            ascending: false
          });
          if (!error && data) {
            setAnnouncements(data);
          } else if (error) {
            console.error('Error fetching announcements:', error);
            toast({
              title: "Error",
              description: "Failed to load announcements",
              variant: "destructive"
            });
          }
        } else {
          // User doesn't have organization membership, try to create one
          await createOrganizationFromProfile();
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        toast({
          title: "Error",
          description: "Failed to load organization data",
          variant: "destructive"
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);
  const createOrganizationFromProfile = async () => {
    if (!user?.id) return;
    try {
      // Get user profile to check for organization data
      const {
        data: userProfile,
        error: profileError
      } = await supabase.from('user_profiles').select('organization_name, organization_type, organization_location, email, phone_number').eq('user_id', user.id).single();
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }
      if (userProfile?.organization_name) {
        setIsCreatingOrganization(true);

        // Create organization
        const {
          data: newOrg,
          error: orgError
        } = await supabase.from('organizations').insert([{
          name: userProfile.organization_name,
          email: userProfile.email,
          phone: userProfile.phone_number,
          address: userProfile.organization_location
        }]).select().single();
        if (orgError) {
          console.error('Error creating organization:', orgError);
          return;
        }

        // Add user as admin to the organization
        const {
          error: memberError
        } = await supabase.from('organization_members').insert([{
          organization_id: newOrg.id,
          user_id: user.id,
          role: 'admin',
          status: 'active'
        }]);
        if (memberError) {
          console.error('Error adding user to organization:', memberError);
        } else {
          setOrganizationId(newOrg.id);
          toast({
            title: "Organization created successfully!"
          });
        }
        setIsCreatingOrganization(false);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      setIsCreatingOrganization(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({
      ...f,
      [e.target.name]: e.target.value
    }));
  };
  const handleSwitch = (name: string, value: boolean) => {
    setForm(f => ({
      ...f,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "Title and content are required",
        variant: "destructive"
      });
      return;
    }
    if (!organizationId) {
      toast({
        title: "No organization found",
        description: "You must be part of an organization to create announcements",
        variant: "destructive"
      });
      return;
    }
    setIsCreating(true);
    const {
      error,
      data
    } = await supabase.from("announcements").insert([{
      title: form.title,
      content: form.content,
      is_global: false,
      // Always false for organization-specific announcements
      is_active: form.is_active,
      expires_at: form.expires_at ? form.expires_at : null,
      created_by: user?.id,
      organization_id: organizationId
    }]).select();
    if (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Announcement created!"
      });
      if (data && data[0]) {
        setAnnouncements(a => [data[0], ...a]);
      }
      setForm({
        title: "",
        content: "",
        is_active: true,
        expires_at: ""
      });
    }
    setIsCreating(false);
  };
  if (loading || isCreatingOrganization) {
    return <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            {isCreatingOrganization ? "Setting up your organization..." : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {isCreatingOrganization ? "Creating your organization and setting up admin access..." : "Please wait while we load your organization data."}
          </p>
        </CardContent>
      </Card>;
  }
  if (!organizationId) {
    return <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            Complete your organization setup to manage announcements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please complete your organization information in the Organization tab to enable announcement features.
          </p>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle>Organization Announcements</CardTitle>
        <CardDescription>
          Post important announcements for your organization members. Only admins can post announcements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
          <div>
            <Label>Title</Label>
            <Input name="title" value={form.title} onChange={handleChange} required maxLength={100} />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea name="content" rows={3} value={form.content} onChange={handleChange} required maxLength={500} />
          </div>
          <div className="flex gap-4 items-center">
            <Label htmlFor="is_active" className="mr-2">Active</Label>
            <Switch id="is_active" checked={form.is_active} onCheckedChange={(v: boolean) => handleSwitch("is_active", v)} />
          </div>
          <div>
            <Label htmlFor="expires_at" className="mr-2">Expires at (optional)</Label>
            <Input type="datetime-local" name="expires_at" id="expires_at" value={form.expires_at} onChange={handleChange} className="max-w-[200px] mx-0 px-[18px]" />
          </div>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Announcement"}
          </Button>
        </form>

        <div>
          <h3 className="font-medium mb-4">Organization Announcements</h3>
          <ul className="space-y-4">
            {announcements.length === 0 ? <li className="text-muted-foreground text-sm">No announcements yet.</li> : announcements.map(a => <li key={a.id} className="border bg-muted rounded-lg px-3 py-2">
                  <div className="flex justify-between">
                    <p className="font-semibold">{a.title}</p>
                    <span className="text-xs">{dayjs(a.created_at).format("MMM D, YYYY HH:mm")}</span>
                  </div>
                  <div className="text-sm mt-1">{a.content}</div>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className={a.is_active ? "text-green-700" : "text-muted-foreground"}>
                      {a.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-blue-700">Organization</span>
                    {a.expires_at && <span className="text-muted-foreground">Expires: {dayjs(a.expires_at).format("MMM D, YYYY HH:mm")}</span>}
                  </div>
                </li>)}
          </ul>
        </div>
      </CardContent>
    </Card>;
}