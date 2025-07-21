import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import {
  ImagePlus,
  Cloud,
  Image as ImageIcon,
  Shield,
  Pen,
} from "lucide-react";
import { AnnouncementAdminPanel } from "@/components/admin/AnnouncementAdminPanel";
import { UserPermissionsPanel } from "@/components/admin/UserPermissionsPanel";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";

interface UserProfileFormState {
  organizationName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // Added
  phoneNumber: string;
  email: string;
  organizationType: string;
  organizationSize: string;
  organizationWebsite: string;
}

interface BrandingFileState {
  logo: File | null;
  seal: File | null;
  signature: File | null;
}

interface BrandingFilePreview {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
}

// FileDropzone component
const FileDropzone = ({
  onFileSelected,
  accept,
  disabled,
  label,
  helperText,
  icon: Icon,
  value,
  previewSrc,
  type,
  boxClassName = "",
}: {
  onFileSelected: (file: File) => void;
  accept: string;
  disabled?: boolean;
  label: string;
  helperText?: string;
  icon?: React.ElementType;
  value?: File | null;
  previewSrc?: string;
  type: "logo" | "seal" | "signature";
  boxClassName?: string;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  React.useEffect(() => {
    if (!value) setFileName(null);
  }, [value]);

  // Icon selection
  let AssetIcon = Icon;
  if (!Icon) {
    if (type === "logo") AssetIcon = ImageIcon;
    else if (type === "seal") AssetIcon = Shield;
    else if (type === "signature") AssetIcon = Pen;
    else AssetIcon = Cloud;
  }

  // If file is present, show preview and replace button
  if (previewSrc) {
    return (
      <div
        className={`w-56 h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-colors bg-background border-muted ${boxClassName}`}
      >
        <div className="w-full flex flex-col items-center">
          <div className="w-[100px] h-[100px] rounded-md border flex items-center justify-center bg-white mb-2">
            <img
              src={previewSrc}
              alt={`${type} preview`}
              className="object-contain max-h-full max-w-full w-[100px] h-[100px]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          {fileName && (
            <div className="text-xs text-muted-foreground mb-2 truncate w-full text-center">
              {fileName}
            </div>
          )}
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-input bg-background hover:bg-neutral-400 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mx-auto"
            onClick={handleClick}
            disabled={disabled}
            style={{ width: "auto", minWidth: 0, display: "block" }}
          >
            {label}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleFileChange}
          disabled={disabled}
          tabIndex={-1}
        />
      </div>
    );
  }

  // No file: show dropzone
  return (
    <div
      className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-colors cursor-pointer select-none ${
        dragActive
          ? "border-primary bg-accent/40"
          : "border-muted bg-background"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-accent/30"} min-h-[180px] text-center ${boxClassName}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      aria-disabled={disabled}
      role="button"
    >
      {AssetIcon ? (
        <AssetIcon className="w-10 h-10 mb-2 text-primary/70" />
      ) : (
        <Cloud className="w-10 h-10 mb-2 text-primary/70" />
      )}
      <div className="font-medium text-base mb-1">{label}</div>
      <div className="text-sm text-muted-foreground mb-2">
        Choose a file or drag & drop it here
      </div>
      <div className="text-xs text-muted-foreground mb-2">{helperText}</div>
      <button
        type="button"
        className="mt-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-neutral-400 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        tabIndex={-1}
        disabled={disabled}
      >
        Browse File
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled}
        tabIndex={-1}
      />
      {fileName && (
        <div className="mt-2 text-xs text-foreground">{fileName}</div>
      )}
    </div>
  );
};

const AdminPage = () => {
  const { user } = useAuth();
  const { refreshBranding } = useBranding();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [hasOrganization, setHasOrganization] = useState<boolean>(true);
  const [formState, setFormState] = useState<UserProfileFormState>({
    organizationName: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "", // Added
    phoneNumber: "",
    email: "",
    organizationType: "",
    organizationSize: "",
    organizationWebsite: "",
  });
  const [brandingFiles, setBrandingFiles] = useState<BrandingFileState>({
    logo: null,
    seal: null,
    signature: null,
  });
  const [brandingPreviews, setBrandingPreviews] = useState<BrandingFilePreview>(
    {
      logoUrl: null,
      sealUrl: null,
      signatureUrl: null,
    },
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    [key in keyof BrandingFileState]: File | null;
  }>({
    logo: null,
    seal: null,
    signature: null,
  });

  // Helper function to parse country from an address/location string (e.g., on signup)
  function parseCountry(address: string | null): string {
    if (!address) return "";
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length > 3) {
      // Assume format like: street, city, state, postal, country
      return parts[parts.length - 1] || "";
    } else if (parts.length === 3) {
      // Could be city, state, country
      return parts[2] || "";
    }
    return "";
  }

  // Fetch user profile data and organization data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Check if user has organization membership
        const { data: memberData, error: memberError } = await supabase
          .from("organization_members")
          .select("organization_id, organizations(name, address, phone, email)")
          .eq("user_id", user.id)
          .single();

        if (memberError || !memberData?.organization_id) {
          setOrganizationId(null);
          setHasOrganization(false);
          setIsLoading(false);
          return;
        }

        // User has organization membership
        setOrganizationId(memberData.organization_id);
        setHasOrganization(true);

        const orgData = memberData.organizations;
        if (orgData) {
          // Parse address for country
          const addressParts = orgData.address
            ? orgData.address.split(",").map((x: string) => x.trim())
            : [];
          setFormState({
            organizationName: orgData.name || "",
            streetAddress: addressParts[0] || "",
            city: addressParts[1] || "",
            state: addressParts[2] || "",
            postalCode: addressParts[3] || "",
            country: addressParts[4] || "", // If present
            phoneNumber: orgData.phone || "",
            email: orgData.email || "",
            organizationType: "",
            organizationSize: "",
            organizationWebsite: "",
          });
        }

        // Fetch branding files
        await fetchBrandingFiles(memberData.organization_id);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setHasOrganization(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [user]);

  const fetchBrandingFiles = async (orgId: string) => {
    try {
      const { data: filesData, error: filesError } = await supabase
        .from("branding_files")
        .select("name, path")
        .eq("organization_id", orgId);

      if (filesError) throw filesError;
      if (filesData) {
        const previews: BrandingFilePreview = {
          logoUrl: null,
          sealUrl: null,
          signatureUrl: null,
        };

        // Generate signed URLs for private storage access
        for (const file of filesData) {
          try {
            const { data: signedUrlData, error: signedUrlError } =
              await supabase.storage
                .from("branding-assets")
                .createSignedUrl(file.path, 3600); // 1 hour expiry

            if (!signedUrlError && signedUrlData?.signedUrl) {
              if (file.name === "logo")
                previews.logoUrl = signedUrlData.signedUrl;
              if (file.name === "seal")
                previews.sealUrl = signedUrlData.signedUrl;
              if (file.name === "signature")
                previews.signatureUrl = signedUrlData.signedUrl;
            }
          } catch (error) {
            console.error(
              `Failed to generate signed URL for ${file.name}:`,
              error,
            );
          }
        }
        setBrandingPreviews(previews);
      }
    } catch (error) {
      console.error("Failed to fetch branding files:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormState((prev) => ({ ...prev, country: e.target.value }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fileType: keyof BrandingFileState,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBrandingFiles((prev) => ({ ...prev, [fileType]: file }));
      const objectUrl = URL.createObjectURL(file);
      setBrandingPreviews((prev) => ({
        ...prev,
        [`${fileType}Url`]: objectUrl,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);

    try {
      let currentOrgId = organizationId;

      // Create full address string from components (with country at the end)
      const fullAddress = [
        formState.streetAddress,
        formState.city,
        formState.state,
        formState.postalCode,
        formState.country,
      ]
        .filter(Boolean)
        .join(", ");

      // Create or update organization
      if (formState.organizationName) {
        if (currentOrgId) {
          // Update existing organization
          const { error: orgUpdateError } = await supabase
            .from("organizations")
            .update({
              name: formState.organizationName,
              address: fullAddress,
              phone: formState.phoneNumber,
              email: formState.email,
            })
            .eq("id", currentOrgId);

          if (orgUpdateError) throw orgUpdateError;
        } else {
          // Create new organization
          const { data: newOrg, error: orgCreateError } = await supabase
            .from("organizations")
            .insert({
              name: formState.organizationName,
              address: fullAddress,
              phone: formState.phoneNumber,
              email: formState.email,
            })
            .select()
            .single();

          if (orgCreateError) throw orgCreateError;

          currentOrgId = newOrg.id;
          setOrganizationId(currentOrgId);

          // Add user as admin of the new organization
          const { error: memberError } = await supabase
            .from("organization_members")
            .insert({
              organization_id: currentOrgId,
              user_id: user.id,
              role: "admin",
            });

          if (memberError) throw memberError;
        }
      }

      // Update user profile with additional details (use country in org_location)
      const { error: profileUpdateError } = await supabase
        .from("user_profiles")
        .update({
          organization_name: formState.organizationName,
          organization_location: fullAddress,
          phone_number: formState.phoneNumber,
          email: formState.email,
          organization_type: formState.organizationType,
          organization_size: formState.organizationSize,
          organization_website: formState.organizationWebsite,
        })
        .eq("user_id", user.id);

      if (profileUpdateError) throw profileUpdateError;

      // Handle branding files if user has organization
      if (currentOrgId) {
        for (const key of Object.keys(brandingFiles) as Array<
          keyof BrandingFileState
        >) {
          const file = brandingFiles[key];
          if (file) {
            // Check if a file with the same name (logo, seal, signature) already exists for this org
            const { data: existingFiles, error: fetchExistingError } =
              await supabase
                .from("branding_files")
                .select("path")
                .eq("organization_id", currentOrgId)
                .eq("name", key);

            if (fetchExistingError) {
              console.warn(
                `Could not check for existing ${key} file:`,
                fetchExistingError.message,
              );
            }

            // If existing files found, remove them from storage first
            if (existingFiles && existingFiles.length > 0) {
              const pathsToRemove = existingFiles
                .map((f) => f.path)
                .filter((p) => p !== null) as string[];
              if (pathsToRemove.length > 0) {
                const { error: removeStorageError } = await supabase.storage
                  .from("branding-assets")
                  .remove(pathsToRemove);
                if (removeStorageError) {
                  console.error(
                    `Error removing old ${key} from storage:`,
                    removeStorageError.message,
                  );
                }
                // Also delete from branding_files table
                const { error: removeDbError } = await supabase
                  .from("branding_files")
                  .delete()
                  .eq("organization_id", currentOrgId)
                  .eq("name", key);
                if (removeDbError) {
                  console.error(
                    `Error removing old ${key} record from DB:`,
                    removeDbError.message,
                  );
                }
              }
            }

            const filePath = `${currentOrgId}/${key}-${Date.now()}.${file.name.split(".").pop()}`;
            const { error: uploadError } = await supabase.storage
              .from("branding-assets")
              .upload(filePath, file, { upsert: true });

            if (uploadError)
              throw new Error(
                `Failed to upload ${key}: ${uploadError.message}`,
              );

            // Update or insert file record in branding_files
            const { error: dbError } = await supabase
              .from("branding_files")
              .upsert(
                {
                  organization_id: currentOrgId,
                  name: key,
                  path: filePath,
                  uploaded_by: user?.id,
                },
                { onConflict: "organization_id,name" },
              );
            if (dbError)
              throw new Error(
                `Failed to save ${key} metadata: ${dbError.message}`,
              );
          }
        }
      }

      toast({
        title: "Success",
        description: "Organization details updated successfully.",
      });

      // Refresh branding context and previews
      if (currentOrgId) {
        await fetchBrandingFiles(currentOrgId);
        await refreshBranding();
        setBrandingFiles({ logo: null, seal: null, signature: null });
      }
    } catch (error) {
      console.error("Failed to save organization data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <AdminPageSkeleton />
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          Please log in to access admin settings.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <Tabs defaultValue="organization" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="users">Users & Permissions</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="organization" className="space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    Update your organization information. This will be stored in
                    the organizations table and linked to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      value={formState.organizationName}
                      onChange={handleInputChange}
                      placeholder="Enter organization name"
                    />
                  </div>

                  {/* Full Address Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Address</h4>
                    <div>
                      <Label htmlFor="streetAddress">Street Address</Label>
                      <Input
                        id="streetAddress"
                        name="streetAddress"
                        value={formState.streetAddress}
                        onChange={handleInputChange}
                        placeholder="Enter street address"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formState.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formState.state}
                          onChange={handleInputChange}
                          placeholder="Enter state or province"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formState.postalCode}
                          onChange={handleInputChange}
                          placeholder="Enter postal code"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formState.country}
                        onChange={handleCountryChange}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneNumber">Phone</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formState.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organizationType">
                        Organization Type
                      </Label>
                      <Input
                        id="organizationType"
                        name="organizationType"
                        value={formState.organizationType}
                        onChange={handleInputChange}
                        placeholder="e.g., Educational Institution, Government"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organizationSize">
                        Organization Size
                      </Label>
                      <Input
                        id="organizationSize"
                        name="organizationSize"
                        value={formState.organizationSize}
                        onChange={handleInputChange}
                        placeholder="e.g., 1-50 employees"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="organizationWebsite">Website</Label>
                    <Input
                      id="organizationWebsite"
                      name="organizationWebsite"
                      type="url"
                      value={formState.organizationWebsite}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserPermissionsPanel organizationId={organizationId} />
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Branding Assets</CardTitle>
                  <CardDescription>
                    {organizationId
                      ? "Upload your organization's logo, seal, and digital signature."
                      : "Branding features require organization membership. Contact your admin to join an organization."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(
                    ["logo", "seal", "signature"] as Array<
                      keyof BrandingFileState
                    >
                  ).map((type) => {
                    const previewSrc = brandingFiles[type]
                      ? URL.createObjectURL(brandingFiles[type]!)
                      : brandingPreviews[
                          `${type}Url` as keyof BrandingFilePreview
                        ] || undefined;
                    const handleFileSelected = (file: File) => {
                      setSelectedFiles((prev) => ({ ...prev, [type]: file }));
                      // Create a synthetic event to pass to handleFileChange
                      const event = {
                        target: { files: [file], value: "" },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleFileChange(event, type);
                    };
                    let iconComp = Cloud;
                    if (type === "logo") iconComp = ImagePlus;
                    else if (type === "seal") iconComp = Shield;
                    else if (type === "signature") iconComp = Pen;
                    return (
                      <div key={type} className="space-y-2">
                        <Label
                          htmlFor={type}
                          className="capitalize flex items-center gap-1 text-base font-medium"
                        >
                          {iconComp
                            ? React.createElement(iconComp, {
                                className: "w-5 h-5 mr-1 text-muted-foreground",
                              })
                            : null}
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Label>
                        <FileDropzone
                          onFileSelected={handleFileSelected}
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          disabled={!organizationId}
                          label={
                            previewSrc
                              ? `Replace ${type.charAt(0).toUpperCase() + type.slice(1)}`
                              : `Upload ${type.charAt(0).toUpperCase() + type.slice(1)}`
                          }
                          helperText="Supported: PNG, JPG, JPEG, SVG (Max 5MB)"
                          icon={iconComp}
                          value={selectedFiles[type]}
                          previewSrc={previewSrc}
                          type={type}
                          boxClassName={previewSrc ? "w-56 h-56" : ""}
                        />
                      </div>
                    );
                  })}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving || !organizationId}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <AnnouncementAdminPanel organizationId={organizationId} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
