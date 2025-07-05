import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FoundersAgreementData } from "@/types/corporate-templates";

interface FoundersAgreementFormProps {
  initialData: FoundersAgreementData;
  onSubmit: (data: FoundersAgreementData) => void;
}

export const FoundersAgreementForm: React.FC<FoundersAgreementFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FoundersAgreementData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="businessDescription">Business Description *</Label>
          <Textarea
            id="businessDescription"
            value={formData.businessDescription}
            onChange={(e) =>
              handleChange("businessDescription", e.target.value)
            }
            placeholder="Describe the business and its purpose"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="equityDistribution">Equity Distribution *</Label>
          <Textarea
            id="equityDistribution"
            value={formData.equityDistribution}
            onChange={(e) => handleChange("equityDistribution", e.target.value)}
            placeholder="e.g., John Doe: 40%, Jane Smith: 35%, Bob Johnson: 25%"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="vestingSchedule">Vesting Schedule *</Label>
          <Textarea
            id="vestingSchedule"
            value={formData.vestingSchedule}
            onChange={(e) => handleChange("vestingSchedule", e.target.value)}
            placeholder="e.g., 4-year vesting with 1-year cliff"
            rows={2}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="roles">Roles and Responsibilities *</Label>
          <Textarea
            id="roles"
            value={formData.roles}
            onChange={(e) => handleChange("roles", e.target.value)}
            placeholder="Define each founder's role and responsibilities"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="capitalContributions">Capital Contributions *</Label>
          <Textarea
            id="capitalContributions"
            value={formData.capitalContributions}
            onChange={(e) =>
              handleChange("capitalContributions", e.target.value)
            }
            placeholder="Initial capital contributions by each founder"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="intellectualProperty">
            Intellectual Property Assignment *
          </Label>
          <Textarea
            id="intellectualProperty"
            value={formData.intellectualProperty}
            onChange={(e) =>
              handleChange("intellectualProperty", e.target.value)
            }
            placeholder="How intellectual property will be assigned to the company"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="confidentiality">Confidentiality Provisions *</Label>
          <Textarea
            id="confidentiality"
            value={formData.confidentiality}
            onChange={(e) => handleChange("confidentiality", e.target.value)}
            placeholder="Confidentiality obligations of founders"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nonCompete">Non-Compete Provisions *</Label>
          <Textarea
            id="nonCompete"
            value={formData.nonCompete}
            onChange={(e) => handleChange("nonCompete", e.target.value)}
            placeholder="Non-compete restrictions during and after involvement"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="disputeResolution">Dispute Resolution Method *</Label>
          <Input
            id="disputeResolution"
            value={formData.disputeResolution}
            onChange={(e) => handleChange("disputeResolution", e.target.value)}
            placeholder="e.g., Binding arbitration"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="governingLaw">Governing Law *</Label>
          <Input
            id="governingLaw"
            value={formData.governingLaw}
            onChange={(e) => handleChange("governingLaw", e.target.value)}
            placeholder="e.g., State of Delaware"
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
          <Label htmlFor="signatoryName">Witness/Notary Name</Label>
          <Input
            id="signatoryName"
            value={formData.signatoryName}
            onChange={(e) => handleChange("signatoryName", e.target.value)}
            placeholder="Name of witness or notary"
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
            Include Digital Signatures
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Generate Founders Agreement
      </Button>
    </form>
  );
};
