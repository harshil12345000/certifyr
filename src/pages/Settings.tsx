
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@certifyr.com",
    jobTitle: "Principal",
    department: "management",
    phone: "+91 98765 43210",
    bio: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newDocumentRequests: true,
    documentSigned: true,
    documentDelivered: true,
    newUserRegistrations: true,
    securityAlerts: true,
    productUpdates: false,
    emailNotifications: true,
    inAppNotifications: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    textSize: "medium"
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [id.replace('first-name', 'firstName').replace('last-name', 'lastName').replace('job-title', 'jobTitle')]: value
    }));
  };

  const handleDepartmentChange = (value: string) => {
    setProfileData(prev => ({ ...prev, department: value }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would send data to an API
    localStorage.setItem('profileData', JSON.stringify(profileData));
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully."
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [id.replace('current-password', 'currentPassword')
         .replace('new-password', 'newPassword')
         .replace('confirm-password', 'confirmPassword')]: value
    }));
  };

  const handleUpdatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Your new password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Your new password should be at least 8 characters.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send data to an API
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully."
    });
    
    // Reset form
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSaveNotifications = () => {
    // In a real app, this would send data to an API
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated."
    });
  };

  const handleThemeChange = (theme: string) => {
    setAppearanceSettings(prev => ({ ...prev, theme }));
  };

  const handleTextSizeChange = (textSize: string) => {
    setAppearanceSettings(prev => ({ ...prev, textSize }));
  };

  const handleSaveAppearance = () => {
    // In a real app, this would send data to an API
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
    toast({
      title: "Appearance settings saved",
      description: "Your appearance preferences have been updated."
    });
  };

  const handle2FASetup = () => {
    toast({
      title: "2FA Setup",
      description: "Two-factor authentication setup would launch here."
    });
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog
    toast({
      title: "Account deletion",
      description: "This would typically show a confirmation dialog before proceeding.",
      variant: "destructive"
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="glass-card">
          <div className="border-b">
            <div className="px-4">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500 data-[state=active]:border-b-2 rounded-none px-4 py-3 -mb-px">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="account" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500 data-[state=active]:border-b-2 rounded-none px-4 py-3 -mb-px">
                  Account
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500 data-[state=active]:border-b-2 rounded-none px-4 py-3 -mb-px">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500 data-[state=active]:border-b-2 rounded-none px-4 py-3 -mb-px">
                  Appearance
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="profile" className="m-0 p-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-6 mb-8">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt="Admin User" />
                  <AvatarFallback className="text-2xl">AI</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-medium">Admin User</h2>
                  <p className="text-sm text-muted-foreground mb-2">admin@certifyr.com</p>
                  <Badge variant="outline" className="bg-certifyr-blue-light/20 text-certifyr-blue border-certifyr-blue/20">
                    Administrator
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input 
                        id="first-name" 
                        placeholder="First name" 
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input 
                        id="last-name" 
                        placeholder="Last name" 
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email" 
                      value={profileData.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input 
                      id="job-title" 
                      placeholder="Your role" 
                      value={profileData.jobTitle}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={profileData.department}
                        onValueChange={handleDepartmentChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="management">Management</SelectItem>
                          <SelectItem value="administration">Administration</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="it">IT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="+91 XXXXX XXXXX" 
                        value={profileData.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input 
                      id="bio" 
                      placeholder="A brief description about yourself" 
                      value={profileData.bio}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="account" className="m-0 p-6">
            <div className="max-w-2xl space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleUpdatePassword}>Update Password</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Switch id="2fa" />
                    <div>
                      <Label htmlFor="2fa" className="text-base">Enable 2FA</Label>
                      <p className="text-sm text-muted-foreground">Protect your account with two-factor authentication</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={handle2FASetup}>Configure 2FA</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="text-red-600">
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions for your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="m-0 p-6">
            <div className="max-w-2xl">
              <h2 className="text-lg font-medium mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Document Notifications</h3>
                  <Separator />
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New document requests</p>
                        <p className="text-sm text-muted-foreground">Get notified when new documents need your approval</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.newDocumentRequests}
                        onCheckedChange={() => handleNotificationToggle('newDocumentRequests')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Document signed</p>
                        <p className="text-sm text-muted-foreground">Get notified when documents are signed</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.documentSigned}
                        onCheckedChange={() => handleNotificationToggle('documentSigned')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Document delivered</p>
                        <p className="text-sm text-muted-foreground">Get notified when documents are delivered</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.documentDelivered}
                        onCheckedChange={() => handleNotificationToggle('documentDelivered')}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">System Notifications</h3>
                  <Separator />
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New user registrations</p>
                        <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.newUserRegistrations}
                        onCheckedChange={() => handleNotificationToggle('newUserRegistrations')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified about security events</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.securityAlerts}
                        onCheckedChange={() => handleNotificationToggle('securityAlerts')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Product updates</p>
                        <p className="text-sm text-muted-foreground">Get notified about new features and improvements</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.productUpdates}
                        onCheckedChange={() => handleNotificationToggle('productUpdates')}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Notification Channels</h3>
                  <Separator />
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">In-app notifications</p>
                        <p className="text-sm text-muted-foreground">Show notifications in the application</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.inAppNotifications}
                        onCheckedChange={() => handleNotificationToggle('inAppNotifications')}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSaveNotifications}>Save Preferences</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="m-0 p-6">
            <div className="max-w-2xl">
              <h2 className="text-lg font-medium mb-6">Appearance Settings</h2>
              
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Choose your preferred color theme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer bg-white ${appearanceSettings.theme === 'light' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        onClick={() => handleThemeChange('light')}
                      >
                        <div className="h-10 rounded-md bg-white border mb-2"></div>
                        <div className="text-center text-sm font-medium">Light</div>
                      </div>
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer ${appearanceSettings.theme === 'dark' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        onClick={() => handleThemeChange('dark')}
                      >
                        <div className="h-10 rounded-md bg-slate-900 mb-2"></div>
                        <div className="text-center text-sm font-medium">Dark</div>
                      </div>
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer ${appearanceSettings.theme === 'system' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        onClick={() => handleThemeChange('system')}
                      >
                        <div className="h-10 rounded-md bg-gradient-to-r from-white to-slate-900 mb-2"></div>
                        <div className="text-center text-sm font-medium">System</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Text Size</CardTitle>
                    <CardDescription>Adjust the size of text throughout the application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="text-size" className="min-w-24">Text Size:</Label>
                      <Select 
                        value={appearanceSettings.textSize}
                        onValueChange={handleTextSizeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select text size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <p className="text-sm mb-2">Preview:</p>
                      <div className="border rounded-md p-4">
                        <h4 className="text-lg font-medium mb-2">Document Heading</h4>
                        <p className="text-sm mb-2">This is how regular text will appear throughout the application.</p>
                        <p className="text-xs text-muted-foreground">This is smaller text for less important information.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Button onClick={handleSaveAppearance}>Save Preferences</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
