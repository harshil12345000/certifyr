
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Loader2 } from "lucide-react";

interface PersonalInfoStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

type ButtonState = 'verify' | 'emailSent' | 'checkVerification' | 'checking' | 'next';

export function PersonalInfoStage({ data, updateData, onNext, onPrev }: PersonalInfoStageProps) {
  const { signUp, user } = useAuth();
  const [buttonState, setButtonState] = useState<ButtonState>('verify');
  const [error, setError] = useState<string | null>(null);
  const [emailSentCooldown, setEmailSentCooldown] = useState(false);

  // Check if user is already verified on component mount
  useEffect(() => {
    if (user && (user.email_confirmed_at || user.confirmed_at)) {
      setButtonState('next');
    }
  }, [user]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!data.fullName || !data.email || !data.phoneNumber) {
      setError("Please fill in all required fields");
      return;
    }

    if (emailSentCooldown) {
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/email-confirmed`;
      
      const { error } = await signUp(data.email, data.password || Math.random().toString(36).slice(-8), {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        organizationTypeOther: data.organizationTypeOther,
        organizationSize: data.organizationSize,
        organizationWebsite: data.organizationWebsite,
        organizationLocation: data.organizationLocation,
      });
      
      if (error) {
        setError(error.message);
        return;
      }

      // Transition to "Email Sent" state
      setButtonState('emailSent');
      setEmailSentCooldown(true);
      
      // After 3 seconds, transition to "I've Verified My Email" state
      setTimeout(() => {
        setButtonState('checkVerification');
      }, 3000);

      // Reset cooldown after 30 seconds
      setTimeout(() => {
        setEmailSentCooldown(false);
      }, 30000);

    } catch (err: any) {
      setError("Failed to send verification email.");
    }
  };

  const handleResendEmail = async () => {
    if (emailSentCooldown) {
      return;
    }

    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: data.email,
      });
      
      if (error) {
        setError(error.message);
        return;
      }

      // Transition to "Email Sent" state
      setButtonState('emailSent');
      setEmailSentCooldown(true);
      
      // After 3 seconds, transition back to "I've Verified My Email" state
      setTimeout(() => {
        setButtonState('checkVerification');
      }, 3000);

      // Reset cooldown after 30 seconds
      setTimeout(() => {
        setEmailSentCooldown(false);
      }, 30000);

    } catch (err: any) {
      setError("Failed to resend verification email.");
    }
  };

  const handleCheckVerification = async () => {
    setButtonState('checking');
    setError(null);
    
    try {
      // Refresh the session to get the latest user data
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        setError("Could not check verification status. Please try again.");
        setButtonState('checkVerification');
        return;
      }
      
      if (session?.user && (session.user.email_confirmed_at || session.user.confirmed_at)) {
        setButtonState('next');
      } else {
        setError("We couldn't verify your email yet. Please check your inbox and try again.");
        setButtonState('checkVerification');
      }
    } catch (err: any) {
      setError("Could not check verification status.");
      setButtonState('checkVerification');
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const isFormValid = data.fullName && data.email && data.phoneNumber;

  const renderActionButton = () => {
    switch (buttonState) {
      case 'verify':
        return (
          <Button
            type="submit"
            disabled={!isFormValid || emailSentCooldown}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            onClick={handleVerifyEmail}
          >
            {emailSentCooldown ? "Please wait..." : "Verify My Email"}
          </Button>
        );

      case 'emailSent':
        return (
          <Button
            type="button"
            disabled
            className="px-8 py-3 bg-green-600 text-white flex items-center gap-2 cursor-default transition-all duration-200"
          >
            <CheckCircle className="w-5 h-5" />
            Email Sent
          </Button>
        );

      case 'checkVerification':
        return (
          <Button
            type="button"
            onClick={handleCheckVerification}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          >
            I've Verified My Email
          </Button>
        );

      case 'checking':
        return (
          <Button
            type="button"
            disabled
            className="px-8 py-3 bg-blue-600 text-white flex items-center gap-2 cursor-default"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            Checking...
          </Button>
        );

      case 'next':
        return (
          <Button
            type="submit"
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          >
            Next
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto w-full pt-3"
    >
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-2xl pt-3 mt-10">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Personal Information
          </CardTitle>
          <p className="text-gray-600">Tell us a bit about yourself</p>
        </CardHeader>
        
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={data.fullName}
                onChange={(e) => updateData({ fullName: e.target.value })}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={data.email}
                onChange={(e) => updateData({ email: e.target.value })}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                Phone Number *
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={data.phoneNumber}
                onChange={(e) => updateData({ phoneNumber: e.target.value })}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200"
              >
                {error}
              </motion.div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onPrev}
                className="px-8 py-3 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Back
              </Button>
              
              {renderActionButton()}
            </div>
            
            {(buttonState === 'checkVerification' || buttonState === 'checking') && (
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={emailSentCooldown}
                  className="px-6 py-2 text-sm border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  {emailSentCooldown ? "Please wait..." : "Resend Verification Email"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
