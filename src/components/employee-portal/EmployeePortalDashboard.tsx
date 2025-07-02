import { useState } from 'react';
import { useEmployeePortal } from '@/contexts/EmployeePortalContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeTemplates } from './EmployeeTemplates';
import { EmployeeSettings } from './EmployeeSettings';
import { FileText, Settings, Building2, User } from 'lucide-react';

interface EmployeePortalDashboardProps {
  employee: any;
}

export function EmployeePortalDashboard({ employee }: EmployeePortalDashboardProps) {
  const { organization } = useEmployeePortal();
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{organization?.name}</h1>
                <p className="text-sm text-muted-foreground">Employee Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{employee.full_name}</p>
                <p className="text-xs text-muted-foreground">ID: {employee.employee_id}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <EmployeeTemplates employee={employee} />
          </TabsContent>

          <TabsContent value="settings">
            <EmployeeSettings employee={employee} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}