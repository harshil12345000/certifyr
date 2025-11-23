import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { countries } from "@/lib/countries";
import { Search, Check } from "lucide-react";

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


export function OrganizationInfoStage({ data, updateData, onNext, onPrev }: OrganizationInfoStageProps) {
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.organizationName && data.organizationType && data.organizationSize && data.organizationLocation && data.organizationWebsite) {
      onNext();
    }
  };

  const isValid = data.organizationName && data.organizationType && data.organizationSize && data.organizationLocation && data.organizationWebsite;

  // Get unique country names sorted alphabetically
  const sortedCountries = [...countries]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((country, index, self) => 
      index === self.findIndex((c) => c.name === country.name)
    );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto w-full pt-3"
    >
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-2xl pt-3 mt-10">
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
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={locationOpen}
                      className="h-12 w-full justify-between bg-white/50 border-gray-200 focus:border-blue-500"
                    >
                      <span className="truncate">
                        {data.organizationLocation || "Select country"}
                      </span>
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background z-50" align="start">
                    <div className="flex flex-col">
                      <div className="p-3 border-b border-border">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search country..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            className="pl-8 bg-background"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[250px]">
                        <div className="p-1">
                          {sortedCountries
                            .filter(country => 
                              country.name.toLowerCase().includes(locationSearch.toLowerCase())
                            )
                            .map((country) => (
                              <button
                                key={country.name}
                                type="button"
                                onClick={() => {
                                  updateData({ organizationLocation: country.name });
                                  setLocationOpen(false);
                                  setLocationSearch("");
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors ${
                                  data.organizationLocation === country.name ? "bg-accent text-accent-foreground" : ""
                                }`}
                              >
                                <Check
                                  className={`h-4 w-4 flex-shrink-0 ${
                                    data.organizationLocation === country.name ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <span className="flex items-center gap-2">
                                  <span className="text-base">{country.flag}</span>
                                  <span>{country.name}</span>
                                </span>
                              </button>
                            ))}
                          {sortedCountries.filter(country => 
                            country.name.toLowerCase().includes(locationSearch.toLowerCase())
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationWebsite" className="text-sm font-medium text-gray-700">
                Website *
              </Label>
              <Input
                id="organizationWebsite"
                type="url"
                placeholder="https://example.com"
                value={data.organizationWebsite || ""}
                onChange={(e) => updateData({ organizationWebsite: e.target.value })}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onPrev}
                className="px-8 py-3 border-gray-300 hover:bg-gray-50 transition-transform hover:scale-105"
              >
                Back
              </Button>
              
              <Button
                type="submit"
                disabled={!isValid}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
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
