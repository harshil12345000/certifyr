import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Sun, User, Palette, Shield, Globe, Upload, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SettingsSkeleton } from "@/components/dashboard/SettingsSkeleton";
import { processSignatureImage } from "@/lib/signature-utils";

const Settings = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
    phone: "",
  });

  // Signature state
  const [signaturePath, setSignaturePath] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const [preferences, setPreferences] = useState({
    theme: "light",
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    language: "en",
    timezone: "UTC",
  });

  // Modal state for change password
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Modal state for delete account
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showDeleteFinalDialog, setShowDeleteFinalDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadUserProfile = async () => {
      try {
        console.log("Loading user profile for user:", user.id);

        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error loading user profile:", error);
          toast.error("Failed to load profile data");
          return;
        }

        console.log("Loaded profile data:", profile);

        if (profile) {
          setFormData({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            email: profile.email || user.email || "",
            designation: profile.designation || "",
            phone: profile.phone_number || "",
          });

          // Load signature
          const sigPath = (profile as any).signature_path as string | null;
          if (sigPath) {
            setSignaturePath(sigPath);
            const { data: urlData } = supabase.storage
              .from("branding-assets")
              .getPublicUrl(sigPath);
            setSignatureUrl(urlData.publicUrl);
          }
        } else {
          // If no profile exists, just set email from user
          setFormData((prev) => ({
            ...prev,
            email: user.email || "",
          }));
        }
      } catch (error) {
        console.error("Unexpected error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      console.log("Saving profile data:", formData);

      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const profileData = {
        user_id: user.id,
        first_name: formData.firstName.trim() || null,
        last_name: formData.lastName.trim() || null,
        email: formData.email.trim() || user.email,
        designation: formData.designation.trim() || null,
        phone_number: formData.phone.trim() || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existingProfile) {
        // Update existing profile
        console.log("Updating existing profile");
        result = await supabase
          .from("user_profiles")
          .update(profileData)
          .eq("user_id", user.id);
      } else {
        // Insert new profile
        console.log("Inserting new profile");
        result = await supabase
          .from("user_profiles")
          .insert(profileData);
      }

      const { error } = result;

      if (error) {
        console.error("Error saving profile:", error);
        toast.error("Failed to save profile: " + error.message);
        return;
      }

      console.log("Profile saved successfully");
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Unexpected error saving profile:", error);
      toast.error("Failed to save profile: " + (error?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  // Signature upload handler
  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type: only PNG or JPG
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Please upload PNG or JPG files only");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingSignature(true);
    try {
      // Process image: B&W + remove background
      const processedBlob = await processSignatureImage(file);
      const processedFile = new File([processedBlob], "signature.png", { type: "image/png" });

      const timestamp = Date.now();
      const filePath = `signatures/${user.id}/signature-${timestamp}.png`;

      // Delete old signature from storage if exists
      if (signaturePath) {
        await supabase.storage.from("branding-assets").remove([signaturePath]);
      }

      // Upload new signature
      const { error: uploadError } = await supabase.storage
        .from("branding-assets")
        .upload(filePath, processedFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        toast.error("Failed to upload signature: " + uploadError.message);
        return;
      }

      // Update user_profiles with signature_path
      const { error: dbError } = await supabase
        .from("user_profiles")
        .update({ signature_path: filePath } as any)
        .eq("user_id", user.id);

      if (dbError) {
        // Cleanup uploaded file
        await supabase.storage.from("branding-assets").remove([filePath]);
        toast.error("Failed to save signature: " + dbError.message);
        return;
      }

      setSignaturePath(filePath);
      const { data: urlData } = supabase.storage
        .from("branding-assets")
        .getPublicUrl(filePath);
      setSignatureUrl(urlData.publicUrl);
      toast.success("Signature uploaded successfully");
    } catch (err: any) {
      toast.error("Failed to process signature: " + (err?.message || "Unknown error"));
    } finally {
      setUploadingSignature(false);
      e.target.value = "";
    }
  };

  // Signature delete handler
  const handleDeleteSignature = async () => {
    if (!user || !signaturePath) return;

    try {
      await supabase.storage.from("branding-assets").remove([signaturePath]);
      await supabase
        .from("user_profiles")
        .update({ signature_path: null } as any)
        .eq("user_id", user.id);

      setSignaturePath(null);
      setSignatureUrl(null);
      toast.success("Signature deleted");
    } catch (err) {
      toast.error("Failed to delete signature");
    }
  };

  const handlePreferencesChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    if (!oldPassword || !newPassword) {
      toast.error("Please fill both fields");
      return;
    }
    setChangingPassword(true);
    try {
      // Revalidate current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: oldPassword,
      });
      if (signInError) {
        toast.error("Current password is incorrect");
        setChangingPassword(false);
        return;
      }
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        toast.error("Failed to change password");
      } else {
        toast.success("Password changed successfully");
        setShowPasswordDialog(false);
        setOldPassword("");
        setNewPassword("");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
    setChangingPassword(false);
  };

  const handleConfirmDelete = () => {
    // Close first dialog and open final confirmation
    setShowDeleteConfirmDialog(false);
    setShowDeleteFinalDialog(true);
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      console.error("No user found");
      return;
    }

    console.log("Starting account deletion for user:", user.id);
    setDeleting(true);
    
    try {
      // Call the database function to delete the account
      console.log("Calling delete_user_account RPC function...");
      const { data, error } = await supabase.rpc("delete_user_account" as any);

      console.log("RPC Response:", { data, error });

      if (error) {
        console.error("Account deletion error:", error);
        toast.error("Account deletion failed: " + error.message);
        setDeleting(false);
        return;
      }

      // Check the response
      const result = data as any;
      console.log("Deletion result:", result);
      console.log("Result type:", typeof result);
      console.log("Result success:", result?.success);
      console.log("Result error:", result?.error);
      
      if (result && result.success === false) {
        console.error("Deletion failed with result:", result);
        console.error("Error message:", result.error);
        toast.error(
          "Account deletion failed: " + (result.error || "Unknown error")
        );
        setDeleting(false);
        return;
      }

      console.log("Account deleted successfully, signing out...");
      toast.success("Account deleted successfully. Redirecting...");
      setShowDeleteFinalDialog(false);

      // Sign out first to clear the session completely
      await signOut();

      // Clear any remaining auth data
      localStorage.clear();
      sessionStorage.clear();

      // Force redirect to auth page after a brief delay
      setTimeout(() => {
        console.log("Redirecting to auth page...");
        window.location.href = "/auth";
      }, 1000);
    } catch (err: any) {
      console.error("Unexpected error during account deletion:", err);
      toast.error("Error: " + (err?.message || "something went wrong."));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <SettingsSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and professional details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    placeholder="Enter your designation (e.g., Principal, Director)"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter your phone number"
                  />
                </div>

                <Separator />

                {/* Digital Signature Upload */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-base">Digital Signature</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload your personal digital signature (PNG or JPG only). Images are automatically converted to black &amp; white with transparent background.
                    </p>
                  </div>

                  {signatureUrl ? (
                    <div className="flex items-center gap-4">
                      <div className="border rounded-lg p-3 bg-background">
                        <img
                          src={signatureUrl}
                          alt="Your signature"
                          className="max-h-16 max-w-[200px] object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSignature}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No signature uploaded</p>
                  )}

                  <div>
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleSignatureUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingSignature}
                      onClick={() => signatureInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {uploadingSignature ? "Processing..." : signatureUrl ? "Replace Signature" : "Upload Signature"}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize your experience and application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) =>
                    handlePreferencesChange("theme", value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Language */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred language
                  </p>
                </div>
                <Select
                  value={preferences.language}
                  onValueChange={(value) =>
                    handlePreferencesChange("language", value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        English
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />
            </CardContent>
          </Card>

          {/* REMOVE NOTIFICATIONS CARD */}
          {/* REMOVE SECURITY 2FA FIELDS, KEEP ONLY PASSWORD + DELETE ACCOUNT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Change Password */}
              <div>
                <Label className="text-base">Change Password</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Update your password to keep your account secure
                </p>
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </div>

              <Separator />

              {/* Delete Account */}
              <div>
                <Label className="text-base text-destructive">
                  Delete Account
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Permanently delete your account. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  className="w-full md:w-auto"
                  onClick={() => setShowDeleteConfirmDialog(true)}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and new password below.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* First Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              You are about to permanently delete your account. This action is
              irreversible and will result in:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Permanent deletion of your profile and personal data</li>
              <li>Loss of access to all certificates and requests</li>
              <li>Removal from all organizations</li>
              <li>Deletion of all notifications and settings</li>
            </ul>
            <p className="text-sm font-semibold text-destructive pt-2">
              This action cannot be undone. All your data will be permanently
              lost.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              I Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog
        open={showDeleteFinalDialog}
        onOpenChange={setShowDeleteFinalDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Final Confirmation</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete your account? This is
              your last chance to cancel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteFinalDialog(false)}
              disabled={deleting}
            >
              No, Keep My Account
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Yes, Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
