import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";
import {
  CreditCard,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Info,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

const PLAN_PRICING: Record<
  string,
  { monthly: number; yearly: number; label: string; order: number }
> = {
  basic: { monthly: 19, yearly: 99, label: "Basic", order: 1 },
  pro: { monthly: 49, yearly: 299, label: "Pro", order: 2 },
  ultra: { monthly: 99, yearly: 599, label: "Ultra", order: 3 },
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  on_hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

interface SubscriptionManagementPanelProps {
  organizationId: string | null;
}

export const SubscriptionManagementPanel: React.FC<
  SubscriptionManagementPanelProps
> = ({ organizationId }) => {
  const { subscription, loading, refetch } = useSubscription();
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [dodoDetails, setDodoDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchDodoDetails = useCallback(async () => {
    if (!subscription?.polar_subscription_id) return;
    setLoadingDetails(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "manage-subscription",
        {
          body: { action: "get-details" },
        }
      );
      if (error) {
        console.error("Error fetching subscription details:", error);
      } else {
        setDodoDetails(data?.dodo || null);
      }
    } catch (err) {
      console.error("Failed to fetch Dodo details:", err);
    } finally {
      setLoadingDetails(false);
    }
  }, [subscription?.polar_subscription_id]);

  useEffect(() => {
    if (subscription?.polar_subscription_id) {
      fetchDodoDetails();
    }
  }, [fetchDodoDetails]);

  const activePlan = subscription?.active_plan?.toLowerCase() || null;
  const planConfig = activePlan ? PLAN_PRICING[activePlan] : null;
  const status = subscription?.subscription_status || "none";
  const isCanceled = status === "canceled" || !!subscription?.canceled_at;

  // Determine billing period from dates
  const periodStart = subscription?.current_period_start
    ? new Date(subscription.current_period_start)
    : null;
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  const isYearly =
    periodStart && periodEnd
      ? periodEnd.getTime() - periodStart.getTime() > 180 * 24 * 60 * 60 * 1000
      : false;

  const currentPrice = planConfig
    ? isYearly
      ? planConfig.yearly
      : planConfig.monthly
    : 0;

  // Calculate savings for yearly plans
  const calculateSavings = () => {
    if (!planConfig || !isYearly) return null;
    const monthlyTotal = planConfig.monthly * 12;
    const yearlyCost = planConfig.yearly;
    return monthlyTotal - yearlyCost;
  };

  const savings = calculateSavings();

  // Get upgradeable plans (only plans with higher order)
  const upgradeablePlans = Object.entries(PLAN_PRICING)
    .filter(([key, config]) => {
      if (!planConfig) return true; // no plan = show all
      return config.order > planConfig.order;
    })
    .map(([key, config]) => ({ key, ...config }));

  const handleChangePlan = async (
    newPlan: string,
    billingPeriod: "monthly" | "yearly"
  ) => {
    setIsChangingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "manage-subscription",
        {
          body: { action: "change-plan", plan: newPlan, billingPeriod },
        }
      );

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Plan Change Failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Plan Change Initiated",
          description: `Your subscription will be updated to ${PLAN_PRICING[newPlan]?.label || newPlan}. Changes will reflect shortly.`,
        });
        await refetch();
        await fetchDodoDetails();
      }
    } catch (err: any) {
      console.error("Change plan error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to change plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "manage-subscription",
        {
          body: { action: "cancel" },
        }
      );

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Cancellation Failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription Cancellation Scheduled",
          description:
            "Your subscription will remain active until the end of the current billing period.",
        });
        await refetch();
        await fetchDodoDetails();
      }
    } catch (err: any) {
      console.error("Cancel subscription error:", err);
      toast({
        title: "Error",
        description:
          err.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading subscription details...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !activePlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            You don't have an active subscription yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Visit the pricing page to choose a plan and get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <Badge
              className={STATUS_COLORS[status] || STATUS_COLORS.pending}
              variant="secondary"
            >
              {isCanceled
                ? "Cancels at period end"
                : status === "active"
                  ? "Active"
                  : status === "on_hold"
                    ? "On Hold"
                    : status}
            </Badge>
          </div>
          <CardDescription>
            Manage your subscription and billing preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Plan Name */}
            <div className="rounded-lg border p-4 space-y-1">
              <div className="text-sm text-muted-foreground">Plan</div>
              <div className="text-2xl font-bold">
                {planConfig?.label || activePlan}
              </div>
              <div className="text-sm text-muted-foreground">
                {isYearly ? "Yearly billing" : "Monthly billing"}
              </div>
            </div>

            {/* Price */}
            <div className="rounded-lg border p-4 space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Amount
                {savings && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-green-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          You're saving <strong>${savings}/year</strong> with
                          yearly billing! 🎉
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="text-2xl font-bold">
                ${currentPrice}
                <span className="text-sm font-normal text-muted-foreground">
                  /{isYearly ? "year" : "month"}
                </span>
              </div>
              {savings && (
                <div className="text-xs text-green-600 font-medium">
                  Saving ${savings}/year vs monthly
                </div>
              )}
            </div>

            {/* Billing Period */}
            <div className="rounded-lg border p-4 space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Billing Period
              </div>
              <div className="text-sm font-medium">
                {periodStart
                  ? format(periodStart, "MMM d, yyyy")
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {periodEnd
                  ? `Renews: ${format(periodEnd, "MMM d, yyyy")}`
                  : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      {upgradeablePlans.length > 0 && status === "active" && !isCanceled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Upgrade Your Plan
            </CardTitle>
            <CardDescription>
              Unlock more features by upgrading to a higher plan. Changes apply
              based on Dodo Payments' billing policy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upgradeablePlans.map((plan) => (
                <div
                  key={plan.key}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">{plan.label}</h4>
                    <Badge variant="outline">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Upgrade
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      ${plan.monthly}/mo or ${plan.yearly}/year
                    </div>
                    {plan.yearly < plan.monthly * 12 && (
                      <div className="text-xs text-green-600">
                        Save ${plan.monthly * 12 - plan.yearly}/year with yearly
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isChangingPlan}
                      onClick={() => handleChangePlan(plan.key, "monthly")}
                    >
                      {isChangingPlan ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Monthly
                    </Button>
                    <Button
                      size="sm"
                      disabled={isChangingPlan}
                      onClick={() => handleChangePlan(plan.key, "yearly")}
                    >
                      {isChangingPlan ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Yearly
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Section */}
      {status === "active" && !isCanceled && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancel Subscription
            </CardTitle>
            <CardDescription>
              Cancellation takes effect at the end of your current billing
              period. You'll continue to have access until{" "}
              {periodEnd
                ? format(periodEnd, "MMMM d, yyyy")
                : "the end of the period"}
              .
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isCanceling}>
                  {isCanceling ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to cancel?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Your {planConfig?.label} plan will remain active until{" "}
                      <strong>
                        {periodEnd
                          ? format(periodEnd, "MMMM d, yyyy")
                          : "the end of the billing period"}
                      </strong>
                      . After that, you'll lose access to premium features.
                    </p>
                    {savings && (
                      <p className="text-green-600 font-medium">
                        💡 You're currently saving ${savings}/year with your
                        yearly plan. Are you sure you want to give that up?
                      </p>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep My Plan</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}

      {/* Already canceled info */}
      {isCanceled && (
        <Card className="border-yellow-300 dark:border-yellow-700">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium">Subscription cancellation scheduled</p>
              <p className="text-sm text-muted-foreground">
                Your plan remains active until{" "}
                {periodEnd
                  ? format(periodEnd, "MMMM d, yyyy")
                  : "the end of the billing period"}
                . After that date, your access will revert.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
