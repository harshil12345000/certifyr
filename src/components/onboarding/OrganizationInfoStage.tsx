
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";

interface OrganizationInfoStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const organizationTypes = [
  "Corporate",
  "Startup", 
  "Law Agency",
  "Educational Institute",
  "Other"
];

const organizationSizes = [
  "1-10",
  "10-50", 
  "50-100",
  "100-1000",
  "1000-10000",
  "10000+"
];

const countries = [
  "United States",
  "Canada", 
  "United Kingdom",
  "Germany",
  "France",
  "India",
  "Australia",
  "Other"
];

export function OrganizationInfoStage({ data, updateData, onNext, onPrev }: OrganizationInfoStageProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.organizationName && data.organizationType && data.organizationSize && data.organizationLocation) {
      onNext();
    }
  };

  const isValid = data.organizationName && data.organizationType && data.organizationSize && data.organizationLocation;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto w-full"
    >
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Organization Information
          </CardTitle>
          <p className="text-gray-600">Help us understand your organization</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organizationName" className="text-sm font-medium text-gray-700">
                  Organization Name *
                </Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="Enter organization name"
                  value={data.organizationName}
                  onChange={(e) => updateData({ organizationName: e.target.value })}
                  className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Type *</Label>
                <Select
                  value={data.organizationType}
                  onValueChange={(value) => updateData({ organizationType: value })}
                >
                  <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {data.organizationType === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="organizationTypeOther" className="text-sm font-medium text-gray-700">
                  Please specify *
                </Label>
                <Input
                  id="organizationTypeOther"
                  type="text"
                  placeholder="Specify your organization type"
                  value={data.organizationTypeOther || ""}
                  onChange={(e) => updateData({ organizationTypeOther: e.target.value })}
                  className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Size *</Label>
                <Select
                  value={data.organizationSize}
                  onValueChange={(value) => updateData({ organizationSize: value })}
                >
                  <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder="Select organization size" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Location *</Label>
                <Select
                  value={data.organizationLocation}
                  onValueChange={(value) => updateData({ organizationLocation: value })}
                >
                  <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationWebsite" className="text-sm font-medium text-gray-700">
                Website (Optional)
              </Label>
              <Input
                id="organizationWebsite"
                type="url"
                placeholder="https://example.com"
                value={data.organizationWebsite || ""}
                onChange={(e) => updateData({ organizationWebsite: e.target.value })}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onPrev}
                className="px-8 py-3 border-gray-300 hover:bg-gray-50"
              >
                Back
              </Button>
              
              <Button
                type="submit"
                disabled={!isValid}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
