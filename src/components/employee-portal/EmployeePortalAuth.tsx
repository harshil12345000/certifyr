import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DoorOpen, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmployeePortalAuthProps {
  portalSettings: any;
  onEmployeeAuthenticated: (employee: any) => void;
}

export function EmployeePortalAuth({ portalSettings, onEmployeeAuthenticated }: EmployeePortalAuthProps) {
  const [mode, setMode] = useState<'signin' | 'register' | 'pending'>('signin');
  const [loading, setLoading] = useState(false);
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

  // --- Sign In Handler ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
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
        toast({ title: 'Error', description: 'Invalid email, password, or not approved.', variant: 'destructive' });
        return;
      }
      onEmployeeAuthenticated(data);
    } catch (err) {
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
        toast({ title: 'Error', description: 'Employee already registered.', variant: 'destructive' });
        return;
      }
      // Insert new employee (pending)
      const passwordHash = btoa(register.password);
      const { data, error } = await supabase
        .from('request_portal_employees')
        .insert({
          organization_id: portalSettings.organization_id,
          full_name: register.fullName,
          email: register.email,
          employee_id: register.employeeId,
          phone_number: register.phoneNumber,
          manager_name: register.managerName,
          password_hash: passwordHash,
          status: 'pending'
        })
        .select()
        .single();
      if (error) {
        toast({ title: 'Error', description: 'Failed to register.', variant: 'destructive' });
        return;
      }
      // Notify admin
      await supabase.from('announcements').insert({
        title: `${register.fullName} Requested Portal Access`,
        content: `${register.fullName} has requested access to your organization's Certifyr Request Portal.\nDetails:\n• Email: ${register.email}\n• ID: ${register.employeeId}\n• Manager: ${register.managerName}`,
        organization_id: portalSettings.organization_id,
        created_by: data.id,
        is_active: true,
        is_global: false
      });
      setMode('pending');
      toast({ title: 'Registration Submitted', description: 'Your registration is pending admin approval.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to register.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---
  if (mode === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Registration Pending</CardTitle>
            <CardDescription>Your registration is awaiting admin approval. You will be notified once approved.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            {mode === 'signin' ? <DoorOpen className="h-6 w-6 text-primary" /> : <Building2 className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle>{mode === 'signin' ? 'Employee Sign In' : 'Employee Registration'}</CardTitle>
          <CardDescription>
            {mode === 'signin' ? 'Sign in with your email and password' : 'Please provide your details to complete registration'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signInEmail">Email</Label>
                <Input id="signInEmail" type="email" value={signIn.email} onChange={e => setSignIn(prev => ({ ...prev, email: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="signInPassword">Password</Label>
                <Input id="signInPassword" type="password" value={signIn.password} onChange={e => setSignIn(prev => ({ ...prev, password: e.target.value }))} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={register.fullName} onChange={e => setRegister(prev => ({ ...prev, fullName: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={register.email} onChange={e => setRegister(prev => ({ ...prev, email: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" value={register.employeeId} onChange={e => setRegister(prev => ({ ...prev, employeeId: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" value={register.phoneNumber} onChange={e => setRegister(prev => ({ ...prev, phoneNumber: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="managerName">Manager Name</Label>
                <Input id="managerName" value={register.managerName} onChange={e => setRegister(prev => ({ ...prev, managerName: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="regPassword">Password *</Label>
                <Input id="regPassword" type="password" value={register.password} onChange={e => setRegister(prev => ({ ...prev, password: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input id="confirmPassword" type="password" value={register.confirmPassword} onChange={e => setRegister(prev => ({ ...prev, confirmPassword: e.target.value }))} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Button variant="link" type="button" onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}>
              {mode === 'signin' ? 'New user? Register' : 'Already have an account? Sign In'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}