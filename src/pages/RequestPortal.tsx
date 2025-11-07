import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Fetch requests count from Supabase
  useEffect(() => {
    const fetchRequestsCount = async () => {
      // Import supabase client dynamically to avoid SSR issues
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return setRequestsCount(0);
      // Get user's organization
      const { data: orgData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      if (!orgData) return setRequestsCount(0);
      // Get pending document requests count
      const { count, error } = await supabase
        .from("document_requests")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgData.organization_id)
        .eq("status", "pending");
      if (error) return setRequestsCount(0);
      setRequestsCount(count || 0);
    };
    fetchRequestsCount();
  }, []);

  // Fetch members count from Supabase
  useEffect(() => {
    const fetchMembersCount = async () => {
      // Import supabase client dynamically to avoid SSR issues
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return setMembersCount(0);
      // Get user's organization
      const { data: orgData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      if (!orgData) return setMembersCount(0);
      // Get all portal employees count
      const { count, error } = await supabase
        .from("request_portal_employees")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgData.organization_id);
      if (error) return setMembersCount(0);
      setMembersCount(count || 0);
    };
    fetchMembersCount();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Simulate loading for 500ms
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
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
              onRequestProcessed={() => {
                // Refresh count when a request is processed
                // (re-run fetchRequestsCount)
                const fetchRequestsCount = async () => {
                  const { supabase } = await import(
                    "@/integrations/supabase/client"
                  );
                  const { data: userData } = await supabase.auth.getUser();
                  const user = userData?.user;
                  if (!user) return setRequestsCount(0);
                  const { data: orgData } = await supabase
                    .from("organization_members")
                    .select("organization_id")
                    .eq("user_id", user.id)
                    .eq("role", "admin")
                    .single();
                  if (!orgData) return setRequestsCount(0);
                  const { count, error } = await supabase
                    .from("document_requests")
                    .select("*", { count: "exact", head: true })
                    .eq("organization_id", orgData.organization_id)
                    .eq("status", "pending");
                  if (error) return setRequestsCount(0);
                  setRequestsCount(count || 0);
                };
                fetchRequestsCount();
              }}
            />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <RequestPortalMembers
              onMemberProcessed={() => {
                // Refresh count when a member is processed
                const fetchMembersCount = async () => {
                  const { supabase } = await import(
                    "@/integrations/supabase/client"
                  );
                  const { data: userData } = await supabase.auth.getUser();
                  const user = userData?.user;
                  if (!user) return setMembersCount(0);
                  const { data: orgData } = await supabase
                    .from("organization_members")
                    .select("organization_id")
                    .eq("user_id", user.id)
                    .eq("role", "admin")
                    .single();
                  if (!orgData) return setMembersCount(0);
                  const { count, error } = await supabase
                    .from("request_portal_employees")
                    .select("*", { count: "exact", head: true })
                    .eq("organization_id", orgData.organization_id);
                  if (error) return setMembersCount(0);
                  setMembersCount(count || 0);
                };
                fetchMembersCount();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
