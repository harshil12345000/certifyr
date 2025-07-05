import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { NDAData } from "@/types/corporate-templates";

interface NDAFormProps {
  initialData: NDAData;
  onSubmit: (data: NDAData) => void;
}

export const NDAForm: React.FC<NDAFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<NDAData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            rows={2}
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
            rows={2}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="purposeOfDisclosure">Purpose of Disclosure *</Label>
          <Textarea
            id="purposeOfDisclosure"
            value={formData.purposeOfDisclosure}
            onChange={(e) =>
              handleChange("purposeOfDisclosure", e.target.value)
            }
            placeholder="Describe the business purpose for sharing confidential information"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="confidentialInformation">
            Definition of Confidential Information *
          </Label>
          <Textarea
            id="confidentialInformation"
            value={formData.confidentialInformation}
            onChange={(e) =>
              handleChange("confidentialInformation", e.target.value)
            }
            placeholder="Define what constitutes confidential information"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="exclusions">Exclusions from Confidentiality *</Label>
          <Textarea
            id="exclusions"
            value={formData.exclusions}
            onChange={(e) => handleChange("exclusions", e.target.value)}
            placeholder="Information that is not considered confidential"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="obligations">Obligations of Receiving Party *</Label>
          <Textarea
            id="obligations"
            value={formData.obligations}
            onChange={(e) => handleChange("obligations", e.target.value)}
            placeholder="Describe the obligations of the receiving party"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="termLength">Term Length *</Label>
          <Input
            id="termLength"
            value={formData.termLength}
            onChange={(e) => handleChange("termLength", e.target.value)}
            placeholder="e.g., 5 years"
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
          <Label htmlFor="returnOfInformation">Return of Information *</Label>
          <Textarea
            id="returnOfInformation"
            value={formData.returnOfInformation}
            onChange={(e) =>
              handleChange("returnOfInformation", e.target.value)
            }
            placeholder="Requirements for returning confidential information"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="remedies">Remedies for Breach *</Label>
          <Textarea
            id="remedies"
            value={formData.remedies}
            onChange={(e) => handleChange("remedies", e.target.value)}
            placeholder="Available remedies in case of breach"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="governingLaw">Governing Law *</Label>
          <Input
            id="governingLaw"
            value={formData.governingLaw}
            onChange={(e) => handleChange("governingLaw", e.target.value)}
            placeholder="e.g., State of California"
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
        Generate Non-Disclosure Agreement
      </Button>
    </form>
  );
};
