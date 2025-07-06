import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle } from "lucide-react";

interface PersonalInfoStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PersonalInfoStage({ data, updateData, onNext, onPrev }: PersonalInfoStageProps) {
  const { signUp, signIn, user } = useAuth(); // Use user from context
  const [verifying, setVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailSentState, setEmailSentState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already verified on component mount
  useEffect(() => {
    if (user && (user.email_confirmed_at || user.confirmed_at)) {
      setEmailVerified(true);
    }
  }, [user]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!data.fullName || !data.email || !data.phoneNumber) {
      setError("Please fill in all required fields");
      return;
    }

    setVerifying(true);
    setVerificationSent(true);
    setEmailSentState(true);
    
    // Reset email sent state after 3 seconds
    setTimeout(() => setEmailSentState(false), 3000);

    try {
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
        setVerificationSent(false);
      }
    } catch (err: any) {
      setError("Failed to send confirmation email.");
      setVerificationSent(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    setError(null);
    setVerifying(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: data.email,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setEmailSentState(true);
        setTimeout(() => setEmailSentState(false), 3000);
      }
    } catch (err: any) {
      setError("Failed to resend confirmation email.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckVerified = async () => {
    setVerifying(true);
    setError(null);
    
    try {
      // Use the more efficient session refresh method
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        setError("Could not check verification status. Please try again.");
        return;
      }
      
      if (session?.user && (session.user.email_confirmed_at || session.user.confirmed_at)) {
        setEmailVerified(true);
        onNext();
      } else {
        setError("Email not verified yet. Please check your inbox and click the confirmation link.");
      }
    } catch (err: any) {
      setError("Could not check verification status.");
    } finally {
      setVerifying(false);
    }
  };

  const isValid = data.fullName && data.email && data.phoneNumber;

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
          <form onSubmit={emailVerified ? (e) => { e.preventDefault(); onNext(); } : handleVerifyEmail} className="space-y-6">
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
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onPrev}
                className="px-8 py-3 border-gray-300 hover:bg-gray-50 transition-transform hover:scale-105"
              >
                Back
              </Button>
              
              {emailVerified ? (
                <Button
                  type="submit"
                  disabled={!isValid}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
                >
                  Next
                </Button>
              ) : emailSentState ? (
                <Button
                  type="button"
                  disabled
                  className="px-8 py-3 bg-green-600 text-white flex items-center gap-2 cursor-default"
                >
                  <CheckCircle className="w-5 h-5" /> Email Sent
                </Button>
              ) : verificationSent ? (
                <Button
                  type="button"
                  onClick={handleCheckVerified}
                  disabled={verifying}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
                >
                  {verifying ? "Checking..." : "I've Verified My Email"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isValid || verifying}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
                >
                  {verifying ? "Sending..." : "Verify Email"}
                </Button>
              )}
            </div>
            
            {!emailVerified && verificationSent && (
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResendEmail}
                  disabled={verifying || emailSentState}
                  className="px-6 py-2 text-base font-medium border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 transition-all"
                >
                  {verifying ? "Sending..." : "Resend Confirmation Email"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}