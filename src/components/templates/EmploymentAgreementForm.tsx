import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { EmploymentAgreementData } from "@/types/corporate-templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";

interface EmploymentAgreementFormProps {
  initialData: EmploymentAgreementData;
  onSubmit: (data: EmploymentAgreementData) => void;
}

export const EmploymentAgreementForm: React.FC<
  EmploymentAgreementFormProps
> = ({ initialData, onSubmit }) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  const [formData, setFormData] =
    useState<EmploymentAgreementData>(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Track preview generation
    await trackPreviewGeneration("employment-agreement-1", "update");
    // Submit the form
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof EmploymentAgreementData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="employeeName">Employee Name *</Label>
          <Input
            id="employeeName"
            value={formData.employeeName}
            onChange={(e) => handleChange("employeeName", e.target.value)}
            placeholder="Enter employee's full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employerName">Employer/Company Name *</Label>
          <Input
            id="employerName"
            value={formData.employerName}
            onChange={(e) => handleChange("employerName", e.target.value)}
            placeholder="Enter employer/company name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            placeholder="Enter job title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => handleChange("department", e.target.value)}
            placeholder="Enter department name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Annual Salary *</Label>
          <Input
            id="salary"
            type="number"
            value={formData.salary}
            onChange={(e) => handleChange("salary", e.target.value)}
            placeholder="Enter annual salary"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workLocation">Work Location *</Label>
          <Input
            id="workLocation"
            value={formData.workLocation}
            onChange={(e) => handleChange("workLocation", e.target.value)}
            placeholder="Enter work location"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workHours">Work Hours *</Label>
          <Input
            id="workHours"
            value={formData.workHours}
            onChange={(e) => handleChange("workHours", e.target.value)}
            placeholder="e.g., 40 hours per week"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duties">Job Duties and Responsibilities *</Label>
        <Textarea
          id="duties"
          value={formData.duties}
          onChange={(e) => handleChange("duties", e.target.value)}
          placeholder="List main duties and responsibilities"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefits">Benefits *</Label>
        <Textarea
          id="benefits"
          value={formData.benefits}
          onChange={(e) => handleChange("benefits", e.target.value)}
          placeholder="List employee benefits"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="terminationTerms">Termination Terms *</Label>
        <Textarea
          id="terminationTerms"
          value={formData.terminationTerms}
          onChange={(e) => handleChange("terminationTerms", e.target.value)}
          placeholder="Specify termination terms and notice period"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholder="Enter place of signing"
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
