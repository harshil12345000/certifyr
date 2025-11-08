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
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { countries } from "@/lib/countries";

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

    // All validation passed, move to next stage
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
    </motion.div>
  );
}
