import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  X,
} from "lucide-react";

interface SetupStatus {
  isAccountSettingsComplete: boolean;
  isOrganizationOverviewComplete: boolean;
  isBrandingComplete: boolean;
}

interface SetupStep {
  id: "account-settings" | "organization-overview" | "branding-logo";
  label: string;
  completed: boolean;
  onAction: () => void;
}

const hasText = (value?: string | null) => Boolean(value?.trim());

export function SetupGuideWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<SetupStatus>({
    isAccountSettingsComplete: false,
    isOrganizationOverviewComplete: false,
    isBrandingComplete: false,
  });
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dismissKey = user?.id ? `setup-guide-dismissed:${user.id}` : null;
  const collapseKey = user?.id ? `setup-guide-collapsed:${user.id}` : null;

  const setCollapsedWithPersist = useCallback((value: boolean) => {
    if (collapseKey) {
      localStorage.setItem(collapseKey, value ? "1" : "0");
    }
    setIsCollapsed(value);
  }, [collapseKey]);

  const fetchSetupStatus = useCallback(async () => {
    if (!user?.id) return;

    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("first_name, last_name, email, designation, phone_number")
      .eq("user_id", user.id)
      .maybeSingle();

    const isAccountSettingsComplete =
      Boolean(profileData) &&
      hasText(profileData?.first_name) &&
      hasText(profileData?.last_name) &&
      hasText(profileData?.email) &&
      hasText(profileData?.designation) &&
      hasText(profileData?.phone_number);

    const { data: orgId } = await supabase.rpc("get_user_organization_id", {
      user_id: user.id,
    });

    let isOrganizationOverviewComplete = false;
    let isBrandingComplete = false;

    if (orgId) {
      const { data: orgDetails } = await supabase
        .from("organizations")
        .select("name, address, phone, email")
        .eq("id", orgId)
        .maybeSingle();

      const addressParts = (orgDetails?.address || "")
        .split("||")
        .map((part) => part.trim());

      isOrganizationOverviewComplete =
        hasText(orgDetails?.name) &&
        hasText(orgDetails?.phone) &&
        hasText(orgDetails?.email) &&
        addressParts.length >= 5 &&
        addressParts.slice(0, 5).every(hasText);

      const { count: logoCount = 0 } = await supabase
        .from("branding_files")
        .select("*", { head: true, count: "exact" })
        .eq("organization_id", orgId)
        .eq("name", "logo");

      isBrandingComplete = logoCount > 0;
    }

    setStatus({
      isAccountSettingsComplete,
      isOrganizationOverviewComplete,
      isBrandingComplete,
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setIsDismissed(false);
      setIsCollapsed(false);
      return;
    }
    setIsDismissed(dismissKey ? localStorage.getItem(dismissKey) === "1" : false);
    setIsCollapsed(collapseKey ? localStorage.getItem(collapseKey) === "1" : false);
    fetchSetupStatus();
  }, [collapseKey, dismissKey, fetchSetupStatus, user?.id]);

  useEffect(() => {
    const onRefresh = () => {
      fetchSetupStatus();
    };
    window.addEventListener("setup-guide-refresh", onRefresh);
    return () => window.removeEventListener("setup-guide-refresh", onRefresh);
  }, [fetchSetupStatus]);

  const handleDismiss = () => {
    if (!dismissKey) return;
    localStorage.setItem(dismissKey, "1");
    setIsDismissed(true);
  };

  const goToSettings = () => {
    setCollapsedWithPersist(true);
    navigate("/settings");
  };

  const goToOverview = () => {
    setCollapsedWithPersist(true);
    navigate("/admin?tab=organization");
  };

  const goToBranding = () => {
    setCollapsedWithPersist(true);
    navigate("/admin?tab=branding");
  };

  const steps = useMemo<SetupStep[]>(() => {
    const items: SetupStep[] = [
      {
        id: "account-settings",
        label: "Fill out Account Settings",
        completed: status.isAccountSettingsComplete,
        onAction: goToSettings,
      },
    ];

    if (!status.isOrganizationOverviewComplete) {
      items.push({
        id: "organization-overview",
        label: "Fill out Organization Overview",
        completed: false,
        onAction: goToOverview,
      });
    }

    if (!status.isBrandingComplete) {
      items.push({
        id: "branding-logo",
        label: "Upload Organization Logo",
        completed: false,
        onAction: goToBranding,
      });
    }

    return items;
  }, [
    status.isAccountSettingsComplete,
    status.isOrganizationOverviewComplete,
    status.isBrandingComplete,
  ]);

  const completedSteps = steps.filter((step) => step.completed).length;
  const hasIncomplete = steps.some((step) => !step.completed);
  const progress = steps.length === 0 ? 100 : Math.round((completedSteps / steps.length) * 100);

  if (!user?.id || isDismissed || !hasIncomplete) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
      <Card className="shadow-lg bg-background border-border">
        <CardHeader className={cn(isCollapsed ? "py-3" : "pb-2")}>
          <div className={cn("flex items-center justify-between", isCollapsed && "relative min-h-14")}>
            <div className={cn(isCollapsed && "w-full text-center")}>
              <CardTitle className="text-lg">Finish Setup</CardTitle>
              <CardDescription>{completedSteps}/{steps.length} completed</CardDescription>
            </div>
            <div className={cn("flex items-center gap-1", isCollapsed && "absolute right-0 top-1/2 -translate-y-1/2")}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={isCollapsed ? "Expand setup guide" : "Collapse setup guide"}
                onClick={() => setCollapsedWithPersist(!isCollapsed)}
              >
                {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Close setup guide"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove setup guide widget?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this setup guide widget?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDismiss}>Yes</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="space-y-2 pt-0">
            <Progress value={progress} className="h-1.5" />
            <div className="space-y-1.5">
              {steps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={step.onAction}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="text-sm font-medium">{step.label}</p>
                    </div>
                    {!step.completed && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
