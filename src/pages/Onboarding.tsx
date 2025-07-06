import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { IntroStage } from "@/components/onboarding/IntroStage";
import { PersonalInfoStage } from "@/components/onboarding/PersonalInfoStage";
import { OrganizationInfoStage } from "@/components/onboarding/OrganizationInfoStage";
import { PasswordStage } from "@/components/onboarding/PasswordStage";
import { PricingStage } from "@/components/onboarding/PricingStage";

export interface OnboardingData {
  // Personal Info
  fullName: string;
  email: string;
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
  selectedPlan: 'basic' | 'pro';
  billingPeriod: 'monthly' | 'yearly';
}

const stages = [
  { id: 1, name: "Intro", title: "Welcome" },
  { id: 2, name: "Personal", title: "Personal Information" },
  { id: 3, name: "Organization", title: "Organization Information" },
  { id: 4, name: "Password", title: "Password" },
  { id: 5, name: "Plan", title: "Choose Your Plan" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    organizationName: "",
    organizationType: "",
    organizationTypeOther: "",
    organizationSize: "",
    organizationWebsite: "",
    organizationLocation: "",
    password: "",
    confirmPassword: "",
    selectedPlan: "basic",
    billingPeriod: "monthly",
  });

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
        toast({
          title: "Account Created!",
          description: "Welcome to Certifyr! Setting up your dashboard...",
        });
        navigate("/dashboard");
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
        return <IntroStage onNext={nextStage} />;
      case 2:
        return (
          <PersonalInfoStage
            data={formData}
            updateData={updateFormData}
            onNext={nextStage}
            onPrev={prevStage}
          />
        );
      case 3:
        return (
          <OrganizationInfoStage
            data={formData}
            updateData={updateFormData}
            onNext={nextStage}
            onPrev={prevStage}
          />
        );
      case 4:
        return (
          <PasswordStage
            data={formData}
            updateData={updateFormData}
            onNext={nextStage}
            onPrev={prevStage}
          />
        );
      case 5:
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
      <OnboardingProgress stages={stages} currentStage={currentStage} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 pt-28 pb-8">
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
