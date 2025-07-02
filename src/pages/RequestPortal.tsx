import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RequestPortalSettings } from '@/components/request-portal/RequestPortalSettings';
import { RequestPortalRequests } from '@/components/request-portal/RequestPortalRequests';
import { RequestPortalMembers } from '@/components/request-portal/RequestPortalMembers';

export default function RequestPortal() {
  const [activeTab, setActiveTab] = useState('settings');
  const [requestsCount, setRequestsCount] = useState(0);

  // Fetch requests count from Supabase
  useEffect(() => {
    const fetchRequestsCount = async () => {
      // Import supabase client dynamically to avoid SSR issues
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return setRequestsCount(0);
      // Get user's organization
      const { data: orgData } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      if (!orgData) return setRequestsCount(0);
      // Get pending document requests count
      const { count, error } = await supabase
        .from('document_requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgData.organization_id)
        .eq('status', 'pending');
      if (error) return setRequestsCount(0);
      setRequestsCount(count || 0);
    };
    fetchRequestsCount();
  }, []);

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
                {requestsCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <RequestPortalSettings />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <RequestPortalRequests onRequestProcessed={() => {
              // Refresh count when a request is processed
              // (re-run fetchRequestsCount)
              const fetchRequestsCount = async () => {
                const { supabase } = await import('@/integrations/supabase/client');
                const { data: userData } = await supabase.auth.getUser();
                const user = userData?.user;
                if (!user) return setRequestsCount(0);
                const { data: orgData } = await supabase
                  .from('organization_members')
                  .select('organization_id')
                  .eq('user_id', user.id)
                  .eq('role', 'admin')
                  .single();
                if (!orgData) return setRequestsCount(0);
                const { count, error } = await supabase
                  .from('document_requests')
                  .select('*', { count: 'exact', head: true })
                  .eq('organization_id', orgData.organization_id)
                  .eq('status', 'pending');
                if (error) return setRequestsCount(0);
                setRequestsCount(count || 0);
              };
              fetchRequestsCount();
            }} />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <RequestPortalMembers />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}