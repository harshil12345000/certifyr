import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [isStatusLoaded, setIsStatusLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCompletedState, setShowCompletedState] = useState(false);
  const completionTimeoutRef = useRef<number | null>(null);
  const previousHasIncompleteRef = useRef<boolean | null>(null);

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

    setIsStatusLoaded(false);
    try {
      const [{ data: profileData }, { data: orgId }] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("first_name, last_name, email, designation, phone_number")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.rpc("get_user_organization_id", {
          user_id: user.id,
        }),
      ]);

      const isAccountSettingsComplete =
        Boolean(profileData) &&
        hasText(profileData?.first_name) &&
        hasText(profileData?.last_name) &&
        hasText(profileData?.email) &&
        hasText(profileData?.designation) &&
        hasText(profileData?.phone_number);

      let isOrganizationOverviewComplete = false;
      let isBrandingComplete = false;

      if (orgId) {
        const [{ data: orgDetails }, { count: logoCount = 0 }] = await Promise.all([
          supabase
            .from("organizations")
            .select("name, address, phone, email")
            .eq("id", orgId)
            .maybeSingle(),
          supabase
            .from("branding_files")
            .select("*", { head: true, count: "exact" })
            .eq("organization_id", orgId)
            .eq("name", "logo"),
        ]);

        const addressParts = (orgDetails?.address || "")
          .split("||")
          .map((part) => part.trim());

        isOrganizationOverviewComplete =
          hasText(orgDetails?.name) &&
          hasText(orgDetails?.phone) &&
          hasText(orgDetails?.email) &&
          addressParts.length >= 5 &&
          addressParts.slice(0, 5).every(hasText);

        isBrandingComplete = logoCount > 0;
      }

      setStatus({
        isAccountSettingsComplete,
        isOrganizationOverviewComplete,
        isBrandingComplete,
      });
    } catch (error) {
      console.error("Failed to load setup guide status:", error);
      setStatus(null);
    } finally {
      setIsStatusLoaded(true);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setIsDismissed(false);
      setIsCollapsed(false);
      setStatus(null);
      setIsStatusLoaded(false);
      setShowCompletedState(false);
      previousHasIncompleteRef.current = null;
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

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

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
    if (!status) return [];

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
    status,
    goToSettings,
    goToOverview,
    goToBranding,
  ]);

  const completedSteps = steps.filter((step) => step.completed).length;
  const hasIncomplete = steps.some((step) => !step.completed);
  const progress = steps.length === 0 ? 100 : Math.round((completedSteps / steps.length) * 100);

  useEffect(() => {
    if (!isStatusLoaded) return;

    const previousHasIncomplete = previousHasIncompleteRef.current;
    previousHasIncompleteRef.current = hasIncomplete;

    if (previousHasIncomplete === true && !hasIncomplete) {
      setShowCompletedState(true);
      if (completionTimeoutRef.current) {
        window.clearTimeout(completionTimeoutRef.current);
      }
      completionTimeoutRef.current = window.setTimeout(() => {
        setShowCompletedState(false);
      }, 3000);
    }
  }, [hasIncomplete, isStatusLoaded]);

  if (!user?.id || !isStatusLoaded || isDismissed) {
    return null;
  }

  if (showCompletedState) {
    return (
      <div className="fixed bottom-6 left-6 z-50 w-[320px] max-w-[calc(100vw-2rem)]">
        <Card className="shadow-lg border-emerald-200 bg-emerald-50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">Setup complete</p>
                <p className="text-xs text-emerald-700/90">All required steps are done.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasIncomplete) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[320px] max-w-[calc(100vw-2rem)]">
      <Card className="shadow-lg bg-background border-border">
        <CardHeader className={cn(isCollapsed ? "py-2.5 px-3" : "pb-1 pt-3")}>
          <div className="flex items-center justify-between">
            <div className={cn("text-left", isCollapsed ? "flex items-center gap-2" : "")}>
              <CardTitle className="text-lg leading-none">Finish Setup</CardTitle>
              {isCollapsed ? (
                <CardDescription className="m-0 text-sm leading-none">
                  {completedSteps}/{steps.length} completed
                </CardDescription>
              ) : (
                <CardDescription>{completedSteps}/{steps.length} completed</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
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
                    className="h-7 w-7"
                    aria-label="Close setup guide"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove setup guide widget?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you don't want to see this setup guide anymore?
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
          <CardContent className="space-y-1.5 pt-0 pb-3">
            <Progress value={progress} className="h-1.5" />
            <div className="space-y-1">
              {steps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={step.onAction}
                  className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-left hover:bg-accent transition-colors"
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
