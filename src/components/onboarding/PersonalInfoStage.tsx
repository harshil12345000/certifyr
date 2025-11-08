import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { countries } from "@/lib/countries";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInfoStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PersonalInfoStage({
  data,
  updateData,
  onNext,
  onPrev,
}: PersonalInfoStageProps) {
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!data.fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!data.email.trim() || !data.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!data.phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    // Send verification email
    try {
      const redirectUrl = `${window.location.origin}/auth/email-verified`;
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: `temp_${Date.now()}_${Math.random()}`, // Temporary password
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            email_verification_only: true,
          },
        },
      });

      if (signUpError) {
        // Check if user already exists
        if (signUpError.message.includes("already registered")) {
          setError("This email is already registered. Please use a different email or sign in.");
          return;
        }
        setError(signUpError.message);
        return;
      }

      setVerificationSent(true);
      setShowVerificationModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to send verification email");
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email_confirmed_at) {
        updateData({ emailVerified: true });
        toast({
          title: "Email Verified!",
          description: "You can now continue with your registration.",
        });
        setShowVerificationModal(false);
        onNext();
      } else {
        toast({
          title: "Not Verified Yet",
          description: "Please check your email and click the verification link.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to check verification status",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/email-verified`;
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: data.email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (resendError) {
        toast({
          title: "Error",
          description: resendError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email Sent!",
          description: "Please check your inbox for the verification link.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to resend verification email",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Personal Information
            </h2>
            <p className="text-gray-600">
              Let's start with some basic information about you
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={data.fullName}
                onChange={(e) => updateData({ fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={data.email}
                onChange={(e) => updateData({ email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode">Country Code</Label>
              <Select
                value={data.countryCode}
                onValueChange={(value) => updateData({ countryCode: value })}
              >
                <SelectTrigger id="countryCode">
                  <SelectValue placeholder="Select country code" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countries.map((country) => (
                    <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
                      {country.flag} {country.name} ({country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="1234567890"
                value={data.phoneNumber}
                onChange={(e) => updateData({ phoneNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onPrev}>
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Next
            </Button>
          </div>
        </form>
      </Card>

      {/* Email Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Verify Your Email
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p>
                We've sent a verification email to <strong>{data.email}</strong>
              </p>
              <p className="text-sm">
                Please check your inbox and click the verification link to continue with your signup.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The verification link will open in a new tab. Once verified, 
                  come back to this page and click "I've Verified My Email" to continue.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleCheckVerification}
              disabled={checking}
              className="w-full"
            >
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  I've Verified My Email
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full"
            >
              {resending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
