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
import { Check, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Invalid email format";
    if (!data.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if email already exists
    setCheckingEmail(true);
    try {
      const email = data.email.trim().toLowerCase();
      const { data: checkResult, error: checkError } = await supabase.functions.invoke("check-email-exists", {
        body: { email }
      });

      if (checkError) {
        console.error("Error checking email:", checkError);
        // Continue anyway - we'll catch it at signup
      } else if (checkResult?.exists) {
        setShowExistingEmailDialog(true);
        setCheckingEmail(false);
        return;
      }

      // Normalize and store email
      updateData({ email: email });
      onNext();
    } catch (error) {
      console.error("Error checking email:", error);
      // Continue anyway
      onNext();
    } finally {
      setCheckingEmail(false);
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

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onPrev}>
                Back
              </Button>
              <Button type="submit" disabled={checkingEmail}>
                {checkingEmail ? "Checking..." : "Next"}
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
              onPrev(); // This goes back to /auth
            }}>
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
