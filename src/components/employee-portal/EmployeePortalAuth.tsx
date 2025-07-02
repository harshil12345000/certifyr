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
  const [step, setStep] = useState<'password' | 'register' | 'pending'>('password');
  const [password, setPassword] = useState('');
  const [registrationData, setRegistrationData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
    managerName: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify password (simple check for demo - use bcrypt in production)
      const hashedPassword = btoa(password);
      
      if (hashedPassword !== portalSettings.password_hash) {
        toast({
          title: 'Error',
          description: 'Invalid password',
          variant: 'destructive'
        });
        return;
      }

      setStep('register');
    } catch (error) {
      console.error('Error verifying password:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify password',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('request_portal_employees')
        .insert({
          organization_id: portalSettings.organization_id,
          full_name: registrationData.fullName,
          email: registrationData.email,
          phone_number: registrationData.phoneNumber || null,
          employee_id: registrationData.employeeId,
          manager_name: registrationData.managerName || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Error',
            description: 'Employee ID or email already registered',
            variant: 'destructive'
          });
          return;
        }
        throw error;
      }

      setStep('pending');
      toast({
        title: 'Registration Submitted',
        description: 'Your registration is pending admin approval'
      });
    } catch (error) {
      console.error('Error registering:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit registration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkApprovalStatus = async () => {
    try {
      const { data } = await supabase
        .from('request_portal_employees')
        .select('*')
        .eq('organization_id', portalSettings.organization_id)
        .eq('email', registrationData.email)
        .eq('status', 'approved')
        .single();

      if (data) {
        onEmployeeAuthenticated(data);
      }
    } catch (error) {
      // Employee not approved yet
    }
  };

  if (step === 'password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <DoorOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Employee Request Portal</CardTitle>
              <CardDescription>
                Enter the portal password to continue
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Portal Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter portal password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Continue'}
              </Button>
            </form>
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
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={registrationData.employeeId}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, employeeId: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
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
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending approval step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Building2 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <CardTitle>Pending Approval</CardTitle>
            <CardDescription>
              Your registration is waiting for admin approval
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              An administrator will review your registration and approve access to the portal. 
              You will receive an email notification once approved.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={checkApprovalStatus} 
            variant="outline" 
            className="w-full"
          >
            Check Status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}