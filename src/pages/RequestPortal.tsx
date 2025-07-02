import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RequestPortalSettings } from '@/components/request-portal/RequestPortalSettings';
import { RequestPortalRequests } from '@/components/request-portal/RequestPortalRequests';
import { RequestPortalMembers } from '@/components/request-portal/RequestPortalMembers';

export default function RequestPortal() {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Request Portal</h1>
            <p className="text-muted-foreground">
              Manage employee document requests and portal access
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              <Badge variant="secondary" className="ml-2">
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <RequestPortalSettings />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <RequestPortalRequests />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <RequestPortalMembers />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}