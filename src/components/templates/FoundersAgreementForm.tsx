import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FoundersAgreementData } from "@/types/corporate-templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";

interface FoundersAgreementFormProps {
  initialData: FoundersAgreementData;
  onSubmit: (data: FoundersAgreementData) => void;
}

export const FoundersAgreementForm: React.FC<FoundersAgreementFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  const [formData, setFormData] = useState<FoundersAgreementData>(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Track preview generation
    await trackPreviewGeneration("founders-agreement-1", "update");
    // Submit the form
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof FoundersAgreementData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="founderNames">
            Founder Names (comma-separated) *
          </Label>
          <Textarea
            id="founderNames"
            value={formData.founderNames}
            onChange={(e) => handleChange("founderNames", e.target.value)}
            placeholder="e.g., John Doe, Jane Smith, Bob Johnson"
            rows={2}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            placeholder="e.g., Startup Inc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="effectiveDate">Effective Date *</Label>
          <Input
            id="effectiveDate"
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => handleChange("effectiveDate", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessPurpose">Business Purpose *</Label>
          <Textarea
            id="businessPurpose"
            value={formData.businessPurpose}
            onChange={(e) => handleChange("businessPurpose", e.target.value)}
            placeholder="Describe the company's business purpose"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="equityDistribution">Equity Distribution *</Label>
          <Textarea
            id="equityDistribution"
            value={formData.equityDistribution}
            onChange={(e) => handleChange("equityDistribution", e.target.value)}
            placeholder="Specify equity distribution among founders"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rolesResponsibilities">Roles & Responsibilities *</Label>
          <Textarea
            id="rolesResponsibilities"
            value={formData.rolesResponsibilities}
            onChange={(e) => handleChange("rolesResponsibilities", e.target.value)}
            placeholder="Define roles and responsibilities of each founder"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vestingSchedule">Vesting Schedule *</Label>
          <Textarea
            id="vestingSchedule"
            value={formData.vestingSchedule}
            onChange={(e) => handleChange("vestingSchedule", e.target.value)}
            placeholder="Specify vesting schedule for founder shares"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intellectualProperty">Intellectual Property *</Label>
          <Textarea
            id="intellectualProperty"
            value={formData.intellectualProperty}
            onChange={(e) => handleChange("intellectualProperty", e.target.value)}
            placeholder="Define IP ownership and assignment"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nonCompete">Non-Compete Terms *</Label>
          <Textarea
            id="nonCompete"
            value={formData.nonCompete}
            onChange={(e) => handleChange("nonCompete", e.target.value)}
            placeholder="Specify non-compete terms"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exitProvisions">Exit Provisions *</Label>
          <Textarea
            id="exitProvisions"
            value={formData.exitProvisions}
            onChange={(e) => handleChange("exitProvisions", e.target.value)}
            placeholder="Define terms for founder exit"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="place">Place *</Label>
          <Input
            id="place"
            value={formData.place}
            onChange={(e) => handleChange("place", e.target.value)}
            placeholder="e.g., San Francisco, CA"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatoryName">Signatory Name *</Label>
          <Input
            id="signatoryName"
            value={formData.signatoryName}
            onChange={(e) => handleChange("signatoryName", e.target.value)}
            placeholder="Enter signatory name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatoryDesignation">Signatory Designation *</Label>
          <Input
            id="signatoryDesignation"
            value={formData.signatoryDesignation}
            onChange={(e) => handleChange("signatoryDesignation", e.target.value)}
            placeholder="Enter signatory designation"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="includeDigitalSignature"
          checked={formData.includeDigitalSignature}
          onCheckedChange={(checked) =>
            handleChange("includeDigitalSignature", checked)
          }
        />
        <Label htmlFor="includeDigitalSignature">Include Digital Signature</Label>
      </div>

      <Button type="submit" className="w-full">
        Update Preview
      </Button>
    </form>
  );
};
