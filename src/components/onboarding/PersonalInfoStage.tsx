import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { countries } from "@/lib/countries";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Search, Loader2, ShieldCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface PersonalInfoStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PersonalInfoStage: React.FC<PersonalInfoStageProps> = ({
  data,
  updateData,
  onNext,
  onPrev
}) => {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showExistingEmailDialog, setShowExistingEmailDialog] = useState(false);

  // OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  const handleSendOtp = async () => {
    if (!data.email.trim()) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      setErrors(prev => ({ ...prev, email: "Invalid email format" }));
      return;
    }

    setSendingOtp(true);
    try {
      const email = data.email.trim().toLowerCase();

      // Check if email already exists
      const { data: checkResult } = await supabase.functions.invoke("check-email-exists", {
        body: { email }
      });

      if (checkResult?.exists) {
        setShowExistingEmailDialog(true);
        setSendingOtp(false);
        return;
      }

      // Show the OTP dialog first
      setShowOtpDialog(true);

      // Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the 6-digit verification code.",
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      setShowOtpDialog(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setSendingOtp(true);
    try {
      const email = data.email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });
      if (error) throw error;
      setOtp("");
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    setVerifyingOtp(true);
    try {
      const email = data.email.trim().toLowerCase();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      setEmailVerified(true);
      setShowOtpDialog(false);
      updateData({ email });
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified.",
      });
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Invalid email format";
    else if (!emailVerified) newErrors.email = "Please verify your email first";
    if (!data.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateData({ email: data.email.trim().toLowerCase() });
    onNext();
  };

  // Reset verification if email changes after being verified
  const handleEmailChange = (value: string) => {
    updateData({ email: value });
    setErrors(prev => ({ ...prev, email: "" }));
    if (emailVerified) {
      setEmailVerified(false);
      setOtpSent(false);
      setOtp("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Personal Information</CardTitle>
          <CardDescription>
            Let's start by getting to know you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={data.fullName}
                onChange={e => {
                  updateData({ fullName: e.target.value });
                  setErrors(prev => ({ ...prev, fullName: "" }));
                }}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="countryCode">Country Code</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={countryOpen} className="w-full justify-between">
                      {data.countryCode || "Select..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-background z-50" align="start">
                    <div className="flex flex-col">
                      <div className="p-3 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[200px]">
                        <div className="p-1">
                          {countries
                            .filter(country =>
                              country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                              country.code.toLowerCase().includes(countrySearch.toLowerCase())
                            )
                            .map(country => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  updateData({ countryCode: country.code });
                                  setCountryOpen(false);
                                  setCountrySearch("");
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                                  data.countryCode === country.code ? "bg-accent" : ""
                                }`}
                              >
                                <Check className={`h-4 w-4 ${data.countryCode === country.code ? "opacity-100" : "opacity-0"}`} />
                                <span>{country.code} - {country.name}</span>
                              </button>
                            ))}
                          {countries.filter(country =>
                            country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                            country.code.toLowerCase().includes(countrySearch.toLowerCase())
                          ).length === 0 && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No country found.
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="9876543210"
                  value={data.phoneNumber}
                  onChange={e => {
                    updateData({ phoneNumber: e.target.value });
                    setErrors(prev => ({ ...prev, phoneNumber: "" }));
                  }}
                  className={errors.phoneNumber ? "border-destructive" : ""}
                />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Email with Verify Button */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={data.email}
                  onChange={e => handleEmailChange(e.target.value)}
                  className={`flex-1 ${errors.email ? "border-destructive" : ""}`}
                  disabled={emailVerified}
                />
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || emailVerified || !data.email.trim()}
                  variant={emailVerified ? "default" : "outline"}
                  className={
                    emailVerified
                      ? "bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
                      : "border-[#1b80ff] text-[#1b80ff] hover:bg-[#1b80ff] hover:text-white min-w-[140px]"
                  }
                >
                  {sendingOtp ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Sending...</>
                  ) : emailVerified ? (
                    <><ShieldCheck className="w-4 h-4 mr-1" /> Verified</>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* OTP Input Field - shown after OTP sent and email not yet verified */}
            {otpSent && !emailVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 p-4 rounded-lg border border-blue-200 bg-blue-50/50"
              >
                <Label className="text-sm font-medium">Enter 6-digit OTP sent to your email</Label>
                <div className="flex items-center gap-3">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || verifyingOtp}
                    className="bg-[#1b80ff] hover:bg-blue-700 text-white"
                  >
                    {verifyingOtp ? (
                      <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Verifying...</>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendingOtp}
                  className="text-sm text-[#1b80ff] hover:underline cursor-pointer"
                >
                  {sendingOtp ? "Resending..." : "Didn't receive the code? Resend OTP"}
                </button>
              </motion.div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onPrev}>
                Back
              </Button>
              <Button type="submit" disabled={!emailVerified}>
                Next
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* OTP Notification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Verification Required</DialogTitle>
            <DialogDescription>
              You have to authenticate your email via OTP. A 6-digit verification code has been sent to <strong>{data.email}</strong>. Please check your inbox and enter the code below.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowOtpDialog(false)}>
              OK, I'll enter the code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Existing Email Dialog */}
      <Dialog open={showExistingEmailDialog} onOpenChange={setShowExistingEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Already Exists</DialogTitle>
            <DialogDescription>
              This email address is already registered. Please login instead to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExistingEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowExistingEmailDialog(false);
              onPrev();
            }}>
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
