import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
interface PortalSettings {
  enabled: boolean;
  password: string;
  portalUrl: string;
}
export function RequestPortalSettings() {
  const {
    user
  } = useAuth();
  const [settings, setSettings] = useState<PortalSettings>({
    enabled: false,
    password: "",
    portalUrl: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  useEffect(() => {
    fetchSettings();
  }, [user]);
  const fetchSettings = async () => {
    if (!user) return;
    try {
      // Get user's organization
      const {
        data: orgData,
        error: orgError
      } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).eq("role", "admin").single();
      if (orgError || !orgData) {
        console.error("Error fetching organization:", orgError);
        setLoading(false);
        return;
      }
      setOrganizationId(orgData.organization_id);

      // Get portal settings
      const {
        data: settingsData,
        error: settingsError
      } = await supabase.from("request_portal_settings").select("*").eq("organization_id", orgData.organization_id).maybeSingle();
      if (settingsError) {
        console.error("Error fetching settings:", settingsError);
      }

      // Always generate the portal URL dynamically
      const portalUrl = `${window.location.origin}/${orgData.organization_id}/request-portal`;
      setSettings({
        enabled: settingsData ? settingsData.enabled : false,
        password: "",
        // Don't display stored password
        portalUrl
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load portal settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const saveSettings = async () => {
    if (!user || !organizationId) {
      toast({
        title: "Error",
        description: "User or organization not found",
        variant: "destructive"
      });
      return;
    }
    if (!settings.password.trim()) {
      toast({
        title: "Error",
        description: "Password is required",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      // Hash the password (simple hash for demo - use bcrypt in production)
      const passwordHash = btoa(settings.password);

      // Upsert portal settings
      const {
        error
      } = await supabase.from("request_portal_settings").upsert({
        organization_id: organizationId,
        enabled: settings.enabled,
        password_hash: passwordHash,
        portal_url: settings.portalUrl
      }, {
        onConflict: "organization_id"
      });
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      toast({
        title: "Success",
        description: "Portal settings saved successfully"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save portal settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const copyUrl = () => {
    navigator.clipboard.writeText(settings.portalUrl);
    toast({
      title: "Copied",
      description: "Portal URL copied to clipboard"
    });
  };
  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle>Portal Settings</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle>Portal Settings</CardTitle>
        <CardDescription>
          Configure your organization's employee request portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch id="portal-enabled" checked={settings.enabled} onCheckedChange={enabled => setSettings(prev => ({
          ...prev,
          enabled
        }))} />
          <Label htmlFor="portal-enabled">Enable Request Portal</Label>
        </div>

        {settings.enabled && <>
            <div className="space-y-2">
              <Label htmlFor="password">Portal Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={settings.password} onChange={e => setSettings(prev => ({
              ...prev,
              password: e.target.value
            }))} placeholder="Enter a secure password" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portal-url">Portal URL</Label>
              <div className="flex gap-2">
                <Input id="portal-url" value={settings.portalUrl} readOnly className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={copyUrl} className="py-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert className="bg-transparent rounded-sm">
              <AlertDescription>
                Share this URL with your employees to allow them to request
                documents. They will need to enter the portal password and be
                approved by an admin.
              </AlertDescription>
            </Alert>
          </>}

        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>;
}