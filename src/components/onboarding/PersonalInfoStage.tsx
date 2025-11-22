import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingData } from "@/pages/Onboarding";
import { countries } from "@/lib/countries";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, Loader2, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  onPrev,
}) => {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const handleSendCode = async () => {
    // Validate email first
    const email = data.email.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }

    setSendingCode(true);
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        setErrors(prev => ({ ...prev, email: "This email is already registered" }));
        setSendingCode(false);
        return;
      }

      // Send OTP using Supabase's built-in email OTP
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create user yet
        }
      });

      if (error) throw error;

      setCodeSent(true);
      setErrors(prev => ({ ...prev, email: "" }));
      toast({
        title: "Code Sent",
        description: "Please check your email for the 6-digit verification code.",
      });
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setVerifyingCode(true);
    try {
      // Verify OTP using Supabase
      const { error } = await supabase.auth.verifyOtp({
        email: data.email.trim(),
        token: verificationCode,
        type: 'email'
      });

      if (error) throw error;

      // Sign out immediately after verification (we don't want them logged in yet)
      await supabase.auth.signOut();

      updateData({ emailVerified: true });
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified!",
      });
    } catch (error: any) {
      console.error("Error verifying code:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Invalid email format";
    if (!data.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!data.emailVerified) newErrors.email = "Please verify your email first";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Final check if email exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email.trim())
        .maybeSingle();

      if (existingUser) {
        setErrors({ email: "This email is already registered" });
        return;
      }

      onNext();
    } catch (error) {
      console.error("Error checking email:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
                onChange={(e) => {
                  updateData({ fullName: e.target.value });
                  setErrors(prev => ({ ...prev, fullName: "" }));
                }}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={data.email}
                    onChange={(e) => {
                      updateData({ email: e.target.value, emailVerified: false });
                      setErrors(prev => ({ ...prev, email: "" }));
                      setCodeSent(false);
                      setVerificationCode("");
                    }}
                    disabled={data.emailVerified}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {!data.emailVerified && (
                    <Button
                      type="button"
                      onClick={handleSendCode}
                      disabled={sendingCode || !data.email.trim()}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      {sendingCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : codeSent ? (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Code
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Code
                        </>
                      )}
                    </Button>
                  )}
                  {data.emailVerified && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Verified</span>
                    </div>
                  )}
                </div>

                {codeSent && !data.emailVerified && (
                  <div className="flex gap-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-blue-700 font-medium">
                        Enter the 6-digit code sent to your email
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="000000"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="max-w-[150px] text-center text-lg tracking-widest"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={verifyingCode || verificationCode.length !== 6}
                        >
                          {verifyingCode ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="countryCode">Country Code</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between"
                    >
                      {data.countryCode || "Select..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-background z-50" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search country..." 
                        value={countrySearch}
                        onValueChange={setCountrySearch}
                      />
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-auto">
                        {countries
                          .filter(country => 
                            country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                            country.code.toLowerCase().includes(countrySearch.toLowerCase())
                          )
                          .map((country) => (
                            <CommandItem
                              key={country.code}
                              value={country.code}
                              onSelect={() => {
                                updateData({ countryCode: country.code });
                                setCountryOpen(false);
                                setCountrySearch("");
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  data.countryCode === country.code ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {country.code} - {country.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
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
                  onChange={(e) => {
                    updateData({ phoneNumber: e.target.value });
                    setErrors(prev => ({ ...prev, phoneNumber: "" }));
                  }}
                  className={errors.phoneNumber ? "border-destructive" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onPrev}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !data.emailVerified}
              >
                {loading ? "Processing..." : "Next"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
