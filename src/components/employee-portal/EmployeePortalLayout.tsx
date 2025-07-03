import { ReactNode, useState } from 'react';
import { useEmployeePortal } from '@/contexts/EmployeePortalContext';
import { FileText, Settings, User, Building2 } from 'lucide-react';

interface EmployeePortalLayoutProps {
  children: ReactNode;
  activeTab?: 'templates' | 'settings';
}

export function EmployeePortalLayout({ children, activeTab = 'templates' }: EmployeePortalLayoutProps) {
  const { employee, organization } = useEmployeePortal();
  const [selectedTab, setSelectedTab] = useState(activeTab);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col glass-card border-r border-border/50 min-h-screen h-screen">
        <div className="flex items-center gap-3 p-4 h-16 border-b border-border/30">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{organization?.name || 'Organization'}</h1>
            <p className="text-xs text-muted-foreground">Employee Portal</p>
          </div>
        </div>
        <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          <a
            href={`/${organization?.id}/request-portal`}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === 'templates' ? 'bg-primary-500/10 text-primary-600' : 'text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500'}`}
            onClick={() => setSelectedTab('templates')}
          >
            <FileText className="h-5 w-5 mr-2" /> Templates
          </a>
          <a
            href={`/${organization?.id}/request-portal?tab=settings`}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === 'settings' ? 'bg-primary-500/10 text-primary-600' : 'text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500'}`}
            onClick={() => setSelectedTab('settings')}
          >
            <Settings className="h-5 w-5 mr-2" /> Settings
          </a>
        </nav>
        {/* Bottom info: always visible, sticky to bottom */}
        <div className="sticky bottom-0 left-0 w-full bg-background p-4 border-t border-border/30 flex items-center gap-3 z-10">
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
        {children}
      </main>
    </div>
  );
} 