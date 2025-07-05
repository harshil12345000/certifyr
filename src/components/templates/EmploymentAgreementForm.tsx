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
import { EmploymentAgreementData } from "@/types/corporate-templates";

interface EmploymentAgreementFormProps {
  initialData: EmploymentAgreementData;
  onSubmit: (data: EmploymentAgreementData) => void;
}

export const EmploymentAgreementForm: React.FC<
  EmploymentAgreementFormProps
> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] =
    useState<EmploymentAgreementData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employerName">Employer/Company Name *</Label>
          <Input
            id="employerName"
            value={formData.employerName}
            onChange={(e) => handleChange("employerName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => handleChange("department", e.target.value)}
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
          <Label htmlFor="employmentType">Employment Type *</Label>
          <Select
            value={formData.employmentType}
            onValueChange={(value) =>
              handleChange(
                "employmentType",
                value as "full-time" | "part-time" | "contract",
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Salary/Compensation *</Label>
          <Input
            id="salary"
            value={formData.salary}
            onChange={(e) => handleChange("salary", e.target.value)}
            placeholder="e.g., $75,000 annually"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payFrequency">Pay Frequency *</Label>
          <Select
            value={formData.payFrequency}
            onValueChange={(value) =>
              handleChange(
                "payFrequency",
                value as "monthly" | "bi-weekly" | "weekly",
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="benefits">Benefits Package</Label>
          <Textarea
            id="benefits"
            value={formData.benefits}
            onChange={(e) => handleChange("benefits", e.target.value)}
            placeholder="Describe health insurance, retirement, vacation, etc."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workLocation">Work Location *</Label>
          <Input
            id="workLocation"
            value={formData.workLocation}
            onChange={(e) => handleChange("workLocation", e.target.value)}
            placeholder="e.g., Remote, Office address, Hybrid"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workHours">Work Hours *</Label>
          <Input
            id="workHours"
            value={formData.workHours}
            onChange={(e) => handleChange("workHours", e.target.value)}
            placeholder="e.g., 9 AM - 5 PM, Monday - Friday"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="probationPeriod">Probation Period</Label>
          <Input
            id="probationPeriod"
            value={formData.probationPeriod}
            onChange={(e) => handleChange("probationPeriod", e.target.value)}
            placeholder="e.g., 90 days"
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="terminationClause">Termination Clause *</Label>
          <Textarea
            id="terminationClause"
            value={formData.terminationClause}
            onChange={(e) => handleChange("terminationClause", e.target.value)}
            placeholder="Terms for termination of employment"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="confidentialityClause">
            Confidentiality Clause *
          </Label>
          <Textarea
            id="confidentialityClause"
            value={formData.confidentialityClause}
            onChange={(e) =>
              handleChange("confidentialityClause", e.target.value)
            }
            placeholder="Confidentiality obligations"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nonCompeteClause">Non-Compete Clause</Label>
          <Textarea
            id="nonCompeteClause"
            value={formData.nonCompeteClause}
            onChange={(e) => handleChange("nonCompeteClause", e.target.value)}
            placeholder="Non-compete restrictions (if applicable)"
            rows={3}
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
          <Label htmlFor="signatoryName">HR/Signatory Name *</Label>
          <Input
            id="signatoryName"
            value={formData.signatoryName}
            onChange={(e) => handleChange("signatoryName", e.target.value)}
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
        Generate Employment Agreement
      </Button>
    </form>
  );
};
