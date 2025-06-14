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

interface OrganizationFormState {
  name: string;
  address: string;
  phone: string;
  email: string;
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
  const [formState, setFormState] = useState<OrganizationFormState>({
    name: '',
    address: '',
    phone: '',
    email: '',
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

  // Fetch organization ID and then details and branding
  useEffect(() => {
    const fetchUserOrganization = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (memberError || !memberData?.organization_id) {
          console.log("No organization found for user, showing admin interface anyway");
          setHasOrganization(false);
          setIsLoading(false);
          return;
        }
        setOrganizationId(memberData.organization_id);
        setHasOrganization(true);
      } catch (error) {
        console.error("Error fetching user organization:", error);
        setHasOrganization(false);
        setIsLoading(false);
      }
    };
    fetchUserOrganization();
  }, [user]);

  // Fetch organization details and branding files once organizationId is set
  useEffect(() => {
    if (!organizationId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('name, address, phone, email')
          .eq('id', organizationId)
          .single();

        if (orgError) throw orgError;
        if (orgData) {
          setFormState({
            name: orgData.name || '',
            address: orgData.address || '',
            phone: orgData.phone || '',
            email: orgData.email || '',
          });
        }

        // Fetch branding files
        const { data: filesData, error: filesError } = await supabase
          .from('branding_files')
          .select('name, path')
          .eq('organization_id', organizationId);

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
        console.error('Failed to fetch admin data:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({ title: 'Error Loading Data', description: errorMessage, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [organizationId]);

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
    if (!hasOrganization) {
      toast({ title: 'Error', description: 'Please create or join an organization first.', variant: 'destructive' });
      return;
    }
    if (!organizationId) {
      toast({ title: 'Error', description: 'Organization ID not found.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);

    try {
      // Update organization details
      const { error: orgUpdateError } = await supabase
        .from('organizations')
        .update({
          name: formState.name,
          address: formState.address,
          phone: formState.phone,
          email: formState.email,
        })
        .eq('id', organizationId);

      if (orgUpdateError) throw orgUpdateError;

      // Upload/Update branding files
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

      toast({ title: 'Success', description: 'Organization details and branding updated.' });
      // Optionally re-fetch previews from storage to get permanent URLs
      const { data: filesData } = await supabase
        .from('branding_files')
        .select('name, path')
        .eq('organization_id', organizationId);
      if (filesData) {
        const newPreviews: BrandingFilePreview = { logoUrl: null, sealUrl: null, signatureUrl: null };
        filesData.forEach(fileEntry => {
          const publicUrlResult = supabase.storage.from('branding-assets').getPublicUrl(fileEntry.path);
          if (publicUrlResult.data?.publicUrl) {
            if (fileEntry.name === 'logo') newPreviews.logoUrl = publicUrlResult.data.publicUrl;
            if (fileEntry.name === 'seal') newPreviews.sealUrl = publicUrlResult.data.publicUrl;
            if (fileEntry.name === 'signature') newPreviews.signatureUrl = publicUrlResult.data.publicUrl;
          }
        });
        setBrandingPreviews(newPreviews);
        setBrandingFiles({ logo: null, seal: null, signature: null });
      }

    } catch (error) {
      console.error('Failed to save admin data:', error);
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
              You are not currently part of an organization. Some features may be limited until you create or join an organization.
            </p>
          </div>
        )}
        
        <Tabs defaultValue="organization" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="organization" className="text-xs md:text-sm">Organization</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm">Users & Permissions</TabsTrigger>
            <TabsTrigger value="branding" className="text-xs md:text-sm">Branding</TabsTrigger>
            <TabsTrigger value="security" className="text-xs md:text-sm">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organization" className="space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    {hasOrganization 
                      ? "Update your organization's information." 
                      : "Organization details will be available once you create or join an organization."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Organization Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formState.name} 
                      onChange={handleInputChange} 
                      disabled={!hasOrganization}
                      placeholder={!hasOrganization ? "No organization found" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={formState.address} 
                      onChange={handleInputChange} 
                      disabled={!hasOrganization}
                      placeholder={!hasOrganization ? "No organization found" : ""}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        value={formState.phone} 
                        onChange={handleInputChange} 
                        disabled={!hasOrganization}
                        placeholder={!hasOrganization ? "No organization found" : ""}
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
                        disabled={!hasOrganization}
                        placeholder={!hasOrganization ? "No organization found" : ""}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving || !hasOrganization}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AnnouncementAdminPanel />
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and their permissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Branding Assets</CardTitle>
                  <CardDescription>
                    {hasOrganization 
                      ? "Upload your organization's logo, seal, and digital signature." 
                      : "Branding features will be available once you create or join an organization."
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
                        disabled={!hasOrganization}
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
                          {hasOrganization ? `No ${type} uploaded.` : `${type.charAt(0).toUpperCase() + type.slice(1)} upload requires an organization.`}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving || !hasOrganization}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage security and access controls.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Security settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
