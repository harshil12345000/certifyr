import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  basic: { monthly: 0, yearly: 0, label: "Basic", order: 1 },
  pro: { monthly: 49, yearly: 299, label: "Pro", order: 2 },
  ultra: { monthly: 99, yearly: 599, label: "Ultra", order: 3 },
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  trialing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
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
  const navigate = useNavigate();
  const { subscription, loading, refetch } = useSubscription();
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [dodoDetails, setDodoDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [documentUsage, setDocumentUsage] = useState<{ used: number; limit: number } | null>(null);

  // Fetch document usage for Basic users
  useEffect(() => {
    const fetchDocumentUsage = async () => {
      if (!subscription?.user_id) return;
      try {
        const { data, error } = await supabase.rpc('check_document_limit', { p_user_id: subscription.user_id });
        if (!error && data) {
          const d = data as any;
          setDocumentUsage({ used: d.used || 0, limit: d.limit || 25 });
        }
      } catch (err) {
        console.error('Error fetching document usage:', err);
      }
    };
    fetchDocumentUsage();
  }, [subscription?.user_id]);

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
  const isBasicFree = activePlan === 'basic' && status === 'active';

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

  // Get all other plans (for paid plans: allow both upgrades and downgrades; for Basic: only show upgrades)
  const availablePlans = Object.entries(PLAN_PRICING)
    .filter(([key]) => key !== activePlan && key !== 'basic') // Can't downgrade to Basic, can't upgrade to same plan
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
      const { data, error } = await supabase.rpc(
        'create_free_subscription',
        { p_user_id: subscription?.user_id, p_plan: 'basic' }
      );

      if (error) throw error;

      toast({
        title: "Downgraded to Basic",
        description: "You've been switched to the free Basic plan. You can upgrade anytime!",
      });
      await refetch();
    } catch (err: any) {
      console.error("Downgrade error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to downgrade. Please try again.",
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
                  : status === "trialing"
                    ? "Trial"
                    : status === "on_hold"
                      ? "On Hold"
                      : status}
            </Badge>
          </div>
          <CardDescription>
            Manage your subscription and billing preferences.
          </CardDescription>
          {(() => {
            if (!planConfig || !periodStart || activePlan === 'basic') return null;
            const trialEndDate = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (new Date() >= trialEndDate) return null;
            return (
              <p className="text-sm text-primary mt-2">
                You're on the {planConfig.label} 7-day free trial. Automatic billing of ${isYearly ? planConfig.yearly : planConfig.monthly}/{isYearly ? 'year' : 'month'} starts on {format(trialEndDate, 'MMMM d, yyyy')}.
              </p>
            );
          })()}
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
                {savings && !isBasicFree && (
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
                {isBasicFree ? 'Free' : `$${currentPrice}`}
                {!isBasicFree && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{isYearly ? "year" : "month"}
                  </span>
                )}
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
                {isBasicFree ? "Plan Status" : "Billing Period"}
              </div>
              {isBasicFree ? (
                <div className="text-sm font-medium text-green-600">
                  Free Plan
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Document Usage for Basic Users */}
          {isBasicFree && documentUsage && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-blue-800">Documents This Month</div>
                <Badge variant="outline" className="bg-white">
                  {documentUsage.used} / {documentUsage.limit}
                </Badge>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min((documentUsage.used / documentUsage.limit) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {documentUsage.limit - documentUsage.used} documents remaining this month
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Plan Section */}
      {availablePlans.length > 0 && (status === "active" || status === "trialing") && !isCanceled && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {isBasicFree ? 'Upgrade Your Plan' : 'Change Plan'}
            </CardTitle>
            <CardDescription>
              {isBasicFree 
                ? 'Unlock more features and remove document limits with Pro or Ultra.'
                : 'Switch to a different plan. Changes apply at the next billing cycle.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlans.map((plan) => {
                const isUpgrade = planConfig ? plan.order > planConfig.order : false;
                const isPro = plan.key === 'pro';
                return (
                  <div
                    key={plan.key}
                    className="rounded-lg border bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{plan.label}</h4>
                      <Badge className={isUpgrade ? "bg-[#1b80ff] text-white" : "bg-gray-500 text-white"}>
                        <ArrowUpRight className="h-3 w-3 mr-1" />{isUpgrade ? 'Upgrade' : 'Downgrade'}
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
                        className={isPro ? "bg-[#1b80ff] hover:bg-[#1566d4]" : "bg-purple-600 hover:bg-purple-700"}
                        onClick={() => navigate(`/checkout?plan=${plan.key}`)}
                      >
                        Monthly
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={isPro ? "border-[#1b80ff] text-[#1b80ff] hover:bg-[#1b80ff] hover:text-white" : "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"}
                        onClick={() => navigate(`/checkout?plan=${plan.key}&yearly=true`)}
                      >
                        Yearly
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Section - Downgrade to Free Basic for paid plans */}
      {(status === "active" || status === "trialing") && !isCanceled && !isBasicFree && (
        <Card className="border-yellow-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Downgrade to Free
            </CardTitle>
            <CardDescription>
              Downgrade to our free Basic plan. You'll keep access until{" "}
              {periodEnd
                ? format(periodEnd, "MMMM d, yyyy")
                : "the end of your billing period"}
              , then switch to the free plan with limited features.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-50" disabled={isCanceling}>
                  {isCanceling ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Downgrade to Free
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Downgrade to Basic (Free)?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Your {planConfig?.label} plan will remain active until{" "}
                      <strong>
                        {periodEnd
                          ? format(periodEnd, "MMMM d, yyyy")
                          : "the end of the billing period"}
                      </strong>
                      . After that, you'll be switched to the free Basic plan with:
                    </p>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      <li>25 documents per month limit</li>
                      <li>No QR Verification</li>
                      <li>No Request Portal</li>
                      <li>No Priority Support</li>
                    </ul>
                    {savings && (
                      <p className="text-yellow-600 font-medium">
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
                    className="bg-yellow-600 text-white hover:bg-yellow-700"
                  >
                    Yes, Downgrade to Free
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
