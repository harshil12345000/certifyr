import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DoorOpen, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmployeePortalAuthProps {
  portalSettings: any;
  onEmployeeAuthenticated: (employee: any) => void;
}

export function EmployeePortalAuth({ portalSettings, onEmployeeAuthenticated }: EmployeePortalAuthProps) {
  const [step, setStep] = useState<'register' | 'signin' | 'pending'>('signin');
  const [registrationData, setRegistrationData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
    managerName: '',
    password: '',
    confirmPassword: ''
  });
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // Registration handler
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (registrationData.password !== registrationData.confirmPassword) {
        toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
        return;
      }
      if (registrationData.password.length < 6) {
        toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
        return;
      }
      // Check for existing employee by name+org or email+org
      const { data: existing } = await supabase
        .from('request_portal_employees')
        .select('id')
        .eq('organization_id', portalSettings.organization_id)
        .or(`full_name.eq.${registrationData.fullName},email.eq.${registrationData.email}`)
        .maybeSingle();
      if (existing) {
        toast({ title: 'Error', description: 'Employee already registered', variant: 'destructive' });
        return;
      }
      // Hash password
      const passwordHash = btoa(registrationData.password);
      const { data, error } = await supabase
        .from('request_portal_employees')
        .insert({
          organization_id: portalSettings.organization_id,
          full_name: registrationData.fullName,
          email: registrationData.email,
          phone_number: registrationData.phoneNumber || null,
          employee_id: registrationData.employeeId,
          manager_name: registrationData.managerName || null,
          status: 'pending',
          password_hash: passwordHash
        })
        .select()
        .single();
      if (error) {
        toast({ title: 'Error', description: 'Failed to register', variant: 'destructive' });
        return;
      }
      setStep('pending');
      toast({ title: 'Registration Submitted', description: 'Your registration is pending admin approval' });
    } catch (error) {
      console.error('Error registering:', error);
      toast({ title: 'Error', description: 'Failed to submit registration', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Sign-in handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const passwordHash = btoa(signInData.password);
      const { data, error } = await supabase
        .from('request_portal_employees')
        .select('*')
        .eq('organization_id', portalSettings.organization_id)
        .eq('email', signInData.email)
        .eq('password_hash', passwordHash)
        .eq('status', 'approved')
        .single();
      if (error || !data) {
        toast({ title: 'Error', description: 'Invalid email or password, or not approved', variant: 'destructive' });
        return;
      }
      onEmployeeAuthenticated(data);
    } catch (error) {
      console.error('Error signing in:', error);
      toast({ title: 'Error', description: 'Failed to sign in', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'signin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <DoorOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Employee Sign In</CardTitle>
              <CardDescription>Sign in with your email and password</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signInEmail">Email</Label>
                <Input
                  id="signInEmail"
                  type="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signInPassword">Password</Label>
                <Input
                  id="signInPassword"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => setStep('register')}>New user? Register</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Employee Registration</CardTitle>
              <CardDescription>
                Please provide your details to complete registration
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistration} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={registrationData.fullName}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={registrationData.employeeId}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, employeeId: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={registrationData.phoneNumber}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="managerName">Manager Name</Label>
                <Input
                  id="managerName"
                  value={registrationData.managerName}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, managerName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="regPassword">Password *</Label>
                <Input
                  id="regPassword"
                  type="password"
                  value={registrationData.password}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={registrationData.confirmPassword}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => setStep('signin')}>Already registered? Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Registration Pending</CardTitle>
              <CardDescription>
                Your registration is pending admin approval. Please wait for approval before signing in.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return null;
}