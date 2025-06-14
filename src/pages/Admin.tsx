import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Settings, Loader2, Building, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase, getPublicUrl } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sealFile, setSealFile] = useState<File | null>(null);
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [sealPreview, setSealPreview] = useState<string | null>(null);
  const [letterheadPreview, setLetterheadPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  
  const [organizationDetails, setOrganizationDetails] = useState({
    name: "",
    type: "Company",
    address: "",
    countryCode: "+1",
    phone: "",
    email: "",
    website: "",
    registration: "",
    affiliation: "",
    tagline: ""
  });

  const institutionTypes = [
    "Company",
    "Startup", 
    "College",
    "School",
    "Other"
  ];

  const countryCodes = [
    { code: "+1", country: "US/CA" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+86", country: "China" },
    { code: "+81", country: "Japan" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+39", country: "Italy" },
    { code: "+34", country: "Spain" },
    { code: "+7", country: "Russia" },
    { code: "+61", country: "Australia" },
    { code: "+55", country: "Brazil" },
    { code: "+52", country: "Mexico" },
    { code: "+27", country: "South Africa" },
    { code: "+971", country: "UAE" },
    { code: "+65", country: "Singapore" },
  ];

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editRole, setEditRole] = useState('member');
  const [editLoading, setEditLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // Load saved organization details and branding assets on component mount
  useEffect(() => {
    const loadOrgDetails = async () => {
      try {
        // Try to get from Supabase first
        const { data: orgData, error } = await supabase
          .from('organization_details')
          .select('*')
          .limit(1);
        
        if (orgData && orgData.length > 0 && !error) {
          console.log("Loaded org details from Supabase:", orgData[0]);
          setOrganizationDetails({
            name: orgData[0].name === "Enter your organization name" ? "" : orgData[0].name || "",
            type: orgData[0].type || "Company",
            address: orgData[0].address === "Enter your address" ? "" : orgData[0].address || "",
            countryCode: "+1", // Default country code
            phone: orgData[0].phone === "Enter your phone number" ? "" : orgData[0].phone || "",
            email: orgData[0].email === "Enter official email address" ? "" : orgData[0].email || "",
            website: orgData[0].website === "Enter organization website" ? "" : orgData[0].website || "",
            registration: orgData[0].registration === "Enter registration number" ? "" : orgData[0].registration || "",
            affiliation: orgData[0].affiliation === "Enter affiliation details" ? "" : orgData[0].affiliation || "",
            tagline: orgData[0].tagline === "Knowledge, Character, Excellence" ? "" : orgData[0].tagline || ""
          });
        } else {
          // Fall back to localStorage
          const savedOrgDetails = localStorage.getItem('organizationDetails');
          if (savedOrgDetails) {
            try {
              const parsed = JSON.parse(savedOrgDetails);
              setOrganizationDetails({
                ...organizationDetails,
                ...parsed,
                countryCode: parsed.countryCode || "+1"
              });
            } catch (error) {
              console.error("Error parsing saved organization details:", error);
            }
          }
        }
      } catch (err) {
        console.error("Error loading organization details:", err);
        // Fall back to localStorage
        const savedOrgDetails = localStorage.getItem('organizationDetails');
        if (savedOrgDetails) {
          try {
            const parsed = JSON.parse(savedOrgDetails);
            setOrganizationDetails({
              ...organizationDetails,
              ...parsed,
              countryCode: parsed.countryCode || "+1"
            });
          } catch (error) {
            console.error("Error parsing saved organization details:", error);
          }
        }
      }
    };
    
    // Load saved branding info and previews
    const loadBrandingInfo = async () => {
      try {
        // Try to get from Supabase first
        const { data: brandingData, error } = await supabase
          .from('branding_settings')
          .select('*')
          .limit(1);
        
        if (brandingData && brandingData.length > 0 && !error) {
          console.log("Loaded branding info from Supabase:", brandingData[0]);
          
          // Set previews for existing branding assets
          if (brandingData[0].logo) {
            const { data } = supabase.storage.from('branding').getPublicUrl(`logos/${brandingData[0].logo}`);
            setLogoPreview(data.publicUrl);
          }
          
          if (brandingData[0].seal) {
            const { data } = supabase.storage.from('branding').getPublicUrl(`seals/${brandingData[0].seal}`);
            setSealPreview(data.publicUrl);
          }
          
          if (brandingData[0].letterhead) {
            const { data } = supabase.storage.from('branding').getPublicUrl(`letterheads/${brandingData[0].letterhead}`);
            setLetterheadPreview(data.publicUrl);
          }
          
          if (brandingData[0].signature) {
            const { data } = supabase.storage.from('branding').getPublicUrl(`signatures/${brandingData[0].signature}`);
            setSignaturePreview(data.publicUrl);
          }
        } else {
          // Fall back to localStorage
          const savedBrandingInfo = localStorage.getItem('brandingInfo');
          if (savedBrandingInfo) {
            try {
              const brandingInfo = JSON.parse(savedBrandingInfo);
              
              if (brandingInfo.logo) {
                const { data } = supabase.storage.from('branding').getPublicUrl(`logos/${brandingInfo.logo}`);
                setLogoPreview(data.publicUrl);
              }
              
              if (brandingInfo.seal) {
                const { data } = supabase.storage.from('branding').getPublicUrl(`seals/${brandingInfo.seal}`);
                setSealPreview(data.publicUrl);
              }
              
              if (brandingInfo.letterhead) {
                const { data } = supabase.storage.from('branding').getPublicUrl(`letterheads/${brandingInfo.letterhead}`);
                setLetterheadPreview(data.publicUrl);
              }
              
              if (brandingInfo.signature) {
                const { data } = supabase.storage.from('branding').getPublicUrl(`signatures/${brandingInfo.signature}`);
                setSignaturePreview(data.publicUrl);
              }
            } catch (error) {
              console.error("Error parsing saved branding info:", error);
            }
          }
        }
      } catch (err) {
        console.error("Error loading branding info:", err);
      }
    };

    loadOrgDetails();
    loadBrandingInfo();
  }, []);

  // Fetch organization members
  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
      const organizationId = await getOrganizationId();
      const { data, error } = await supabase
        .from('organization_members')
        .select('user_id, role, status, invited_email, profiles:profiles!organization_members_user_id_fkey(full_name, email), user_profiles:profiles!inner(email, full_name), department')
        .eq('organization_id', organizationId);
      if (!error && data) setMembers(data);
      setMembersLoading(false);
    };
    if (user) fetchMembers();
  }, [user, inviteModalOpen, editModalOpen]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    fileType: string
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      
      toast({
        title: `${fileType} selected`,
        description: `File "${selectedFile.name}" has been selected.`
      });
    }
  };

  const handleSaveOrganization = async () => {
    try {
      // Combine country code and phone number for storage
      const fullPhone = `${organizationDetails.countryCode} ${organizationDetails.phone}`;
      const orgDataToSave = {
        ...organizationDetails,
        phone: fullPhone
      };
      
      // Save organization details to localStorage for backward compatibility
      localStorage.setItem('organizationDetails', JSON.stringify(orgDataToSave));
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('organization_details')
        .upsert({ 
          id: '1', // Using a constant string ID
          ...orgDataToSave
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Organization details saved",
        description: "Your organization details have been saved successfully."
      });
    } catch (error) {
      console.error("Error saving organization details:", error);
      toast({
        title: "Organization details saved locally",
        description: "Your changes have been saved locally."
      });
    }
  };
  
  const handleSaveBranding = async () => {
    if (!logoFile && !sealFile && !letterheadFile && !signatureFile && !organizationDetails.tagline) {
      toast({
        title: "No changes to save",
        description: "Please upload files or update the tagline before saving."
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create branding info object to track what was uploaded
      const brandingInfo: Record<string, string | null> = {
        tagline: organizationDetails.tagline,
        logo: null,
        seal: null,
        letterhead: null,
        signature: null
      };

      // Fetch existing branding settings to preserve values that aren't being updated
      const { data: existingSettings } = await supabase
        .from('branding_settings')
        .select('*')
        .limit(1);

      if (existingSettings && existingSettings.length > 0) {
        if (!logoFile) brandingInfo.logo = existingSettings[0].logo;
        if (!sealFile) brandingInfo.seal = existingSettings[0].seal;
        if (!letterheadFile) brandingInfo.letterhead = existingSettings[0].letterhead;
        if (!signatureFile) brandingInfo.signature = existingSettings[0].signature;
      }
      
      // Upload logo if present
      if (logoFile) {
        const logoFileName = `org_logo_${Date.now()}_${logoFile.name.replace(/\s+/g, '_')}`;
        const { error: logoError } = await supabase.storage
          .from('branding')
          .upload(`logos/${logoFileName}`, logoFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (logoError) {
          console.error("Error uploading logo:", logoError);
          throw logoError;
        }
        
        brandingInfo.logo = logoFileName;
        console.log("Logo successfully uploaded:", logoFileName);
      }
      
      // Upload seal if present
      if (sealFile) {
        const sealFileName = `org_seal_${Date.now()}_${sealFile.name.replace(/\s+/g, '_')}`;
        const { error: sealError } = await supabase.storage
          .from('branding')
          .upload(`seals/${sealFileName}`, sealFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (sealError) {
          console.error("Error uploading seal:", sealError);
          throw sealError;
        }
        
        brandingInfo.seal = sealFileName;
        console.log("Seal successfully uploaded:", sealFileName);
      }
      
      // Upload letterhead if present
      if (letterheadFile) {
        const letterheadFileName = `org_letterhead_${Date.now()}_${letterheadFile.name.replace(/\s+/g, '_')}`;
        const { error: letterheadError } = await supabase.storage
          .from('branding')
          .upload(`letterheads/${letterheadFileName}`, letterheadFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (letterheadError) {
          console.error("Error uploading letterhead:", letterheadError);
          throw letterheadError;
        }
        
        brandingInfo.letterhead = letterheadFileName;
        console.log("Letterhead successfully uploaded:", letterheadFileName);
      }
      
      // Upload signature if present
      if (signatureFile) {
        const signatureFileName = `org_signature_${Date.now()}_${signatureFile.name.replace(/\s+/g, '_')}`;
        const { error: signatureError } = await supabase.storage
          .from('branding')
          .upload(`signatures/${signatureFileName}`, signatureFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (signatureError) {
          console.error("Error uploading signature:", signatureError);
          throw signatureError;
        }
        
        brandingInfo.signature = signatureFileName;
        console.log("Signature successfully uploaded:", signatureFileName);
      }
      
      // Save branding info to localStorage for backward compatibility
      localStorage.setItem('brandingInfo', JSON.stringify(brandingInfo));
      
      // Save branding info to Supabase
      const { error } = await supabase
        .from('branding_settings')
        .upsert(brandingInfo);

      if (error) {
        console.error("Error saving branding to database:", error);
        throw error;
      }
      
      toast({
        title: "Branding settings saved",
        description: "Your branding settings and uploaded files have been saved successfully."
      });
      
      // Update previews to show changes immediately instead of forcing reload
      if (logoFile) setLogoPreview(URL.createObjectURL(logoFile));
      if (sealFile) setSealPreview(URL.createObjectURL(sealFile));
      if (letterheadFile) setLetterheadPreview(URL.createObjectURL(letterheadFile));
      if (signatureFile) setSignaturePreview(URL.createObjectURL(signatureFile));
      
    } catch (error: any) {
      console.error("Error saving branding:", error);
      toast({
        title: "Error saving branding",
        description: error.message || "There was an error saving your branding settings. Some files may not have been uploaded.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('org-', '');
    setOrganizationDetails(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSelectChange = (fieldName: string, value: string) => {
    setOrganizationDetails(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Get current organization ID for the admin
  const getOrganizationId = async () => {
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();
    return orgMember?.organization_id;
  };

  // Real Invite User logic (Edge Function)
  const handleInviteUserSubmit = async () => {
    setInviteLoading(true);
    try {
      const organizationId = await getOrganizationId();
      // Call the Supabase Edge Function
      const res = await fetch('/functions/v1/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, organization_id: organizationId })
      });
      let result;
      const text = await res.text();
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(text || 'Unknown error');
      }
      if (!res.ok) throw new Error(result.error || 'Unknown error');
      toast({ title: 'Invite Sent', description: `Invitation sent to ${inviteEmail}` });
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (error) {
      toast({ title: 'Invite Failed', description: error.message, variant: 'destructive' });
    } finally {
      setInviteLoading(false);
    }
  };

  // Real Edit User logic
  const handleEditUserSave = async () => {
    setEditLoading(true);
    try {
      const organizationId = await getOrganizationId();
      await supabase.from('organization_members')
        .update({ role: editRole })
        .eq('organization_id', organizationId)
        .eq('user_id', editUser.user_id);
      toast({ title: 'User Updated', description: 'User role updated.' });
      setEditModalOpen(false);
    } catch (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  // Placeholder: Search
  const handleSearch = () => {
    toast({ title: 'Search', description: `Searching for "${searchTerm}" (not yet implemented)` });
  };
  // Placeholder: Setup/Configure/Change/Export
  const handlePlaceholder = (action: string) => {
    toast({ title: action, description: `${action} action not yet implemented.` });
  };

  return (
    <DashboardLayout>
      {/* Invite User Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="User email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={handleInviteUserSubmit} disabled={inviteLoading || !inviteEmail}>
              {inviteLoading ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="User name" defaultValue={editUser?.name || ''} disabled />
            <Input placeholder="User email" defaultValue={editUser?.email || ''} disabled />
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={handleEditUserSave} disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Admin Settings</h1>
            <p className="text-muted-foreground">Manage your organization and user permissions</p>
          </div>
          <Button className="gradient-blue md:self-start gap-2" onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite User
          </Button>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="organization" className="glass-card">
          <div className="border-b">
            <div className="px-4">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger value="organization" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500 data-[state=active]:border-b-2 rounded-none px-4 py-3 -mb-px">
                  Organization
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500 data-[state=active]:border-b-2 rounded-none px-4 py-3 -mb-px">
                  Users & Permissions
                </TabsTrigger>
                <TabsTrigger value="branding" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500 data-[state=active]:border-b-2 rounded-none px-4 py-3 -mb-px">
                  Branding
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500 data-[state=active]:border-b-2 rounded-none px-4 py-3 -mb-px">
                  Security
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="organization" className="m-0 p-6">
            <div className="max-w-2xl">
              <h2 className="text-lg font-medium mb-6">Organization Details</h2>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input 
                        id="org-name" 
                        placeholder="Enter your organization name" 
                        value={organizationDetails.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-type">Institution Type</Label>
                      <Select 
                        value={organizationDetails.type} 
                        onValueChange={(value) => handleSelectChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select institution type" />
                        </SelectTrigger>
                        <SelectContent>
                          {institutionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org-address">Address</Label>
                    <Input 
                      id="org-address" 
                      placeholder="Enter your address" 
                      value={organizationDetails.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={organizationDetails.countryCode} 
                          onValueChange={(value) => handleSelectChange('countryCode', value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.code} {country.country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input 
                          id="org-phone" 
                          placeholder="Enter your phone number" 
                          value={organizationDetails.phone}
                          onChange={handleInputChange}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-email">Official Email</Label>
                      <Input 
                        id="org-email" 
                        placeholder="Enter official email address" 
                        value={organizationDetails.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org-website">Website</Label>
                    <Input 
                      id="org-website" 
                      placeholder="Enter organization website" 
                      value={organizationDetails.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Optional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-registration">Registration Number (Optional)</Label>
                      <Input 
                        id="org-registration" 
                        placeholder="Enter registration number" 
                        value={organizationDetails.registration}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-affiliation">Affiliation (Optional)</Label>
                      <Input 
                        id="org-affiliation" 
                        placeholder="Enter affiliation details" 
                        value={organizationDetails.affiliation}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSaveOrganization}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="m-0">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                <h2 className="text-lg font-medium">Users & Permissions</h2>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <Input placeholder="Search users..." className="w-full md:w-56" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  <Button onClick={handleSearch}>Search</Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membersLoading ? (
                      <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                    ) : members.length === 0 ? (
                      <TableRow><TableCell colSpan={6}>No users found.</TableCell></TableRow>
                    ) : (
                      members.map(member => {
                        const name = member.profiles?.full_name || member.user_profiles?.full_name || member.invited_email || 'Unknown';
                        const email = member.profiles?.email || member.user_profiles?.email || member.invited_email || 'Unknown';
                        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                        return (
                          <TableRow key={member.user_id || member.invited_email}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <span>{name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{email}</TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>{member.department || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={member.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}>
                                {member.status === 'active' ? 'Active' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => { setEditUser(member); setEditModalOpen(true); }}>Edit</Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Showing 3 of 48 users</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="branding" className="m-0 p-6">
            <div className="max-w-3xl">
              <h2 className="text-lg font-medium mb-6">Branding Settings</h2>
              
              <div className="grid gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Logo & Identity</CardTitle>
                    <CardDescription>Customize how your organization appears on documents</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label>Organization Logo</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center relative">
                          {logoPreview ? (
                            <div className="flex flex-col items-center">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                <img 
                                  src={logoPreview} 
                                  alt="Logo preview" 
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => console.error("Error loading logo preview:", e)}
                                />
                              </div>
                              <p className="text-sm font-medium">{logoFile?.name || "Current logo"}</p>
                            </div>
                          ) : (
                            <>
                              <Building className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground mb-2">Upload your logo</p>
                              <p className="text-xs text-muted-foreground">Recommended size: 200x200px</p>
                            </>
                          )}
                          <Input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setLogoFile, setLogoPreview, "Logo")}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Official Seal</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center relative">
                          {sealPreview ? (
                            <div className="flex flex-col items-center">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                <img 
                                  src={sealPreview} 
                                  alt="Seal preview" 
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => console.error("Error loading seal preview:", e)}
                                />
                              </div>
                              <p className="text-sm font-medium">{sealFile?.name || "Current seal"}</p>
                            </div>
                          ) : (
                            <>
                              <Building className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground mb-2">Upload your seal</p>
                              <p className="text-xs text-muted-foreground">Recommended size: 200x200px</p>
                            </>
                          )}
                          <Input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setSealFile, setSealPreview, "Seal")}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="org-tagline">Organization Tagline</Label>
                      <Input 
                        id="org-tagline" 
                        placeholder="Enter your tagline" 
                        value={organizationDetails.tagline}
                        onChange={(e) => setOrganizationDetails(prev => ({...prev, tagline: e.target.value}))}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Document Settings</CardTitle>
                    <CardDescription>Configure how your documents look and behave</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="letterhead">Letterhead</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center relative">
                          {letterheadPreview ? (
                            <div className="flex flex-col items-center">
                              <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                <img 
                                  src={letterheadPreview} 
                                  alt="Letterhead preview" 
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => console.error("Error loading letterhead preview:", e)}
                                />
                              </div>
                              <p className="text-sm font-medium">{letterheadFile?.name || "Current letterhead"}</p>
                            </div>
                          ) : (
                            <>
                              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground mb-2">Upload letterhead design</p>
                            </>
                          )}
                          <Input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setLetterheadFile, setLetterheadPreview, "Letterhead")}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="signature">Digital Signature</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center relative">
                          {signaturePreview ? (
                            <div className="flex flex-col items-center">
                              <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                <img 
                                  src={signaturePreview} 
                                  alt="Signature preview" 
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => console.error("Error loading signature preview:", e)}
                                />
                              </div>
                              <p className="text-sm font-medium">{signatureFile?.name || "Current signature"}</p>
                            </div>
                          ) : (
                            <>
                              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground mb-2">Upload signature image</p>
                            </>
                          )}
                          <Input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setSignatureFile, setSignaturePreview, "Signature")}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveBranding} disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="m-0 p-6">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-lg font-medium mb-4">Security Settings</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>Manage login and access control settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-factor authentication</h4>
                      <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePlaceholder('Setup 2FA')}>Setup</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password policy</h4>
                      <p className="text-sm text-muted-foreground">Require strong passwords</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePlaceholder('Configure Password Policy')}>Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session timeout</h4>
                      <p className="text-sm text-muted-foreground">Currently set to 30 minutes</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePlaceholder('Change Session Timeout')}>Change</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Document Security</CardTitle>
                  <CardDescription>Control how your documents are protected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">QR Code Verification</h4>
                      <p className="text-sm text-muted-foreground">Add QR codes to verify document authenticity</p>
                    </div>
                    <Button variant="outline" size="sm" className="bg-primary-50 border-primary-100 text-primary-700" onClick={() => handlePlaceholder('Toggle QR Code Verification')}>Enabled</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Watermarking</h4>
                      <p className="text-sm text-muted-foreground">Add watermarks to printed documents</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePlaceholder('Configure Watermarking')}>Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Document Expiry</h4>
                      <p className="text-sm text-muted-foreground">Set expiration dates for documents</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePlaceholder('Configure Document Expiry')}>Configure</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>Track activities within your organization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                      <h4 className="font-medium">Export audit logs</h4>
                      <p className="text-sm text-muted-foreground">Download a record of all system activities</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 md:mt-0" onClick={() => handlePlaceholder('Export Audit Logs')}>
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
