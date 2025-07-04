
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DoorOpen, Building2, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmployeePortalAuthProps {
  portalSettings: any;
  onEmployeeAuthenticated: (employee: any) => void;
}

export function EmployeePortalAuth({ portalSettings, onEmployeeAuthenticated }: EmployeePortalAuthProps) {
  const [mode, setMode] = useState<'portal-password' | 'signin' | 'register' | 'pending'>('portal-password');
  const [loading, setLoading] = useState(false);
  const [portalPassword, setPortalPassword] = useState('');
  const [signIn, setSignIn] = useState({ email: '', password: '' });
  const [register, setRegister] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    phoneNumber: '',
    managerName: '',
    password: '',
    confirmPassword: ''
  });

  // --- Portal Password Gate Handler ---
  const handlePortalPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!portalPassword.trim()) {
        toast({ title: 'Error', description: 'Please enter the organization portal password.', variant: 'destructive' });
        return;
      }

      // Check portal password against stored hash
      const passwordHash = btoa(portalPassword);
      
      if (passwordHash !== portalSettings.password_hash) {
        toast({ title: 'Error', description: 'Invalid organization portal password.', variant: 'destructive' });
        return;
      }

      // Password is correct, proceed to signin/register options
      setMode('signin');
      toast({ title: 'Success', description: 'Portal password verified. You can now sign in or register.' });
    } catch (err) {
      console.error('Portal password verification error:', err);
      toast({ title: 'Error', description: 'Failed to verify portal password.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- Sign In Handler ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!signIn.email.trim() || !signIn.password.trim()) {
        toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
        return;
      }

      const passwordHash = btoa(signIn.password);
      const { data, error } = await supabase
        .from('request_portal_employees')
        .select('*')
        .eq('organization_id', portalSettings.organization_id)
        .eq('email', signIn.email)
        .eq('password_hash', passwordHash)
        .eq('status', 'approved')
        .single();
      
      if (error || !data) {
        toast({ title: 'Error', description: 'Invalid email, password, or account not yet approved.', variant: 'destructive' });
        return;
      }

      toast({ title: 'Success', description: 'Successfully signed in!' });
      onEmployeeAuthenticated(data);
    } catch (err) {
      console.error('Sign in error:', err);
      toast({ title: 'Error', description: 'Failed to sign in.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- Registration Handler ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation
      if (!register.fullName.trim() || !register.email.trim() || !register.password.trim() || !register.confirmPassword.trim()) {
        toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
        return;
      }

      if (register.password !== register.confirmPassword) {
        toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
        return;
      }

      if (register.password.length < 6) {
        toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
        return;
      }

      // Check for existing employee
      const { data: existing } = await supabase
        .from('request_portal_employees')
        .select('id')
        .eq('organization_id', portalSettings.organization_id)
        .or(`full_name.eq.${register.fullName},email.eq.${register.email}`)
        .maybeSingle();
      
      if (existing) {
        toast({ title: 'Error', description: 'An employee with this name or email already exists.', variant: 'destructive' });
        return;
      }

      // Insert new employee (pending status)
      const passwordHash = btoa(register.password);
      const { data, error } = await supabase
        .from('request_portal_employees')
        .insert({
          organization_id: portalSettings.organization_id,
          full_name: register.fullName,
          email: register.email,
          employee_id: register.employeeId || null,
          phone_number: register.phoneNumber || null,
          manager_name: register.managerName || null,
          password_hash: passwordHash,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Registration error:', error);
        toast({ title: 'Error', description: 'Failed to register. Please try again.', variant: 'destructive' });
        return;
      }

      // Notify admin
      await supabase.from('announcements').insert({
        title: `${register.fullName} Requested Portal Access`,
        content: `${register.fullName} has requested access to your organization's Certifyr Request Portal.\n\nDetails:\n• Email: ${register.email}\n• Employee ID: ${register.employeeId || 'Not provided'}\n• Phone: ${register.phoneNumber || 'Not provided'}\n• Manager: ${register.managerName || 'Not provided'}\n\nPlease review and approve/reject this request in Request Portal → Members.`,
        organization_id: portalSettings.organization_id,
        created_by: data.id,
        is_active: true,
        is_global: false
      });

      setMode('pending');
      toast({ title: 'Registration Submitted', description: 'Your registration is pending admin approval. You will be notified once approved.' });
    } catch (err) {
      console.error('Registration error:', err);
      toast({ title: 'Error', description: 'Failed to register. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- Portal Password Gate UI ---
  if (mode === 'portal-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Organization Portal Access</CardTitle>
            <CardDescription>
              Enter your organization's portal password to access the employee request portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePortalPasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="portalPassword">Organization Portal Password</Label>
                <Input 
                  id="portalPassword" 
                  type="password" 
                  value={portalPassword} 
                  onChange={e => setPortalPassword(e.target.value)} 
                  placeholder="Enter portal password"
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Pending State UI ---
  if (mode === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>Registration Pending</CardTitle>
            <CardDescription className="text-center">
              Your registration is awaiting admin approval. You will be notified once approved and can then sign in to access the portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => setMode('signin')}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Sign In / Register UI ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            {mode === 'signin' ? <DoorOpen className="h-6 w-6 text-primary" /> : <Building2 className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle>{mode === 'signin' ? 'Employee Sign In' : 'Employee Registration'}</CardTitle>
          <CardDescription>
            {mode === 'signin' 
              ? 'Sign in with your approved employee credentials' 
              : 'Register to request access to the organization portal'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signInEmail">Email *</Label>
                <Input 
                  id="signInEmail" 
                  type="email" 
                  value={signIn.email} 
                  onChange={e => setSignIn(prev => ({ ...prev, email: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="signInPassword">Password *</Label>
                <Input 
                  id="signInPassword" 
                  type="password" 
                  value={signIn.password} 
                  onChange={e => setSignIn(prev => ({ ...prev, password: e.target.value }))} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input 
                  id="fullName" 
                  value={register.fullName} 
                  onChange={e => setRegister(prev => ({ ...prev, fullName: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={register.email} 
                  onChange={e => setRegister(prev => ({ ...prev, email: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input 
                  id="employeeId" 
                  value={register.employeeId} 
                  onChange={e => setRegister(prev => ({ ...prev, employeeId: e.target.value }))} 
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  value={register.phoneNumber} 
                  onChange={e => setRegister(prev => ({ ...prev, phoneNumber: e.target.value }))} 
                />
              </div>
              <div>
                <Label htmlFor="managerName">Manager Name</Label>
                <Input 
                  id="managerName" 
                  value={register.managerName} 
                  onChange={e => setRegister(prev => ({ ...prev, managerName: e.target.value }))} 
                />
              </div>
              <div>
                <Label htmlFor="regPassword">Password *</Label>
                <Input 
                  id="regPassword" 
                  type="password" 
                  value={register.password} 
                  onChange={e => setRegister(prev => ({ ...prev, password: e.target.value }))} 
                  placeholder="Minimum 6 characters"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={register.confirmPassword} 
                  onChange={e => setRegister(prev => ({ ...prev, confirmPassword: e.target.value }))} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          )}
          
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              type="button" 
              onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}
            >
              {mode === 'signin' ? 'New employee? Register here' : 'Already registered? Sign in'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
