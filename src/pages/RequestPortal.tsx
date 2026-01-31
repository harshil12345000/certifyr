import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { RequestPortalSettings } from "@/components/request-portal/RequestPortalSettings";
import { RequestPortalRequests } from "@/components/request-portal/RequestPortalRequests";
import { RequestPortalMembers } from "@/components/request-portal/RequestPortalMembers";
import { RequestPortalSkeleton } from "@/components/request-portal/RequestPortalSkeleton";
import { FeatureGate } from "@/components/auth/FeatureGate";
import { UpgradePrompt } from "@/components/shared/UpgradePrompt";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { Users } from "lucide-react";

export default function RequestPortal() {
  const [activeTab, setActiveTab] = useState("settings");
  const [requestsCount, setRequestsCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { orgId, loading: orgLoading } = useOrganizationId();
  const { limits, activePlan } = usePlanFeatures();

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

  // Get member limit display
  const getMemberLimitDisplay = () => {
    if (limits.maxPortalMembers === null) {
      return `${membersCount} / ∞`;
    }
    return `${membersCount} / ${limits.maxPortalMembers}`;
  };

  return (
    <DashboardLayout>
      <FeatureGate 
        feature="requestPortal" 
        fallback={
          <UpgradePrompt 
            feature="requestPortal" 
            requiredPlan="pro" 
            description="Upgrade to Pro to access the Request Portal and manage employee document requests."
          />
        }
      >
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Request Portal</h1>
              <p className="text-muted-foreground">
                Manage employee document requests and portal access
              </p>
            </div>
            
            {/* Member Counter Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Portal Members: <span className="text-primary">{getMemberLimitDisplay()}</span>
              </span>
              {activePlan && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {activePlan.charAt(0).toUpperCase() + activePlan.slice(1)}
                </Badge>
              )}
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
                maxMembers={limits.maxPortalMembers}
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
      </FeatureGate>
    </DashboardLayout>
  );
}
