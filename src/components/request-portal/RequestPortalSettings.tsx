import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationId } from "@/hooks/useOrganizationId";
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
  portalSlug: string;
}

interface Organization {
  id: string;
  name: string;
  portal_slug: string;
}
export function RequestPortalSettings() {
  const { user } = useAuth();
  const { orgId, loading: orgLoading } = useOrganizationId();
  const [settings, setSettings] = useState<PortalSettings>({
    enabled: false,
    password: "",
    portalUrl: "",
    portalSlug: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  
  useEffect(() => {
    if (!orgLoading && orgId) {
      fetchSettings();
    }
  }, [orgId, orgLoading]);
  
  const fetchSettings = async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    
    try {
      // Get organization details
      const { data: orgData, error: orgDataError } = await supabase
        .from("organizations")
        .select("id, name, portal_slug")
        .eq("id", orgId)
        .single();
        
      if (orgDataError || !orgData) {
        console.error("Error fetching organization details:", orgDataError);
        setLoading(false);
        return;
      }
      
      setOrganization(orgData);

      // Get portal settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("request_portal_settings")
        .select("*")
        .eq("organization_id", orgData.id)
        .maybeSingle();
        
      if (settingsError) {
        console.error("Error fetching settings:", settingsError);
      }

      // Generate the portal URL using slug
      const portalUrl = `${window.location.origin}/portal/${orgData.portal_slug || 'your-org'}`;
      
      const decodedPassword = settingsData?.password_hash ? (() => {
        try {
          return atob(settingsData.password_hash);
        } catch (error) {
          console.error("Error decoding portal password:", error);
          return "";
        }
      })() : "";
      
      setSettings({
        enabled: settingsData?.enabled ?? false,
        password: decodedPassword,
        portalUrl,
        portalSlug: orgData.portal_slug || ""
      });
      
      // Set slug as available initially since it's the org's own slug
      if (orgData.portal_slug) {
        setSlugAvailable(true);
      }
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
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    // Validate format
    if (!/^[a-z][a-z0-9-]{2,49}$/.test(slug)) {
      setSlugAvailable(false);
      return;
    }

    setCheckingSlug(true);
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("id")
        .eq("portal_slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error checking slug:", error);
        setSlugAvailable(null);
        return;
      }

      // Slug is available if no organization found, or if it's the current organization
      setSlugAvailable(!data || data.id === orgId);
    } catch (error) {
      console.error("Error checking slug availability:", error);
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSlugChange = (value: string) => {
    // Convert to lowercase and replace spaces with hyphens
    let slug = value.toLowerCase().replace(/\s+/g, '-');
    // Remove any invalid characters
    slug = slug.replace(/[^a-z0-9-]/g, '');
    
    setSettings(prev => ({
      ...prev,
      portalSlug: slug,
      portalUrl: `${window.location.origin}/portal/${slug}`
    }));

    // Check availability after a short delay
    const timeoutId = setTimeout(() => {
      checkSlugAvailability(slug);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const saveSettings = async () => {
    if (!user || !orgId) {
      toast({
        title: "Error",
        description: "Organization not found. Please refresh the page.",
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

    if (!settings.portalSlug || settings.portalSlug.length < 3) {
      toast({
        title: "Error",
        description: "Portal name must be at least 3 characters",
        variant: "destructive"
      });
      return;
    }

    if (slugAvailable === false) {
      toast({
        title: "Error",
        description: "Portal name is already taken",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Update organization slug
      const { error: orgError } = await supabase
        .from("organizations")
        .update({ portal_slug: settings.portalSlug })
        .eq("id", orgId);

      if (orgError) {
        console.error("Error updating organization slug:", orgError);
        throw orgError;
      }

      // Hash the password
      const passwordHash = btoa(settings.password);

      // Upsert portal settings
      const { error: settingsError } = await supabase
        .from("request_portal_settings")
        .upsert({
          organization_id: orgId,
          enabled: settings.enabled,
          password_hash: passwordHash,
          portal_url: settings.portalUrl
        }, {
          onConflict: "organization_id"
        });

      if (settingsError) {
        console.error("Error saving portal settings:", settingsError);
        throw settingsError;
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
  if (loading || orgLoading) {
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
          <Switch 
            id="portal-enabled" 
            checked={settings.enabled} 
            onCheckedChange={enabled => {
              setSettings(prev => ({
                ...prev,
                enabled
              }));
            }} 
          />
          <Label htmlFor="portal-enabled">Enable Request Portal</Label>
        </div>

        {settings.enabled && <>
            <div className="space-y-2">
              <Label htmlFor="portal-name">Portal Name</Label>
              <div className="relative">
                <Input 
                  id="portal-name" 
                  value={settings.portalSlug} 
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="e.g., acme-corp"
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {checkingSlug && <span className="text-muted-foreground">Checking...</span>}
                  {!checkingSlug && slugAvailable === true && settings.portalSlug.length >= 3 && (
                    <span className="text-green-600">✓ Available</span>
                  )}
                  {!checkingSlug && slugAvailable === false && (
                    <span className="text-destructive">✗ Taken</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and hyphens. Must start with a letter (3-50 characters).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Portal Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={settings.password} 
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    password: e.target.value
                  }))} 
                  placeholder="Enter a secure password" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portal-url">Portal URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="portal-url" 
                  value={settings.portalUrl} 
                  readOnly 
                  className="flex-1" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={copyUrl} 
                  className="my-0 py-[19px]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert className="bg-transparent rounded-sm">
              <AlertDescription>
                Share this URL with your employees or students to allow them to request documents. 
                They will need to enter the portal password and be approved by an admin.
              </AlertDescription>
            </Alert>
          </>}

        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>;
}