import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ImagePlus } from 'lucide-react';
import { AnnouncementAdminPanel } from "@/components/admin/AnnouncementAdminPanel";
import { UserPermissionsPanel } from "@/components/admin/UserPermissionsPanel";

interface UserProfileFormState {
  organizationName: string;
  organizationLocation: string;
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

const AdminPage = () => {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [hasOrganization, setHasOrganization] = useState<boolean>(false);
  const [formState, setFormState] = useState<UserProfileFormState>({
    organizationName: '',
    organizationLocation: '',
    phoneNumber: '',
    email: '',
    organizationType: '',
    organizationSize: '',
    organizationWebsite: '',
  });
  const [brandingFiles, setBrandingFiles] = useState<BrandingFileState>({
    logo: null,
    seal: null,
    signature: null,
  });
  const [brandingPreviews, setBrandingPreviews] = useState<BrandingFilePreview>({
    logoUrl: null,
    sealUrl: null,
    signatureUrl: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.log("No user profile found:", profileError);
          setHasOrganization(false);
          setIsLoading(false);
          return;
        }

        if (profileData) {
          // Check if user has organization data
          const hasOrgData = profileData.organization_name || 
                           profileData.organization_location || 
                           profileData.organization_type;
          
          setHasOrganization(!!hasOrgData);
          
          setFormState({
            organizationName: profileData.organization_name || '',
            organizationLocation: profileData.organization_location || '',
            phoneNumber: profileData.phone_number || '',
            email: profileData.email || '',
            organizationType: profileData.organization_type || '',
            organizationSize: profileData.organization_size || '',
            organizationWebsite: profileData.organization_website || '',
          });

          // Check for organization membership to get organization ID for branding
          const { data: memberData } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .single();

          if (memberData?.organization_id) {
            setOrganizationId(memberData.organization_id);
            // Fetch branding files if user is part of an organization
            await fetchBrandingFiles(memberData.organization_id);
          }
        }
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
        .from('branding_files')
        .select('name, path')
        .eq('organization_id', orgId);

      if (filesError) throw filesError;
      if (filesData) {
        const previews: BrandingFilePreview = { logoUrl: null, sealUrl: null, signatureUrl: null };
        filesData.forEach(file => {
          const publicUrlResult = supabase.storage.from('branding-assets').getPublicUrl(file.path);
          if (publicUrlResult.data?.publicUrl) {
            if (file.name === 'logo') previews.logoUrl = publicUrlResult.data.publicUrl;
            if (file.name === 'seal') previews.sealUrl = publicUrlResult.data.publicUrl;
            if (file.name === 'signature') previews.signatureUrl = publicUrlResult.data.publicUrl;
          }
        });
        setBrandingPreviews(previews);
      }
    } catch (error) {
      console.error('Failed to fetch branding files:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: keyof BrandingFileState) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBrandingFiles(prev => ({ ...prev, [fileType]: file }));
      setBrandingPreviews(prev => ({ ...prev, [`${fileType}Url`]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({ title: 'Error', description: 'User not found.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);

    try {
      // Update user profile
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({
          organization_name: formState.organizationName,
          organization_location: formState.organizationLocation,
          phone_number: formState.phoneNumber,
          email: formState.email,
          organization_type: formState.organizationType,
          organization_size: formState.organizationSize,
          organization_website: formState.organizationWebsite,
        })
        .eq('user_id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      // Handle branding files if user has organization
      if (organizationId) {
        // ... keep existing code (branding file upload logic)
        for (const key of Object.keys(brandingFiles) as Array<keyof BrandingFileState>) {
          const file = brandingFiles[key];
          if (file) {
            // Check if a file with the same name (logo, seal, signature) already exists for this org
            const { data: existingFiles, error: fetchExistingError } = await supabase
              .from('branding_files')
              .select('path')
              .eq('organization_id', organizationId)
              .eq('name', key);

            if (fetchExistingError) {
              console.warn(`Could not check for existing ${key} file:`, fetchExistingError.message);
            }
            
            // If existing files found, remove them from storage first
            if (existingFiles && existingFiles.length > 0) {
              const pathsToRemove = existingFiles.map(f => f.path).filter(p => p !== null) as string[];
              if (pathsToRemove.length > 0) {
                  const { error: removeStorageError } = await supabase.storage
                      .from('branding-assets')
                      .remove(pathsToRemove);
                  if (removeStorageError) {
                      console.error(`Error removing old ${key} from storage:`, removeStorageError.message);
                  }
                  // Also delete from branding_files table
                  const { error: removeDbError } = await supabase
                      .from('branding_files')
                      .delete()
                      .eq('organization_id', organizationId)
                      .eq('name', key);
                   if (removeDbError) {
                      console.error(`Error removing old ${key} record from DB:`, removeDbError.message);
                  }
              }
            }

            const filePath = `${organizationId}/${key}-${Date.now()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage
              .from('branding-assets')
              .upload(filePath, file, { upsert: true });

            if (uploadError) throw new Error(`Failed to upload ${key}: ${uploadError.message}`);

            // Update or insert file record in branding_files
            const { error: dbError } = await supabase
              .from('branding_files')
              .upsert(
                {
                  organization_id: organizationId,
                  name: key,
                  path: filePath,
                  uploaded_by: user?.id,
                },
                { onConflict: 'organization_id,name' }
              );
            if (dbError) throw new Error(`Failed to save ${key} metadata: ${dbError.message}`);
          }
        }
      }

      toast({ title: 'Success', description: 'Profile updated successfully.' });
      
      // Update hasOrganization status
      const hasOrgData = formState.organizationName || 
                        formState.organizationLocation || 
                        formState.organizationType;
      setHasOrganization(!!hasOrgData);

      // Refresh branding previews if organization exists
      if (organizationId) {
        await fetchBrandingFiles(organizationId);
        setBrandingFiles({ logo: null, seal: null, signature: null });
      }

    } catch (error) {
      console.error('Failed to save profile data:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: 'Save Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <DashboardLayout><div className="p-6 text-center">Loading admin settings...</div></DashboardLayout>;
  }

  if (!user) {
    return <DashboardLayout><div className="p-6 text-center">Please log in to access admin settings.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 px-4 md:py-8 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Admin Settings</h1>
        
        {!hasOrganization && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              You haven't provided organization details yet. Complete your organization information below to unlock all features.
            </p>
          </div>
        )}
        
        <Tabs defaultValue="organization" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="organization" className="text-xs md:text-sm">Organization</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm">Users & Permissions</TabsTrigger>
            <TabsTrigger value="branding" className="text-xs md:text-sm">Branding</TabsTrigger>
            <TabsTrigger value="announcements" className="text-xs md:text-sm">Announcements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organization" className="space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    Update your organization information from your profile.
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
                  <div>
                    <Label htmlFor="organizationLocation">Address/Location</Label>
                    <Input 
                      id="organizationLocation" 
                      name="organizationLocation" 
                      value={formState.organizationLocation} 
                      onChange={handleInputChange} 
                      placeholder="Enter organization address or location"
                    />
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
                      <Label htmlFor="organizationType">Organization Type</Label>
                      <Input 
                        id="organizationType" 
                        name="organizationType" 
                        value={formState.organizationType} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Educational Institution, Government"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organizationSize">Organization Size</Label>
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
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserPermissionsPanel />
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Branding Assets</CardTitle>
                  <CardDescription>
                    {organizationId 
                      ? "Upload your organization's logo, seal, and digital signature." 
                      : "Branding features require organization membership. Contact your admin to join an organization."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(['logo', 'seal', 'signature'] as Array<keyof BrandingFileState>).map((type) => (
                    <div key={type} className="space-y-2">
                      <Label htmlFor={type} className="capitalize flex items-center">
                        <ImagePlus className="w-5 h-5 mr-2" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Label>
                      <Input 
                        id={type} 
                        type="file" 
                        accept="image/png, image/jpeg, image/svg+xml" 
                        onChange={(e) => handleFileChange(e, type)} 
                        disabled={!organizationId}
                      />
                      {brandingPreviews[`${type}Url` as keyof BrandingFilePreview] && (
                        <div className="mt-2 p-2 border rounded-md inline-block">
                          <img 
                            src={brandingPreviews[`${type}Url` as keyof BrandingFilePreview]!} 
                            alt={`${type} preview`} 
                            className="h-20 object-contain" 
                          />
                        </div>
                      )}
                      {!brandingPreviews[`${type}Url` as keyof BrandingFilePreview] && brandingFiles[type] && (
                        <p className="text-sm text-muted-foreground italic">New file selected, pending save.</p>
                      )}
                      {!brandingPreviews[`${type}Url` as keyof BrandingFilePreview] && !brandingFiles[type] && (
                        <p className="text-sm text-muted-foreground italic">
                          {organizationId ? `No ${type} uploaded.` : `${type.charAt(0).toUpperCase() + type.slice(1)} upload requires organization membership.`}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving || !organizationId}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <AnnouncementAdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
