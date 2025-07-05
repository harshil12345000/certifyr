import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EmbassyAttestationLetterData } from "@/types/corporate-templates";

interface EmbassyAttestationLetterFormProps {
  onSubmit: (data: EmbassyAttestationLetterData) => void;
  initialData: EmbassyAttestationLetterData;
}

export const EmbassyAttestationLetterForm: React.FC<
  EmbassyAttestationLetterFormProps
> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] =
    useState<EmbassyAttestationLetterData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (
    field: keyof EmbassyAttestationLetterData,
    value: any,
  ) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onSubmit(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Applicant Details Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium border-b pb-2">Applicant Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="applicantName">Applicant Name *</Label>
            <Input
              id="applicantName"
              value={formData.applicantName}
              onChange={(e) => handleChange("applicantName", e.target.value)}
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
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeOfBirth">Place of Birth *</Label>
            <Input
              id="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={(e) => handleChange("placeOfBirth", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fatherName">Father's Name *</Label>
            <Input
              id="fatherName"
              value={formData.fatherName}
              onChange={(e) => handleChange("fatherName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motherName">Mother's Name *</Label>
            <Input
              id="motherName"
              value={formData.motherName}
              onChange={(e) => handleChange("motherName", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="applicantAddress">Applicant Address *</Label>
          <Textarea
            id="applicantAddress"
            value={formData.applicantAddress}
            onChange={(e) => handleChange("applicantAddress", e.target.value)}
            className="min-h-[80px]"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email Address *</Label>
            <Input
              id="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={(e) => handleChange("emailAddress", e.target.value)}
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
              onValueChange={(value) => handleChange("documentType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educational-certificate">
                  Educational Certificate
                </SelectItem>
                <SelectItem value="birth-certificate">
                  Birth Certificate
                </SelectItem>
                <SelectItem value="marriage-certificate">
                  Marriage Certificate
                </SelectItem>
                <SelectItem value="police-clearance">
                  Police Clearance Certificate
                </SelectItem>
                <SelectItem value="medical-certificate">
                  Medical Certificate
                </SelectItem>
                <SelectItem value="experience-certificate">
                  Experience Certificate
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Number</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => handleChange("documentNumber", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
            <Input
              id="issuingAuthority"
              value={formData.issuingAuthority}
              onChange={(e) => handleChange("issuingAuthority", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentIssueDate">Document Issue Date</Label>
            <Input
              id="documentIssueDate"
              type="date"
              value={formData.documentIssueDate}
              onChange={(e) =>
                handleChange("documentIssueDate", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Purpose and Destination Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium border-b pb-2">
          Attestation Purpose
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="purposeOfAttestation">
              Purpose of Attestation *
            </Label>
            <Textarea
              id="purposeOfAttestation"
              value={formData.purposeOfAttestation}
              onChange={(e) =>
                handleChange("purposeOfAttestation", e.target.value)
              }
              placeholder="e.g., Higher education, Employment, Migration"
              className="min-h-[80px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinationCountry">Destination Country *</Label>
            <Input
              id="destinationCountry"
              value={formData.destinationCountry}
              onChange={(e) =>
                handleChange("destinationCountry", e.target.value)
              }
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="embassyName">Embassy/Consulate Name *</Label>
            <Input
              id="embassyName"
              value={formData.embassyName}
              onChange={(e) => handleChange("embassyName", e.target.value)}
              placeholder="e.g., Embassy of [Country] in India"
              required
            />
          </div>
        </div>
      </div>

      {/* Institution Details Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium border-b pb-2">
          Issuing Authority Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="institutionName">
              Institution/Organization Name *
            </Label>
            <Input
              id="institutionName"
              value={formData.institutionName}
              onChange={(e) => handleChange("institutionName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Issue Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="place">Place of Issue *</Label>
            <Input
              id="place"
              value={formData.place}
              onChange={(e) => handleChange("place", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatoryName">Authorized Signatory Name *</Label>
            <Input
              id="signatoryName"
              value={formData.signatoryName}
              onChange={(e) => handleChange("signatoryName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="signatoryDesignation">
              Signatory Designation *
            </Label>
            <Input
              id="signatoryDesignation"
              value={formData.signatoryDesignation}
              onChange={(e) =>
                handleChange("signatoryDesignation", e.target.value)
              }
              required
            />
          </div>
        </div>
      </div>

      {/* Digital Signature Option */}
      <div className="flex items-center space-x-2">
        <Checkbox
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

      <Button type="submit" className="w-full">
        Generate Letter
      </Button>
    </form>
  );
};
