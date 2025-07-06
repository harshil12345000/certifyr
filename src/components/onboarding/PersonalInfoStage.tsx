import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInfoStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PersonalInfoStage({ data, updateData, onNext, onPrev }: PersonalInfoStageProps) {
  const [verifying, setVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!data.fullName || !data.email || !data.phoneNumber) return;
    setVerifying(true);
    try {
      // Send a sign up request to Supabase to trigger email verification (do not create user yet)
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: { shouldCreateUser: true }
      });
      if (error) {
        setError(error.message);
      } else {
        setVerificationSent(true);
      }
    } catch (err: any) {
      setError("Failed to send verification email.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckVerified = async () => {
    setVerifying(true);
    setError(null);
    try {
      // Check if the user is confirmed in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email_confirmed_at) {
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

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

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
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
