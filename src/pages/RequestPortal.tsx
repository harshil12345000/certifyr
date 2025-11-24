import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequestPortalSettings } from "@/components/request-portal/RequestPortalSettings";
import { RequestPortalRequests } from "@/components/request-portal/RequestPortalRequests";
import { RequestPortalMembers } from "@/components/request-portal/RequestPortalMembers";
import { RequestPortalSkeleton } from "@/components/request-portal/RequestPortalSkeleton";

export default function RequestPortal() {
  const [activeTab, setActiveTab] = useState("settings");
  const [requestsCount, setRequestsCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { orgId, loading: orgLoading } = useOrganizationId();

  // Fetch requests count from Supabase
  useEffect(() => {
    if (!orgId) return;
    const fetchRequestsCount = async () => {
      const { count } = await supabase
        .from("document_requests")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "pending");
      setRequestsCount(count || 0);
    };
    fetchRequestsCount();
  }, [orgId]);

  // Fetch members count from Supabase
  useEffect(() => {
    if (!orgId) return;
    const fetchMembersCount = async () => {
      const { count } = await supabase
        .from("request_portal_employees")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);
      setMembersCount(count || 0);
    };
    fetchMembersCount();
  }, [orgId]);

  useEffect(() => {
    if (!orgLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [orgLoading]);

  if (loading || orgLoading) {
    return (
      <DashboardLayout>
        <RequestPortalSkeleton />
      </DashboardLayout>
    );
  }

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

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary bg-primary text-primary-foreground text-xs font-medium">
                {requestsCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="members">
              Members
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary bg-primary text-primary-foreground text-xs font-medium">
                {membersCount}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <RequestPortalSettings />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <RequestPortalRequests
              organizationId={orgId || ""}
              onRequestProcessed={async () => {
                if (!orgId) return;
                const { count } = await supabase
                  .from("document_requests")
                  .select("*", { count: "exact", head: true })
                  .eq("organization_id", orgId)
                  .eq("status", "pending");
                setRequestsCount(count || 0);
              }}
            />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <RequestPortalMembers
              organizationId={orgId || ""}
              onMemberProcessed={async () => {
                if (!orgId) return;
                const { count } = await supabase
                  .from("request_portal_employees")
                  .select("*", { count: "exact", head: true })
                  .eq("organization_id", orgId);
                setMembersCount(count || 0);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
