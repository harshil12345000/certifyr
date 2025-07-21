import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MaternityLeaveData } from "@/types/templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";

const maternityLeaveSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  leaveStartDate: z.string().min(1, "Leave start date is required"),
  leaveEndDate: z.string().min(1, "Leave end date is required"),
  totalLeaveDays: z.string().min(1, "Total leave days is required"),
  medicalCertificateNumber: z
    .string()
    .min(1, "Medical certificate number is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  hospitalName: z.string().min(1, "Hospital name is required"),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  emergencyContactPhone: z
    .string()
    .min(1, "Emergency contact phone is required"),
  institutionName: z.string().min(1, "Institution name is required"),
  date: z.string().min(1, "Date is required"),
  place: z.string().min(1, "Place is required"),
  signatoryName: z.string().min(1, "Signatory name is required"),
  signatoryDesignation: z.string().min(1, "Signatory designation is required"),
  includeDigitalSignature: z.boolean(),
});

interface MaternityLeaveFormProps {
  onSubmit: (data: MaternityLeaveData) => void;
  initialData?: Partial<MaternityLeaveData>;
}

export const MaternityLeaveForm: React.FC<MaternityLeaveFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  
  const form = useForm<MaternityLeaveData>({
    resolver: zodResolver(maternityLeaveSchema),
    defaultValues: {
      fullName: "",
      employeeId: "",
      designation: "",
      department: "",
      expectedDeliveryDate: "",
      leaveStartDate: "",
      leaveEndDate: "",
      totalLeaveDays: "",
      medicalCertificateNumber: "",
      doctorName: "",
      hospitalName: "",
      emergencyContact: "",
      emergencyContactPhone: "",
      institutionName: "",
      date: new Date().toISOString().split("T")[0],
      place: "",
      signatoryName: "",
      signatoryDesignation: "",
      includeDigitalSignature: false,
      ...initialData,
    },
  });

  const handleSubmit = async (data: MaternityLeaveData) => {
    // Track preview generation
    await trackPreviewGeneration("maternity-leave-1", "update");
    // Submit the form
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            {...form.register("fullName")}
            placeholder="Enter full name"
          />
          {form.formState.errors.fullName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="employeeId">Employee ID *</Label>
          <Input
            id="employeeId"
            {...form.register("employeeId")}
            placeholder="Enter employee ID"
          />
          {form.formState.errors.employeeId && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.employeeId.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="designation">Designation *</Label>
          <Input
            id="designation"
            {...form.register("designation")}
            placeholder="Enter designation"
          />
          {form.formState.errors.designation && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.designation.message}
            </p>
          )}
        </div>

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
          <Label htmlFor="expectedDeliveryDate">Expected Delivery Date *</Label>
          <Input
            id="expectedDeliveryDate"
            type="date"
            {...form.register("expectedDeliveryDate")}
          />
          {form.formState.errors.expectedDeliveryDate && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.expectedDeliveryDate.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="leaveStartDate">Leave Start Date *</Label>
          <Input
            id="leaveStartDate"
            type="date"
            {...form.register("leaveStartDate")}
          />
          {form.formState.errors.leaveStartDate && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.leaveStartDate.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="leaveEndDate">Leave End Date *</Label>
          <Input
            id="leaveEndDate"
            type="date"
            {...form.register("leaveEndDate")}
          />
          {form.formState.errors.leaveEndDate && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.leaveEndDate.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="totalLeaveDays">Total Leave Days *</Label>
          <Input
            id="totalLeaveDays"
            {...form.register("totalLeaveDays")}
            placeholder="Enter total leave days"
          />
          {form.formState.errors.totalLeaveDays && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.totalLeaveDays.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="medicalCertificateNumber">
            Medical Certificate Number *
          </Label>
          <Input
            id="medicalCertificateNumber"
            {...form.register("medicalCertificateNumber")}
            placeholder="Enter medical certificate number"
          />
          {form.formState.errors.medicalCertificateNumber && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.medicalCertificateNumber.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="doctorName">Doctor Name *</Label>
          <Input
            id="doctorName"
            {...form.register("doctorName")}
            placeholder="Enter doctor's name"
          />
          {form.formState.errors.doctorName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.doctorName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="hospitalName">Hospital Name *</Label>
          <Input
            id="hospitalName"
            {...form.register("hospitalName")}
            placeholder="Enter hospital name"
          />
          {form.formState.errors.hospitalName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.hospitalName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="emergencyContact">Emergency Contact *</Label>
          <Input
            id="emergencyContact"
            {...form.register("emergencyContact")}
            placeholder="Enter emergency contact name"
          />
          {form.formState.errors.emergencyContact && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.emergencyContact.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="emergencyContactPhone">
            Emergency Contact Phone *
          </Label>
          <Input
            id="emergencyContactPhone"
            {...form.register("emergencyContactPhone")}
            placeholder="Enter emergency contact phone"
          />
          {form.formState.errors.emergencyContactPhone && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.emergencyContactPhone.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="institutionName">Institution Name *</Label>
          <Input
            id="institutionName"
            {...form.register("institutionName")}
            placeholder="Enter institution name"
          />
          {form.formState.errors.institutionName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.institutionName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input id="date" type="date" {...form.register("date")} />
          {form.formState.errors.date && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.date.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="place">Place *</Label>
          <Input
            id="place"
            {...form.register("place")}
            placeholder="Enter place"
          />
          {form.formState.errors.place && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.place.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="signatoryName">Signatory Name *</Label>
          <Input
            id="signatoryName"
            {...form.register("signatoryName")}
            placeholder="Enter signatory name"
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
            placeholder="Enter signatory designation"
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
