import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PricingStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  loading: boolean;
}

const basicFeatures = [
  "25 Documents per Month",
  "Limited Templates Available", 
  "Single Admin Access",
  "Organization Branding",
  "Basic Support"
];

const proFeatures = [
  "Unlimited Document Generation",
  "QR Verification",
  "Request Portal (Up to 100 Members)",
  "Up to 5 Admins",
  "Priority Email Support"
];

const ultraFeatures = [
  "Everything in Pro",
  "Unlimited Admins",
  "Request Portal (Unlimited Members)",
  "Agentic AI Assistant",
  "Custom Document Requests"
];

export function PricingStage({ data, updateData, onPrev, loading }: PricingStageProps) {
  const { toast } = useToast();
  
  const [showFAQ, setShowFAQ] = useState(false);
  
  // Set defaults on mount - keep user's selection if valid
  React.useEffect(() => {
    const validPlans = ['basic', 'pro', 'ultra'];
    if (!validPlans.includes(data.selectedPlan)) {
      updateData({ selectedPlan: 'basic' });
    }
  }, []);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricing = {
    basic: {
      monthly: 0,
      yearly: 0
    },
    pro: {
      monthly: 49,
      yearly: 299
    },
    ultra: {
      monthly: 99,
      yearly: 599
    }
  };

  const isYearly = data.billingPeriod === 'yearly';
  const savingsPercent: Record<string, number> = {
    basic: 57,
    pro: 49,
    ultra: 50,
  };

  const handlePlanSelect = (plan: 'basic' | 'pro' | 'ultra') => {
    updateData({ selectedPlan: plan });
  };

  const handleBillingToggle = (yearly: boolean) => {
    updateData({ billingPeriod: yearly ? 'yearly' : 'monthly' });
  };

  const selectedPrice = pricing[data.selectedPlan][data.billingPeriod];

  const handleCompleteSignup = async () => {
    setLocalLoading(true);
    setError("");

    try {
      if (!data.email.trim()) throw new Error("Email is required");
      if (!data.password) throw new Error("Password is required");
      if (!data.organizationName.trim()) throw new Error("Organization name is required");

      const email = data.email.trim().toLowerCase();
      const metadata = {
        full_name: data.fullName.trim(),
        phone_number: `${data.countryCode}-${data.phoneNumber.trim()}`,
        organization_name: data.organizationName.trim(),
        organization_type: data.organizationType === 'Other' ? data.organizationTypeOther : data.organizationType,
        organization_size: data.organizationSize,
        organization_website: data.organizationWebsite?.trim() || null,
        organization_location: data.organizationLocation?.trim() || null,
        selectedPlan: data.selectedPlan,
      };

      // User already exists from OTP email verification — set password and update metadata
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session?.user) {
        // User authenticated via OTP — update password and metadata
        const { error: updateError } = await supabase.auth.updateUser({
          password: data.password,
          data: metadata,
        });
        if (updateError) throw updateError;

        // Complete onboarding via RPC
        const { data: onboardingResult, error: onboardingError } = await supabase.rpc(
          'complete_user_onboarding',
          {
            p_user_id: sessionData.session.user.id,
            p_organization_name: data.organizationName.trim(),
            p_organization_address: data.organizationLocation?.trim() || null,
            p_organization_type: data.organizationType === 'Other' ? data.organizationTypeOther : data.organizationType,
            p_organization_size: data.organizationSize,
            p_organization_website: data.organizationWebsite?.trim() || null,
            p_organization_location: data.organizationLocation?.trim() || null,
            p_plan: data.selectedPlan,
          }
        );

        if (onboardingError) throw onboardingError;
        const result = onboardingResult as { success: boolean; error?: string };
        if (!result.success) throw new Error(result.error || "Failed to complete onboarding");
      } else {
        // Fallback: no session (shouldn't happen with OTP flow)
        const redirectUrl = `${window.location.origin}/`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: data.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: metadata,
          }
        });
        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error("Failed to create user account");

        const { data: onboardingResult, error: onboardingError } = await supabase.rpc(
          'complete_user_onboarding',
          {
            p_user_id: signUpData.user.id,
            p_organization_name: data.organizationName.trim(),
            p_organization_address: data.organizationLocation?.trim() || null,
            p_organization_type: data.organizationType === 'Other' ? data.organizationTypeOther : data.organizationType,
            p_organization_size: data.organizationSize,
            p_organization_website: data.organizationWebsite?.trim() || null,
            p_organization_location: data.organizationLocation?.trim() || null,
            p_plan: data.selectedPlan,
          }
        );
        if (onboardingError) throw onboardingError;
        const result = onboardingResult as { success: boolean; error?: string };
        if (!result.success) throw new Error(result.error || "Failed to complete onboarding");
      }

      // If Basic plan, create free subscription directly (no payment)
      if (data.selectedPlan === 'basic') {
        const userId = sessionData.session?.user?.id;
        if (!userId) {
          // Need to get the user ID from the signup
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (!newUser) throw new Error("Failed to get user");
        }

        const actualUserId = userId || (await supabase.auth.getUser()).data.user?.id;
        const { data: subData, error: subError } = await supabase.rpc(
          'create_free_subscription',
          { p_user_id: actualUserId!, p_plan: 'basic' }
        );
        
        if (subError) throw subError;

        toast({
          title: "Account Created!",
          description: "Welcome to Certifyr Basic - your free account is ready!",
        });

        // Redirect to dashboard
        window.location.href = '/dashboard';
        return;
      }

      // Mark that account was created - used if user returns from checkout
      sessionStorage.setItem('accountCreatedPendingPayment', 'true');
      sessionStorage.setItem('pendingPlan', data.selectedPlan);

      // For Pro/Ultra, proceed with payment
      toast({
        title: "Account Created!",
        description: "Redirecting to payment...",
      });

      sessionStorage.setItem('selectedPlanIntent', data.selectedPlan);

      const DODO_PRODUCTS: Record<string, Record<string, string>> = {
        basic: { monthly: 'pdt_0NYXDFIglnn4wukqC1Qa2', yearly: 'pdt_0NYXIK26wpbK6kngEpdrT' },
        pro: { monthly: 'pdt_0NYXEA30vMCJgSxp0pcRw', yearly: 'pdt_0NYXIQ6Nqc7tDx0YXn8OY' },
        ultra: { monthly: 'pdt_0NYXI4SnmvbXxxUZAkDH0', yearly: 'pdt_0NYXIWHTsKjeI7gEcRLdR' },
      };

      const productId = DODO_PRODUCTS[data.selectedPlan][data.billingPeriod];
      const response = await supabase.functions.invoke('create-dodo-checkout', {
        body: {
          productId,
          plan: data.selectedPlan,
          billingPeriod: data.billingPeriod,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout`,
        },
      });

      if (response.error) throw new Error(response.error.message || 'Failed to create checkout');

      const { checkout_url } = response.data;
      if (!checkout_url) throw new Error('No checkout URL returned');

      window.location.href = checkout_url;
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto w-full"
    >
      <div className="text-center mb-8 pt-2 mt-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Choose Your Plan to Continue
        </h2>
        <p className="text-gray-600">
          Try Pro or Ultra free for 7 days. Cancel anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <span className={cn("text-sm font-medium", !isYearly ? "text-blue-600" : "text-gray-500")}>
          Billed Monthly
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={handleBillingToggle}
          className="data-[state=checked]:bg-blue-600"
        />
        <div className="flex items-center space-x-2">
          <span className={cn("text-sm font-medium", isYearly ? "text-blue-600" : "text-gray-500")}>
            Billed Yearly
          </span>
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            Save up to 57%
          </Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="flex flex-row justify-center gap-x-4 mb-4 pt-3 mt-x-5">
        {/* Basic Plan */}
        <Card className={cn(
          "relative cursor-pointer transition-all duration-300 hover:shadow-xl pt-3 max-w-xs w-full",
          data.selectedPlan === 'basic' 
            ? "ring-2 ring-blue-600 bg-blue-50/50 backdrop-blur-sm" 
            : "bg-white/70 backdrop-blur-sm hover:bg-white/80"
        )}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">Basic</CardTitle>
            <div className="py-4">
              <div className="text-4xl font-bold text-gray-800">
                {pricing.basic[data.billingPeriod] === 0 ? 'Free' : `$${pricing.basic[data.billingPeriod]}`}
              </div>
              <div className="text-gray-500">
                {isYearly ? "per year" : "per month"}
              </div>
              {isYearly && pricing.basic[data.billingPeriod] > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  Save {savingsPercent.basic}%
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <Button
              onClick={() => handlePlanSelect('basic')}
              variant={data.selectedPlan === 'basic' ? "default" : "outline"}
              className={cn(
                "w-full mb-6 h-12 transition-all duration-200 transition-transform hover:scale-105",
                data.selectedPlan === 'basic'
                  ? "bg-green-600 text-white border border-green-600"
                  : "bg-white text-green-600 border border-green-600 hover:bg-green-600 hover:text-white hover:border-green-600"
              )}
            >
              {data.selectedPlan === 'basic' ? "Selected" : "Get Started Free"}
            </Button>
            
            <ul className="space-y-3">
              {basicFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={cn(
          "relative cursor-pointer transition-all duration-300 hover:shadow-xl pt-3 max-w-xs w-full",
          data.selectedPlan === 'pro' 
            ? "ring-2 ring-[#1b80ff] bg-[#eaf4ff] backdrop-blur-sm" 
            : "bg-white/70 backdrop-blur-sm hover:bg-white/80"
        )}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-[#1b80ff] text-white px-4 py-1">
              <Star className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          
          <CardHeader className="text-center pb-4 pt-8">
            <CardTitle className="text-xl font-semibold">Pro</CardTitle>
            <div className="py-4">
              <div className="text-4xl font-bold text-gray-800">
                ${pricing.pro[data.billingPeriod]}
              </div>
              <div className="text-gray-500">
                {isYearly ? "per year" : "per month"}
              </div>
              {isYearly && (
                <div className="text-sm text-green-600 font-medium">
                  Save {savingsPercent.pro}%
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <Button
              onClick={() => handlePlanSelect('pro')}
              variant={data.selectedPlan === 'pro' ? "default" : "outline"}
              className={cn(
                "w-full mb-6 h-12 transition-all duration-200 transition-transform hover:scale-105",
                data.selectedPlan === 'pro'
                  ? "bg-[#1b80ff] text-white border border-[#1b80ff]"
                  : "bg-white text-[#1b80ff] border border-[#1b80ff] hover:bg-[#1b80ff] hover:text-white hover:border-[#1b80ff]"
              )}
            >
              {data.selectedPlan === 'pro' ? "Selected" : "Start 7-Day Free Trial"}
            </Button>
            
            <ul className="space-y-3">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Ultra Plan */}
        <Card className={cn(
          "relative cursor-pointer transition-all duration-300 hover:shadow-xl pt-3 max-w-xs w-full",
          data.selectedPlan === 'ultra' 
            ? "ring-2 ring-purple-600 bg-purple-50/50 backdrop-blur-sm" 
            : "bg-white/70 backdrop-blur-sm hover:bg-white/80"
        )}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-purple-600 text-white px-4 py-1">
              Enterprise
            </Badge>
          </div>
          
          <CardHeader className="text-center pb-4 pt-8">
            <CardTitle className="text-xl font-semibold">Ultra</CardTitle>
            <div className="py-4">
              <div className="text-4xl font-bold text-gray-800">
                ${pricing.ultra[data.billingPeriod]}
              </div>
              <div className="text-gray-500">
                {isYearly ? "per year" : "per month"}
              </div>
              {isYearly && (
                <div className="text-sm text-green-600 font-medium">
                  Save {savingsPercent.ultra}%
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <Button
              onClick={() => handlePlanSelect('ultra')}
              variant={data.selectedPlan === 'ultra' ? "default" : "outline"}
              className={cn(
                "w-full mb-6 h-12 transition-all duration-200 transition-transform hover:scale-105",
                data.selectedPlan === 'ultra'
                  ? "bg-purple-600 text-white border border-purple-600"
                  : "bg-white text-purple-600 border border-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600"
              )}
            >
              {data.selectedPlan === 'ultra' ? "Selected" : "Start 7-Day Free Trial"}
            </Button>
            
            <ul className="space-y-3">
              {ultraFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="text-center mb-8">
        <Button
          variant="ghost"
          onClick={() => setShowFAQ(!showFAQ)}
          className="text-blue-600 hover:text-blue-700 border-2 border-blue-600 hover:bg-blue-50"
        >
          {showFAQ ? "Hide" : "Show"} Frequently Asked Questions
        </Button>
      </div>

      {showFAQ && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800">Is my data secure?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Yes, we use industry-standard encryption and security measures to protect your data.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Can I cancel anytime?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Yes, you can cancel your subscription at any time. No long-term contracts.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Do you offer refunds?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  We don't offer refunds at the moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="px-8 py-3 border-gray-300 hover:bg-gray-50 transition-transform hover:scale-105"
          disabled={loading || localLoading}
        >
          Back
        </Button>
        
        <Button
          onClick={handleCompleteSignup}
          disabled={loading || localLoading}
          className="px-8 py-3 bg-[#1b80ff] hover:bg-blue-700 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105"
        >
          {(loading || localLoading) ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : data.selectedPlan === 'basic' ? (
            `Get Started Free`
          ) : (
            `Start 7-Day Free Trial – $${selectedPrice}${isYearly ? '/year' : '/month'} after`
          )}
        </Button>
      </div>

      {error && (
        <div className="text-center text-red-500 mt-4">{error}</div>
      )}
    </motion.div>
  );
}