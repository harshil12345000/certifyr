
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Settings, Lock, Mail, Building, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sealFile, setSealFile] = useState<File | null>(null);
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [organizationDetails, setOrganizationDetails] = useState({
    name: "Delhi Public School",
    type: "School",
    address: "123 Education Lane, New Delhi, 110001",
    phone: "+91 98765 43210",
    email: "info@dpsdelhi.edu.in",
    website: "https://dpsdelhi.edu.in",
    registration: "CBSE-1049/DL",
    affiliation: "Central Board of Secondary Education",
    tagline: "Knowledge, Character, Excellence"
  });

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    fileType: string
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      toast({
        title: `${fileType} uploaded`,
        description: `File "${files[0].name}" has been uploaded successfully.`
      });
    }
  };

  const handleSaveOrganization = () => {
    // In a real app, this would send data to an API
    localStorage.setItem('organizationDetails', JSON.stringify(organizationDetails));
    toast({
      title: "Organization details saved",
      description: "Your organization details have been saved successfully."
    });
  };
  
  const handleSaveBranding = () => {
    // In a real app, this would upload files to a storage service
    const brandingInfo = {
      logo: logoFile?.name || null,
      seal: sealFile?.name || null,
      letterhead: letterheadFile?.name || null,
      signature: signatureFile?.name || null,
      tagline: organizationDetails.tagline
    };
    localStorage.setItem('brandingInfo', JSON.stringify(brandingInfo));
    toast({
      title: "Branding settings saved",
      description: "Your branding settings have been saved successfully."
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setOrganizationDetails(prev => ({
      ...prev,
      [id.replace('org-', '')]: value
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Admin Settings</h1>
            <p className="text-muted-foreground">Manage your organization and user permissions</p>
          </div>
          <Button className="gradient-blue md:self-start gap-2">
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
                        placeholder="Acme College" 
                        value={organizationDetails.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-type">Institution Type</Label>
                      <Input 
                        id="org-type" 
                        placeholder="School/College/Corporate" 
                        value={organizationDetails.type}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org-address">Address</Label>
                    <Input 
                      id="org-address" 
                      placeholder="Full address" 
                      value={organizationDetails.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-phone">Phone Number</Label>
                      <Input 
                        id="org-phone" 
                        placeholder="+91 XXXXX XXXXX" 
                        value={organizationDetails.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-email">Official Email</Label>
                      <Input 
                        id="org-email" 
                        placeholder="contact@example.com" 
                        value={organizationDetails.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org-website">Website</Label>
                    <Input 
                      id="org-website" 
                      placeholder="https://example.com" 
                      value={organizationDetails.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Official Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-registration">Registration Number</Label>
                      <Input 
                        id="org-registration" 
                        placeholder="REG123456" 
                        value={organizationDetails.registration}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-affiliation">Affiliation</Label>
                      <Input 
                        id="org-affiliation" 
                        placeholder="e.g. CBSE, ICSE, etc." 
                        value={organizationDetails.affiliation}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSaveOrganization}>Save Changes</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="m-0">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                <h2 className="text-lg font-medium">Users & Permissions</h2>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <Input placeholder="Search users..." className="w-full md:w-56" />
                  <Button>Search</Button>
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
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt="Rajesh Khanna" />
                            <AvatarFallback>RK</AvatarFallback>
                          </Avatar>
                          <span>Rajesh Khanna</span>
                        </div>
                      </TableCell>
                      <TableCell>principal@dpsdelhi.edu.in</TableCell>
                      <TableCell>Administrator</TableCell>
                      <TableCell>Management</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt="Priya Sharma" />
                            <AvatarFallback>PS</AvatarFallback>
                          </Avatar>
                          <span>Priya Sharma</span>
                        </div>
                      </TableCell>
                      <TableCell>registrar@dpsdelhi.edu.in</TableCell>
                      <TableCell>Manager</TableCell>
                      <TableCell>Administration</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt="Amit Kumar" />
                            <AvatarFallback>AK</AvatarFallback>
                          </Avatar>
                          <span>Amit Kumar</span>
                        </div>
                      </TableCell>
                      <TableCell>accounts@dpsdelhi.edu.in</TableCell>
                      <TableCell>Staff</TableCell>
                      <TableCell>Finance</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
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
                          {logoFile ? (
                            <div className="flex flex-col items-center">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(logoFile)} 
                                  alt="Logo preview" 
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <p className="text-sm font-medium">{logoFile.name}</p>
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
                            onChange={(e) => handleFileUpload(e, setLogoFile, "Logo")}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Official Seal</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center relative">
                          {sealFile ? (
                            <div className="flex flex-col items-center">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(sealFile)} 
                                  alt="Seal preview" 
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <p className="text-sm font-medium">{sealFile.name}</p>
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
                            onChange={(e) => handleFileUpload(e, setSealFile, "Seal")}
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
                          {letterheadFile ? (
                            <div className="flex flex-col items-center">
                              <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(letterheadFile)} 
                                  alt="Letterhead preview" 
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <p className="text-sm font-medium">{letterheadFile.name}</p>
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
                            onChange={(e) => handleFileUpload(e, setLetterheadFile, "Letterhead")}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="signature">Digital Signature</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center relative">
                          {signatureFile ? (
                            <div className="flex flex-col items-center">
                              <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(signatureFile)} 
                                  alt="Signature preview" 
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <p className="text-sm font-medium">{signatureFile.name}</p>
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
                            onChange={(e) => handleFileUpload(e, setSignatureFile, "Signature")}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveBranding}>Save Changes</Button>
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
                    <Button variant="outline" size="sm">Setup</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password policy</h4>
                      <p className="text-sm text-muted-foreground">Require strong passwords</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session timeout</h4>
                      <p className="text-sm text-muted-foreground">Currently set to 30 minutes</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
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
                    <Button variant="outline" size="sm" className="bg-primary-50 border-primary-100 text-primary-700">
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Watermarking</h4>
                      <p className="text-sm text-muted-foreground">Add watermarks to printed documents</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Document Expiry</h4>
                      <p className="text-sm text-muted-foreground">Set expiration dates for documents</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
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
                    <Button variant="outline" size="sm" className="mt-2 md:mt-0">
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
