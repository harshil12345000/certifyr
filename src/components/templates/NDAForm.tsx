import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { NDAData } from "@/types/corporate-templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";

interface NDAFormProps {
  initialData: NDAData;
  onSubmit: (data: NDAData) => void;
}

export const NDAForm: React.FC<NDAFormProps> = ({ initialData, onSubmit }) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  const [formData, setFormData] = useState<NDAData>(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Track preview generation
    await trackPreviewGeneration("nda-1", "update");
    // Submit the form
    onSubmit(formData);
  };

  const handleChange = (field: keyof NDAData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="disclosingParty">Disclosing Party *</Label>
          <Input
            id="disclosingParty"
            value={formData.disclosingParty}
            onChange={(e) => handleChange("disclosingParty", e.target.value)}
            placeholder="Party sharing confidential information"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="receivingParty">Receiving Party *</Label>
          <Input
            id="receivingParty"
            value={formData.receivingParty}
            onChange={(e) => handleChange("receivingParty", e.target.value)}
            placeholder="Party receiving confidential information"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="disclosingPartyAddress">
            Disclosing Party Address *
          </Label>
          <Textarea
            id="disclosingPartyAddress"
            value={formData.disclosingPartyAddress}
            onChange={(e) =>
              handleChange("disclosingPartyAddress", e.target.value)
            }
            placeholder="Enter complete address"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="receivingPartyAddress">
            Receiving Party Address *
          </Label>
          <Textarea
            id="receivingPartyAddress"
            value={formData.receivingPartyAddress}
            onChange={(e) =>
              handleChange("receivingPartyAddress", e.target.value)
            }
            placeholder="Enter complete address"
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
          <Label htmlFor="duration">Agreement Duration *</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
            placeholder="e.g., 2 years"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="confidentialInformation">
            Confidential Information *
          </Label>
          <Textarea
            id="confidentialInformation"
            value={formData.confidentialInformation}
            onChange={(e) =>
              handleChange("confidentialInformation", e.target.value)
            }
            placeholder="Define what constitutes confidential information"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="permittedUse">Permitted Use *</Label>
          <Textarea
            id="permittedUse"
            value={formData.permittedUse}
            onChange={(e) => handleChange("permittedUse", e.target.value)}
            placeholder="Specify permitted uses of confidential information"
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
