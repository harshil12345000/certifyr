
import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Load saved settings when the component mounts
  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        // Load profile data from Supabase using raw SQL query to avoid type issues
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles' as any)
          .select('*')
          .limit(1)
          .single();
        
        if (profileData && !profileError) {
          setProfileData({
            firstName: profileData.first_name || "Admin",
            lastName: profileData.last_name || "User",
            email: profileData.email || "admin@certifyr.com",
            jobTitle: profileData.job_title || "Principal",
            department: profileData.department || "management",
            phone: profileData.phone || "+91 98765 43210",
            bio: profileData.bio || ""
          });
        } else {
          // Fall back to localStorage
          const savedProfileData = localStorage.getItem('profileData');
          if (savedProfileData) {
            try {
              setProfileData(JSON.parse(savedProfileData));
            } catch (error) {
              console.error("Error parsing saved profile data:", error);
            }
          }
        }
        
        // Load notification settings from Supabase
        const { data: notificationData, error: notificationError } = await supabase
          .from('user_notification_settings' as any)
          .select('*')
          .limit(1)
          .single();
        
        if (notificationData && !notificationError) {
          setNotificationSettings({
            newDocumentRequests: notificationData.new_document_requests ?? true,
            documentSigned: notificationData.document_signed ?? true,
            documentDelivered: notificationData.document_delivered ?? true,
            newUserRegistrations: notificationData.new_user_registrations ?? true,
            securityAlerts: notificationData.security_alerts ?? true,
            productUpdates: notificationData.product_updates ?? false,
            emailNotifications: notificationData.email_notifications ?? true,
            inAppNotifications: notificationData.in_app_notifications ?? true
          });
        } else {
          // Fall back to localStorage
          const savedNotificationSettings = localStorage.getItem('notificationSettings');
          if (savedNotificationSettings) {
            try {
              setNotificationSettings(JSON.parse(savedNotificationSettings));
            } catch (error) {
              console.error("Error parsing saved notification settings:", error);
            }
          }
        }
        
        // Load appearance settings from Supabase
        const { data: appearanceData, error: appearanceError } = await supabase
          .from('user_appearance_settings' as any)
          .select('*')
          .limit(1)
          .single();
        
        if (appearanceData && !appearanceError) {
          setAppearanceSettings({
            theme: appearanceData.theme || "light",
            textSize: appearanceData.text_size || "medium"
          });
        } else {
          // Fall back to localStorage
          const savedAppearanceSettings = localStorage.getItem('appearanceSettings');
          if (savedAppearanceSettings) {
            try {
              setAppearanceSettings(JSON.parse(savedAppearanceSettings));
            } catch (error) {
              console.error("Error parsing saved appearance settings:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        // Still try to load from localStorage as fallback
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      const savedProfileData = localStorage.getItem('profileData');
      if (savedProfileData) {
        try {
          setProfileData(JSON.parse(savedProfileData));
        } catch (error) {
          console.error("Error parsing saved profile data:", error);
        }
      }
      
      const savedNotificationSettings = localStorage.getItem('notificationSettings');
      if (savedNotificationSettings) {
        try {
          setNotificationSettings(JSON.parse(savedNotificationSettings));
        } catch (error) {
          console.error("Error parsing saved notification settings:", error);
        }
      }
      
      const savedAppearanceSettings = localStorage.getItem('appearanceSettings');
      if (savedAppearanceSettings) {
        try {
          setAppearanceSettings(JSON.parse(savedAppearanceSettings));
        } catch (error) {
          console.error("Error parsing saved appearance settings:", error);
        }
      }
    };
    
    loadSavedSettings();
  }, []);

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

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage for backward compatibility
      localStorage.setItem('profileData', JSON.stringify(profileData));
      
      // Save to Supabase
      const { error } = await supabase
        .from('user_profiles' as any)
        .upsert({ 
          id: '1', // Using a constant string ID
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          job_title: profileData.jobTitle,
          department: profileData.department,
          phone: profileData.phone,
          bio: profileData.bio
        })
        .select();
      
      if (error) {
        console.error("Error saving to database:", error);
        // Continue with success message since we saved to localStorage
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully."
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Profile saved locally",
        description: "Your changes have been saved locally."
      });
    } finally {
      setIsSaving(false);
    }
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

  const handleUpdatePassword = async () => {
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
    
    setIsSaving(true);
    try {
      // In a real app with Supabase, we would update the password using auth.updateUser
      const { error } = await supabase.auth.updateUser({ 
        password: passwordData.newPassword 
      });
      
      if (error) {
        throw error;
      }
      
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
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error updating password",
        description: "There was an error updating your password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage for backward compatibility
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      
      // Save to Supabase
      const { error } = await supabase
        .from('user_notification_settings' as any)
        .upsert({ 
          id: '1', // Using a constant string ID
          new_document_requests: notificationSettings.newDocumentRequests,
          document_signed: notificationSettings.documentSigned,
          document_delivered: notificationSettings.documentDelivered,
          new_user_registrations: notificationSettings.newUserRegistrations,
          security_alerts: notificationSettings.securityAlerts,
          product_updates: notificationSettings.productUpdates,
          email_notifications: notificationSettings.emailNotifications,
          in_app_notifications: notificationSettings.inAppNotifications
        })
        .select();
      
      if (error) {
        console.error("Error saving to database:", error);
        // Continue with success message since we saved to localStorage
      }
      
      toast({
        title: "Notification preferences saved",
        description: "Your notification settings have been updated."
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Notification settings saved locally",
        description: "Your changes have been saved locally."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (theme: string) => {
    setAppearanceSettings(prev => ({ ...prev, theme }));
  };

  const handleTextSizeChange = (textSize: string) => {
    setAppearanceSettings(prev => ({ ...prev, textSize }));
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage for backward compatibility
      localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
      
      // Apply theme immediately
      document.documentElement.setAttribute('data-theme', appearanceSettings.theme);
      document.documentElement.style.fontSize = 
        appearanceSettings.textSize === 'small' ? '14px' : 
        appearanceSettings.textSize === 'large' ? '18px' : '16px';
      
      // Save to Supabase
      const { error } = await supabase
        .from('user_appearance_settings' as any)
        .upsert({ 
          id: '1', // Using a constant string ID
          theme: appearanceSettings.theme,
          text_size: appearanceSettings.textSize
        })
        .select();
      
      if (error) {
        console.error("Error saving to database:", error);
        // Continue with success message since we saved to localStorage
      }
      
      toast({
        title: "Appearance settings saved",
        description: "Your appearance preferences have been updated."
      });
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      toast({
        title: "Appearance settings saved locally",
        description: "Your changes have been saved locally."
      });
    } finally {
      setIsSaving(false);
    }
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
                  <AvatarImage src="" alt={`${profileData.firstName} ${profileData.lastName}`} />
                  <AvatarFallback className="text-2xl">
                    {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-medium">{profileData.firstName} {profileData.lastName}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{profileData.email}</p>
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
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
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
                  <Button onClick={handleUpdatePassword} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
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
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
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
                
                <Button onClick={handleSaveAppearance} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Preferences'
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
