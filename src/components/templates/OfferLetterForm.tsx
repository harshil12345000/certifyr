import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { OfferLetterData } from "@/types/templates";

const offerLetterSchema = z.object({
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateAddress: z.string().min(1, "Candidate address is required"),
  dateOfOffer: z.string().min(1, "Date of offer is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  reportingManager: z.string().min(1, "Reporting manager is required"),
  startDate: z.string().min(1, "Start date is required"),
  probationPeriod: z.string().min(1, "Probation period is required"),
  salaryAmount: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, "Invalid salary amount")
    .min(1, "Salary amount is required"),
  salaryCurrency: z
    .string()
    .min(1, "Salary currency is required (e.g., INR, USD)"),
  salaryFrequency: z.enum(["monthly", "annually"], {
    required_error: "Salary frequency is required",
  }),
  benefits: z.string().min(1, "Benefits description is required"),
  workHours: z.string().min(1, "Work hours are required"),
  workLocation: z.string().min(1, "Work location is required"),
  acceptanceDeadline: z.string().min(1, "Acceptance deadline is required"),
  institutionName: z.string().min(1, "Institution name is required"),
  date: z.string().min(1, "Issue date is required"),
  place: z.string().min(1, "Place of issue is required"),
  signatoryName: z.string().min(1, "Signatory name is required"),
  signatoryDesignation: z.string().min(1, "Signatory designation is required"),
  includeDigitalSignature: z.boolean(),
});

interface OfferLetterFormProps {
  onSubmit: (data: OfferLetterData) => void;
  initialData?: Partial<OfferLetterData>;
}

export const OfferLetterForm: React.FC<OfferLetterFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const form = useForm<OfferLetterData>({
    resolver: zodResolver(offerLetterSchema),
    defaultValues: {
      candidateName: "",
      candidateAddress: "",
      dateOfOffer: new Date().toISOString().split("T")[0],
      jobTitle: "",
      department: "",
      reportingManager: "",
      startDate: "",
      probationPeriod: "3 months",
      salaryAmount: "",
      salaryCurrency: "INR",
      salaryFrequency: "monthly",
      benefits: "",
      workHours: "9 AM to 6 PM, Monday to Friday",
      workLocation: "",
      acceptanceDeadline: "",
      institutionName: "",
      date: new Date().toISOString().split("T")[0],
      place: "",
      signatoryName: "",
      signatoryDesignation: "",
      includeDigitalSignature: false,
      ...initialData,
    },
  });

  const handleSubmit = (data: OfferLetterData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="candidateName">Candidate Name *</Label>
          <Input
            id="candidateName"
            {...form.register("candidateName")}
            placeholder="Enter candidate's full name"
          />
          {form.formState.errors.candidateName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.candidateName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="candidateAddress">Candidate Address *</Label>
          <Textarea
            id="candidateAddress"
            {...form.register("candidateAddress")}
            placeholder="Enter candidate's full address"
            rows={3}
          />
          {form.formState.errors.candidateAddress && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.candidateAddress.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="dateOfOffer">Date of Offer *</Label>
          <Input
            id="dateOfOffer"
            type="date"
            {...form.register("dateOfOffer")}
          />
          {form.formState.errors.dateOfOffer && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.dateOfOffer.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input
            id="jobTitle"
            {...form.register("jobTitle")}
            placeholder="Enter job title"
          />
          {form.formState.errors.jobTitle && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.jobTitle.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            {...form.register("department")}
            placeholder="Enter department"
          />
          {form.formState.errors.department && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.department.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="reportingManager">Reporting Manager *</Label>
          <Input
            id="reportingManager"
            {...form.register("reportingManager")}
            placeholder="Enter reporting manager's name"
          />
          {form.formState.errors.reportingManager && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.reportingManager.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="startDate">Expected Start Date *</Label>
          <Input id="startDate" type="date" {...form.register("startDate")} />
          {form.formState.errors.startDate && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.startDate.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="probationPeriod">Probation Period *</Label>
          <Input
            id="probationPeriod"
            {...form.register("probationPeriod")}
            placeholder="e.g., 3 months, None"
          />
          {form.formState.errors.probationPeriod && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.probationPeriod.message}
            </p>
          )}
        </div>
      </div>

      <h3 className="text-md font-medium pt-2 border-t">Salary Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="salaryAmount">Salary Amount *</Label>
          <Input
            id="salaryAmount"
            {...form.register("salaryAmount")}
            placeholder="e.g., 50000"
          />
          {form.formState.errors.salaryAmount && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.salaryAmount.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="salaryCurrency">Currency *</Label>
          <Input
            id="salaryCurrency"
            {...form.register("salaryCurrency")}
            placeholder="e.g., INR, USD"
          />
          {form.formState.errors.salaryCurrency && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.salaryCurrency.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="salaryFrequency">Salary Frequency *</Label>
          <Select
            value={form.watch("salaryFrequency")}
            onValueChange={(value) =>
              form.setValue("salaryFrequency", value as "monthly" | "annually")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.salaryFrequency && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.salaryFrequency.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="benefits">Benefits *</Label>
        <Textarea
          id="benefits"
          {...form.register("benefits")}
          placeholder="Describe company benefits (e.g., Health Insurance, Paid Time Off, etc.)"
          rows={4}
        />
        {form.formState.errors.benefits && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.benefits.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="workHours">Work Hours *</Label>
          <Input
            id="workHours"
            {...form.register("workHours")}
            placeholder="e.g., 9 AM to 6 PM, Mon-Fri"
          />
          {form.formState.errors.workHours && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.workHours.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="workLocation">Work Location *</Label>
          <Input
            id="workLocation"
            {...form.register("workLocation")}
            placeholder="e.g., Remote, Office Address"
          />
          {form.formState.errors.workLocation && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.workLocation.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="acceptanceDeadline">Offer Acceptance Deadline *</Label>
        <Input
          id="acceptanceDeadline"
          type="date"
          {...form.register("acceptanceDeadline")}
        />
        {form.formState.errors.acceptanceDeadline && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.acceptanceDeadline.message}
          </p>
        )}
      </div>

      <h3 className="text-md font-medium pt-2 border-t">Issuer Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="institutionName">Company/Institution Name *</Label>
          <Input
            id="institutionName"
            {...form.register("institutionName")}
            placeholder="Enter company/institution name"
          />
          {form.formState.errors.institutionName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.institutionName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="date">Issue Date *</Label>
          <Input id="date" type="date" {...form.register("date")} />
          {form.formState.errors.date && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.date.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="place">Place of Issue *</Label>
          <Input
            id="place"
            {...form.register("place")}
            placeholder="Enter city/place of issue"
          />
          {form.formState.errors.place && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.place.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="signatoryName">Signatory Name *</Label>
          <Input
            id="signatoryName"
            {...form.register("signatoryName")}
            placeholder="Enter signatory's full name"
          />
          {form.formState.errors.signatoryName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.signatoryName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="signatoryDesignation">Signatory Designation *</Label>
          <Input
            id="signatoryDesignation"
            {...form.register("signatoryDesignation")}
            placeholder="Enter signatory's designation"
          />
          {form.formState.errors.signatoryDesignation && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.signatoryDesignation.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeDigitalSignature"
          checked={form.watch("includeDigitalSignature")}
          onCheckedChange={(checked) =>
            form.setValue("includeDigitalSignature", checked as boolean)
          }
        />
        <Label htmlFor="includeDigitalSignature">
          Include Digital Signature
        </Label>
      </div>

      <Button type="submit" className="w-full">
        Update Preview
      </Button>
    </form>
  );
};
