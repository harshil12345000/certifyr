import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { EmbassyAttestationData } from "@/types/templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmbassyAttestationFormProps {
  onSubmit: (data: EmbassyAttestationData) => void;
  initialData: EmbassyAttestationData;
}

export const EmbassyAttestationForm: React.FC<EmbassyAttestationFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  const [formData, setFormData] = useState<EmbassyAttestationData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof EmbassyAttestationData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Track preview generation
    await trackPreviewGeneration("embassy-attestation-1", "update");
    // Submit the form
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Applicant Details Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium border-b pb-2">Applicant Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passportNumber">Passport Number *</Label>
            <Input
              id="passportNumber"
              value={formData.passportNumber}
              onChange={(e) => handleChange("passportNumber", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality *</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Document Details Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium border-b pb-2">Document Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type *</Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => handleChange("documentType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educational">Educational Documents</SelectItem>
                <SelectItem value="commercial">Commercial Documents</SelectItem>
                <SelectItem value="personal">Personal Documents</SelectItem>
                <SelectItem value="legal">Legal Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Number *</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => handleChange("documentNumber", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentIssueDate">Document Issue Date *</Label>
            <Input
              id="documentIssueDate"
              type="date"
              value={formData.documentIssueDate}
              onChange={(e) => handleChange("documentIssueDate", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentIssuingAuthority">
              Document Issuing Authority *
            </Label>
            <Input
              id="documentIssuingAuthority"
              value={formData.documentIssuingAuthority}
              onChange={(e) =>
                handleChange("documentIssuingAuthority", e.target.value)
              }
              required
            />
          </div>
        </div>
      </div>

      {/* Embassy Details Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium border-b pb-2">Embassy Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="embassy">Embassy/Consulate *</Label>
            <Input
              id="embassy"
              value={formData.embassy}
              onChange={(e) => handleChange("embassy", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Attestation *</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Signatory Details Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium border-b pb-2">Signatory Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="institutionName">Institution Name *</Label>
            <Input
              id="institutionName"
              value={formData.institutionName}
              onChange={(e) => handleChange("institutionName", e.target.value)}
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
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatoryName">Signatory Name *</Label>
            <Input
              id="signatoryName"
              value={formData.signatoryName}
              onChange={(e) => handleChange("signatoryName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatoryDesignation">Signatory Designation *</Label>
            <Input
              id="signatoryDesignation"
              value={formData.signatoryDesignation}
              onChange={(e) => handleChange("signatoryDesignation", e.target.value)}
              required
            />
          </div>
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
