import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { UpgradeCTA } from "@/components/onboarding/UpgradeCTA";

import { PersonalInfoStage } from "@/components/onboarding/PersonalInfoStage";
import { OrganizationInfoStage } from "@/components/onboarding/OrganizationInfoStage";
import { PasswordStage } from "@/components/onboarding/PasswordStage";
import { PricingStage } from "@/components/onboarding/PricingStage";

export interface OnboardingData {
  // Personal Info
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  
  // Organization Info
  organizationName: string;
  organizationType: string;
  organizationTypeOther?: string;
  organizationSize: string;
  organizationWebsite?: string;
  organizationLocation: string;
  
  // Password
  password: string;
  confirmPassword: string;
  
  // Plan
  selectedPlan: 'basic' | 'pro' | 'ultra';
  billingPeriod: 'monthly' | 'yearly';
}

const stages = [
  { id: 1, name: "Personal", title: "Personal Information" },
  { id: 2, name: "Organization", title: "Organization Information" },
  { id: 3, name: "Password", title: "Password" },
  { id: 4, name: "Plan", title: "Choose Your Plan" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Parse plan from URL param or sessionStorage
  // Format: basic, pro, ultra
  const getInitialPlanAndBilling = (): { plan: 'basic' | 'pro' | 'ultra'; billing: 'monthly' | 'yearly' } => {
    const urlPlan = searchParams.get('plan');
    const storedPlan = sessionStorage.getItem('selectedPlanIntent');
    const planParam = urlPlan || storedPlan || '';
    
    // Parse the plan parameter (e.g., basic, pro, ultra)
    if (planParam === 'basic' || planParam === 'pro' || planParam === 'ultra') {
      return { plan: planParam, billing: 'monthly' };
    }
    
    return { plan: 'pro', billing: 'monthly' };
  };
  
  const initialPlanData = getInitialPlanAndBilling();
  
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    organizationName: "",
    organizationType: "",
    organizationTypeOther: "",
    organizationSize: "",
    organizationWebsite: "",
    organizationLocation: "",
    password: "",
    confirmPassword: "",
    selectedPlan: initialPlanData.plan,
    billingPeriod: initialPlanData.billing,
  });
  
  // Handle plan upgrade (only allows upgrades, never downgrades)
  const handlePlanUpgrade = (plan: 'pro' | 'ultra') => {
    const planHierarchy = { basic: 1, pro: 2, ultra: 3 };
    // Only allow upgrading, never downgrading
    if (planHierarchy[plan] > planHierarchy[formData.selectedPlan]) {
      setFormData(prev => ({ ...prev, selectedPlan: plan }));
      const billingPrefix = formData.billingPeriod === 'monthly' ? 'm' : 'y';
      sessionStorage.setItem('selectedPlanIntent', `${billingPrefix}${plan}`);
      toast({
        title: "Plan Updated",
        description: `You've selected the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`,
      });
    }
  };

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStage = () => {
    if (currentStage < stages.length) {
      setCurrentStage(prev => prev + 1);
    }
  };

  const prevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(prev => prev - 1);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        organizationTypeOther: formData.organizationTypeOther,
        organizationSize: formData.organizationSize,
        organizationWebsite: formData.organizationWebsite,
        organizationLocation: formData.organizationLocation,
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Clear the email verification flag from localStorage
        localStorage.removeItem('emailVerified');
        
        toast({
          title: "Account Created!",
          description: "Welcome to Certifyr! Continue onboarding to finish setup.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStage = () => {
    switch (currentStage) {
      case 1:
        return (
          <PersonalInfoStage
            data={formData}
            updateData={updateFormData}
            onNext={nextStage}
            onPrev={() => navigate("/auth")}
          />
        );
      case 2:
        return (
          <OrganizationInfoStage
            data={formData}
            updateData={updateFormData}
            onNext={nextStage}
            onPrev={prevStage}
          />
        );
      case 3:
        return (
          <PasswordStage
            data={formData}
            updateData={updateFormData}
            onNext={nextStage}
            onPrev={prevStage}
          />
        );
      case 4:
        return (
          <PricingStage
            data={formData}
            updateData={updateFormData}
            onNext={handleSignUp}
            onPrev={prevStage}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Persistent Upgrade CTA - visible on all onboarding stages */}
      <UpgradeCTA 
        currentPlan={formData.selectedPlan} 
        onUpgrade={handlePlanUpgrade}
      />
      
      <OnboardingProgress stages={stages} currentStage={currentStage} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Add padding-top to account for the upgrade CTA banner */}
        <div className={`container mx-auto px-4 pb-8 ${formData.selectedPlan === 'basic' ? 'pt-52' : 'pt-40'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              {renderStage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
