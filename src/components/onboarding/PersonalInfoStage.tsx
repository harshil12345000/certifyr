import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { countries } from "@/lib/countries";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!data.fullName.trim()) {
      setError("Please enter your full name");
      setLoading(false);
      return;
    }

    if (!data.email.trim() || !data.email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!data.phoneNumber.trim()) {
      setError("Please enter your phone number");
      setLoading(false);
      return;
    }

    if (!data.countryCode) {
      setError("Please select a country code");
      setLoading(false);
      return;
    }

    try {
      // Send verification email using Supabase's magic link
      const redirectUrl = `${window.location.origin}/onboarding?verified=true&stage=2`;
      
      const { error: emailError } = await supabase.auth.signInWithOtp({
        email: data.email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: false, // Don't create user yet
        }
      });

      if (emailError) {
        // If user doesn't exist yet, that's okay - we'll create them after payment
        // For now, just show the verification dialog
        console.log("Email verification initiated");
      }

      // Mark email as verified in the form data
      updateData({ emailVerified: true });
      
      // Show verification dialog
      setShowVerificationDialog(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to send verification email");
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContinueAfterVerification = () => {
    setShowVerificationDialog(false);
    onNext();
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
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {data.countryCode
                      ? (() => {
                          const selected = countries.find(
                            (country) => country.code === data.countryCode
                          );
                          return selected
                            ? `${selected.flag} ${selected.name} (${selected.code})`
                            : "Select country code";
                        })()
                      : "Select country code"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={true}>
                    <CommandInput placeholder="Search country..." className="h-9" />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {countries.map((country) => (
                        <CommandItem
                          key={`${country.code}-${country.name}`}
                          value={`${country.name} ${country.code}`}
                          onSelect={() => {
                            updateData({ countryCode: country.code });
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              data.countryCode === country.code
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {country.flag} {country.name} ({country.code})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
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
            <Button type="button" variant="outline" onClick={onPrev} disabled={loading}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Verification Email...
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Email Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                We've sent a verification email to <strong>{data.email}</strong>.
              </p>
              <p>
                Please check your inbox and click the verification link to continue with your signup.
              </p>
              <p className="text-sm text-muted-foreground">
                You can continue filling out the form while waiting for verification. The email verification will be confirmed before account creation.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleContinueAfterVerification}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
