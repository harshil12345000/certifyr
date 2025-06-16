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

export function AnnouncementAdminPanel({ organizationId }: { organizationId: string | null }) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    is_active: true,
    expires_at: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !organizationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch announcements for this organization
        const { data, error } = await supabase
          .from("announcements")
          .select("id, title, content, is_global, is_active, created_at, expires_at, organization_id")
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          setAnnouncements(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, organizationId]);

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
    const { error, data } = await supabase.from("announcements").insert([{
      title: form.title,
      content: form.content,
      is_global: false,
      is_active: form.is_active,
      expires_at: form.expires_at ? form.expires_at : null,
      created_by: user?.id,
      organization_id: organizationId
    }]).select();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Announcement created!" });
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

  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please wait while we load your organization data.</p>
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
          <Button type="submit" disabled={!organizationId || isCreating}>
            {isCreating ? "Creating..." : "Create Announcement"}
          </Button>
          {!organizationId && (
            <p className="text-xs text-red-500 mt-2">You must be part of an organization to create announcements.</p>
          )}
        </form>
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
      </CardContent>
    </Card>;
}