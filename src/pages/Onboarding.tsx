import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { supabase } from "@/integrations/supabase/client";

import { PersonalInfoStage } from "@/components/onboarding/PersonalInfoStage";
import { OrganizationInfoStage } from "@/components/onboarding/OrganizationInfoStage";
import { PricingStage } from "@/components/onboarding/PricingStage";

export interface OnboardingData {
  // Personal Info + Password (combined in stage 1)
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  emailVerified: boolean;
  
  // Organization Info
  organizationName: string;
  organizationType: string;
  organizationTypeOther?: string;
  organizationSize: string;
  organizationWebsite?: string;
  organizationLocation: string;
  
  // Plan
  selectedPlan: 'basic' | 'pro';
  billingPeriod: 'monthly' | 'yearly';
}

const stages = [
  { id: 1, name: "Account", title: "Create Your Account" },
  { id: 2, name: "Organization", title: "Organization Information" },
  { id: 3, name: "Plan", title: "Choose Your Plan" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    emailVerified: false,
    organizationName: "",
    organizationType: "",
    organizationTypeOther: "",
    organizationSize: "",
    organizationWebsite: "",
    organizationLocation: "",
    selectedPlan: "pro",
    billingPeriod: "yearly",
  });

  // If user is already authenticated and has completed stage 1, move to stage 2
  useEffect(() => {
    if (user && currentStage === 1) {
      // User is logged in, they've completed account creation
      setFormData(prev => ({ ...prev, emailVerified: true }));
      setCurrentStage(2);
    }
  }, [user, currentStage]);

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

  const handleOrganizationSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update user_profiles with organization info
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          organization_name: formData.organizationName.trim(),
          organization_type: formData.organizationType === "Other" 
            ? formData.organizationTypeOther?.trim() 
            : formData.organizationType,
          organization_size: formData.organizationSize,
          organization_website: formData.organizationWebsite?.trim() || null,
          organization_location: formData.organizationLocation.trim(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      nextStage();
    } catch (error: any) {
      console.error("Error updating organization:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save organization info.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update plan in user_profiles
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ plan: formData.selectedPlan })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Welcome to Certifyr!",
        description: "Your account setup is complete.",
      });

      // Redirect to dashboard
      navigate("/");
    } catch (error: any) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save plan selection.",
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
            onNext={handleOrganizationSubmit}
            onPrev={prevStage}
            loading={loading}
          />
        );
      case 3:
        return (
          <PricingStage
            data={formData}
            updateData={updateFormData}
            onNext={handlePlanSubmit}
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
      <OnboardingProgress stages={stages} currentStage={currentStage} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 pt-40 pb-8">
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
