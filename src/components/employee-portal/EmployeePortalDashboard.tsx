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
  onSignOut: () => void;
}

export function EmployeePortalDashboard({ employee, onSignOut }: EmployeePortalDashboardProps) {
  const { organization } = useEmployeePortal();
  const [activeTab, setActiveTab] = useState('templates');

  const handleSignOut = () => {
    localStorage.removeItem('employee_portal_session');
    onSignOut();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col glass-card border-r border-border/50 min-h-screen">
        <div className="flex items-center gap-3 p-4 h-16 border-b border-border/30">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{organization?.name || 'Organization'}</h1>
            <p className="text-xs text-muted-foreground">Employee Portal</p>
          </div>
        </div>
        <nav className="flex-1 py-6 px-2 space-y-1">
          <button
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'templates' ? 'bg-primary-500/10 text-primary-600' : 'text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500'}`}
            onClick={() => setActiveTab('templates')}
          >
            <FileText className="h-5 w-5 mr-2" /> Templates
          </button>
          <button
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-primary-500/10 text-primary-600' : 'text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-5 w-5 mr-2" /> Settings
          </button>
        </nav>
        <div className="mt-auto p-4 border-t border-border/30 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{employee?.full_name || organization?.name || 'Employee'}</p>
            <p className="text-xs text-muted-foreground">{employee?.email}</p>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeTab === 'templates' && <EmployeeTemplates />}
        {activeTab === 'settings' && <EmployeeSettings employee={employee} />}
      </main>
    </div>
  );
}