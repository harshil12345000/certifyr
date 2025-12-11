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
import { Check, Loader2, Search, Eye, EyeOff, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showExistingEmailDialog, setShowExistingEmailDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const passwordStrength = {
    minLength: data.password.length >= 8,
    hasNumber: /\d/.test(data.password),
    hasLetter: /[a-zA-Z]/.test(data.password),
  };
  const passwordsMatch = data.password === data.confirmPassword && data.password.length > 0;
  const isPasswordValid = passwordStrength.minLength && passwordStrength.hasNumber && passwordStrength.hasLetter && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    // Validate all fields
    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Invalid email format";
    if (!data.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!data.password) newErrors.password = "Password is required";
    if (!isPasswordValid) newErrors.password = "Please meet all password requirements";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Check if email already exists
      const { data: checkResult, error: checkError } = await supabase.functions.invoke("check-email-exists", {
        body: { email: data.email.trim().toLowerCase() }
      });

      if (checkError) {
        console.error("Error checking email:", checkError);
        throw checkError;
      }

      if (checkResult?.exists) {
        setShowExistingEmailDialog(true);
        setLoading(false);
        return;
      }

      // Create the user account with email and password
      const redirectUrl = `${window.location.origin}/`;
      const { data: signUpResult, error: signUpError } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.fullName.trim(),
            phone_number: `${data.countryCode}-${data.phoneNumber.trim()}`
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Check if email confirmation is required
      if (signUpResult.user && !signUpResult.session) {
        // Email confirmation is enabled - user needs to verify
        toast({
          title: "Check Your Email",
          description: "Please verify your email to continue. Check your inbox for the confirmation link.",
        });
        updateData({ emailVerified: false });
      } else if (signUpResult.session) {
        // Email confirmation disabled - user is logged in immediately
        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
        });
        updateData({ emailVerified: true });
        onNext();
      }
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
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
          <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
          <CardDescription>
            Enter your details to get started with Certifyr
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
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

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={data.email}
                onChange={e => {
                  updateData({ email: e.target.value });
                  setErrors(prev => ({ ...prev, email: "" }));
                }}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Phone Number */}
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
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${data.countryCode === country.code ? "bg-accent" : ""}`}
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={data.password}
                  onChange={e => {
                    updateData({ password: e.target.value });
                    setErrors(prev => ({ ...prev, password: "" }));
                  }}
                  className={cn("pr-10", errors.password ? "border-destructive" : "")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password strength indicators */}
              {data.password.length > 0 && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    {passwordStrength.minLength ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={passwordStrength.minLength ? "text-green-600" : "text-muted-foreground"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordStrength.hasLetter ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={passwordStrength.hasLetter ? "text-green-600" : "text-muted-foreground"}>
                      Contains a letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordStrength.hasNumber ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={passwordStrength.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                      Contains a number
                    </span>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={data.confirmPassword}
                  onChange={e => {
                    updateData({ confirmPassword: e.target.value });
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {data.confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  {passwordsMatch ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onPrev}>
                Back
              </Button>
              <Button type="submit" disabled={loading || !isPasswordValid}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account & Continue"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
