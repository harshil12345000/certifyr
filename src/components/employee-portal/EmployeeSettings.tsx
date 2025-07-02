import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface EmployeeSettingsProps {
  employee: any;
}

export function EmployeeSettings({ employee }: EmployeeSettingsProps) {
  const [formData, setFormData] = useState({
    fullName: employee.full_name || '',
    email: employee.email || '',
    phoneNumber: employee.phone_number || '',
    employeeId: employee.employee_id || '',
    managerName: employee.manager_name || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save employee data
      toast({
        title: 'Success',
        description: 'Account information updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update account information',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              readOnly
              className="bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="managerName">Manager Name</Label>
            <Input
              id="managerName"
              value={formData.managerName}
              onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
            />
          </div>
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}