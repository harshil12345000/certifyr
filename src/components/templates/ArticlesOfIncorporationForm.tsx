import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArticlesOfIncorporationData } from "@/types/corporate-templates";

interface ArticlesOfIncorporationFormProps {
  initialData: ArticlesOfIncorporationData;
  onSubmit: (data: ArticlesOfIncorporationData) => void;
}

export const ArticlesOfIncorporationForm: React.FC<
  ArticlesOfIncorporationFormProps
> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] =
    useState<ArticlesOfIncorporationData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof ArticlesOfIncorporationData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="corporationName">Corporation Name *</Label>
          <Input
            id="corporationName"
            value={formData.corporationName}
            onChange={(e) => handleChange("corporationName", e.target.value)}
            placeholder="e.g., ABC Corporation"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stateOfIncorporation">State of Incorporation *</Label>
          <Select
            value={formData.stateOfIncorporation}
            onValueChange={(value) =>
              handleChange("stateOfIncorporation", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="california">California</SelectItem>
              <SelectItem value="delaware">Delaware</SelectItem>
              <SelectItem value="nevada">Nevada</SelectItem>
              <SelectItem value="texas">Texas</SelectItem>
              <SelectItem value="florida">Florida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="businessPurpose">Business Purpose *</Label>
          <Textarea
            id="businessPurpose"
            value={formData.businessPurpose}
            onChange={(e) => handleChange("businessPurpose", e.target.value)}
            placeholder="Describe the general business purpose of the corporation"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="corporateAddress">Corporate Address *</Label>
          <Textarea
            id="corporateAddress"
            value={formData.corporateAddress}
            onChange={(e) => handleChange("corporateAddress", e.target.value)}
            placeholder="Principal office address"
            rows={2}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registeredAgent">Registered Agent Name *</Label>
          <Input
            id="registeredAgent"
            value={formData.registeredAgent}
            onChange={(e) => handleChange("registeredAgent", e.target.value)}
            placeholder="Name of registered agent"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registeredAgentAddress">
            Registered Agent Address *
          </Label>
          <Textarea
            id="registeredAgentAddress"
            value={formData.registeredAgentAddress}
            onChange={(e) =>
              handleChange("registeredAgentAddress", e.target.value)
            }
            placeholder="Address of registered agent"
            rows={2}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorizedShares">Authorized Shares *</Label>
          <Input
            id="authorizedShares"
            value={formData.authorizedShares}
            onChange={(e) => handleChange("authorizedShares", e.target.value)}
            placeholder="e.g., 1,000,000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shareValue">Par Value per Share</Label>
          <Input
            id="shareValue"
            value={formData.shareValue}
            onChange={(e) => handleChange("shareValue", e.target.value)}
            placeholder="e.g., $0.001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incorporatorName">Incorporator Name *</Label>
          <Input
            id="incorporatorName"
            value={formData.incorporatorName}
            onChange={(e) => handleChange("incorporatorName", e.target.value)}
            placeholder="Name of incorporator"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incorporatorAddress">Incorporator Address *</Label>
          <Textarea
            id="incorporatorAddress"
            value={formData.incorporatorAddress}
            onChange={(e) =>
              handleChange("incorporatorAddress", e.target.value)
            }
            placeholder="Address of incorporator"
            rows={2}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filingDate">Filing Date *</Label>
          <Input
            id="filingDate"
            type="date"
            value={formData.filingDate}
            onChange={(e) => handleChange("filingDate", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="place">Place of Signing *</Label>
          <Input
            id="place"
            value={formData.place}
            onChange={(e) => handleChange("place", e.target.value)}
            placeholder="City, State"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatoryName">Signatory Name *</Label>
          <Input
            id="signatoryName"
            value={formData.signatoryName}
            onChange={(e) => handleChange("signatoryName", e.target.value)}
            placeholder="Name of person signing"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatoryDesignation">Signatory Title *</Label>
          <Input
            id="signatoryDesignation"
            value={formData.signatoryDesignation}
            onChange={(e) =>
              handleChange("signatoryDesignation", e.target.value)
            }
            placeholder="e.g., Incorporator"
            required
          />
        </div>

        <div className="flex items-center space-x-2 md:col-span-2">
          <Switch
            id="includeDigitalSignature"
            checked={formData.includeDigitalSignature}
            onCheckedChange={(checked) =>
              handleChange("includeDigitalSignature", checked)
            }
          />
          <Label htmlFor="includeDigitalSignature">
            Include Digital Signature
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Generate Articles of Incorporation
      </Button>
    </form>
  );
};
