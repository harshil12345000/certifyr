import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { cn } from "@/lib/utils";

interface PricingStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  loading: boolean;
}

const basicFeatures = [
  "Unlimited Document Generations",
  "All Templates Available", 
  "Single Admin Access",
  "Organization Branding",
  "Basic Support"
];

const proFeatures = [
  "Everything in Basic",
  "QR Verification",
  "Request Portal",
  "Invite Up to 5 Admins (Coming Soon)",
  "Priority Email Support"
];

export function PricingStage({ data, updateData, onNext, onPrev, loading }: PricingStageProps) {
  const [showFAQ, setShowFAQ] = useState(false);

  const pricing = {
    basic: {
      monthly: 10,
      yearly: 100
    },
    pro: {
      monthly: 20,
      yearly: 200
    }
  };

  const isYearly = data.billingPeriod === 'yearly';
  const yearlyDiscount = 37.5;

  const handlePlanSelect = (plan: 'basic' | 'pro') => {
    updateData({ selectedPlan: plan });
  };

  const handleBillingToggle = (yearly: boolean) => {
    updateData({ billingPeriod: yearly ? 'yearly' : 'monthly' });
  };

  const selectedPrice = pricing[data.selectedPlan][data.billingPeriod];

  const handlePayment = () => {
    // This will trigger the signup process
    // In a real implementation, you would integrate with Razorpay here
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto w-full"
    >
      <div className="text-center mb-8 pt-3">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Choose Your Plan to Continue
        </h2>
        <p className="text-gray-600">
          Select the plan that best fits your organization's needs
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
            Save {yearlyDiscount}%
          </Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="flex flex-row justify-center gap-x-4 mb-4 pt-3">
        {/* Basic Plan */}
        <Card className={cn(
          "relative cursor-pointer transition-all duration-300 hover:shadow-xl pt-3 max-w-sm w-full",
          data.selectedPlan === 'basic' 
            ? "ring-2 ring-blue-600 bg-blue-50/50 backdrop-blur-sm" 
            : "bg-white/70 backdrop-blur-sm hover:bg-white/80"
        )}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">Basic</CardTitle>
            <div className="py-4">
              <div className="text-4xl font-bold text-gray-800">
                ${pricing.basic[data.billingPeriod]}
              </div>
              <div className="text-gray-500">
                {isYearly ? "per year" : "per month"}
              </div>
              {isYearly && (
                <div className="text-sm text-green-600 font-medium">
                  Save ${(pricing.basic.monthly * 12) - pricing.basic.yearly} yearly
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <Button
              onClick={() => handlePlanSelect('basic')}
              variant={data.selectedPlan === 'basic' ? "default" : "outline"}
              className={cn(
                "w-full mb-6 h-12 transition-all duration-200",
                data.selectedPlan === 'basic'
                  ? "bg-[#1b80ff] text-white border border-[#1b80ff]"
                  : "bg-white text-[#1b80ff] border border-[#1b80ff] hover:bg-[#1b80ff] hover:text-white hover:border-[#1b80ff]"
              )}
            >
              {data.selectedPlan === 'basic' ? "Selected" : "Select Basic"}
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
          "relative cursor-pointer transition-all duration-300 hover:shadow-xl pt-3 max-w-sm w-full",
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
                  Save ${(pricing.pro.monthly * 12) - pricing.pro.yearly} yearly
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <Button
              onClick={() => handlePlanSelect('pro')}
              variant={data.selectedPlan === 'pro' ? "default" : "outline"}
              className={cn(
                "w-full mb-6 h-12 transition-all duration-200",
                data.selectedPlan === 'pro'
                  ? "bg-[#1b80ff] text-white border border-[#1b80ff]"
                  : "bg-white text-[#1b80ff] border border-[#1b80ff] hover:bg-[#1b80ff] hover:text-white hover:border-[#1b80ff]"
              )}
            >
              {data.selectedPlan === 'pro' ? "Selected" : "Select Pro"}
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
      </div>

      {/* FAQ Section */}
      <div className="text-center mb-8">
        <Button
          variant="ghost"
          onClick={() => setShowFAQ(!showFAQ)}
          className="text-blue-600 hover:text-blue-700"
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
          className="px-8 py-3 border-gray-300 hover:bg-gray-50"
          disabled={loading}
        >
          Back
        </Button>
        
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="px-8 py-3 bg-[#1b80ff] hover:bg-blue-700 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            `Subscribe & Continue - $${selectedPrice}${isYearly ? '/year' : '/month'}`
          )}
        </Button>
      </div>
    </motion.div>
  );
}
