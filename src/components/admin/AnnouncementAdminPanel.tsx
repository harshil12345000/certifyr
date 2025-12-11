
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, Calendar } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  expires_at: string | null;
  is_active: boolean;
  is_global: boolean;
  created_at: string;
  organization_id: string | null;
}

export const AnnouncementAdminPanel: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    expires_at: "",
    is_global: false,
  });
  const { user } = useAuth();
  const { orgId, loading: orgLoading } = useOrganizationId();

  useEffect(() => {
    if (!orgLoading && orgId) {
      fetchAnnouncements();
    } else if (!orgLoading && !orgId) {
      setLoading(false);
    }
  }, [orgId, orgLoading]);

  const fetchAnnouncements = async () => {
    if (!orgId) return;
    
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !orgId) {
      toast.error('Organization not found');
      return;
    }

    setSubmitting(true);
    try {
      // Create the announcement
      const { data: announcementData, error: announcementError } = await supabase
        .from('announcements')
        .insert({
          title: formData.title,
          content: formData.content,
          expires_at: formData.expires_at || null,
          is_global: formData.is_global,
          created_by: user.id,
          organization_id: orgId,
        })
        .select()
        .single();

      if (announcementError) throw announcementError;

      // Create a notification for all users in the organization
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          org_id: orgId,
          subject: `New Announcement: ${formData.title}`,
          body: formData.content,
          type: 'announcement',
          data: { announcement_id: announcementData.id },
          read_by: [],
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the whole operation if notification fails
      }

      toast.success('Announcement created successfully');
      setFormData({ title: "", content: "", expires_at: "", is_global: false });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    } finally {
      setSubmitting(false);
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
      toast.success('Announcement status updated');
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
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
      toast.success('Announcement deleted');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading || orgLoading) {
    return <div>Loading...</div>;
  }

  if (!orgId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No organization found. Please set up your organization first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Announcement content"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_global"
                checked={formData.is_global}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_global: checked }))}
              />
              <Label htmlFor="is_global">Global Announcement</Label>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating..." : "Create Announcement"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-muted-foreground">No announcements found.</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground">{announcement.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(announcement.created_at)}
                        {announcement.expires_at && (
                          <span>• Expires: {formatDate(announcement.expires_at)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={announcement.is_active ? "default" : "secondary"}>
                        {announcement.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {announcement.is_global && (
                        <Badge variant="outline">Global</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAnnouncementStatus(announcement.id, announcement.is_active)}
                    >
                      {announcement.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
